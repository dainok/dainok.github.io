---
cover: ad
date: 2025-10-19
tags:
- beginner
- fundamentals
---
In all the automation projects I have worked on, the operations teams usually lack the skills needed to manage the automation framework itself.

In other words, the data structures behind [[Introduction to Ansible Automation|Ansible]], [[Importing NaC objects from Cisco ACI into Terraform|Terraform]] and [[Managing a brownfield Cisco ACI fabric with NaC and Terraform|NaC]] are often too complex for operations teams to handle directly. They are difficult to understand and they increase the risk of mistakes.

And let's not forget: an error introduced into an automation system propagates instantly at scale. The **first priority** of any automation system must be to prevent errors that could compromise the infrastructure.

## A Hybrid Approach

Before starting an automation project, I always try to identify a data structure that the operations team can manage, and to define what their day-to-day responsibilities should be.

In most cases, their tasks are limited to creating and deleting objects (networks, addresses). This information often lives in an IPAM system, or sometimes just in Excel spreadsheets. From an Infrastructure-as-Code perspective, I prefer **text-based data structures** that can be stored and versioned in systems like GitHub or [[GitLab as the backbone of IaC|GitLab]]. Very often, I rely on CSV or YAML files stored alongside the automation code.

Reading data from a CSV and converting it into a structure compatible with Ansible, Terraform or NaC can be quite challenging, though. My approach is therefore to build a **parser** that reads the data from one or more sources and generates the native data structures required by Ansible, Terraform, NaC or even a combination of them.

This approach, also adopted by other colleagues, has several advantages:

* The parser can be modified freely, because the generated files make it easy to detect whether a change has introduced errors.
* It generates data structures for multiple frameworks (and thus redundancy) from a single [[Leveraging Nautobot as a SSOT|source of truth]].
* Compliance checks can be embedded in the parser, to validate the resulting data structures.
* It is fully compatible with CI/CD workflows.
