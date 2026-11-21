---
cover: iec62443
date: 2026-10-03
tags:
- beginner
- governance
- iec62443
- ot-ics
- security
title: "Security level: target, capability, achieved"
---
In the [[Security Levels|previous article]] I covered the four security levels, from 1 to 4. But the topic is still incomplete: there are **three types of SL**, and they are used at different moments.

![[iec62443-sl-types.png]]

## The three types

**Target (SL-T)** is what you *want* to achieve. You decide it after a [[The initial risk assessment (ZCR2)|risk assessment]], before designing anything: it is a goal, not yet a reality. It is assigned to a zone or to a conduit.

**Capability (SL-C)** is what a component *can* deliver. It is a characteristic of the product, independent of where it will be installed. For a component, SL-C is defined (and declared) by the vendor and says what you can obtain *if the component is configured correctly*. A component with SL-C 2 does not give you SL 2 by itself: it gives you the possibility to get there.

**Achieved (SL-A)** is what you *really* have, measured on the real system once implemented. It is the number that tells you whether you are meeting the goal or just declaring it.

## The natural flow

The flow, in theory, is:

1. start from a target (SL-T);
2. choose components with an adequate capability (SL-C);
3. measure the achieved (SL-A) to verify the goal has really been reached.

The arrows in the picture say it: you *choose* the components against the target, you *measure* the result.

## The real world

We know the real world is a bit different: the plant arrives, it gets installed, switched on, and then somebody thinks about security. This makes everything more complicated, but not impossible. We start from an SL-A (the starting point) that has to get closer to an SL-T, often with no idea of what the SL-C of the components is.

In this case the work is reconstructive: you inventory the components, you look for vendor documentation (or you ask for it), you compare with the target and you find the gaps. Where the component is not enough, you compensate with something around it, a topic for a later article (common component security constraints, the CCSC).

## SL-A is not static

There is a detail that ties this topic to the life cycle: **SL-A decays over time**. Countermeasures age, configurations drift, new vulnerabilities appear. The line in the chart goes down while the target stays where it is.

The goal of the standard is that, at any moment, **SL-A ≥ SL-T**. Which means the work does not end when the system goes into production. Compared with the IT world, it is the continuous process of [[VA scanners for patch management  good or bad|patch management]], extended to everything that keeps your SL alive: reviews, audits, access rights, backups, monitoring.
