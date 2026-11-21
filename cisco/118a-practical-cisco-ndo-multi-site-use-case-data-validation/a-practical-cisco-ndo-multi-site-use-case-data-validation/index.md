---
cover: cisco
date: 2025-11-16
tags:
- aci
- advanced
- cisco
- ndo
- netascode
---
As we have seen, the CSV files are used to generate the NaC configuration. We need validation tests, however, to ensure correctness.

Let's start with the CSV file that defines the networks:

![[networks-csv.png]]

* `VLAN_ID` must contain an integer within a defined VLAN pool.
* `VLAN_NAME` must contain an alphanumeric string without spaces (hyphens and underscores are allowed). Uppercase or lowercase can be enforced if needed.
* `SITE` must contain one of the following values: `RM`, `MI` or `SHARED`. This field defines the name of the object and the associated tenant template in NDO.

The fields `VLAN_ID`, `VLAN_NAME` and `SITE` together define the name of the object, e.g., `MI-0011-INFRA-DMZ`.

* `L2_STRETCHED` specifies whether the network is stretched between `MI` and `RM`. Only networks in the `SHARED` template can be L2 stretched.
* `ANYCAST_ADDRESS` defines the subnet associated with the Bridge Domain. If a network has an Anycast address and is associated with the `SHARED` template, it must be L2 stretched.
* `VRF` defines the name of the associated VRF. If empty, a default VRF is created.
* `ADVERTISED` specifies whether the subnet is advertised via dynamic routing protocols.

An additional check, not implemented yet, could verify whether a VLAN is already in use in the `fabric-interfaces.csv` file.

Now let's move on to the CSV file that defines the interfaces:

![[interraces-csv.png]]

* `SITE` must contain `RM` or `MI`.
* `LEAF_ID` contains the ID of a single leaf or of a pair of leaves. Each ID must be present in `fabric-leaves.csv`.
* `POLICY_GROUP` contains the associated policy group. If `LEAF_ID` is a single value, the policy group must exist in `custom-apic-fabric.nac.yaml`. If it is a pair, it must exist in `config.yaml`.
* `INTERFACES` lists the interfaces to configure, separated by commas. Each interface can be used only once per leaf.
* `TAGGED_VLANS` can include a VLAN range; each VLAN must exist in `l2-networks.csv`.
* `NATIVE_VLAN` can include a VLAN defined in `l2-networks.csv`.
* `GROUP_NAME` defines the names of the objects on the APIC (selectors, policy groups): these values must remain unchanged.
* `PORT_DESCRIPTION` defines the description of the interface. If empty, the value of `GROUP_NAME` is used.

The CSV files are available in the [GitHub repository](https://github.com/dainok/courses/tree/master/Cisco/NDO/input-data).
