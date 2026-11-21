---
cover: nautobot
date: 2024-07-10
tags:
- beginner
- nautobot
- ssot
---
Every company should move away from Excel sheets as databases for managing the infrastructure and adopt a structured system as the foundation of its operational workflows.

The goal is a single repository that contains all the infrastructure data, including:

* VLANs, IP networks, IP addresses and VRFs (IPAM).
* Sites, physical and virtual devices.
* Rack configuration and cabling.

This type of data structure is often called SSOT, or Single Source of Truth, which implies that the database:

* Reflects what is configured in the infrastructure.
* Serves as the source for various workflows.

In reality, things are a bit different: a SSOT, as defined here, is not truly a "source" but more of a destination. For instance:

* VLANs, IP networks, IP addresses and VRFs are configured within the devices. We can always create a new VLAN inside a device without updating the SSOT.
* VMs are configured within the virtual environments (e.g., ESXi). We can always add a VM locally to a host (e.g., ESXi) in a way that the orchestrator (e.g., vCenter) or the SSOT cannot see.

That is why I prefer the term Single Pane Of Glass (SPOG). A SPOG is a dashboard that collects data from external sources and presents it in an integrated and coherent way. From a SPOG, we can run workflows that change the state of the systems.

To summarize:

* A unified data structure that shows the state of the infrastructure is essential to reduce operational costs.
* It is not accurate to call it strictly a SSOT (Single Source Of Truth).
* We should approach the problem by developing a SPOG (Single Pane Of Glass).
* A SPOG should be fed, or at least verified, with real data from the infrastructure (often from the individual devices).
* We can associate workflows with the SPOG to make changes to the infrastructure.

From here on, we use the terms SSOT and SPOG interchangeably for simplicity, now that we have clarified the differences.

Here is an example:

* We use Nautobot (or NetBox) as the SSOT.
* We feed it with data from the devices of the infrastructure.
* We define profiles to associate with the switch interfaces.
* When we change the profile associated with an interface in Nautobot, the configuration of the switch is updated automatically.

In the next posts, we implement this workflow from scratch in a development environment. We do not cover how to move the development environment to production.
