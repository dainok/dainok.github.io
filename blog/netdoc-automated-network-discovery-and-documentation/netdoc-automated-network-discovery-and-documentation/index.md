---
cover: ad
date: 2022-08-28
tags:
- advanced
- blog
- netdoc
title: "NetDoc: automated network discovery and documentation"
---
Years ago I worked on a data center migration project. I was in charge of reviewing the network documentation and automating the configuration, testing and migration phases. Reviewing dozens of switches manually was not an option, so I wrote some [[Automatic network discovery and documentation|Python scripts]] to get neighborships and configurations from the switches and draw Visio diagrams. In the end, I was able to discover an entire network topology in minutes.

NetDoc is the industrialized, open-source version of those scripts, available to the public, to discover multi-vendor networks. It is based on [NetBox](https://docs.netbox.dev/en/stable/), [Netmiko](https://github.com/ktbyers/netmiko), [nornir](https://nornir.readthedocs.io/en/latest/), [ntc-templates](https://github.com/networktocode/ntc-templates) and [netbox-topology-views](https://github.com/mattieserver/netbox-topology-views).

A next step would be to integrate [draw.io](https://app.diagrams.net/) into `netbox-topology-views` to export diagrams in a reusable format.

## Installation

NetDoc requires a working NetBox instance. See the [NetBox](https://docs.netbox.dev/en/stable/) documentation first, then [NetDoc](https://github.com/dainok/netdoc). In this post, I use NetBox 3.3.2.

## Usage

Once logged in, we create a site. Then we go to `Plugins` → `Netdoc` → `Credentials` and add or import all the credentials used to log in to the network devices. We can also import them via CSV with the following format:

```csv
name,username,password,enable_password
ssh-admin-w-enable,admin,C1sco123,C1sco123
ssh-admin-wo-enable,admin,C1sco123,
```

Then we add or import at least one discoverable. A discoverable is a network node NetDoc can retrieve information from. Again, we can import via CSV with the following format:

```csv
address,credential,mode,site
172.25.82.38,ssh-admin-w-enable,netmiko_cisco_nxos,Test Site
172.25.82.37,ssh-admin-w-enable,netmiko_cisco_nxos,Test Site
172.25.82.36,ssh-admin-w-enable,netmiko_cisco_nxos,Test Site
172.25.82.35,ssh-admin-w-enable,netmiko_cisco_nxos,Test Site
```

We need to edit those devices and make them discoverable. Then we can start the discovery by selecting one or more discoverables and pressing the button.

![[discoverables-1.png]]

We can follow the discovery process with `journalctl`:

```bash
$ journalctl -u netbox-rq -f
Aug 28 19:54:55 linux-station python3[306570]: multiple_tasks*******************
***********************************************
Aug 28 19:54:55 linux-station python3[306570]: * 172.25.82.35 ** changed : False
 **********************************************
Aug 28 19:54:55 linux-station python3[306570]: vvvv multiple_tasks ** changed :
False vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv INFO
Aug 28 19:54:55 linux-station python3[306570]: ---- show running-config ** chang
ed : False ------------------------------------ INFO
Aug 28 19:54:55 linux-station python3[306570]: Building configuration...
Aug 28 19:54:55 linux-station python3[306570]:
Aug 28 19:54:55 linux-station python3[306570]: Current configuration : 3662 bytes
Aug 28 19:54:55 linux-station python3[306570]: !
Aug 28 19:54:55 linux-station python3[306570]: ! Last configuration change at 12:00:59 UTC Wed Jul 13 2022
Aug 28 19:54:55 linux-station python3[306570]: !
Aug 28 19:54:55 linux-station python3[306570]: version 15.2
```

The discovery scripts populate the following NetBox items:

* Devices.
* Manufacturers.
* Interfaces.
* Cables.
* IP Addresses.
* Prefixes.
* VRFs.
* VLANs.

New discoverables detected via CDP/LLDP are added automatically: we can discover them after reviewing the IP address and the discovery method.

![[discoverables-2.png]]

The discovery process should bind a device to each discoverable. When this does not happen (e.g., Cisco XR), we can bind them manually.

## Additional Information

NetDoc also discovers the ARP table, the MAC address table and the routing table of each discoverable.

![[mac-address-table.png]]

All the data (logs) fetched from the discoverables is stored and can be reviewed:

* The Configuration bit is set if the log contains the configuration of the discoverable.
* The Success bit is set if the command returned a valid output.
* The Parsed bit is set if the output was parsed successfully.
* The Ingested bit is set if the parsed output was ingested into NetBox.

![[logs.png]]

## L2 Network Topology

Using CDP and LLDP, NetDoc can discover L2 adjacencies. For each adjacency, it creates a cable:

![[cables.png]]

With the [netbox-topology-views](https://github.com/mattieserver/netbox-topology-views) plugin, we can draw L2 topologies automatically. Each device can be associated with a specific image through the `Device Role` attribute. The device roles must be created with one of the following slugs:

* `access-switch`.
* `backup`.
* `core-switch`.
* `distribution-switch`.
* `firewall`.
* `internal-switch`.
* `isp-cpe-material`.
* `non-racked-devices`.
* `power-units`.
* `role-unknown`.
* `router`.
* `server`.
* `storage`.
* `wan-network`.
* `wireless-ap`.

Opening `Plugins` → `Topology Views`, we can see an L2 topology diagram:

![[l2-topology.png]]

`netbox-topology-views` currently works only with NetBox 3.2.

## L3 Network Topology

During my network assessments, I need to draw L3 topology diagrams too. I forked [netbox-topology-views](https://github.com/mattieserver/netbox-topology-views) and implemented the feature I need:

![[l3-topology.png]]

The L3 diagram is VRF aware: we need to update the VRF on prefixes manually (and on IP addresses too).

## Conclusions

NetDoc is alpha software. It currently supports Cisco devices only, but it can be extended. Even so, it saves me a lot of time.

If you want to contribute, drop me a message. I do not consider myself a software developer, and there are certainly a lot of bugs.
