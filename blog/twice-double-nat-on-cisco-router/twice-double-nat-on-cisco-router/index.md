---
cover: cisco
date: 2017-02-01
tags:
- blog
- cisco
- design
- intermediate
---
When we connect different companies, it is a common request that each company wants the other one to present itself with a specific subnet. Usually, companies do not agree on IP ranges. A Twice NAT configuration (also called double NAT) can help a lot.

In this scenario, the two companies want to be interconnected through an MPLS network for a couple of services:

* The CompanyA server (`10.1.1.100`) must reach the CompanyB web server (`10.2.2.200`).
* CompanyA is responsible for (and pays for) the connectivity.

Because of the IP address allocations:

* CompanyA wants CompanyB to present itself as `10.1.255.100`.
* CompanyA wants to place the ISP router on `10.155.255.0/24`.
* CompanyB wants CompanyA to present itself as `10.2.255.200`.
* CompanyB wants to place the ISP router on `10.255.255.0/24`.

![[twicenat.png]]

The following table describes who translates what:

| Source Site | Source | Source IP | SNAT@CPB | Destination Site | Destination | Destination IP | DNAT@CPB | Port | Service |
|:--|:--|:--|:--|:--|:--|:--|:--|:--|:--|
| CompanyA | ServerA | 10.1.1.100 | 10.2.255.200 | CompanyB | ServerB | 10.1.255.100 | 10.2.2.200 | 80 | http |

In other words:

* ServerA (`10.1.1.100`) calls ServerB using `10.1.255.100`.
* CPEB translates the packets so that the source of ServerA is `10.2.255.200` and the destination of ServerB is `10.2.2.200`.

Why is this useful?

In many companies, I see internal routing tables messed up with external IP addresses, without much care. It is obvious that:

* Sooner or later, we cannot interconnect companies because of overlapping IP addresses.
* We cannot interconnect companies that force a specific IP address as the source.

## Relevant Configuration

The following sections show only the relevant configurations.

### CompanyA Router

The CompanyA router wants to reach CompanyB using `10.1.255.0/24`, so we configure a route:

```text
ip route 10.1.255.0 255.255.255.0 10.155.255.1
```

### CPEA Router

Because CompanyA provides the connectivity, the whole MPLS network must know where CompanyA is. A default gateway can be a good choice:

```text
ip route 0.0.0.0 0.0.0.0 10.155.255.254
router ospf 1
 default-information originate
```

### CPEB Router

CPEB must know where CompanyB is:

```text
ip route 10.2.2.0 255.255.255.0 10.255.255.254
```

If ServerA calls ServerB, the CPEB router sees a packet from `10.1.1.100` to `10.1.255.100`. In this case, the packet flows from the `outside` interface to the `inside` one. According to the [NAT Order of Operation](http://www.cisco.com/c/en/us/support/docs/ip/network-address-translation-nat/6209-5.html "NAT Order of Operation"), the router routes the packet before the translation (NAT). I guess that, because CPEB does not know where `10.1.255.100` is, it cannot complete the NAT translation. CPEB must also announce the network that CompanyA calls (`10.1.255.0/24`):

```text
ip route 10.1.255.0 255.255.255.0 Null0
ip prefix-list STATIC-TO-OSPF permit 10.1.255.0/24
route-map STATIC-TO-OSPF permit 10
 match ip address prefix-list STATIC-TO-OSPF
router ospf 1
 redistribute static subnets route-map STATIC-TO-OSPF
```

The interface facing the customer is configured as inside, and the one facing the MPLS network is the outside:

```text
interface Ethernet0/0
 ip address 1.1.1.2 255.255.255.252
 ip nat outside
interface Ethernet0/1
 ip address 10.255.255.1 255.255.255.0
 ip nat inside
```

Finally, we want to:

* Expose the outside ServerA (`10.1.1.100`) using `10.2.255.200`.
* Expose the inside ServerB (`10.2.2.200`) using `10.1.255.100`.

```text
ip nat outside source static 10.1.1.100 10.2.255.200
ip nat inside source static 10.2.2.200 10.1.255.100
```

### CompanyB Router

The CompanyB router wants to reach CompanyA using `10.2.255.0/24`, so we configure a route:

```text
ip route 10.2.255.0 255.255.255.0 10.255.255.1
```

## Testing

We ping or start a connection from ServerA to ServerB using `10.1.255.100`:

```text
CPEB#show ip nat translations
Pro Inside global      Inside local       Outside local      Outside global
--- ---                ---                10.2.255.200       10.1.1.100
tcp 10.1.255.100:80    10.2.2.200:80      10.2.255.200:46711 10.1.1.100:46711
--- 10.1.255.100       10.2.2.200         ---                ---
```

The outside global address (translated into the outside local one) calls the inside global address (translated into the inside local one).

## References

* [NAT Order of Operation](http://www.cisco.com/c/en/us/support/docs/ip/network-address-translation-nat/6209-5.html "NAT Order of Operation")
* [IOS Order of Operation](http://etherealmind.com/cisco-ios-order-of-operation/ "IOS Order of Operation")
