---
cover: eve-ng
date: 2025-03-02
tags:
- advanced
- eve-ng
---
The network infrastructure that EVE-NG uses to interconnect lab nodes is somewhat obscure. Let's explore how to identify the Linux interfaces of each virtualized node for debugging or simple analysis.

Let's take the following lab as an example:

![[eveng-topology.png]]

## Required Information

Before we begin, we need the following data:

* The user identifier (POD).
* The lab identifier.
* The identifiers of the nodes to analyze.
* The identifiers of the interfaces to analyze.
* The identifiers of the networks to analyze.
* The execution space identifier.

## User Identifier (POD)

An administrator can see the user identifier under `Management` → `User Management`.

![[eveng-users.png]]

In this example, the POD assigned to my user is **5**.

## Lab Identifier

We can find the lab identifier by opening the lab and navigating to `Lab Details`.

![[eveng-lab-id.png]]

For instance, my lab identifier is `3b327c21-1585-499d-9a0d-4281e05f4532`.

If we open the lab file with a text editor, the identifier is the `id` attribute of the `lab` object.

![[eveng-xml-lab-1.png]]

## Node Identifiers

Each node is identified by a number that we can see by opening the lab and navigating to `Nodes`.

![[eveng-lab-nodes.png]]

If we open the lab file with a text editor, the identifier is the `id` attribute of the node object.

![[eveng-xml-lab-2.png]]

## Interface Identifiers

Each interface is identified by a number, which we can see by opening the lab file with a text editor. The interface identifier is the `id` attribute of the interface object.

![[eveng-xml-lab-3.png]]

Each interface is associated with a network (`network_id`), which represents the network the interface is connected to.

There is a key difference between QEMU and IOL node interfaces:

* QEMU node interfaces start from identifier `0` and increment sequentially.
* IOL node interfaces follow the formula `ID = X + Y × 16`, where `X` and `Y` are the slot and interface identifiers present in the `EthernetX/Y` name.

## Network Identifiers

Each network segment is identified by a number that we can see by opening the lab and navigating to `Networks`.

![[eveng-lab-networks.png]]

A network can be either a point-to-point link or a network object. A network object is an L2 network implemented by a Linux bridge rather than by an EVE-NG node. This view displays only the explicitly created networks, while all the point-to-point networks remain hidden.

If we open the lab file with a text editor, the identifier is the `id` attribute of the network object.

![[eveng-xml-lab-4.png]]

The **visibility** flag determines whether a network is visible in the web interface. For example, four networks are present, but only two are visible in the web interface:

* Network R2-R7 (`id=3`).
* Network R5-R7 (`id=2`).
* Shared Network (`id=4`).
* Mgmt Network (`id=1`).

When we create a point-to-point link, the network name is set using the node name and the source interface.

## Execution Space Identifier

The execution space is represented by a number associated with an open lab. This number remains assigned until the lab is closed.

We can access the database with the following command and the password `eve`:

```bash
mysql -u root -p eve_ng_db
```

Knowing the lab ID, we can retrieve the execution space identifier with a database query:

```text
mysql> SELECT * FROM lab WHERE uuid="3b327c21-1585-499d-9a0d-4281e05f4532";
+----+--------------------------------------+---------------+-----------------+-----+
| id | uuid                                 | path          | name            | pod |
+----+--------------------------------------+---------------+-----------------+-----+
|  3 | 3b327c21-1585-499d-9a0d-4281e05f4532 | /Users/Andrea | Ansible Cisco XR |   5 |
+----+--------------------------------------+---------------+-----------------+-----+
```

In our case, the execution space identifier is `3`.

## Node Interfaces

At this point, we have all the values we need to identify the interfaces in our system. Each interface name is built as follows: `vunAAABBBBCCCDD`.

Where:

* `AAA`: the decimal execution space identifier.
* `BBBB`: the decimal POD identifier.
* `CCC`: the decimal node identifier.
* `DD`: the hexadecimal interface identifier.

The first interface of node R2 in our lab (execution space 3, POD 5) has the prefix `vun0030005002`:

```bash
$ ifconfig | grep vun0030005002
vun003000500200: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 9000
vun003000500210: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 9000
vun003000500220: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 9000
vun003000500230: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 9000
```

Since R2 is an IOL node, its interfaces are `0`, `16` (`0x10`), `32` (`0x20`) and `48` (`0x30`).

Each interface can be part of a network implemented with a Linux bridge. The names of the Linux bridges are built as follows: `vnetAAABBBBEEEE`.

Where:

* `AAA`: the decimal execution space identifier.
* `BBBB`: the decimal POD identifier.
* `EEEE`: the decimal network identifier.

The network in our lab (execution space 3, POD 5, ID 4) is named `vnet00300050004`:

```bash
$ brctl show vnet00300050004
bridge name     bridge id               STP enabled     interfaces
vnet00300050004         8000.de24a99b6dc2       no                      vun003000500103
                                                        vun003000500220
                                                        vun003000500520
```

This network contains three interfaces:

* `vun003000500103`: execution space 3, POD 5, node 1 (**R7, QEMU**), interface `0x3` (`Gi0/3`).
* `vun003000500220`: execution space 3, POD 5, node 2 (**R2, IOL**), interface `0x20` (`32`, `Eth0/2`).
* `vun003000500520`: execution space 3, POD 5, node 5 (**R5, IOL**), interface `0x20` (`32`, `Eth0/2`).
