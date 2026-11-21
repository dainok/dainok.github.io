---
cover: ad
date: 2018-09-11
tags:
- advanced
- blog
- design
title: What about too complex IT-Infrastructures?
---
IT infrastructures are evolving fast, and they are not becoming simpler. The more flexibility the application layer asks for, the more complexity we add to the network layer.

From RFC 1925:

> (6) It is easier to move a problem around (for example, by moving the problem to a different part of the overall network architecture) than it is to solve it.
> (6a) (corollary). It is always possible to add another level of indirection.

Complexity is like entropy: moving a problem around increases the overall complexity. In other words, solving an application problem at the network layer increases the complexity, especially in operations.

## What Do We Solve in the Network Layer Instead of in Applications?

For mainly historical reasons, applications require L2 adjacency. In other words, we expect application servers to be in the same network. In most cases, this is not a strict requirement, but a design assumption. Legacy applications in particular are implemented "to work", not "to scale". Because of that, developers build applications as simply as possible, placing one or two clustered application servers in the same network (L2 adjacency), connected to a local database cluster.

![[legacy-infrastructure.png]]

And they work as expected, but...

> What happens when applications must scale geographically between data centers?

And...

> What happens when applications must be secured offline in a different site for disaster recovery purposes?

One of the common requirements nowadays is to have applications that span data centers, so that issues in one data center do not decrease the availability. Application clustering usually expects local adjacency, so we must extend (stretch) the local networks between sites. This is requested because applications are initially designed without thinking about geographic availability.

It is now obvious that solving an application design issue at the networking layer increases the overall complexity.

## How Can We Satisfy L2 Adjacency with the Network?

Many small companies prefer the simple way, without asking whether they are doing things right. A couple of cables carry all the networks (VLANs) between two sites. This satisfies the L2 adjacency requirements without adding any additional complexity. This is the way many small and medium companies follow: it is cost-effective, easy to implement and easy to manage.

A couple of cables that trunk all the networks do not isolate the two interconnected data centers, though, so any L2 issue in one site (packet storm, STP issue...) impacts the other site too.

In recent years, many technologies have been developed to address these requirements, e.g., OTV, FabricPath, VXLAN (and iVXLAN), Geneve... All of them "should" give reasonable availability and isolation. I use the term "should" because implementations usually do not follow the correct guidelines, and the overall availability is lower than expected.

![[stretched-infrastructure.png]]

We can deduce that maintaining legacy applications and giving them scalability they were not designed for has costs:

* Buying equipment to support new technologies.
* Training technical staff.
* Adapting the procedures for provisioning and operations.
* Increased operational time because of the overall complexity.

## How Do We Design Scalable Applications?

This is not an exhaustive post about application design, but we should remember that:

* We should avoid silo applications.
* Databases should be distributed and replicated across sites.
* File servers should be distributed too, and should expose files through APIs (hopefully via HTTP), not filesystems (e.g., NFS, SMB/CIFS).
* Application servers should be stateless.
* We should avoid L2 adjacency and multicast requirements.
* Networks can always fail, and this should not impact application performance or availability at all.

The last point is especially for all the programmers who think that the network can never fail. This assumption always makes applications crash in the event of:

* L2 (STP) or L3 (e.g., BGP) network convergence.
* Firewall or load balancer failover (sometimes upgrades do not preserve sessions).
* Database failover.

It is not a secret that famous internet applications (Google, Facebook, LinkedIn, Twitter...) are designed to scale geographically and do not need L2 adjacency at all.

![[scalable-infrastructure.png]]

## Conclusions

It does not make sense to me, but many companies still prefer to invest money rather than redesign their applications to be scalable and distributed. That is fine if a deep analysis supports it.

Designing a stretched data center that spans two or more sites, and adding one more site for disaster recovery, can be very complex and requires understanding both the big picture and each detail. Make sure you are not compiling the bill of materials without fully understanding where you want to go in the next few years. Be aware that you should also start designing applications the right way, standardizing and automating everything that can be automated. Automation is the key to being competitive. So make sure you are approaching it the right way.
