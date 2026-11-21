---
cover: governance
date: 2022-06-15
tags:
- advanced
- governance
- ot-ics
---
I am discussing the [[How IEC 62443 is organized|IEC 62443]] certification with an organization that builds and sells ICS plants which are risky from a safety perspective. The organization currently complies with the Machinery Directive (Directive 2006/42/EC of the European Parliament), but it does not consider cyber risk. Compliance is not mandatory today, but more and more customers ask for some "security" compliance.

Without reinventing the wheel, I chose the IEC 62443 framework as a guideline to evaluate the AS-IS situation and define the next steps.

IEC 62443 is very complete, but in this post I focus on AAA: Authentication, Authorization and Accounting.

![[structure-of-iec62443.png]]

## User Authentication in OT (and Medical Devices)

AAA functions are described in many parts of IEC 62443, at both system and component levels. Let's look at some requirements from IEC 62443-3-3 (I quote a few of them only as examples):

> Security measures shall not adversely affect essential functions of a high availability IACS unless supported by a risk assessment. (Support of essential functions)
>
> The control system shall provide the capability to identify and authenticate all human users. This capability shall enforce such identification and authentication on all interfaces which provide human user access to the control system to support segregation of duties and least privilege in accordance with applicable security policies and procedures. (SR 1.1 – Human user identification and authentication)
>
> The control system shall provide the capability to employ multifactor authentication for human user access to the control system via an untrusted network (SR 1.1 RE 2 – Multifactor authentication for untrusted networks)
>
> Automatic denial of access for control system operator workstations or nodes should not be used when immediate operator responses are required in emergency situations. (SR 1.11 – Unsuccessful login attempts)
>
> The control system shall provide the capability to limit the number of concurrent sessions per interface for any given user (human, software process or device) to a configurable number of sessions. (SR 2.7 – Concurrent session control)
>
> The control system shall provide the capability to centrally manage audit events and to compile audit records from multiple components throughout the control system into a system-wide (logical or physical), time-correlated audit trail [...] (SR 2.8 RE 1 – Centrally managed, system-wide audit trail, IEC 62443)

Medical devices have similar requirements.

In short:

* AAA must be implemented properly: user and non-user access must be authenticated, authorized and logged.
* In some cases, additional security measures may be required (MFA).
* Emergency access (firecall) must be provided.
* Security measures cannot affect essential functions.

These statements may sound contradictory, but we are missing an important piece: the context.

## The Context

In the real world, plants and medical devices are installed in specific contexts. Most of them are installed in a restricted area where only authorized personnel can enter and operate. In an emergency, they must operate as fast as possible. We should also differentiate the security measures for reading, writing and administrative operations.

I often see remote access to plants and medical devices for service assistance.

Finally, we need to evaluate the risk of the information available on the HMI, for both local and remote access. Medical devices are more critical, but ICS HMIs can also store confidential information (recipes, production details, etc.).

## A Hypothetical Approach

I do not have a magic recipe that fits any organization, but we can make some assumptions:

1. Setting the same PIN or password for every HMI and user is useless and does not comply with IEC 62443 (users must be identified).
2. In a restricted area, a read-only view may not require authentication.
3. Some remote connections may not require a username and password. For example, remote control rooms can be authenticated by IP or VPN, and require stronger authentication only for write or administrative operations.
4. Fast emergency access must be guaranteed.
5. Any remote user must be identified with a strong authentication method (user, password, MFA).
6. Security measures cannot affect essential functions, so we can offload AAA to external devices (firewalls, captive portals, NACs, etc.).

## Post-Incident Analysis Involving Casualties

The most critical situation a plant can face is one that involves casualties or physical damage. In these cases, we need to find the root cause and collect evidence that can help the investigation.

This is where logging and its security features, integrity and availability, come in. Every event should be logged and made permanent. The events I would log include:

* Access (unauthenticated).
* Authentication and authorization.
* Event logging and accounting.
* Chat (especially during service assistance).
* Software and configuration changes.
* Output of integrity tests (systems and components).
* State of each component (especially during service assistance).

The manufacturer should consider WORM media for accounting:

> The control system shall provide the capability to determine whether a given human user took a particular action. (SR 2.12 – Non-repudiation)

**In a specific event, a good logging platform with WORM media helped to prove that the customer, and not the manufacturer, caused the casualties.**

## Conclusions

I often see OT and medical devices protected by simple PINs. Every time, I ask why they use the same 5-digit PIN, shared among all the authorized users and probably known by many more people. Blind compliance is useless: if we do not evaluate the context, we are not protecting a device, we are just scrolling a checklist.
