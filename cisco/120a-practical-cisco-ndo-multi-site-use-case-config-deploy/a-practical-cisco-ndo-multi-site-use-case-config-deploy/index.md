---
cover: cisco
date: 2025-11-30
tags:
- aci
- beginner
- cisco
- ndo
---
At this stage, we can build the configuration:

```bash
./build-nac-data.py
```

If everything runs successfully, the script completes silently ("no news is good news") and creates or updates the files under the `nac-data` and `site-*` directories.

We can now apply the configuration to **NDO** with [[Importing NaC objects from Cisco ACI into Terraform|Terraform]]:

```bash
cd site-shared
terraform apply -parallelism=1
```

Then we proceed with the **APIC** configurations:

```bash
cd site-mi
terraform apply
cd ../site-rm
terraform apply
```

During testing, this workflow has consistently worked, except in one specific case: when we rename or reuse an object (e.g., when we reassign an interface).

In such cases, it is best to **delete the old entry from the CSV**, run Terraform to remove the previous object and **then recreate it**. Otherwise, resource conflicts may occur if the same object is recreated before the previous one has been fully deleted.

For example, creating approximately **600 networks** on NDO (Bridge Domains, Application Profiles and EPGs, for a total of about **1,100 objects**) took roughly **35 minutes**.

```text
Plan: 1096 to add, 6 to change, 0 to destroy.

Do you want to perform these actions?
  Terraform will perform the actions described above.
  Only 'yes' will be accepted to approve.

  Enter a value: yes
```

The configuration of the physical layer on the APIC, approximately **3,700 objects** including the physical interfaces and the VLAN-to-EPG mappings, took about **25 minutes**.

```text
Plan: 3712 to add, 0 to change, 0 to destroy.

Do you want to perform these actions?
  Terraform will perform the actions described above.
  Only 'yes' will be accepted to approve.

  Enter a value: yes
```
