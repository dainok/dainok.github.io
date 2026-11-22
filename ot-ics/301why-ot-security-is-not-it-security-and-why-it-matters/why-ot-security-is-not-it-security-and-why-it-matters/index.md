---
cover: iec62443
date: 2026-08-29
tags:
- beginner
- governance
- iec62443
- ot-ics
---
I recently finished the ISA IC32 course, the first module of the IEC 62443 certification path. I liked it. Some modules were explained really well, but overall it was not enough to understand the standard thoroughly and to face the exam. So I decided to write a short series of articles: to fix the concepts in my own head first, and hopefully to help you do the same.

![[aic-priority.png]]

## IT and OT Are Different. But Why?

We all know that IT and OT must be treated differently. I am not sure it is always clear **why**. So let's start from there, because everything else in the standard builds on it.

### Different Priorities: AIC, Not CIA

In IT we think in terms of **CIA**: Confidentiality, Integrity and Availability, in this order. In an IACS (Industrial Automation and Control System) the order flips and becomes **AIC**: **Availability comes first**.

Why? Because in some sectors a stopped plant is a physical safety problem for people long before it is an economic one. A chemical process that cannot be controlled is not a "service outage".

Here is an example I like. In IT, three failed logins lock the account, which is textbook good practice. Now imagine a plant operator who **mistypes the password in the middle of an emergency**. If the system locks him out, the lockout can be more dangerous than the typo. The control that protects confidentiality ends up hurting availability, and in OT availability wins.

### Different Time Scales

A server in IT is replaced every 3-5 years. A control system can stay in service for 15-20 years, often longer than its designers ever imagined. The maintenance windows we take for granted in IT often do not exist in OT. Think of a pharmaceutical plant: updating a production system can mean re-validating the entire process. You do not "just apply the patch on Tuesday".

This is why, later in the series, we will spend a whole article on [[VA scanners for patch management  good or bad|patch management]]. It is not a detail, it is one of the hardest parts of the job.

## Don't Throw Away What You Know

The course makes one point clear right away, and I think it is an important one: this is **not** about throwing away what we know from IT and starting from scratch.

Today's IACS run on Windows, TCP/IP and Ethernet. Most IT practices are still valid: hardening, segmentation, access control, backup and monitoring. The real work is spotting early the 10% that is different, and treating it accordingly, before it turns into an incident.

If you come from IT, I suggest looking for that 10% in three places:

* Anything that automatically blocks, locks or reboots, because it may collide with availability.
* Anything that assumes you can patch or restart at will.
* Anything that assumes a short equipment life cycle.
