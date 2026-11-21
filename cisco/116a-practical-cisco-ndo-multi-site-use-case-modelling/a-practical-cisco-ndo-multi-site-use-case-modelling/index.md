---
cover: cisco
date: 2025-11-02
tags:
- aci
- advanced
- cisco
- ndo
- terraform
---
This example covers the deployment of a [[From Single-Site to Multi-Site with NDO|multi-site]] fabric managed through NDO. The current setup, based on a legacy environment, must be migrated to a newly implemented multi-site environment. This is not a greenfield project, but we can treat it as one, because the entire configuration is generated from scratch.

The requirements of the automation project are to:

* Distribute the production workload across all the sites.
* Ensure fast deployment.
* Provide simple tools for the operations team.

In the current infrastructure, most of the L3 routing is handled by firewalls. Some basic L3 routing scenarios inside the fabric may be implemented in the future.

Unfortunately, there is no single "correct" approach that guarantees results. Moreover, what works today may require changes tomorrow, because NDO, the Terraform NDO provider and [[Managing a brownfield Cisco ACI fabric with NaC and Terraform|NaC]] are constantly evolving.

In this case, I chose to:

* Focus on the production tenant, managing the fabric setup and the inter-site communication manually.
* Prefer the tools in this order: NaC, Terraform, Python.
* Store the automation code and the data structures in [[Git fundamentals for developers and IT professionals|Git]].
* Manage the configuration on NDO, and configure only the unsupported features directly on the APIC.
* Use NaC data structures for objects that rarely require modification.
* Use a simple CSV-based structure for operations that require frequent updates (networks, L3Outs).
* Create a parser that converts the CSV files into NaC and Terraform data structures.

## NDO

NDO manages all the logical configuration, i.e., everything related to templates, with a few exceptions described later. The physical configuration, instead, is managed directly on the APIC, for two reasons:

* There is currently no complete NaC or Terraform module to manage the physical layer.
* The Terraform provider for NDO has poor performance, so it is more efficient to perform non-critical tasks directly on the APIC.

NDO therefore contains:

* The production tenant, applied across all the sites.
* A schema.

The schema contains six tenant templates:

* One template per site, containing BDs, subnets, Application Profiles and EPGs (deploy order 2).
* One shared template for all the sites, containing BDs, Application Profiles and EPGs (deploy order 2).
* One shared template for all the sites, containing VRFs (deploy order 1).
* One shared template for all the sites, containing Contracts (deploy order 1).
* One shared template for all the sites, containing External EPGs (deploy order 3).

Operational activity is typically limited to the templates that contain BDs, Application Profiles and EPGs. The others remain mostly static.

The Terraform provider for NDO does not support tenant-level policies (e.g., IGMP snooping policies). If such policies are required, we must configure them directly on the APIC.

## APIC

All the configuration not managed by NDO, in particular the physical configuration, is managed directly on the APIC. Specifically, the APIC manages:

* Access policies (AAEPs, interface policies, leaf interface policy groups, physical domains, VLAN pools).
* Physical topology (interfaces, vPCs).
* Physical association with EPGs.

Each site also has its own dedicated Terraform environment, which ensures visibility into the changes and their impact on the infrastructure.

## NaC and Terraform

In this project, NaC manages nearly the entire configuration. The only exception is the vPC explicit protection groups, which are handled via Terraform.

Terraform may look complex at first, but it offers significant advantages with Cisco ACI: objects are created and deleted safely and automatically.

## Modelling

The infrastructure is built at multiple levels: NDO, APIC, NaC and Terraform. In practice, this requires building a relatively complex data structure that includes some duplicated information.

For example, when we create an EPG, we must associate it with both a BD and the relevant physical interfaces. On NDO, we define BDs, Application Profiles and EPGs; on the APIC, we associate the EPG with the physical interfaces.

Validating the data structure to prevent human errors can be challenging.

The modelling must never be influenced by the technical solution: it must be defined according to the architecture and the operational requirements.

In this case, I chose to work with:

* CSV files containing networks and interfaces.
* YAML files for NaC containing static, non-duplicated information.

I developed a parser that:

* Validates the CSV data structure.
* Performs integrity checks (e.g., the use of a VLAN depends on the definition of its associated network).
* Generates the NaC and Terraform structures for NDO and APIC safely.

Adding or removing objects only requires editing the CSV files, which are designed to be human-readable. Terraform handles the rest safely.

## Parser

The core of the automation is a custom parser that converts CSV-based data structures into NaC and Terraform formats.

The parser provides a user interface that transforms the input files (CSV) into the structures required by NaC and Terraform.

It also validates and normalizes the CSV input, performing multiple integrity checks.

The parser can be integrated easily into a CI/CD pipeline: the user only needs to update a CSV file. After the commit, the deployment of the configuration is managed automatically during a maintenance window.

This approach also lets us modify the parser safely: if the generated data structure remains unchanged, no errors were introduced. Similarly, the CSV structure can evolve, for example by integrating with an IPAM.

## CSV

In this scenario, the input data is managed with two main CSV files.

Network CSV:

![[network-csv.png]]

IT teams are typically used to thinking of networks in terms of VLANs. VLAN tags are also critical when connecting ACI with environments that do not natively support VXLAN. Moreover, all objects must have unique names, to avoid overlaps with the shadow objects created on other sites.

Each network can include a subnet and may be L2 stretched. If the VRF is not defined, a default one is used. The name of the Application Profile is derived from the site and the VRF name, because this migration project follows a network-centric model from legacy to ACI.

This CSV file generates:

* VRFs (e.g., `replica_VRF` or `default_VRF`).
* Application Profiles (e.g., `MI-storage_replica_App` or `MI-default_App`).
* Bridge Domains (e.g., `MI-0011-INFRA-DMZ_BD`).
* EPGs (e.g., `MI-0011-INFRA-DMZ_EPG`).

The objects (VRF, Application Profile, Bridge Domain, Subnets, Endpoint Groups) are created on NDO. They are deployed on the shared template if `SITE=SHARED`, or on the site-specific template otherwise.

With this model, we immediately identify a critical issue: if a site-local network (not L2 stretched) later needs to become L2 stretched, we must set `SITE=SHARED`. In practice, this destroys and recreates the object with a new name and requires all the associated interfaces to be bound again, which has a significant impact on the infrastructure.

The client requirement, however, is to make a network L2 stretched without disruption. To achieve this, only objects that will **never** need to be stretched should be defined as site-local. All the others, which may potentially be stretched, should be defined with `SITE=SHARED`.

Interface CSV:

![[interface-csv-1.png]]

Each interface group specifies the site, the corresponding leaf, the policy group, the configured interfaces, the tagged VLANs and the native VLAN.

We must define a unique `GROUP_NAME`: it is used to build the related objects and cannot be changed later. `PORT_DESCRIPTION` can be modified freely and defaults to the same value as `GROUP_NAME`.

For individual interfaces, `POLICY_GROUP` references one of the predefined policy groups, created via a dedicated NaC file.

This CSV file generates:

* Selectors (e.g., `MI-SERVER-1A_Sel`) associated with the leaf interface profiles (e.g., `TrustedPort_PolGrp`).
* Port blocks (e.g., `Block3`) associated with the selectors and their descriptions (e.g., `to Server 1`).

For vPC interfaces, `POLICY_GROUP` references a policy template used when the vPC policy group is created.

For vPCs, this CSV file generates:

* vPC-type policy groups (e.g., `MI-BLADE-1_PolGrp`).
* Selectors (e.g., `MI-BLADE-1_Sel`) associated with the policy groups and the leaf interface profiles.
* Port blocks (e.g., `Block1`) linked to the selectors, with descriptions (e.g., `vPC to Blade Servers Chassis 1`).

Finally, the file creates the static EPG-to-port/vPC associations for each VLAN.

The CSV files are available in the [GitHub repository](https://github.com/dainok/courses/tree/master/Cisco/NDO/input-data).
