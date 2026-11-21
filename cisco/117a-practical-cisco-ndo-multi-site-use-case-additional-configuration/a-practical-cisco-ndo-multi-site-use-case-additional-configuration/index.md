---
cover: cisco
date: 2025-11-09
tags:
- aci
- advanced
- cisco
- ndo
- netascode
---
In the [[A practical Cisco NDO multi-site use case modelling|previous article]], we built the data structure that defines our infrastructure and most of its operational logic. Some elements, however, require a different approach.

## Config

I usually work with two main files to store the required variables: `config.yaml` and `secrets.yaml`.

The `config.yaml` file includes:

* The access references for APIC and NDO:

```yaml
apics:
  mi:
    name: MI-FABRIC
    url: https://192.168.1.1
    url_insecure: true
  rm:
    name: RM-FABRIC
    url: https://192.168.2.1
    url_insecure: true
ndo:
  url: https://192.168.0.1
  url_insecure: true
```

* The names and the deployment order of the templates:

```yaml
ndo:
  templates:
    contracts:
      name: Template-Contracts
      deploy_order: 1
    stretched_extepg:
      name: Template-Stretched-ExtEPG
      deploy_order: 3
    stretched_vrf:
      name: Template-Stretched-VRF
      deploy_order: 1
    site_mi:
      name: Template-MI
      deploy_order: 2
    site_rm:
      name: Template-RM
      deploy_order: 2
```

* The parameters of the optional filters:

```yaml
ndo:
  templates:
    site_stretched:
      filters:
        - name: ANY_Filter
          entries:
            - name: Any
              ethertype: unspecified
```

* The name of the physical domain.

The `secrets.yaml` file, instead, stores the credentials required to access NDO and APIC:

```yaml
ndo:
  username: admin
  password: "password"
mi:
  username: admin
  password: "password"
rm:
  username: admin
  password: "password"
```

Both files are available in the [GitHub repository](https://github.com/dainok/courses/tree/master/Cisco/NDO).

## NaC Static Files

Some NaC-related configurations are rarely modified. Before changing them, it is essential to evaluate their potential impact on the fabric, because they are the foundational building blocks of the entire infrastructure.

My approach is to use the NaC data structure for the components that are defined statically, do not interact with other systems (e.g., NDO, APIC) and seldom require modification. These configurations are defined in the file `custom-apic-fabric.nac.yaml`.

In particular, I chose to define statically the fabric access policies for:

* AAEPs:

```yaml
apic:
  access_policies:
    aaeps:
      - name: Phy_AAEP
        routed_domains:
          - PhyL3Out_RoutedDomain
        physical_domains:
          - Phy_Domain
```

* Interface policies (e.g., CDP, LLDP, port channel):

```yaml
apic:
  access_policies:
    interface_policies:
      cdp_policies:
        - name: ENABLE_CDP_IntPol
          admin_state: true
        - name: DISABLE_CDP_IntPol
          admin_state: true
      lldp_policies:
        - name: ENABLE_LLDP_IntPol
          admin_rx_state: true
          admin_tx_state: true
        - name: DISABLE_LLDP_IntPol
          admin_rx_state: false
          admin_tx_state: false
      port_channel_policies:
        - name: ENABLE_LACP_PO_IntPol
          mode: active
          suspend_individual: true
          graceful_convergence: true
        - name: ENABLE_STATIC_PO_IntPol
          mode: off
          suspend_individual: true
          graceful_convergence: true
```

* Leaf interface policy groups (e.g., `TrustedPort_PolGrp`, `UntrustedPort_PolGrp`):

```yaml
apic:
  access_policies:
    leaf_interface_policy_groups:
      - name: TrustedPort_PolGrp
        type: access
        cdp_policy: DISABLE_CDP_IntPol
        lldp_policy: ENABLE_LLDP_IntPol
        aaep: Phy_AAEP
      - name: UntrustedPort_PolGrp
        type: access
        cdp_policy: DISABLE_CDP_IntPol
        lldp_policy: DISABLE_LLDP_IntPol
        aaep: Phy_AAEP
```

* Physical and routed domains:

```yaml
apic:
  access_policies:
    vlan_pools:
      - name: Phy_VlanPool
        allocation: static
        ranges:
          - from: 1
            to: 1001
            role: external
          - from: 1006
            to: 3499
            role: external
      - name: PhyL3Out_VlanPool
        allocation: static
        ranges:
          - from: 3500
            to: 3999
            role: external
```

* VLAN pools:

```yaml
apic:
  access_policies:
    vlan_pools:
      - name: Phy_VlanPool
        allocation: static
        ranges:
          - from: 1
            to: 1001
            role: external
          - from: 1006
            to: 3499
            role: external
      - name: PhyL3Out_VlanPool
        allocation: static
        ranges:
          - from: 3500
            to: 3999
            role: external
```

These files are also available in the [GitHub repository](https://github.com/dainok/courses/tree/master/Cisco/NDO/input-data).

## Single Ports and vPC Profiles

We have seen that, when we define a static port, we can associate a policy group that acts as a template:

![[interface-csv-2.png]]

In our CSV file, port 3 of leaf 101 is associated with the `TrustedPort` policy group. The port is therefore configured with LLDP enabled and CDP disabled. As mentioned, the `TrustedPort` policy group is defined statically in `custom-apic-fabric.nac.yaml`.

When we configure a **vPC**, however, we cannot use the same approach, because each vPC requires a unique policy group: an abstraction layer is missing.

During the modelling phase, we decided to configure vPCs with a **template-based** approach, similar to the one we use for single interfaces.

The templates are defined in `config.yaml`:

```yaml
fabric:
  port_channel_policies:
    TrustedLACPVPC:
      type: vpc
      cdp_policy: ENABLE_CDP_IntPol
      lldp_policy: ENABLE_LLDP_IntPol
      aaep: Phy_AAEP
      port_channel_policy: ENABLE_LACP_PO_IntPol
    TrustedStaticVPC:
      type: vpc
      cdp_policy: ENABLE_CDP_IntPol
      lldp_policy: ENABLE_LLDP_IntPol
      aaep: Phy_AAEP
      port_channel_policy: ENABLE_STATIC_PO_IntPol
    UntrustedLACPVPC:
      type: vpc
      cdp_policy: DISABLE_CDP_IntPol
      lldp_policy: DISABLE_LLDP_IntPol
      aaep: Phy_AAEP
      port_channel_policy: ENABLE_LACP_PO_IntPol
    UntrustedStaticVPC:
      type: vpc
      cdp_policy: DISABLE_CDP_IntPol
      lldp_policy: DISABLE_LLDP_IntPol
      aaep: Phy_AAEP
      port_channel_policy: ENABLE_STATIC_PO_IntPol
```

Each template contains the configuration applied when the policy group associated with each vPC is created.

For example, if a vPC is defined as `TrustedLACPVPC` in the `fabric-interfaces.csv` file, the automation creates a policy group by copying the configuration of the corresponding template.

This lets us manage both single interfaces and vPCs with a unified, centralized approach to defining configuration profiles.

The files are available in the [GitHub repository](https://github.com/dainok/courses/tree/master/Cisco/NDO/input-data).
