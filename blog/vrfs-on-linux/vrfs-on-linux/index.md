---
cover: linux
date: 2016-11-29
tags:
- advanced
- blog
- linux
---
VRF (Virtual Routing and Forwarding) allows multiple, separate routing tables on the same system.

On Linux, VRF support started with the 4.3 kernels. Ubuntu 16.04 ships a 4.4 kernel, but note that the 4.5 kernels have some important patches too.

This post shows how to create two different VRFs, each dedicated to a virtual bridge. A virtual router runs on each virtual bridge. The VM used for the tests below is an Ubuntu 16.04 installed with [[Introduction to EVE-NG platform|EVE-NG]].

## Create a VRF

We create two VRFs:

```bash
ip link add red type vrf table 1
ip link add green type vrf table 2
```

Don't forget to bring both up:

```bash
ip link set dev red up
ip link set dev green up
```

```bash
# ip -br link show type vrf
red              UNKNOWN        9a:ca:96:75:f8:f5 <NOARP,MASTER,UP,LOWER_UP>
green            UNKNOWN        8e:b6:6f:25:64:10 <NOARP,MASTER,UP,LOWER_UP>
```

## Assign a Network Interface to a VRF

We assign an EVE-NG switch to each VRF:

```bash
ip link set vnet0_1 master red
ip link set vnet0_2 master green
```

```bash
$ ip link show vnet0_1
3: vnet0_1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 9000 qdisc noqueue master red state UP mode DEFAULT group default qlen 1000
    link/ether ae:81:73:24:b5:66 brd ff:ff:ff:ff:ff:ff
# ip link show vnet0_2
8: vnet0_2: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 9000 qdisc noqueue master green state UP mode DEFAULT group default qlen 1000
    link/ether 0a:9d:e0:76:8b:84 brd ff:ff:ff:ff:ff:ff
```

## Set FIB Rules

Before kernel v4.8, we must add some additional rules to forward traffic on the interfaces properly:

```bash
ip rule add iif red table 1
ip rule add oif red table 1
ip rule add iif green table 2
ip rule add oif green table 2
```

```bash
$ ip rule show
0:      from all lookup local
32762:  from all oif green lookup 2
32763:  from all iif green lookup 2
32764:  from all oif red lookup 1
32765:  from all iif red lookup 1
32766:  from all lookup main
32767:  from all lookup default
```

## IP Configuration

We assign an IP address and a default route to each virtual bridge and VRF:

```bash
ip addr add 10.254.0.1/24 dev vnet0_1
ip addr add 10.254.0.1/24 dev vnet0_2
ip route add 0.0.0.0/0 via 10.254.0.2 table 1
ip route add 0.0.0.0/0 via 10.254.0.2 table 2
```

## Connectivity Test

Both virtual routers connected to the virtual bridges are configured as follows:

* R1: `e0/0` 10.254.0.2/24, `lo0` 1.1.1.1/32.
* R2: `e0/0` 10.254.0.2/24, `lo0` 2.2.2.2/32.

Remember to bind `ping` (and `traceroute`) to an interface assigned to the VRF:

```bash
$ ping -I vnet0_1 -c5 10.254.0.2
PING 10.254.0.2 (10.254.0.2) from 10.254.0.1 vnet0_1: 56(84) bytes of data.
64 bytes from 10.254.0.2: icmp_seq=1 ttl=255 time=0.434 ms
[...]
```

```bash
$ ping -I vnet0_2 -c5 10.254.0.2
PING 10.254.0.2 (10.254.0.2) from 10.254.0.1 vnet0_2: 56(84) bytes of data.
64 bytes from 10.254.0.2: icmp_seq=1 ttl=255 time=0.649 ms
[...]
```

The local networks are reachable. Now let's test the routing:

```bash
$ ping -I vnet0_1 -c5 1.1.1.1
PING 1.1.1.1 (1.1.1.1) from 10.254.0.1 vnet0_1: 56(84) bytes of data.
64 bytes from 1.1.1.1: icmp_seq=1 ttl=255 time=0.649 ms
[...]
```

```bash
$ ping -I vnet0_2 -c5 2.2.2.2
PING 2.2.2.2 (2.2.2.2) from 10.254.0.1 vnet0_2: 56(84) bytes of data.
64 bytes from 2.2.2.2: icmp_seq=1 ttl=255 time=0.452 ms
[...]
```

## Current Limits

VRF support on Linux is quite new, so there are many limits:

* Most applications cannot be VRF-aware, even if local services can listen on all VRFs (`sysctl -w net.ipv4.tcp_l3mdev_accept=1` with 4.5 kernels).
* There is no way to start a client command (`telnet`, `ftp`, `ssh`, ...) in a specific VRF.

Edit: we can now execute a command "attached" to a specific VRF with `ip vrf exec blue ping 8.8.8.8`.

## References

* [Virtual Routing and Forwarding (VRF)](https://docs.kernel.org/networking/vrf.html "Virtual Routing and Forwarding (VRF)")
* [Operationalizing VRF in the Data Center](http://www.slideshare.net/CumulusNetworks/operationalizing-vrf-in-the-data-center "Operationalizing VRF in the Data Center")
* [VRF for Linux (Cumulus Networks)](https://cumulusnetworks.com/blog/vrf-for-linux/ "Cumulus Networks")
