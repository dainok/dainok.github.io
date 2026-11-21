---
cover: proxmox
date: 2024-07-26
tags:
- advanced
- lab
- proxmox
- unetlab
---
We now have all the elements needed to simulate an L1 link. Let's create a simple lab with two interconnected VyOS nodes.

## Create an L1 Network Bridge

First, we create a network bridge that simulates the L1 link. We start by defining a naming convention for our network components:

```bash
pvesh create /nodes/proxmox1/network -iface unlbr1 -type bridge -autostart 1
pvesh set /nodes/proxmox1/network
```

## Clone VyOS Nodes from the Template

Next, we clone two VyOS nodes from the template and connect a second network interface to the newly created bridge:

```bash
pvesh create /nodes/proxmox1/qemu/9001/clone -newid 10001 -full 0 -name node-vyos1
pvesh create /nodes/proxmox1/qemu/9001/clone -newid 10002 -full 0 -name node-vyos2
pvesh set /nodes/proxmox1/qemu/10001/config -tags unl,root
pvesh set /nodes/proxmox1/qemu/10002/config -tags unl,root
pvesh set /nodes/proxmox1/qemu/10001/config -net1 virtio,bridge=unlbr1
pvesh set /nodes/proxmox1/qemu/10002/config -net1 virtio,bridge=unlbr1
```

## Start the VyOS Nodes

We start the two VyOS nodes:

```bash
pvesh create /nodes/proxmox1/qemu/10001/status/start
pvesh create /nodes/proxmox1/qemu/10002/status/start
```

We wait a few minutes for the nodes to boot, then we configure the new network interfaces.

## Configure the Network Interfaces and Enable LLDP

On each node, we configure the new network interface and enable the LLDP protocol to validate the patch:

```text
configure
set service lldp
set service lldp interface all
set interfaces ethernet eth1 address '192.168.0.1/24'
commit
save
```

## Enable the Forwarding of All Frames

To enable the forwarding of all frames, we run the following commands:

```bash
echo 65535 > /sys/class/net/unlbr1/bridge/group_fwd_mask
echo 0 > /sys/devices/virtual/net/unlbr1/bridge/multicast_snooping
```

Each L1 link requires a manual command to enable the forwarding of all frames. Currently, we cannot perform this operation through the API, but we will revisit it in the future.

## Verify Connectivity

If everything is configured correctly, we should see the adjacent router via the LLDP protocol:

```text
show lldp neighbors
```

```text
Capability Codes: R - Router, B - Bridge, W - Wlan r - Repeater, S - Station
                  D - Docsis, T - Telephone, O - Other

Device    Local Port    Protocol    Capability    Platform                          Remote
Port
--------  ------------  ----------  ------------  --------------------------------  ------
--------------
vyos      eth1          LLDP        R             VyOS 1.5-rolling-202407171706     eth1
```

We can confirm that the two nodes see each other via the LLDP protocol, which bridges typically filter.
