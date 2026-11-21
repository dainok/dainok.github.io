---
cover: terraform
date: 2026-03-15
tags:
- aci
- advanced
- cisco
- iac
- netascode
- terraform
---
In the [[Importing NaC objects from Cisco ACI into Terraform|previous post]], we saw how to import an infrastructure defined through NaC into Terraform. We stopped when `terraform plan` reported differences in some attribute values:

```text
# module.aci.module.aci_bridge_domain["NTS_TRAINING/WEB"].aci_rest_managed.fvBD will be updated in-place
~ resource "aci_rest_managed" "fvBD" {
    + annotation  = "orchestrator:terraform"
    ~ content     = {
        - "OptimizeWanBandwidth"     = "no" -> null
        - "intersiteBumTrafficAllow" = "no" -> null
        - "intersiteL2Stretch"       = "no" -> null
        - "ipv6McastAllow"           = "no" -> null
        - "llAddr"                   = "::" -> null
        - "ownerKey"                 = null
        - "ownerTag"                 = null
        - "userdom"                  = "all" -> null
        # (19 unchanged elements hidden)
      }
    + escape_html = true
      id          = "uni/tn-NTS_TRAINING/BD-WEB"
    # (2 unchanged attributes hidden)
  }
```

I identified three possible scenarios:

* The attribute is cosmetic or not relevant (e.g., `annotation`).
* The attribute is not handled by our import script (ACI to NaC).
* The attribute is not managed by NaC.

Let's examine the three cases in detail.

This is an educational post: nobody should run this process in a production environment, because it is highly likely to cause a service disruption.

## Cosmetic or Non-Relevant Attributes

Some attributes are purely cosmetic and have no real impact on the operation of a Cisco ACI fabric.

For example, `annotation` may contain a reference to who created and manages the object. By default, [[Introduction to Ansible Automation|Ansible]] and Terraform set this parameter, and so does [[From Single-Site to Multi-Site with NDO|NDO]]. If NDO is used in the infrastructure, this parameter must be set correctly.

```text
# module.aci.module.aci_vrf["NTS_TRAINING/PROD"].aci_rest_managed.fvRsCtxToExtRouteTagPol will be updated in-place
~ resource "aci_rest_managed" "fvRsCtxToExtRouteTagPol" {
    + annotation  = "orchestrator:terraform"
    ~ content     = {
        - "userdom" = "all" -> null
        # (1 unchanged element hidden)
      }
    + escape_html = true
      id          = "uni/tn-NTS_TRAINING/ctx-PROD/rsctxToExtRouteTagPol"
    # (2 unchanged attributes hidden)
  }
```

The `escape_html` attribute is internal to Terraform and not relevant. Other parameters (such as `userdom`) may affect the visibility of the object to other Cisco ACI users or groups.

## Attributes Not Imported

We need much more attention when an attribute is supported by NaC but was not imported from the fabric:

```text
# module.aci.module.aci_bridge_domain["NTS_TRAINING/APP"].aci_rest_managed.fvBD will be updated in-place
~ resource "aci_rest_managed" "fvBD" {
    + annotation  = "orchestrator:terraform"
    ~ content     = {
        - "OptimizeWanBandwidth"     = "no" -> null
        - "intersiteBumTrafficAllow" = "no" -> null
        - "intersiteL2Stretch"       = "no" -> null
        - "ipv6McastAllow"           = "no" -> null
        - "llAddr"                   = "::" -> null
        ~ "mcastARPDrop"             = "no" -> null
        - "ownerKey"                 = null
        - "ownerTag"                 = null
        - "userdom"                  = "all" -> null
        # (18 unchanged elements hidden)
      }
    + escape_html = true
      id          = "uni/tn-NTS_TRAINING/BD-APP"
    # (2 unchanged attributes hidden)
  }
```

In this case, we see the `mcastARPDrop` attribute of a BD. If we inspect the [module source code](https://github.com/netascode/terraform-aci-nac-aci/blob/main/modules/terraform-aci-bridge-domain/main.tf), we can confirm that the attribute is supported:

```hcl
resource "aci_rest_managed" "fvBD" {
  dn         = "uni/tn-${var.tenant}/BD-${var.name}"
  class_name = "fvBD"
  annotation = var.annotation
  content = {
    name                  = var.name
    nameAlias             = var.alias
    descr                 = var.description
    arpFlood              = var.arp_flooding == true ? "yes" : "no"
    hostBasedRouting      = var.advertise_host_routes == true ? "yes" : "no"
    ipLearning            = var.ip_dataplane_learning == true ? "yes" : "no"
    limitIpLearnToSubnets = var.limit_ip_learn_to_subnets == true ? "yes" : "no"
    mac                   = var.mac
    epMoveDetectMode      = var.ep_move_detection == true ? "garp" : ""
    vmac                  = var.virtual_mac
    mcastAllow            = var.l3_multicast == true ? "yes" : "no"
    multiDstPktAct        = var.multi_destination_flooding
    type                  = "regular"
    unicastRoute          = var.unicast_routing == true ? "yes" : "no"
    unkMacUcastAct        = var.unknown_unicast
    unkMcastAct           = var.unknown_ipv4_multicast
    v6unkMcastAct         = var.unknown_ipv6_multicast
    epClear               = var.clear_remote_mac_entries == true ? "yes" : "no"
    mcastARPDrop          = var.multicast_arp_drop != null ? (var.multicast_arp_drop == true ? "yes" : "no") : null
  }
}
```

We must therefore read the `mcastARPDrop` attribute from the fabric and set the `multicast_arp_drop` variable in the NaC data file.

The source code of the module effectively shows all the attributes that we must read for each fabric object.

## Attributes Not Managed by NaC

The final case involves attributes that are available in Cisco ACI but not managed by NaC. NaC is a very comprehensive framework, but many attributes are not covered. We must determine whether they are not relevant (and therefore fall into the first case), whether they have no operational impact (for example, a changed default value) or whether they are critical.

```text
# module.aci.module.aci_vrf["NTS_TRAINING/PROD"].aci_rest_managed.fvCtx will be updated in-place
~ resource "aci_rest_managed" "fvCtx" {
    + annotation  = "orchestrator:terraform"
    ~ content     = {
        - "bdEnforcedEnable" = "no" -> null
        - "knwMcastAct"      = "permit" -> null
        - "ownerKey"         = null
        - "ownerTag"         = null
        - "userdom"          = "all" -> null
        - "vrfIndex"         = "0" -> null
        # (6 unchanged elements hidden)
      }
    + escape_html = true
      id          = "uni/tn-NTS_TRAINING/ctx-PROD"
    # (2 unchanged attributes hidden)
  }
```

In the example, the PROD VRF includes three attributes that certainly require attention: `bdEnforcedEnable`, `knwMcastAct` and `vrfIndex`.

By downloading and inspecting the source code of the module, we can quickly verify whether these attributes are supported. With `fgrep` or `egrep`, we find that these three attributes are not managed.

There are therefore two possibilities:

* The change of value is not relevant, because it does not affect the operation of the fabric.
* The change of value affects the fabric, and we must extend the Terraform module to support it.

At this point, the value of professional services in importing a Cisco ACI fabric into NaC becomes clear.

The script used in this example is available in the [GitHub repository](https://github.com/dainok/courses/blob/master/Cisco/ACI/nac-terraform-check.py).
