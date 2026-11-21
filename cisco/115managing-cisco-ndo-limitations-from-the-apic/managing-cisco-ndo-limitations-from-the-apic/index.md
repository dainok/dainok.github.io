---
cover: cisco
date: 2025-10-26
tags:
- advanced
- cisco
- ndo
- netascode
---
We have seen that NDO currently has some important limitations that we must keep in mind:

* The NDO frameworks have limitations, particularly NaC.
* NDO itself has limitations.
* Certain configurations must necessarily be managed directly on the APIC.

This is far from a trivial consideration, and to understand it fully we need to analyze how NDO creates objects on the APIC.

## Objects Created by APIC vs. NDO

When I create an object manually on the APIC, the `annotation` field is empty. If I create it through [[Importing NaC objects from Cisco ACI into Terraform|Terraform]] or [[Introduction to Ansible Automation|Ansible]], the field is populated with the name of the framework used.

When NDO creates the object, we get:

```text
annotation: orchestrator:msc-shadow:no
children -> fvSiteAssociated -> children -> fvRemoteId
```

See the files `BD-MANUAL-ON-APIC.json` and `BD-94-FROM-NDO.json` in the [GitHub repository](https://github.com/dainok/courses/tree/master/Cisco/NDO/objects).

## Modifying an Object Created by NDO

Let's look at a practical example: we need to add the IGMP Snooping policy, because NDO does not support it with NaC. The Bridge Domain has `unicastRoute` disabled.

We modify the Bridge Domain with Terraform/NaC. The final result shows the following differences:

```text
annotation: orchestrator:terraform
unicastRoute: no -> yes
```

See the files `BD-94-SHADOW-FROM-NDO.json` and `BD-94-FROM-NDO-MODIFIED.json` in the [GitHub repository](https://github.com/dainok/courses/tree/master/Cisco/NDO/objects).

If I redeploy from NDO, I get:

```text
annotation: orchestrator:terraform -> orchestrator:msc-shadow:no
unicastRoute: yes -> no
children -> fvSiteAssociated -> name: -> msc-local
```

This happens even if I manually modify, on the APIC, an object that was originally created by NDO.

See the files `BD-94-FROM-NDO-REDEPLOYED.json` and `BD-94-FROM-NDO-MODIFIED.json` in the [GitHub repository](https://github.com/dainok/courses/tree/master/Cisco/NDO/objects).

We can therefore conclude that, if we modify on the APIC an object created by NDO:

* NDO then interprets it as locally managed (`msc-local`).
* If we use a framework, the `annotation` field is overwritten.
* If we use a framework, the parameters are reset to their defaults.

We must therefore remember to:

* Use the `ndo_managed` parameter to preserve the `annotation` field.
* When we use a framework, specify the same parameters used to create the object in NDO.

## Shadow Objects

When we use NDO, even if the templates are tied to different sites, NDO creates all the objects on all the APICs. This is why identical objects that belong to different templates must have different names.

Objects on an APIC that belong to a different fabric are marked as shadow objects, and this information is always stored in the `annotation` field:

```text
annotation: orchestrator:msc-shadow:yes
annotation: orchestrator:msc-shadow:no
```

See the files `BD-94-FROM-NDO.json` and `BD-94-SHADOW-FROM-NDO.json` in the [GitHub repository](https://github.com/dainok/courses/tree/master/Cisco/NDO/objects).

From the Web UI, we can make shadow objects visible by navigating to `Manage my profile` → `Settings` → `Show Hidden Policies`:

![[apic-application-settings.png]]

At this point, the shadow objects become visible:

![[aci-shadow-objects.png]]

## Stretching a Stretched Network

A critical point of the design phase is how to extend networks without causing service disruption.

We have seen that, during the design, we configure our networks (Bridge Domains) in a template, which can be either local to a site or shared across multiple sites. As a consequence, if we need to extend a network that was previously configured in a site-local template, we must move it to the appropriate shared template.

NDO provides a dedicated function for this:

![[ndo-object-migration.png]]

Our Infrastructure as Code approach, however, does not rely on the Web UI.

It is also likely that the names of the objects depend on the associated template: changing the template means changing the name, and changing the name means deleting the object on the APIC and recreating it from scratch, with all its dependencies.

My approach is therefore to define networks as shared, unless we are certain that they will always remain strictly local. Of course, we must consider the architectural limits, to make sure we do not exceed the allowed number of objects per type.

## Safeguarding the Critical Tenant

Each [[Introduction to Cisco ACI|ACI]] fabric includes an infrastructure tenant, which defines its basic functionality and connectivity. The production workload tenants are added on top of it.

In my view, we must consider managing the infrastructure tenant separately from the production tenants: both can be handled through Infrastructure as Code, but they have different characteristics and requirements.

The Infra tenant is prepared at the beginning and changes very rarely. An error on the Infra tenant can compromise the entire fabric.

The production tenants are modified constantly. An error affects only the specific tenant.

My approach is therefore to separate the two implementations, minimizing the changes and limiting access to the Infra tenant.

With NDO, dividing the management into multiple workspaces also improves the performance of the automation system (especially with Terraform and NaC).
