---
cover: cisco
date: 2025-08-27
tags:
- aci
- advanced
- cisco
---
Before diving into the Cisco ACI APIs, we need a brief introduction to the hierarchical structure of its elements.

This article may look intimidating because of its complexity. In reality, we use it as a reference whenever we need to understand a detail better, to optimize our automation. Don't be discouraged: automating a Cisco ACI fabric is a very straightforward process.

## Promise Theory

Cisco ACI is object-oriented and based on [Promise Theory](https://developer.cisco.com/docs/aci/introduction/#where-to-go-from-here): each object declares the promises it keeps, i.e., it specifies what it can do. Policies establish the relationships between the objects that provide promises and those that consume them:

![[aci-class-diagram.png]]

Let's take an example related to traffic management between EPGs:

* **EPG (Endpoint Group):** a group of endpoints promises to provide/accept traffic under specific conditions.
* **Contracts:** define the interaction rules between EPGs.
* **Policy model:** declares that two EPGs can communicate according to the rules defined in a given contract.
* At this point, the desired state composed of EPGs, contracts and the policy model is pushed down, and the objects implement the changes, returning faults when required.

## Object Model

Cisco ACI uses a [hierarchical model](https://www.cisco.com/c/en/us/td/docs/switches/datacenter/aci/apic/sw/policy-model-guide/b-Cisco-ACI-Policy-Model-Guide.html), in which objects located in different branches can still interact directly.

![[aci-hierarchical-model.png]]

The object model represents the tree of objects and properties that implement the Cisco ACI fabric. Each Managed Object (MO) has a class and a unique Distinguished Name (DN), formed by the name of its parent and its relative name. The Management Information Model (MIM) [describes](https://developer.cisco.com/site/apic-mim-ref-api/?version=6.1(x)) the structure of the model, the relationships and the objects. In other words, the object model contains the configuration of the fabric, implemented according to the MIM rules.

The object model is managed by an APIC (Application Policy Infrastructure Controller) cluster. Each switch receives the policies from the APIC and enforces them locally.

To see some examples, we can use **Visore**, available from the APIC at `/visore.html` or under `Tools` → `Object Store Browser`:

![[aci-visore-1.png]]

In the example above, I searched for the class `fvTenant`, and Visore returned all the objects that belong to that class.

Some attributes to highlight:

* `DN` (Distinguished Name): the unique identifier of the object (e.g., `uni/tn-Tenant64`). `uni` (Unified Namespace) is the root of the MO tree. All the objects of the fabric have a DN, rooted in `uni`.
* `monPolDn` (Monitoring Policy Distinguished Name): the policy applied to monitor the object (e.g., `uni/tn-common/monepg-default`).
* `name`: the name of the object, which, as shown, is part of the DN (`Tenant64`). Objects cannot be renamed in ACI because the name is bound to the DN, and once set, the DN cannot be modified.

`uni` is the root of the DNs, i.e., the topRoot object (described by the MIM), from which all the objects of the fabric derive. Some of the first levels under `uni` include:

| Branch         | Meaning                                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------------------ |
| `uni/tn-*`     | Tenant (`fvTenant` class). Contains AppProfiles, EPGs, BDs, Subnets, Contracts, etc.                         |
| `uni/infra`    | Physical infrastructure and policies: access policies, profiles, AAEP, switch profiles, physical/VM domains. |
| `uni/fabric`   | Fabric configuration: global policies, fabric-wide settings, discovery.                                      |
| `uni/topology` | Physical structure of pods and nodes (Leaf/Spine, interfaces, port-channels).                                |
| `uni/health`   | Global health of the fabric (in addition to `healthInst` for each MO).                                       |
| `uni/fv`       | Package for logical virtualization objects (tenants, BDs, EPGs, etc.).                                       |
| `uni/vz`       | Contracts package (communication policies).                                                                  |
| `uni/qos`      | QoS policies.                                                                                                |
| `uni/mgmt`     | Management objects (In-Band and Out-of-Band).                                                                |
| `uni/l3ext`    | Configurations for external Layer 3 connections (Outside Networks, External EPGs).                           |
| `uni/phys`     | Physical domains.                                                                                            |
| `uni/vmmp`     | VMM domains (VMware, Hyper-V, KVM, OpenStack).                                                               |
| `uni/cloud`    | Cloud domain (integration with public clouds).                                                               |

## Object Relationships

Let's now see how the objects inside `uni` relate to each other.

This example refers to the logical part. In Cisco ACI, the network `10.10.10.1/24` is represented as a **Subnet object** associated with a **Bridge Domain**. A Bridge Domain represents the L2 domain and can contain one or more subnets. The relationship is one-to-many: one Bridge Domain is referenced by multiple Subnets.

Bridge Domains, in turn, are associated with a Tenant, which is essentially the logical container.

![[aci-tenant-classes.png]]

The diagram also shows cross-relationships: an EPG represents a group of endpoints that share the same network and security policies. An EPG can communicate with other EPGs based on specific rules (Contracts).

The diagram shows that:

* One Bridge Domain is referenced by multiple EPGs (one-to-many).
* One Contract is referenced by multiple EPGs (one-to-many).

From a data structure perspective:

* Each object has an **attributes dictionary** that contains all its specific values (DN, name, description, etc.).
* The relationships with other objects are described in the **children list**.

When an object contains a group of objects (e.g., a Tenant contains its Bridge Domains), the parent object includes those objects in its children. Example: a Bridge Domain that contains a Subnet:

```json
{
    "totalCount": "1",
    "imdata": [
        {
            "fvBD": {
                "attributes": {
                    "OptimizeWanBandwidth": "no",
                    "annotation": "",
                    "arpFlood": "yes",
                    "descr": "",
                    "dn": "uni/tn-NTS_TRAINING/BD-APP",
                    // [...]
                },
                "children": [
                    {
                        "fvSubnet": {
                            "attributes": {
                                "annotation": "",
                                "ctrl": "",
                                "descr": "",
                                "ip": "10.1.1.254/24",
                                // [...]
                            }
                        }
                    },
                    // [...]
                ]
            }
        }
    ]
}
```

When an object references another object located in a different branch, the children list does not contain the full object but only a reference. Example: an EPG that references a Bridge Domain:

```json
{
    "totalCount": "1",
    "imdata": [
        {
            "fvAEPg": {
                "attributes": {
                    "annotation": "",
                    "descr": "",
                    "dn": "uni/tn-NTS_TRAINING/ap-CorpApp/epg-CLIENTS",
                    // [...]
                },
                "children": [
                    // [...]
                    {
                        "fvRsBd": {
                            "attributes": {
                                "annotation": "",
                                "tnFvBDName": "CLIENTS",
                                "userdom": "all"
                            }
                        }
                    }
                ]
            }
        }
    ]
}
```

Note that the class of the referenced Bridge Domain is not `fvBD` but `fvRsBd`, where `Rs` stands for relationship.

## API URL Structure

Finally, let's describe the structure of the URL:

![[aci-url-structure-1.png]]

Take for example the address used to retrieve the Bridge Domain shown earlier:

```text
https://172.25.82.1/api/mo/uni/tn-NTS_TRAINING/BD-CLIENTS.json
```

Breakdown:

* `https` → protocol used to access the APIC.
* `172.25.82.1` → address of the APIC cluster.
* `/api` → start of the paths reserved to the API (the web interface uses other components, often under `/insieme`).
* `/mo` → query of a Managed Object (alternatively, we could list all the objects of a given class).
* `/uni/tn-NTS_TRAINING/BD-CLIENTS` → DN of the object (also the path from the root).
* `.json` → output format (JSON; XML is the alternative).

We could also use the following address:

```text
https://172.25.82.1/api/node/mo/uni/tn-NTS_TRAINING/BD-CLIENTS.json
```

In this case, `/node` specifies that the request must be directed to a specific node of the APIC cluster, determined by the address. Otherwise, the request is handled by the cluster.
