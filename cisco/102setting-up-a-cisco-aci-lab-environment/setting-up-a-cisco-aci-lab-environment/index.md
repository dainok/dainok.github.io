---
cover: cisco
date: 2025-08-17
tags:
- aci
- beginner
- cisco
- installation
- lab
---
Before diving into the technical aspects, we need a dedicated environment for testing and development. **Under no circumstances should integrations be tested directly on production systems.** A safe, isolated environment is required.

Here are three recommended options:

* ACI Simulator Always-On.
* Application Centric Infrastructure (ACI) Simulator.
* Cisco ACI Mini Fabric.

## ACI Simulator Always-On

Cisco provides a persistent sandbox environment, the **ACI Simulator Always-On**. It is a continuously running instance of the ACI Simulator, publicly accessible to anyone with an Internet connection.

The ACI Simulator emulates a small fabric that includes:

* One APIC controller.
* One spine switch.
* Two leaf switches.

![[aci-diagram.png]]

As the name implies, this is not actual hardware but a fully virtualized environment running on a single virtual machine.

This instance is part of the [Cisco DevNet](https://devnetsandbox.cisco.com/DevNet/catalog/ACI-Simulator-Always-On_aci-simulator-always-on) project and is accessible at:

* **URL:** [https://sandboxapicdc.cisco.com](https://sandboxapicdc.cisco.com)
* **Username:** `admin`
* **Password:** `!v3G@!4@Y`

The ACI Simulator Always-On is ideal to learn how Cisco ACI works and to explore its API ecosystem. As your projects become more complex, you may need a faster, more responsive setup, or even a physical lab where you can observe the impact of your operations on the physical layer.

## Cisco ACI Simulator

The **Cisco ACI Simulator** is the official virtual appliance developed by Cisco to simulate the ACI environment with all its features, especially suited for exploring the APIs and learning.

The latest release, [acisim-6.1-3f.ova](https://software.cisco.com/download/home/286283149/type/286283168/release/6.1(3f)), is an OVA file of approximately 4 GB.

![[aci-simulator.png]]

According to the [release notes](https://www.cisco.com/c/en/us/products/collateral/cloud-systems-management/application-centric-infrastructure-simulator/datasheet-c78-733252.html), the virtual machine requires:

* 12 vCPUs.
* 32 GB of RAM.
* 200 GB of disk space.

## Cisco ACI Mini Fabric

The third option is a physical lab based on the [Cisco ACI Mini Fabric](https://www.cisco.com/c/dam/en/us/solutions/collateral/data-center-virtualization/application-centric-infrastructure/promotion-bulletin-c80-741390.pdf), a hardware kit that includes:

* One APIC.
* One spine switch.
* Two leaf switches.

The advantage of a physical lab is that we can test real networking features that simulators can only emulate. When we move from training and prototyping to production-level architecture and integration, a physical environment becomes critical to validate the behavior and correctness of our implementations.
