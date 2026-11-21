---
cover: cisco
date: 2026-03-01
tags:
- aci
- advanced
- cisco
- iac
- netascode
- terraform
---
After using NaC in recent projects, I started wondering whether it would be possible to manage an existing (brownfield) infrastructure with NaC. Within the NaC suite, this capability is provided directly by Cisco.

![[services-as-code.png]]

In theory, it is possible to import the objects of an existing infrastructure into the Terraform state file. Likewise, it should be possible to analyze a Cisco ACI fabric and describe (model) it with the language provided by NaC.

If everything works as expected, we can operate safely on a brownfield infrastructure with NaC and Terraform. Let's walk through the process step by step.

This is an educational post: nobody should run this process in a production environment, because it is highly likely to cause a service disruption.

## Analysis of a Cisco ACI Fabric

The first step is relatively straightforward: we read from a Cisco ACI infrastructure the objects that NaC models. In this example, we limit the scope to Tenants, VRFs and Bridge Domains (BDs).

The most direct approach is to use the APIs, which we have already discussed. This time I chose Cobra, the Python SDK that can be downloaded from any APIC at `https://172.25.82.1/cobra/_downloads/`.

Once we have downloaded the `*.whl` files, we can install them with:

```bash
pip install *.whl
```

Cobra is a powerful tool, but its documentation is very limited. Understanding how to use the SDK properly can therefore be challenging, and more than once I had to inspect the source code of the library to find out how to use it correctly.

Let's start by retrieving all the tenants:

```python
# Get Tenants
fvTenant_objs = moDir.lookupByClass("fvTenant")
for tenant in fvTenant_objs:
    if tenant.name in IGNORED_TENANTS:
        # Ignore tenant
        continue
    nac_tenant_data = {}
    nac_tenant_data["name"] = tenant.name
    if tenant.descr:
        nac_tenant_data["description"] = tenant.descr
```

For each tenant, we must retrieve the associated VRFs:

```python
    # Get VRFs
    fvCtx_objs = moDir.lookupByClass('fvCtx', parentDn=tenant.dn)
    if fvCtx_objs:
        nac_tenant_data["vrfs"] = []
    for vrf in fvCtx_objs:
        nac_vrf_data = {}
        nac_vrf_data["name"] = vrf.name
        nac_vrf_data["enforcement_preference"] = vrf.pcEnfPref
        if vrf.descr:
            nac_vrf_data["description"] = vrf.descr
        nac_tenant_data["vrfs"].append(nac_vrf_data)
```

And finally, the Bridge Domains:

```python
    # Get BrideDomains
    fvBD_objs = moDir.lookupByClass('fvBD', parentDn=tenant.dn, subtree="children")
    if fvBD_objs:
        nac_tenant_data["bridge_domains"] = []
    for bd in fvBD_objs:
        nac_bd_data = {}
        nac_bd_data["name"] = bd.name
        nac_bd_data["multicast_arp_drop"] = parse_boolean(bd.mcastARPDrop)
        nac_bd_data["ip_dataplane_learning"] = parse_boolean(bd.ipLearning)
        nac_bd_data["unknown_unicast"] = bd.unkMacUcastAct
        if bd.descr:
            nac_bd_data["description"] = bd.descr
        nac_tenant_data["bridge_domains"].append(nac_bd_data)

        # Find VRF
        for child in bd.children:
            if child.meta.moClassName == "fvRsCtx":
                vrf = moDir.lookupByDn(child.tDn)
                nac_bd_data["vrf"] = vrf.name
                break
```

As the code shows, while we retrieve the objects we progressively build the NaC-formatted data structure that describes Tenants, VRFs and BDs.

Since NaC lets us organize the information freely, we generate one file per tenant:

```python
    # Dump data
    with open(f"data/tenant-{tenant.name}.nac.yaml", "w", encoding="utf-8") as fh:
        nac_data = {"apic": {"tenants": [nac_tenant_data]}}
        yaml.dump(nac_data, fh, default_flow_style=False, sort_keys=False, allow_unicode=True)
```

The result is a set of NaC files that describe our infrastructure:

```yaml
apic:
  tenants:
  - name: NTS_TRAINING
    vrfs:
    - name: PROD
      enforcement_preference: unenforced
    bridge_domains:
    - name: FW_OUTSIDE
      multicast_arp_drop: false
      ip_dataplane_learning: false
      unknown_unicast: flood
      vrf: PROD
    - name: APP
      multicast_arp_drop: false
      ip_dataplane_learning: true
      unknown_unicast: flood
      vrf: PROD
    - name: WEB
      multicast_arp_drop: false
      ip_dataplane_learning: true
      unknown_unicast: proxy
      vrf: PROD
    - name: DMZ
      multicast_arp_drop: false
      ip_dataplane_learning: true
      unknown_unicast: flood
      vrf: PROD
```

This is the simplest part. The next step is to import the objects from Cisco ACI into Terraform using the NaC data model.

The script used in this example is available in the [GitHub repository](https://github.com/dainok/courses/tree/master/Cisco/ACI).
