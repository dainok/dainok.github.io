---
cover: ansible
date: 2025-01-13
tags:
- ansible
- beginner
---
In this course, we ran Ansible manually. To take the next step, we need an orchestrator that organizes [[Ansible Playbooks and variables|playbooks]], manages their execution and generates reports.

There are several solutions: in this post, we describe the most popular ones.

## Ansible Navigator

[Ansible Navigator](https://ansible.readthedocs.io/projects/navigator/) is a command-line tool and a text-based user interface (TUI) for creating, reviewing, running and troubleshooting Ansible content, including [[Ansible inventory|inventories]], playbooks, [[Ansible Galaxy|collections]], documentation and container images (execution environments).

Ansible Navigator is designed to run from within containers. Personally, I prefer to disable this behavior:

```bash
ansible-navigator --ee=false run playbook-output.yml
```

![[ansible-navigator-output.png]]

As we have seen, Ansible Navigator is not exactly an orchestrator: it is a utility to run playbooks, analyze configurations, inventories and collections, and perform linting.

## ARA Records Ansible

[ARA](https://ara.recordsansible.org/) provides Ansible reporting by recording `ansible` and `ansible-playbook` commands, regardless of how and where they run.

The recorded results are available via an included CLI, a REST API and a self-hosted, local-first web interface.

![[ansible-ara-dashboard.png]]

[[Ansible reporting with ARA|ARA]] is not an orchestrator, but it provides a simple dashboard that displays the progress of playbook executions. The playbooks, however, must be run manually or from an external system.

## Automation Controller (Formerly Ansible Tower)

[Ansible Tower](https://docs.ansible.com/ansible-tower/), now called the automation controller, is the commercial web-based user interface and REST API of the Ansible ecosystem. It makes it easier to manage Ansible projects, inventories and schedules.

![[ansible-tower-dashboard.png]]

It is the official Red Hat orchestrator for Ansible, designed to centralize the Ansible ecosystem and give users a single pane of glass to manage automation tasks.

## Ansible AWX

[AWX](https://github.com/ansible/awx) provides a web-based user interface, a REST API and a task engine built on top of Ansible. It is one of the upstream projects of the Red Hat Ansible Automation Platform.

![[ansible-awx-dashboard.png]]

[[Orchestrating playbooks with Ansible AWX|AWX]] is the open-source upstream of the automation controller (formerly Ansible Tower), and it is often subject to [significant changes](https://forum.ansible.com/t/refactoring-awx-into-a-pluggable-service-oriented-architecture/7404), including major refactoring.

## Red Hat Ansible Automation Platform

The Red Hat Ansible Automation Platform includes the automation controller (formerly Ansible Tower) as one of its components and adds further tools, integrations and features.

![[ansible-automation-platform-dashboard.png]]

The [Ansible Automation Platform](https://www.redhat.com/en/technologies/management/ansible) also includes [[Event-Driven Ansible]] (EDA), which automates the response to events or triggers in your infrastructure: EDA recognizes the specified event, matches it with the appropriate action and executes it automatically. Actions can be existing playbooks, templates or modules, so you extend the value of automation you already trust.

## eNMS

[eNMS](https://www.enms.io/) is a vendor-agnostic Network Management System (NMS) designed for building workflow-based network automation solutions.

An Ansible Playbook service runs a playbook on a set of target devices and returns a JSON-formatted result. The output can be validated with a command/pattern mechanism, like the Data Validation Service.

![[enms-dashboard.png]]

eNMS centralizes the Ansible ecosystem and gives users a single pane of glass.

## Other Orchestrators and Tools

Ansible can be integrated with numerous other tools, for example:

* [Spacelift](https://spacelift.io/): a sophisticated CI/CD platform for OpenTofu, [[Importing NaC objects from Cisco ACI into Terraform|Terraform]], Terragrunt, CloudFormation, Pulumi, Kubernetes and Ansible.
* [NetBox](https://netbox.dev/) / [Nautobot](https://networktocode.com/nautobot/): the network [[Leveraging Nautobot as a SSOT|Source of Truth]].
* [Semaphore UI](https://semaphoreui.com/): a modern UI for Ansible.
* [Uyuni](https://www.uyuni-project.org/): the open-source configuration and infrastructure management solution for software-defined infrastructure.
* [Infrahub](https://opsmill.com/): unifies and syncs your infrastructure data foundation while preserving its context and intent, so teams can store and manage their automation blueprints in one place and integrate natively with the deployment tools they already use.
