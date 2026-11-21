---
cover: iec62443
date: 2026-11-17
tags:
- advanced
- governance
- iec62443
- ot-ics
- security
---
**Where do you actually start?**

The first mistake in an OT security project is usually not a technical one. It is starting without knowing why you are doing it, and without knowing what you are protecting.

So step zero asks three questions: **why, who, what.**

![[iec62443-suc.png]]

## Why: The Mandate on One Page

ISA/IEC 62443-2-1 lists a typical mistake: starting a security program without a rationale tied to the mission of the organization. You don't need a fifty-page document. You need one page that says which business risk you want to reduce, in words understood by whoever signs the budget.

A possible starting point is revenue, and how much of it depends on the systems you want to protect.

* If they become unavailable, how much do we lose for every day of downtime?
* What is the maximum downtime we can sustain?
* How much can a cyber incident affect the safety of people?

If you need a hook, look at what happened in the last few weeks. Coordinated attacks hit the refrigeration controllers of supermarkets across Europe, starting in France in October and spreading to Belgium, Ireland, Sweden and others. According to press reports, attackers abused the defrost mode to push temperatures up to 50 °C, and stores had to throw away stock. Many of the controllers were running outdated software. That is not a story about exotic malware. It is a story about a business that depended on a system nobody had put in the right place on the risk register.

A one-page mandate can be as simple as this:

* **Why:** which business risk we want to reduce (production stop, quality, safety of people, legal obligations).
* **Goal:** what must be different in one or two years.
* **Scope:** which plants or systems are involved.
* **Responsibilities:** who is the sponsor, who coordinates.
* **Resources:** time, people and an indicative budget.

This outline is a practical suggestion, inspired by the program charter in NIST SP 800-82. It is not a list from IEC 62443.

## Who: Sponsor, Coordinator, Working Group

You need two clear roles. A sponsor, who has the authority to decide and to release resources. A coordinator, who keeps the thread. Around them, a small group with the right skills: OT, IT, production and, where it exists, safety.

Without this, the [[The initial risk assessment (ZCR2)|risk assessment]] becomes an exercise of the security department alone, and the people who know how the plant really runs are not in the room.

Remember the stakeholders from the earlier post: the [[The IEC 62443 roles|asset owner]] is the accountable role. The sponsor comes from that side.

## What: The SUC

Here the standard has a precise name: **SUC, System Under Consideration**. ISA/IEC 62443-3-2 opens its process with the first requirement, ZCR 1: identify the SUC, define its security perimeter and identify all access points (clause 4.2.1).

A few useful details:

* The SUC includes all the IACS assets necessary to provide a complete automation solution.
* It can contain several subsystems: BPCS, DCS, SIS, SCADA, vendor packages, and also technologies like IIoT or cloud services.
* External services and support to the IACS are part of the picture too.

One practical tip, mine and not the standard's: if you have more than one system, start from one only. A SUC that is too big makes the risk assessment slow and vague. A small one can be closed, you learn from the first round, and you repeat it on the others.

## The Inventory

You start from what exists on paper: network diagrams, architecture, data flows. Then you go to the field and verify.

The second step is the one that counts. It often happens that something shows up that was not on the drawing: an undocumented connection, a vendor with remote access, a forgotten PC in a cabinet. This is why "the plant is isolated" is a sentence to be verified, not believed. And the access points that emerge here, logical and physical, are exactly the ones ZCR 1 asks you to identify.

As a starting point for the inventory (again a practical suggestion): an identifier, asset type and function, location, vendor and model, firmware or OS version, network interfaces and protocols, connections to the outside, owner, and whether the vendor still supports it.

## Typical Mistakes

* Starting without a rationale tied to the mission: the program stays a technical initiative that nobody defends.
* No management support, and therefore no resources when you need them.
* Building the inventory from drawings only, without a field check.
* Defining a SUC that is too big for a first round.

## What You Have in Hand at the End

Three things:

* A one-page mandate.
* A written definition of the SUC.
* An inventory with the network diagram.

It is not the most exciting part of the journey, but everything else rests on it.

---

To follow this post, it helps to review the ZCR diagram we already covered in [[The IEC 62443 map]].

![[iec62443-diagram-10-risk-assessment-zcr.png]]
