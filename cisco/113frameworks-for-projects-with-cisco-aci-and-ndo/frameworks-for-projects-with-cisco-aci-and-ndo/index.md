---
cover: cisco
date: 2025-10-12
tags:
- aci
- beginner
- cisco
- ndo
- terraform
---
When we develop an automation system for Cisco ACI and NDO, we can choose among several frameworks:

* **APIs:** maximum flexibility, but they require significant effort and strong programming skills.
  * **APIC:** API-first approach, with the documentation available directly through the Web UI.
  * **NDO:** APIs are available, but beware of potential breaking changes. The [documentation](https://developer.cisco.com/docs/nexus-dashboard-orchestrator/latest/api-reference/) is online (via OpenAPI/Swagger), along with a [changelog of breaking changes](https://developer.cisco.com/docs/nexus-dashboard-orchestrator/latest/api-changelog/).
* **[[Introduction to Ansible Automation|Ansible]]:** a simplified framework that does not require programming experience.
  * **APIC:** a fairly complete [Ansible collection](https://docs.ansible.com/ansible/latest/collections/cisco/aci/index.html) is available.
  * **NDO:** a fairly complete [Ansible collection](https://docs.ansible.com/ansible/latest/collections/cisco/mso/index.html) is also available.
* **Terraform:** more complex and requiring prior expertise; best suited for greenfield environments.
  * **APIC:** a fairly complete [Terraform provider](https://registry.terraform.io/providers/CiscoDevNet/aci/latest) is available.
  * **NDO:** a [Terraform provider](https://registry.terraform.io/providers/CiscoDevNet/mso/latest) exists, but with several limitations.
* **[NaC (Network as Code)](https://netascode.cisco.com/):** a framework that abstracts the complexity of Terraform.
  * **APIC:** a [specific module](https://registry.terraform.io/modules/netascode/nac-aci/aci) is available, with some limitations.
  * **NDO:** a [specific module](https://registry.terraform.io/modules/netascode/nac-ndo/mso/latest) exists, but with more significant limitations.

For NDO specifically, I recommend using **[NaC](https://netascode.cisco.com/)** whenever possible, because it greatly simplifies automation. Objects in NDO must be created and deleted in a specific sequence. Terraform (and therefore [[Managing a brownfield Cisco ACI fabric with NaC and Terraform|NaC]]) implements the correct sequence out of the box, which lets projects move much faster.

We dive deeper into NaC in a dedicated article.

And no, we are not even considering the Web UI: managing this level of complexity manually is simply not practical.

## Managing Limitations

Unless we work directly with the APIs on both APIC and NDO, we inevitably run into the limitations of the frameworks. And even then, we know that NDO has inherent restrictions compared to the APIC.

A practical example is **IGMP Snooping**. Some products implement multicast in a somewhat "loose" way, so I often need to disable IGMP Snooping.

If we manage Cisco ACI fabrics through NDO, we must always check how (and if) this can be done. Here are some examples:

![[ndo-vs-apic-support.png]]

From this, we can conclude:

* We almost always need a **hybrid approach**, working on both NDO and APIC.
* **APIs** provide maximum flexibility, but they are also the most complex and expensive to implement.
* **NaC** covers most scenarios, but sometimes it must be complemented with a custom Terraform module.

Hundreds of customers use NaC heavily to manage entire ACI infrastructures. In theory, we could find something that Terraform supports and NaC does not, but the probability is very low. **As an example**, we configure a vPC Explicit Protection Group outside of NaC.

We should apply this mindset to every configuration in our environment. As we said before, **planning is the most important phase** of any automation project.
