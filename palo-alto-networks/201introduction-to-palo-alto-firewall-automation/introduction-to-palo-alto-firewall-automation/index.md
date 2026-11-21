---
cover: paloalto-strata
date: 2025-06-07
tags:
- beginner
- firewall
- fundamentals
- palo-alto-networks
---
Firewall automation is still a relatively under-discussed topic compared to the automation of network devices. This is likely due to complexity: firewall policies tend to be a long list of rules, created by different people for different (application) purposes and aggregated together. The order of the rules is often crucial and has a direct impact on performance, so creating a model to describe them is far from simple. Other tasks can be automated, but in my experience they are of relatively minor importance.

Let's take a step back and identify the activities a security engineer performs throughout the lifecycle of a firewall:

* **Provisioning:** one-time or occasional tasks that configure the foundation of a firewall (IP addressing, routing, VLANs, DNS, NTP, licenses, etc.).
* **Rules:** tasks that add, modify or delete rules in response to changes in the services that pass through one or more firewalls.
* **Maintenance:** tasks that monitor the status of a firewall or troubleshoot anomalies and unexpected behaviors.

On Palo Alto Networks firewalls, we can interact with the device in the following ways:

* Web User Interface.
* Command Line Interface (CLI) via SSH.
* [[Automating Palo Alto Firewall via XML API|XML API]].
* External Dynamic Lists.
* SDKs (Python, PHP).
* Frameworks ([[Introduction to Ansible Automation|Ansible]], [[Importing NaC objects from Cisco ACI into Terraform|Terraform]]).
* Direct configuration changes.

In complex environments, **Panorama** is often used to manage all the firewalls centrally. We can interact with Panorama in all the same ways described for individual firewalls.

Except for the Web User Interface, all the other interfaces enable the creation of automations and integrations.
