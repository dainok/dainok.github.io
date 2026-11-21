---
cover: gitlab
date: 2026-02-08
tags:
- aci
- advanced
- ci-cd
- cisco
- fundamentals
- git
- gitlab
- iac
title: GitLab CI/CD + IaC in action
---
Let's see in practice how to change our infrastructure with GitLab and the pipeline we created.

We open our GitLab repository, select the file to modify and edit it with the Web IDE:

![[l2-network-csv.png]]

We modify the infrastructure files the same way we would in Visual Studio Code:

![[l2-network-csv-edit.png]]

When we are done, we go to source control and use the `Create a new branch and commit` function, with `add-vlan-1510` as the name of the new branch:

![[l2-network-add-vlan.png]]

Remember that the `main` branch is protected and direct commits to `main` are disabled.

We then return to our repository and go to `Build` → `Pipelines` to monitor the progress of the jobs:

![[failed-ci-pipeline.png]]

In this case, we made a mistake. The details show that the job stopped during the data validation:

```text
280  16:46:56 ValueError: With network 1509, VLAN is duplicated on site MI
281  16:46:56 Cleaning up project directory and file based variables
282  16:46:57 ERROR: Job failed: exit code 1
```

We defined a duplicated VLAN. We modify our code again, fix the error and check the new execution:

![[ci-pipeline.png]]

All the jobs completed successfully: the data has been validated and a plan has been prepared for each environment. We can open the plan jobs to review the operations that [[Importing NaC objects from Cisco ACI into Terraform|Terraform]] will execute:

![[terraform-plan.png]]

If we are satisfied, we go to `Code` → `Merge requests` and create a new MR:

![[create-merge-request.png]]

Up to this point, no changes have been applied: the `main` branch is intact, all the modifications are contained in a dedicated branch and the infrastructure has not been reconfigured:

![[add-vlan-1510.png]]

When we press `Merge`:

* The changes are integrated into the `main` branch.
* A new pipeline is triggered, which runs all the jobs again and applies the changes to the infrastructure, without any further confirmation.

We return to `Build` → `Pipelines` and wait for the jobs to complete:

![[cd-pipeline.png]]

If we now check the status of the three environments, we can verify that they have been reconfigured and include VLAN 1510.

On the APIC, the BD and the EPG have been created:

![[apic-check.png]]

On Intersight, the VLAN range has been updated:

![[intersight-check.png]]

On vCenter, the port group has been created:

![[vcenter-check.png]]
