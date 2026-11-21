---
cover: cisco
date: 2017-01-31
tags:
- advanced
- blog
- cisco
- design
- ucs
---
This post covers disjoint L2 domains on Cisco UCS-B, and why and when to implement them.

## Scenario 1: Multi-Tenant Infrastructure

Suppose your current UCS-B infrastructure is configured to support a single, physically L2-separated tenant:

![[disjoint-l2-1.png]]

Now suppose you need to share the UCS-B infrastructure with multiple, physically L2-separated tenants:

![[disjoint-l2-2.png]]

## Scenario 2: Physically Separated Security Zones

Suppose your current UCS-B infrastructure is configured to support a single L2 uplink:

![[disjoint-l2-3.png]]

Now suppose you need some virtual machines in a different, physically L2-isolated security zone:

![[disjoint-l2-4.png]]

## Requirements for Working Disjoint L2 Domains

The configuration is pretty simple, but you must be 100% sure about the following points:

1. All the ports related to the new port-channel must be in the shutdown state. Otherwise, after you add the new port-channels on the Fabric Interconnects, UCS-B uses them to carry the old VLANs too, and it becomes a mess because the new port-channels do not carry the old VLANs.
2. VLANs must be unique: you cannot configure the same VLAN on more than one uplink/domain. Otherwise, UCS-B does not know which uplink/domain owns which VLAN.
3. Each server must have a vNIC dedicated to a single uplink/domain: you cannot use a single vNIC to carry VLANs from multiple uplinks/domains. Otherwise, UCS-B does not know which uplink to pin the vNIC to.

## Configure Disjoint L2 Domains with a Zero-Downtime Approach

1. On the Nexus switches, configure all the ports dedicated to the new port-channels in the shutdown state.
2. On UCS Manager (`Equipment` → `Chassis` → `Fabric Interconnect A|B` → `Physical Ports` → `Ethernet Ports`), configure all the ports dedicated to the new port-channels as "Uplink Port" and disable them:
   ![[disjoint-l2-5.png]]
3. On UCS Manager (`LAN` → `LAN Cloud` → `Fabric A|B` → `Port Channels`), add a new port-channel, assign the ports dedicated to it, and disable the port-channel:
   ![[disjoint-l2-6.png]]
4. On UCS Manager (`LAN` → `LAN Cloud` → `VLANs`), add all the VLANs assigned to the new port-channel:
   ![[disjoint-l2-7.png]]
5. On UCS Manager (`LAN` → right click → `LAN Uplinks Manager` → `VLANs` → `VLAN Manager` → `Fabric A|B`), assign all the VLANs (both old and new) to a port-channel. This is the most critical phase, so make sure you assign each VLAN to a single uplink/port-channel on both Fabric Interconnects:
   ![[disjoint-l2-8.png]]
6. On UCS Manager, enable the port-channels.
7. On the Cisco Nexus switches, configure and enable the virtual port-channels.

## References

* [Deploy Layer 2 Disjoint Networks Upstream in End Host Mode](https://www.kernel.org/doc/Documentation/networking/vrf.txt "Deploy Layer 2 Disjoint Networks Upstream in End Host Mode")
