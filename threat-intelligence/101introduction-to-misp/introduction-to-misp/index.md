---
cover: misp
date: 2025-05-04
tags:
- beginner
- misp
- threat-intelligence
---
[MISP (Malware Information Sharing Platform)](https://www.misp-project.org/) is an open-source software solution to collect, store, distribute and share cybersecurity indicators and threat intelligence related to incident analysis and malware analysis. It is designed for incident analysts, security professionals, ICT specialists and malware reverse engineers, to support their daily operations and share structured information efficiently.

MISP was launched in 2011 to manage Indicators of Compromise (IoCs) in a structured way. It has since evolved and is now used by [national CERTs and NATO](https://www.misp-project.org/who/), which gave the platform its name. Today, MISP is also used by organizations like [ACN](https://www.acn.gov.it/portale/w/cybersecurity-governance-fundamentals-la-valutazione-del-contesto-cyber-di-un-organizzazione) and by various entities that need structured IoC management.

MISP has also been used by the [European Payments Council (EPC)](https://www.europeanpaymentscouncil.eu/sites/default/files/kb/file/2021-04/EPC098-21%20Request%20for%20Proposal%20EPC%20MISP%20instance%20service%20provider.pdf) to share timely information that helps prevent and intercept fraudulent activities in payment transactions. For further details, see the [CIPA note](https://www.cipa.it/attivita/iniziative/iniziative.pdf).

![[misp-example.png]]

## A Threat Intelligence Tool

Threat intelligence, or "threat intel", is actionable insight into current or emerging cybersecurity threats. It helps individuals and organizations understand past, present and future risks better.

Threat intelligence is more than IoC management. It can also provide insight into the motivations behind emerging threats, such as geopolitical tensions between nations. At a more granular level, it can involve specific data, such as the IP addresses associated with suspicious activities.

MISP supports threat intelligence activities with:

* Complete management of IoCs (Indicators of Compromise).
* A flexible and precise [taxonomy system](https://www.misp-project.org/datamodels/#misp-taxonomies) based on tags, which defines each piece of stored data ([GitHub](https://github.com/MISP/misp-taxonomies/)).
* A variety of [feeds](https://www.misp-project.org/feeds/) available by default in any MISP installation.
* [Third-party tools and integrations](https://www.misp-project.org/tools/) that extend its functionality.
* [Open protocols and data structures](https://www.misp-project.org/datamodels/).

## Automation-Oriented

MISP is designed to be integrated into automated or semi-supervised processes.

It provides complete [APIs](https://www.misp-project.org/openapi/) for custom integrations with third-party solutions, and PyMISP integrates MISP natively into Python projects.

We can export IoCs in multiple formats, including various native IDS formats, OpenIOC, plain text, CSV, MISP JSON, STIX (XML and JSON, versions 1 and 2), NIDS exports (Suricata, Snort and Bro/Zeek), RPZ zones and cache formats for forensic tools. We can add other formats, such as PDF, through [misp-modules](https://github.com/MISP/misp-modules) or custom built-in export modules.
