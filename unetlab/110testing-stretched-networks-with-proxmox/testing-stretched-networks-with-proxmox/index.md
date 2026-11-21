---
cover: proxmox
date: 2024-08-04
tags:
- advanced
- proxmox
- unetlab
---
Let's explore how the SDN functionality of Proxmox works. We use the SDN structure to implement extended L2 networks, so that we can run labs across multiple hosts.

## Create an SDN Zone

First, we create a zone:

```bash
pvesh create /cluster/sdn/zones -type=vxlan -zone=unlzone1 -peers=172.25.82.157,172.25.82.158 -ipam=pve
pvesh set /cluster/sdn/zones
```

In the **peers** list, we add the IP addresses of all the Proxmox hosts.

## Create a Bridge Associated with the Zone

Next, we create a bridge linked to the zone to connect the nodes:

```bash
pvesh create /cluster/sdn/vnets -vnet=unlnet1 -tag=1000004 -zone=unlzone1
pvesh set /cluster/sdn/zones
```

Then we associate the network with the nodes as shown in the previous steps.

If everything is configured correctly, nodes running on different hosts can ping each other, using both the native VLAN and a tagged VLAN.

## Design Considerations

From a design perspective, we need to decide how to manage zones and networks within UNetLab: should we create a single zone with all the Vnets, or a zone for each Vnet?

According to the [official documentation](https://pve.proxmox.com/pve-docs/chapter-pvesdn.html#pvesdn_config_zone), a zone defines a virtually separated network. The documentation lacks detail, so we need to understand the constructs created at the OS level.

When we created the zone, we specified the IP addresses of the Proxmox hosts that share it. Proxmox writes this configuration to `/etc/pve/sdn/zones.cfg` and generates the `/etc/network/interfaces.d/sdn` file. There are no network namespace configurations (`ip netns`).

We can deduce that the zone is a Proxmox-defined structure that translates into VXLAN interfaces. Since UNetLab does not use L3 networks, we can use a single zone for the entire UNetLab cluster.

## Troubleshooting

During my first test, the two VyOS nodes could not communicate. By connecting to the two Proxmox servers via SSH, we can see how the SDN configuration translates at the OS level.

The network interfaces of the nodes are associated with a bridge:

```bash
brctl show unlnet3
```

```text
bridge name     bridge id               STP enabled     interfaces
unlnet3         8000.6659fe6b9723       no              tap10001i1
                                                        vxlan_unlnet3
```

The TAP interface belongs to the node, while the VXLAN interface allows communication with the nodes on other hosts.

We check the forwarding table for frames with:

```bash
bridge fdb show | grep vxlan
```

```text
66:59:fe:6b:97:23 dev vxlan_unlnet3 vlan 1 master unlnet3 permanent
66:59:fe:6b:97:23 dev vxlan_unlnet3 master unlnet3 permanent
00:00:00:00:00:00 dev vxlan_unlnet3 dst 172.25.82.158 self permanent
ba:2f:72:71:47:0a dev vxlan_unlnet4 vlan 1 master unlnet4 permanent
ba:2f:72:71:47:0a dev vxlan_unlnet4 master unlnet4 permanent
00:00:00:00:00:00 dev vxlan_unlnet4 dst 172.25.82.158 self permanent
```

The MAC addresses on the left should match the network interfaces of the nodes running on the remote host. In my case, the remote VyOS node had its network interfaces reversed, which resulted in an incorrect connection.

We can verify further by analyzing the traffic between the hosts:

```bash
tcpdump -i vmbr0 -nn udp and port 4789
```

```text
IP 192.168.0.1 > 192.168.0.3: ICMP echo request, id 35144, seq 2, length 64
13:02:10.899649 IP 172.25.82.158.46121 > 172.25.82.157.4789: VXLAN, flags [I] (0x08), vni
1000000
IP 192.168.0.3 > 192.168.0.1: ICMP echo reply, id 35144, seq 2, length 64
13:02:11.900765 IP 172.25.82.157.35416 > 172.25.82.158.4789: VXLAN, flags [I] (0x08), vni
1000000
IP 192.168.0.1 > 192.168.0.3: ICMP echo request, id 35144, seq 3, length 64
13:02:11.901642 IP 172.25.82.158.46121 > 172.25.82.157.4789: VXLAN, flags [I] (0x08), vni
1000000
IP 192.168.0.3 > 192.168.0.1: ICMP echo reply, id 35144, seq 3, length 64
13:02:12.902939 IP 172.25.82.157.35416 > 172.25.82.158.4789: VXLAN, flags [I] (0x08), vni
1000000
```
