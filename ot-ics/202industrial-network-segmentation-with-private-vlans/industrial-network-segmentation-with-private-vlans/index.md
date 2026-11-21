---
cover: cisco
date: 2025-04-30
tags:
- advanced
- cisco
- ot-ics
---
We have seen how to segment an OT/ICS network transparently into groups using VLAN Insertion from Palo Alto Networks. This feature let us divide our lab environments into groups without reconfiguring any IP address, and it lets us define policies that allow specific communications between groups when necessary.

Since the early 2000s, a standard feature has been available to achieve a similar result: **Private VLAN**, also known as **port isolation**, which segments devices into groups of ports.

## Private VLAN

Private VLANs are defined in [RFC5517](https://datatracker.ietf.org/doc/html/rfc5517) as VLAN-based "forced forwarding". In other words, the forwarding of frames is determined at the VLAN level.

Two types of VLANs are defined:

* **Primary VLAN:** handles the traffic common to all the groups.
* **Secondary VLAN:** is associated with groups of ports and can be either **Isolated** or **Community**. In an Isolated VLAN, each port can communicate only with the primary VLAN. In a Community VLAN, each port can communicate with the primary VLAN and with all the ports of the same Community VLAN.

There are three types of ports:

* **Promiscuous Access Port (P-Port):** can communicate with any other port, regardless of the VLAN assignment.
* **Host Isolated Access Port (I-Port):** is associated with an Isolated VLAN and can communicate only with P-Ports.
* **Host Community Access Port (C-Port):** is associated with a Community VLAN and can communicate with P-Ports and with all the other C-Ports of the same VLAN.

![[pvlan-ports.png]]

In a real environment, there are likely several interconnected switches. Moreover, the network gateway is often a firewall that may not be VLAN-aware.

From an operational standpoint, I strongly recommend using switches of the same model and automating the PVLAN configuration, to minimize human error.

## Broadcast Traffic

A switch configured with PVLAN must handle broadcast traffic in a particular way. Consider ARP requests: a single request must be propagated across ports, even those in different secondary VLANs.

* Broadcast traffic from a **promiscuous port** is forwarded to all the ports of the primary VLAN, including those in isolated and community VLANs.
* Broadcast traffic from an **isolated port** is forwarded only to the promiscuous ports of the primary VLAN associated with the isolated port.
* Broadcast traffic from **community ports** is forwarded to all the ports of the same community and to all the associated promiscuous ports. It is **not** forwarded to other communities in the primary VLAN or to isolated ports.

## PVLAN Trunks

In a distributed network, inter-switch links (ISL) configured as trunks are necessary. Trunking carries multiple VLANs and is essential for the secondary PVLANs (Community and Isolated VLANs).

* **Regular PVLAN trunk:** when both switches support PVLAN, regular trunks can be used. Each switch recognizes and handles the PVLANs correctly.
* **Promiscuous PVLAN trunk:** used to connect a device that must communicate with all the ports, such as a firewall or a router. When it sends a frame, the switch **replaces** the secondary PVLAN ID with the primary PVLAN ID.
* **Isolated PVLAN trunk:** used when the connected device handles only isolated ports. When it sends a frame, the switch **replaces** the primary PVLAN ID with the isolated secondary PVLAN ID.

For isolated PVLAN trunks, the switch is responsible for isolating the ports within the isolated PVLAN, which can be enforced with the `switchport protected` command.

## Segregating a Plant with PVLAN

Compared to VLAN Insertion, Private VLANs are less flexible: groups can either communicate fully or not at all. We cannot selectively allow or block specific communications. Before deploying PVLANs in OT/ICS environments, it is therefore crucial to identify the required communications.

To segment our ICS/OT devices transparently, we configured them in separate Community VLANs:

| Plant                | Role | Address          | VLAN |
| -------------------- | ---- | ---------------- | ---- |
| Bottle Filling Plant | HMI  | 172.26.104.11/24 | 110  |
| Bottle Filling Plant | PLC  | 172.26.104.12/24 | 110  |
| Oil Refinery Plant   | HMI  | 172.26.104.21/24 | 110  |
| Oil Refinery Plant   | PLC  | 172.26.104.22/24 | 110  |

## Switch Configuration

All the ICS/OT devices reside in VLAN 110, which we keep for routing and for the promiscuous ports. The devices are moved to their final VLAN without changing their IP addressing.

First, we configure the secondary Community VLANs:

```text
vlan 111
  name LAB_SEC_OT_SEC_1
  private-vlan community
vlan 112
  name LAB_SEC_OT_SEC_2
  private-vlan community
```

Next, we define the primary VLAN and associate it with the secondary VLANs:

```text
vlan 110
  name LAB_SEC_OT_L3
  private-vlan primary
  private-vlan association 111-112
```

## Host Access Ports (C-Port and I-Port)

We use a host port when an endpoint device is connected directly to an access port of the switch. In private VLANs, host ports are part of the secondary VLANs, which can be either community or isolated. Configuring a private VLAN host port takes two steps: first, we define the port as a private VLAN host port, then we configure the host association between the primary and secondary VLANs.

```text
interface GigabitEthernet1/0/10
 switchport private-vlan host-association 110 111
 switchport mode private-vlan host
```

This configuration places the port in primary VLAN 110 and secondary VLAN 111 (Community), which makes it a C-Port.

## Promiscuous Access Ports (P-Port)

We use a promiscuous port when a device is connected directly to an access port of the switch. This device, typically a gateway, needs to communicate with all the host ports, both community and isolated. In a private VLAN domain, promiscuous ports are part of the primary VLAN. Configuring a promiscuous port takes two steps: first, we define the port as promiscuous, then we configure the mapping between the secondary VLANs and the primary VLAN.

```text
interface GigabitEthernet1/0/1
 switchport private-vlan mapping 110 111-112
 switchport mode private-vlan promiscuous
```

## Promiscuous Trunk Port

We use a promiscuous trunk port when a device that does not support PVLAN, typically a gateway, is connected directly to a trunk port of the switch. In a private VLAN domain, promiscuous trunk ports are part of the primary VLAN. They can carry multiple primary VLANs, and multiple secondary VLANs of a given primary VLAN can be mapped to a promiscuous trunk port.

```text
interface GigabitEthernet1/0/1
 switchport private-vlan trunk allowed vlan 102-104,110
 switchport private-vlan mapping 110 111-112
 switchport mode private-vlan trunk promiscuous
```

Here we configured a trunk to the gateway. VLANs 102, 103 and 104 are regular VLANs. VLANs 111 and 112 are secondary PVLANs associated with the primary VLAN 110. VLAN 110 is allowed on the trunk because, on a promiscuous trunk port, the traffic destined for a secondary VLAN is mapped using the tag of the associated primary VLAN.

## Isolated Trunk Port

This is not our case, but if we need to configure a trunk port connected to a device that does not support PVLAN and manages devices in an isolated VLAN, we must use a different syntax:

```text
interface GigabitEthernet1/0/1
 switchport private-vlan trunk allowed vlan 102-104,110
 switchport private-vlan association 110 113
 switchport mode private-vlan trunk secondary
```

The upstream devices must know that VLAN 113 is isolated, to handle broadcast and unicast traffic correctly.

With uniform switch models and promiscuous PVLAN trunks used only for gateways, we keep the network complexity low and still segment the OT/ICS environment properly.
