---
cover: cisco
date: 2025-08-24
tags:
- aci
- beginner
- cisco
---
Cisco ACI can be managed through five different interfaces:

* **GUI:** the graphical user interface, typically used for the initial setup and, unfortunately, often still used for the direct day-to-day operations on the fabric.
* **CLI:** used mainly for the initial configuration of the APIC and, later, only in rare cases where special troubleshooting commands are required, either on the APIC or on the individual switches.
* **[Cobra SDK](https://developer.cisco.com/docs/aci/cobra-sdk-downloads/):** a Python-based SDK that provides a programmatic interface to the fabric using Pythonic methods.
* **[Visore](https://www.cisco.com/c/en/us/support/docs/cloud-systems-management/application-policy-infrastructure-controller-apic/118839-technote-visore-00.html):** a simple web interface to query the objects of the fabric.
* **[API](https://developer.cisco.com/docs/aci/):** a complete set of REST APIs for full programmatic control of the fabric.

As anticipated, Cisco ACI is designed with an **API-first** architecture:

![[aci-as-api-first.png]]

In other words, regardless of the interface we use, all operations are ultimately translated into API calls to the APIC.

## NX-OS vs. ACI Mode

At the core of an ACI fabric are Cisco Nexus switches. The difference is the operating system: in ACI mode, the switches run the ACI OS instead of NX-OS. Supported hardware can be converted between NX-OS and ACI mode without issues.

NX-OS shares some key programmability features with ACI:

* **[API-first](https://www.cisco.com/c/en/us/td/docs/dcn/nx-os/nexus9000/101x/programmability/cisco-nexus-9000-series-nx-os-programmability-guide-release-101x/m-n9k-nx-api-rest-101x.html)**.
* **[Visore](https://developer.cisco.com/docs/nx-os/visore/)**.

Few engineers know this, and even fewer use the APIs. In my opinion, the reason is historical: network engineers are deeply attached to the CLI and, when it is available, they prefer it over any other method, even when more efficient options exist.
