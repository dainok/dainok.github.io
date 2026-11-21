---
cover: misp
date: 2025-05-04
tags:
- beginner
- misp
- threat-intelligence
---
MISP is a platform for threat intelligence, not for incident management. It helps to manage Indicators of Compromise (IoCs) in a structured way, so it must be integrated into an existing ecosystem.

[TheHive](https://strangebee.com/) is very often used as the incident management platform, but integration requests commonly involve also [Splunk](https://www.splunk.com/), [Elastic](https://www.elastic.co/), [Maltego](https://www.maltego.com/) and detection and prevention systems (antispam, honeypot, firewall, etc.).

A MISP event does not represent a security incident: it represents a threat that we analyze and evaluate from a threat intelligence perspective. Much of the work (defining IoCs and artifacts) has likely already been done on other platforms. We evaluate the event and its IoCs to determine whether they add value for us and for the communities we belong to.

## Automating MISP Tasks

We can identify the following activities to automate:

* Creating events by ingesting data from external sources (TheHive, honeypot, etc.).
* Making the IoCs available to external platforms (firewalls, EDR, antispam, SIEMs, etc.).
* Facilitating incident analysis by providing IoCs to external platforms (Maltego, TheHive, etc.).
* Sending and receiving feedback on events (thumbs up = observed and malicious, thumbs down = observed but not malicious).

## API

MISP offers [APIs in OpenAPI 3.0.0 format](https://www.misp-project.org/openapi/) that allow programmatic interaction with the platform.

To use the API, we need an authentication key. We generate it under `My Profile` → `Auth keys` → `Add authentication key`:

![[add-misp-auth-key.png]]

We include the key in the `Authorization` header.

## PyMISP

Alternatively, we can use the Python library [PyMISP](https://github.com/MISP/PyMISP), which allows native interaction with MISP in Python.

In my experience, PyMISP is more challenging to use than the native APIs. The [documentation](https://pymisp.readthedocs.io/en/latest/) is not always clear, and for some tasks I had to reverse engineer the code.

## CIRCL

[CIRCL](https://www.circl.lu/) is the CERT for the private sector, municipalities and non-governmental organizations in Luxembourg. CIRCL is a very active contributor to MISP, and its website offers excellent [MISP documentation](https://www.circl.lu/doc/misp/).
