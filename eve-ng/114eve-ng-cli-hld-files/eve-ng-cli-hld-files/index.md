---
cover: eve-ng
date: 2026-04-12
tags:
- advanced
- eve-ng
---
The primary reason EVE-NG CLI exists is to let you build labs from code. Every other command in the shell (folder navigation, image listing, lab inspection) supports that core workflow. The real feature is this: describe your network topology in a text file, run one command, and get a fully wired lab on the server in seconds.

That text file is the **HLD** (High-Level Design).

## The HLD Format

An HLD file is a structured YAML document. At its core, it contains a `groups` key, which holds one or more node groups. Each group defines a set of nodes that share the same image and are wired together in a specific topology.

You can define as many groups as you need and connect them to each other in arbitrary ways. This makes it possible to describe anything from a simple linear chain to a complex multi-tier network in a single file.

```yaml
groups:
  - template: "*linux-adv*-iac.bin"
    prefix: R
    count: 4
    topology: linear
    features:
      - loopback:name=Loopback0
interfaces:
  - match: Loopback0
    address: 192.168.0.0/16
    mask: 32
    features:
      - ospf:area=0
  - match: Ethernet
    address: 10.0.0.0/8
    mask: auto
    features:
      - ospf:area=0
```

Every node in every group is connected by default to the OOB management network (attached to `nat0`). To exclude a group from OOB, for example a group of devices with no management interface, set `use_oob: false` on that group.

Optional per-group parameters:

* `ram`: the amount of RAM to allocate to each node (MB).
* `cpu`: the number of vCPUs to assign to each node.

The `features` and `interfaces` keys are reserved for the upcoming node configuration layer, which will push advanced configuration (OSPF, BGP, MPLS, etc.) to the nodes after the first boot. That part of the framework is not released yet.

Example topology files are available in the [GitHub repository](https://github.com/dainok/eveng-cli/tree/master/eveng_cli/tests/hld).

## Topology: Linear

[Nodes are connected in a chain](https://github.com/dainok/eveng-cli/blob/master/eveng_cli/tests/hld/hld-1-linear-vios.yml), each node linked to the next. Use `count` to set the number of nodes.

![[topology-linear.png]]

This is useful for simulating a simple WAN backbone, a sequence of routers along a path, or any scenario where traffic flows in a single direction along a chain.

## Topology: Ring

[Nodes are connected in a closed loop](https://github.com/dainok/eveng-cli/blob/master/eveng_cli/tests/hld/hld-2-ring-vios.yml): the last node connects back to the first. Use `count` to set the number of nodes.

![[topology-ring.png]]

This is a natural fit for OSPF ring topologies, resilient metro networks, or anywhere you need a loop with no single point of failure.

## Topology: Full Mesh

[Every node is connected directly to every other node](https://github.com/dainok/eveng-cli/blob/master/eveng_cli/tests/hld/hld-2-full-mesh-vios.yml). Use `count` to set the number of nodes.

![[topology-full-mesh.png]]

This is ideal for iBGP full-mesh scenarios, or any topology where all nodes need a direct adjacency.

## Topology: Hub-Spoke, Spine-Leaf and Star

This topology type creates a two-tier structure. A set of nodes acts as **hubs**, and the rest are **spokes**, each connected to all the hubs. The required parameters are:

* `hubs`: the number of hub nodes.
* `count`: the number of spoke nodes.
* `connect_hubs`: set to `true` to interconnect the hubs in a full mesh, or `false` to leave them isolated.

The same topology type covers three different patterns, depending on how you configure it:

**[Hub-spoke](https://github.com/dainok/eveng-cli/blob/master/eveng_cli/tests/hld/hld-3-hubs-spoke-vios.yml):** multiple hubs, connected to each other, with each spoke connected to all the hubs. This is a classic WAN or DMVPN layout.

![[topology-hub-spokes.png]]

**[Spine-leaf](https://github.com/dainok/eveng-cli/blob/master/eveng_cli/tests/hld/hld-3-spine-leaf-vios.yml):** multiple hubs (spines) that are *not* interconnected (`connect_hubs: false`), with each leaf connected to all the spines. This is the standard data center fabric topology.

![[topology-spine-leaf.png]]

**[Star](https://github.com/dainok/eveng-cli/blob/master/eveng_cli/tests/hld/hld-3-star-vios.yml):** a single hub (`hubs: 1`) with all the spokes connected to it. It is simple and effective for scenarios with a central aggregation point.

![[topology-star.png]]

## Topology: Defined

For anything that does not fit a regular pattern, the [defined topology](https://github.com/dainok/eveng-cli/blob/master/eveng_cli/tests/hld/hld-4-defined-vios.yml) lets you specify connectivity explicitly. You provide a list of links, each containing the names of the nodes to connect, separated by a comma.

![[topology-defined-1.png]]

Node names are built from the prefix of the group and a sequential number (`R1`, `R2`, `SW1`, etc.).

The defined topology is also the mechanism for [connecting nodes across different groups](https://github.com/dainok/eveng-cli/blob/master/eveng_cli/tests/hld/hld-9-loops.yml):

![[topology-defined-2.png]]

This makes it possible to model multi-tier topologies (core, distribution, access) entirely within a single HLD file.

The HLD format is still evolving. If you have a topology that is hard to express with the current types, or a use case that would benefit from a new topology mode, open an issue on GitHub or leave a comment below.
