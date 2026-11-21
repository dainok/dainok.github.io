---
cover: cisco
date: 2025-08-10
tags:
- aci
- beginner
- cisco
---
Cisco ACI is the Software-Defined Networking (SDN) solution that Cisco designed specifically for data center networking. I would argue that it is Cisco's only truly SDN-native solution, because it was built from the ground up to be **API-first**: every operation in the system is executed via API.

But let's take a step back.

## A Brief History of Infrastructure

Over the years, IT infrastructures have been asked for capabilities that were not originally envisioned. These capabilities are essential to scale applications horizontally, deliver services across multiple sites, support workload mobility and handle disaster recovery.

Ideally, applications should scale horizontally in a seamless and agile way. In the real world, however, many applications were designed to rely on a consistent network identity, regardless of where they run.

As a result, infrastructure has evolved to become as transparent and scalable as possible. We moved from physical servers to virtual machines that can be migrated transparently (e.g., vMotion) from one host to another, even across sites.

If I had to pick a moment when this transition began, I would point to 1984, when [Radia Joy Perlman](https://www.invent.org/inductees/radia-perlman) invented the Spanning Tree Protocol (STP). It allowed devices on physically separate networks to communicate as if they were on the same subnet, which was critical for applications designed with that assumption. It is also worth mentioning [NetBIOS](https://en.wikipedia.org/wiki/NetBIOS), which was used in the same era and for many years after.

As Radia herself once said:

> I assumed STP was a short-term fix that would last a few months until the deployed nodes could be upgraded to work with existing routers.

This highlights a fundamental truth: infrastructure adapts to the needs of applications, even when the solution is not architecturally ideal.

## Reducing Complexity

It should come as no surprise that technologies originally developed for service providers, such as BGP, VPN, OSPF/ISIS and VXLAN, are now commonplace in both data center and campus networks. The goal remains the same: to scale networks horizontally and geographically, while keeping maximum transparency for applications and users.

SDN is the paradigm that lets us simplify operations and make them sustainable in increasingly large and complex infrastructures.

## API-First by Design

API-first is a paradigm that ensures the infrastructure can be fully integrated with any automation or orchestration framework. It is not just about freedom of choice, it is about **completeness**. Only systems designed from the beginning with an API-first philosophy can be truly managed via API, across **all** operational aspects.

In systems where APIs were added after the fact, the coverage tends to be incomplete. Certain operations may not be possible via API, or may rely on unreliable workarounds that compromise the stability of the system.

## Automation First

Cisco ACI is a highly sophisticated system, and operations that were once trivial can now involve far more complexity. For instance, creating a port channel through the ACI GUI requires [12 distinct steps](https://www.cisco.com/c/en/us/td/docs/dcn/aci/aci-virtual-edge/3x/Configuration/cisco-aci-virtual-edge-configuration-guide-31x/Cisco-ACI-Virtual-Edge-Configuration-Guide-31x-port-channel-and-virtual-port-channel-configuration.html):

![[aci-manual-steps.png]]

Presented poorly, this technology can seem overwhelming. ACI, however, transforms (and must transform) the operational model: it standardizes workflows, makes operations sustainable and reduces the risk of human error.

To benefit fully from ACI, we need a mindset shift. We must let go of old habits, leave the CLI behind and approach complexity from a new angle.

**If you are configuring Cisco ACI using the Web GUI, you are doing it wrong.**

In the upcoming articles, we explore how a new, automation-driven approach is not only possible, but accessible to everyone.
