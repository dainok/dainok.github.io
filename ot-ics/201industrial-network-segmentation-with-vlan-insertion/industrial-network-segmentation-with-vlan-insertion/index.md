---
cover: paloalto-strata
date: 2025-04-02
tags:
- advanced
- media
- ot-ics
- palo-alto-networks
---
In real industrial environments, it is common to find all the OT/ICS devices configured with IP addresses of a single large network. Different production lines or plants can then communicate with each other without any filtering.

User PCs are often part of the same network, for various reasons. Unfortunately, these PCs are more exposed to malware, because corporate policies are not applied consistently. A malware infection inside an OT/ICS network can spread easily, because the defenses are weak.

![[ot-network.png]]

Our lab implements two plants: the Bottle Filling Plant and the Oil Refinery Plant. In our setup, the two plants must not communicate with each other, even though they reside in the same IP network.

The goal is to segment the OT/ICS network transparently, with minimal disruption.

![[ot-network-with-vlan-insertion.png]]

Benefits of VLAN Insertion:

* No IP address changes are required.
* Downtime is minimal.
* Network visibility increases.
* IT and OT resources are clearly separated.
* Customized policies can be applied to the different zones.
* Deep packet inspection is possible on a per-zone basis.
* Potential issues are identified and isolated faster.
* The solution scales up or down as needed.

## Grouping OT/ICS Devices Without Reconfiguration

Our lab includes the following devices:

| Plant                | Role | Address          | VLAN |
| -------------------- | ---- | ---------------- | ---- |
| Bottle Filling Plant | HMI  | 172.26.104.11/24 | 104  |
| Bottle Filling Plant | PLC  | 172.26.104.12/24 | 104  |
| Oil Refinery Plant   | HMI  | 172.26.104.21/24 | 104  |
| Oil Refinery Plant   | PLC  | 172.26.104.22/24 | 104  |

To segment the network transparently, we deploy Palo Alto Networks firewalls configured with VLAN Insertion. This feature groups devices into specific VLANs and enforces communication policies between them.

After the segmentation, the devices are organized into two groups, each containing all the components of its plant:

| Plant                | Role | Address          | Group (VLAN) |
| -------------------- | ---- | ---------------- | ------------ |
| Bottle Filling Plant | HMI  | 172.26.104.11/24 | 102          |
| Bottle Filling Plant | PLC  | 172.26.104.12/24 | 102          |
| Oil Refinery Plant   | HMI  | 172.26.104.21/24 | 103          |
| Oil Refinery Plant   | PLC  | 172.26.104.22/24 | 103          |

It is technically possible to separate HMI and PLC into different groups and let the firewall control their communication. In a real setting, however, this may not be feasible: OT managers typically prefer to keep HMI and PLC units in the same physical location, with no additional security layers in between.

## Switch Configuration

Currently, all the ICS/OT devices reside in VLAN 104. We keep this VLAN for routing while the devices are moved to their final VLANs, without changing their IP addresses.

We create the necessary VLANs on the switch:

* VLAN 102: `LAB_SEC_OT_L2_1`.
* VLAN 103: `LAB_SEC_OT_L2_2`.

Additional requirements:

* Configure a loop prevention algorithm on the switches.
* Make sure the firewall is connected via a trunk port that carries VLANs 102 and 103.

Once all the ICS/OT devices have been migrated and connectivity has been verified, VLAN 104 can be removed.

## Firewall Configuration

We now enable VLAN Insertion on the firewall.

### Step 1: Create Security Zones

Navigate to `Network` → `Zones` → `Add` and create the following zones:

* `LAB_SEC_OT_L2_1` (Layer 2).
* `LAB_SEC_OT_L2_2` (Layer 2).

![[create-security-zones.png]]

### Step 2: Create Subinterfaces

Each ICS/OT group is assigned a subinterface with:

* The correct VLAN tag.
* The appropriate security zone.

Navigate to `Network` → `Interfaces` → `Add` and create the subinterfaces.

![[create-subinterfaces.png]]

### Step 3: Create the VLAN Interface

Navigate to `Network` → `Interfaces` → `VLAN` → `Add` and create a VLAN interface.

![[create-vlan-interface.png]]

### Step 4: Create the VLAN Mapping

Navigate to `Network` → `VLANs` → `Add` and associate the VLAN interface with the subinterfaces.

![[associate-subinterfaces.png]]

This configuration maps the network `172.24.106.0/24` onto VLANs 102 and 103 and enforces the security policies accordingly.

Once all the configurations are applied, the policy rules are committed and the devices are moved to the correct VLANs, the segmentation is complete.

## Policy Considerations

Policies use L2 or L3 zones as follows:

* **Inter-VLAN communication:** source and destination are the Layer 3 zone assigned to the VLAN interface.
* **Intra-VLAN communication:** source and destination are the Layer 2 zones assigned to the subinterfaces.

![[ot-firewall-policies.png]]

## Virtual Firewall Considerations

If we use a virtual device, we must remember that the firewall behaves like a switch and manipulates incoming and outgoing frames. The virtual network must therefore allow:

* **Promiscuous mode:** to receive frames that are not addressed to the network interface of the firewall.
* **Forged transmit:** to forward (transmit) frames that originate from other devices.

![[vswitch-security-policies.png]]

## Attachments

* [[VLAN Insertion use case.pdf|Applying VLAN Insertion in ICS/SCADA]]
