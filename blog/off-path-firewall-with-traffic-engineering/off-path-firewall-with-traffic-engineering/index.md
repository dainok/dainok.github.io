---
cover: ad
date: 2023-03-02
tags:
- advanced
- blog
- design
- firewall
- security
---
I usually deploy simple network architectures for two reasons:

* They are easy to debug and troubleshoot.
* The engineers who come after can understand and manage them easily.

With these rules in mind, I usually deploy in-line firewalls, meaning that traffic is routed through a firewall placed "in the path":

![[inline-firewall.png]]

Sometimes things are more complicated, and we need to deploy "off-path" firewalls, where traffic is only partially routed through the firewall:

![[off-path-firewall.png]]

There are many reasons to do so:

* We want to test a new firewall.
* We do not have enough budget for a firewall big enough to manage the entire traffic.
* We must exclude some latency-sensitive traffic.

In 99% of the scenarios, an in-line firewall is fine. Let's see how to approach the remaining 1%.

## Local Internet Connection

> Requirement #1: We need to use the local Internet connection if available and use the MPLS if not.

Solving this requirement is easy: we implement a conditional static default route. The firewall is used only if the Internet connection through it is working.

Depending on the firewall model, we can use native features and dynamic routing to accomplish this. For the sake of this post, however, we solve the requirement by acting on the L3 switch only.

Network engineers are used to implementing an ICMP probe to `8.8.8.8` to test the Internet connection. I have even read official documents that suggest it, but it is a bad practice because [Google applies rate limits](https://groups.google.com/g/public-dns-discuss/c/p1o62SJElck).

Instead, we implement two DNS probes using two different OpenDNS servers:

```text
ip sla 1
 dns www.cisco.com name-server 208.67.222.222 source-ip 192.168.1.1
 timeout 5000
 frequency 10
ip sla schedule 1 life forever start-time now
ip sla 2
 dns www.google.com name-server 208.67.220.220 source-ip 192.168.1.1
 timeout 5000
 frequency 10
ip sla schedule 2 life forever start-time now
track 1 ip sla 1 reachability
track 2 ip sla 2 reachability
```

DNS providers can rate limit requests with unusual record types, excessive duplicate queries, excessive DNS records, or requests sent from client IPs flagged as malicious. Because we use a 10 s frequency, we can assume it is safe.

We combine the probes above with the OR logical operator:

```text
track 3 list boolean or
 object 1
 object 2
 delay down 12 up 30
```

To avoid flapping, we introduce a delay before the state changes.

Finally, we configure the default static route associated with the probe:

```text
ip route 0.0.0.0 0.0.0.0 192.168.1.254 track 3
```

{{< img src="internet-traffic.png" alt="Active and backup Internet path (L3 diagram)" >}}

With this configuration, Internet traffic is routed through the firewall if the Internet connection via the firewall itself is working. Otherwise, the default route from the MPLS is used.

We should pay attention to the convergence time, especially when the local Internet connection goes down.

## Off-Path Firewall Filtering

> Requirement #2: We must filter some network conversations selectively. We cannot forward everything to the firewall because it does not have sufficient bandwidth or computational resources.

Solving this requirement needs PBR (Policy-Based Routing). We use PBR when we need to make an exception to the normal routing. We want to select, based on protocol, source/destination IP and port, the network flows to be routed through the firewall. The firewall is configured "on a stick", meaning that a single interface receives and transmits the allowed traffic.

![[off-path-firewall-w-flows.png]]

We define the traffic to be filtered with an ACL:

```text
ip access-list extended FILTERED
 permit ip 192.168.20.0 0.0.0.255 any
 permit ip any 192.168.20.0 0.0.0.255
```

We must match both ingress and egress traffic. A route map forwards the traffic through the firewall:

```text
route-map FILTERED permit 10
 match ip address FILTERED
 set ip next-hop verify-availability 192.168.1.254
```

In a non-HA firewall configuration, we can implement a conditional PBR:

```text
route-map FILTERED permit 10
 match ip address FILTERED
 set ip next-hop verify-availability 192.168.1.254 1 track 11
```

Finally, we apply the route map to every L3 interface, excluding the interface where the firewall is attached:

```text
interface Ethernet0/1
 ip policy route-map FILTERED
interface Ethernet0/2
 ip policy route-map FILTERED
```

With this configuration, the ingress traffic matching the ACL is forwarded to the firewall.

## Conclusions

Again, this design should not be used unless specific requirements exist. It works well, though. For large environments, we should consider automation tools: the more human-dependent the process, the more errors (and outages) we will have.
