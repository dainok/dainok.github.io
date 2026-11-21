---
cover: terraform
date: 2026-03-08
tags:
- aci
- beginner
- cisco
- iac
- netascode
- terraform
---
In the [[Managing a brownfield Cisco ACI fabric with NaC and Terraform|previous post]], we analyzed a Cisco ACI infrastructure and described it with the NaC data model. This is a simplification: NaC is a very comprehensive framework, but it does not support 100% of the configuration options available in Cisco ACI.

This is an educational post: nobody should run this process in a production environment, because it is highly likely to cause a service disruption.

Terraform can only manage the objects it knows about. We now need to create the Terraform representation of the objects (Tenants, VRFs, BDs) using the NaC data model.

Let's clarify this further.

If I try to import the tenant `NTS_TRAINING`, I get the following error:

```bash
$ terraform import aci_tenant.nts_training uni/tn-NTS_TRAINING
Error: resource address "aci_tenant.nts_training" does not exist in the configuration.

Before importing this resource, please create its configuration in the root module. For example:

resource "aci_tenant" "nts_training" {
  # (resource arguments)
}
```

The error states that Terraform cannot find any reference to `aci_tenant.nts_training`. This happens because no `.tf` file defines that object. This is expected: one of the key advantages of NaC is that it abstracts away the complexity of Terraform.

We must therefore import the tenant `NTS_TRAINING` following the naming convention used by NaC. We can obtain this information from the Terraform plan.

For example, the plan to create the tenant `NTS_TRAINING` shows:

```text
# module.aci.module.aci_tenant["NTS_TRAINING"].aci_rest_managed.fvTenant will be created
+ resource "aci_rest_managed" "fvTenant" {
    + annotation  = "orchestrator:terraform"
    + class_name  = "fvTenant"
    + content     = {
        + "descr"     = null
        + "name"      = "NTS_TRAINING"
        + "nameAlias" = null
      }
    + dn          = "uni/tn-NTS_TRAINING"
    + escape_html = true
    + id          = (known after apply)
  }
```

The name of the module is composed, among other elements, of the tenant name and the class:

```text
module.aci.module.aci_tenant["NTS_TRAINING"].aci_rest_managed.fvTenant
```

The correct import command is therefore:

```bash
$ terraform import 'module.aci.module.aci_tenant["NTS_TRAINING"].aci_rest_managed.fvTenant' uni/tn-NTS_TRAINING
module.aci.module.aci_tenant["NTS_TRAINING"].aci_rest_managed.fvTenant: Importing from ID "uni/tn-NTS_TRAINING"...
module.aci.module.aci_tenant["NTS_TRAINING"].aci_rest_managed.fvTenant: Import prepared!
  Prepared aci_rest_managed for import
module.aci.module.aci_tenant["NTS_TRAINING"].aci_rest_managed.fvTenant: Refreshing state... [id=uni/tn-NTS_TRAINING]

Import successful!

The resources that were imported are shown above. These resources are now in
your Terraform state and will henceforth be managed by Terraform.
```

We can verify the result by running `terraform plan` again: the tenant object exists, but some attributes require modification:

```text
# module.aci.module.aci_tenant["NTS_TRAINING"].aci_rest_managed.fvTenant will be updated in-place
~ resource "aci_rest_managed" "fvTenant" {
    + annotation  = "orchestrator:terraform"
    ~ content     = {
        - "ownerKey" = null
        - "ownerTag" = null
        - "userdom"  = "all" -> null
        # (3 unchanged elements hidden)
      }
    + escape_html = true
      id          = "uni/tn-NTS_TRAINING"
    # (2 unchanged attributes hidden)
  }
```

This is the most critical point of the entire approach: we must make sure that the attribute values configured in Cisco ACI (and detected by Terraform) exactly match those defined through NaC for all the relevant parameters:

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

To complete the process, we must apply the Terraform plan. This may lead to unpredictable situations if we do not fully understand the purpose of each attribute and value.

We must now import the VRFs, the BDs and all the derived objects.

In general, the Terraform plan tells us how many objects must be created. The data structure is already defined in the NaC files, so we only need to run the correct import commands.

For reference, these are the commands to import Tenants, VRFs, BDs and related objects:

```text
terraform import module.aci.module.aci_tenant["NTS_TRAINING"].aci_rest_managed.fvTenant uni/tn-NTS_TRAINING
terraform import module.aci.module.aci_vrf["NTS_TRAINING/PROD"].aci_rest_managed.fvCtx uni/tn-NTS_TRAINING/ctx-PROD
terraform import module.aci.module.aci_vrf["NTS_TRAINING/PROD"].aci_rest_managed.fvRsBgpCtxPol uni/tn-NTS_TRAINING/ctx-PROD/rsbgpCtxPol
terraform import module.aci.module.aci_vrf["NTS_TRAINING/PROD"].aci_rest_managed.fvRsCtxToExtRouteTagPol uni/tn-NTS_TRAINING/ctx-PROD/rsctxToExtRouteTagPol
terraform import module.aci.module.aci_vrf["NTS_TRAINING/PROD"].aci_rest_managed.fvRsOspfCtxPol uni/tn-NTS_TRAINING/ctx-PROD/rsospfCtxPol
terraform import module.aci.module.aci_vrf["NTS_TRAINING/PROD"].aci_rest_managed.vzAny uni/tn-NTS_TRAINING/ctx-PROD/any
terraform import module.aci.module.aci_bridge_domain["NTS_TRAINING/FW_OUTSIDE"].aci_rest_managed.fvBD uni/tn-NTS_TRAINING/BD-FW_OUTSIDE
terraform import module.aci.module.aci_bridge_domain["NTS_TRAINING/FW_OUTSIDE"].aci_rest_managed.fvRsCtx uni/tn-NTS_TRAINING/BD-FW_OUTSIDE/rsctx
terraform import module.aci.module.aci_bridge_domain["NTS_TRAINING/APP"].aci_rest_managed.fvBD uni/tn-NTS_TRAINING/BD-APP
terraform import module.aci.module.aci_bridge_domain["NTS_TRAINING/APP"].aci_rest_managed.fvRsCtx uni/tn-NTS_TRAINING/BD-APP/rsctx
terraform import module.aci.module.aci_bridge_domain["NTS_TRAINING/WEB"].aci_rest_managed.fvBD uni/tn-NTS_TRAINING/BD-WEB
terraform import module.aci.module.aci_bridge_domain["NTS_TRAINING/WEB"].aci_rest_managed.fvRsCtx uni/tn-NTS_TRAINING/BD-WEB/rsctx
terraform import module.aci.module.aci_bridge_domain["NTS_TRAINING/DMZ"].aci_rest_managed.fvBD uni/tn-NTS_TRAINING/BD-DMZ
terraform import module.aci.module.aci_bridge_domain["NTS_TRAINING/DMZ"].aci_rest_managed.fvRsCtx uni/tn-NTS_TRAINING/BD-DMZ/rsctx
```

When the process is complete, a new Terraform plan should show that some objects would be modified, but none should be created or destroyed.

The script used in this example is available in the [GitHub repository](https://github.com/dainok/courses/tree/master/Cisco/ACI).
