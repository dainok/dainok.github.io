---
cover: cisco
date: 2025-09-24
tags:
- beginner
- cisco
- ndo
---
As infrastructures expand across different geographic locations and distances grow, moving from a single-site setup to a multi-site architecture becomes a natural step.

In an ideal world, each site of a multi-site deployment operates independently. In practice, applications often have specific requirements that call for stretched L2 networks between sites. Since this is driven by the applications themselves, my advice is to design self-sufficient and independent silos that keep running even if another site goes down.

When the real need is to connect applications across multiple sites in a native and consistent way, the tool of choice is **Cisco Nexus Dashboard Orchestrator (NDO)**.

NDO is a powerful platform, but also a complex one with some limitations. Like any automation project, it requires the involvement of multiple roles and skill sets. Here we focus only on the aspects that matter most for our use case, without going too deep into the overall design and configuration architecture of NDO.

## Object Structure

NDO organizes its configuration using **schemas** and **templates**, which are then applied to tenants and sites:

* **Schemas:** collections of templates that share a common use case.
* **Templates:** define the objects that are deployed to one or more sites. These objects can include Application Profiles, EPGs, Contracts, VRFs, Bridge Domains, Filters, External EPGs and L3Outs. At the template level, we choose the sites where the objects are applied.
* **Tenants:** logical containers for objects, mapped one-to-one to the tenants defined in the APIC.

## Key Considerations

There are a few important points to keep in mind when working with NDO:

* **NDO does not cover everything.** We cannot configure the entire fabric exclusively through NDO: some operations still need to be performed directly on the APIC.
* **Avoid [[Circular Dependencies with NDO|circular dependencies]].** Objects defined in different templates must not create circular relationships between each other (we dive deeper into this later).
