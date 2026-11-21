---
cover: cisco
date: 2025-12-28
tags:
- aci
- beginner
- cisco
---
In the [[Cisco ACI object model explained|previous post]], we introduced the Cisco ACI object model. We saw that we can retrieve objects either through **[[Cisco ACI object model explained|Managed Objects]] (MOs)** or by requesting the objects that belong to a specific class.

![[aci-url-structure-2.png]]

If we need the details of a single object and we know its **DN (Distinguished Name)**, we can issue a specific request to obtain that object and all its details.

If we do not know the DN of the object, or if we simply need a list of the objects that belong to a given class, we must run a more generic query.

Every ACI object is an instance of a **Managed Object (MO) class**. Let's look at the most commonly used classes, grouped by category:

Tenant and networking (`fv*`):

![[aci-tenant-networking-classes.png]]

Contracts and policies (`vz*`):

![[aci-contracts-policies-classes.png]]

Fabric and infrastructure:

![[aci-fabric-infra-classes.png]]

Faults, events and health:

![[aci-fault-events-health-classes.png]]

Endpoints and forwarding:

![[aci-endpoints-forwarding-classes.png]]
