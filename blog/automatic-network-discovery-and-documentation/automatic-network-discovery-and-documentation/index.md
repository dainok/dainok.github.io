---
cover: ad
date: 2017-03-28
tags:
- blog
- intermediate
- netdoc
---
NetBrain is a well-known software for network discovery and management. Let's focus on network discovery and documentation: we want to discover network devices automatically, learn how they are connected, and store everything in a version control repository ([[Git fundamentals for developers and IT professionals|Git]]/CVS).

So we want to:

* Discover all the network devices.
* Map how they are connected.
* Track changes automatically.
* Store everything in a version control repository (Git/CVS).
* Visualize any updated map with a simple browser.

This is how we can solve the problem:

* We assume all devices are Cisco, so we can use CDP.
* We can get the CDP data via SNMPv3.
* We can build a (source, destination) topology.
* We can store the topology in a revision control repository (Git/CVS).
* We can use [jsPlumb](https://jsplumbtoolkit.com/) to render the (source, destination) topology into a web page.

## NetDoc

NetDoc is the small experiment I wrote to solve the problem. It contains two Python scripts:

* `netdiscover.py`: discovers network devices via SNMPv3 and generates two `.ini` files:
  * `discovered_nodes.ini`: contains all the network devices with some additional information.
  * `discovered_connections.ini`: contains all the network connections with some additional information.
* `netplot.py`: plots a web page from the `.ini` files above.

The `.ini` files can be stored in a revision control repository.

## Running NetDoc

NetDoc is currently a proof-of-concept script, so it may or may not work on your infrastructure. To start it, run:

```bash
./netdiscover.py -u snmpv3user -p snmpv3password -h 10.1.1.4 -h 10.1.1.5 -h 10.1.1.6
```

The `discovered_nodes.ini` file contains all the devices discovered via CDP in the following form:

```ini
[AccessServer]
id = AccessServer
image = router.svg
disabled = false
platform = cisco 2610
```

The title is the CDP neighbor ID (usually the hostname). The other attributes are:

* `id`: the CDP neighbor ID (usually the hostname).
* `image`: an image used to display the node in the web page.
* `disabled`: `true` if the node was missing during the last scan.
* `platform`: the CDP neighbor platform.

The `discovered_connections.ini` file contains all the connections discovered via CDP in the following form:

```ini
[AccessServer:e0/0-switch.example.com:gi2/0/46]
source = AccessServer
source_if = e0/0
destination = switch.example.com
destination_if = gi2/0/46
disabled = false
```

The title is the source and destination CDP neighbor IDs with the interface names. The other attributes are:

* `source`: the source CDP neighbor ID.
* `source_if`: the source interface name.
* `destination`: the destination CDP neighbor ID.
* `destination_if`: the destination interface name.
* `disabled`: `true` if the connection was missing during the last scan.

After a successful scan, we can create the HTML page:

```bash
./netplot.py > netdoc.html
```

And here we go, a draggable web page:

![[netdoc-diagram-1.png]]
