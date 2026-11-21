---
cover: iec62443
date: 2026-10-17
tags:
- advanced
- governance
- iec62443
- ot-ics
- security
---
IEC 62443 does not have one diagram. It has about ten, with similar names, and during the course I needed a map not to get lost.

This article **is** that map. Bookmark it, because the next articles come back to it one piece at a time.

## 1. The Common Thread

There is only one thread (diagram 1). You start from the **CSMS** (Cyber Security Management System), you assess the risk, you draw zones and conduits, you assign an **SL-T**, you break it down into the seven **FR** (foundational requirements), you derive the requirements, you choose the countermeasures, then you monitor and improve. Everything else, models and life cycles included, is just a different view of this chain.

![[iec62443-diagram-1-map.png]]

## 2. The Four Models

There are four models, and each one derives from the previous one (diagram 2).

![[iec62443-diagram-2-model-dependency.png]]

**Reference Model** (diagram 3). The one everybody calls "Purdue". It gives the conceptual base with its levels from 0 to 4. Levels 0 to 3 are the industrial (OT) side, level 4 is the enterprise (IT) side. A note: the industrial DMZ between levels 3 and 4 that you see in many drawings is a widely recommended best practice, not a layer of the official model. In the picture I show it to make the point that IT and OT should not talk directly.

![[iec62443-diagram-3-reference-model-purdue.png]]

**Asset Model** (diagram 4). It says **what I have**: physical and logical components, with their attributes and relations. It is the inventory that everything else depends on.

![[iec62443-diagram-4-asset-model.png]]

**Reference Architecture** (diagram 5). It says **how it is built**, and it is unique for every company.

![[iec62443-diagram-5-reference-architecture.png]]

**Zone and Conduit Model** (diagram 6). It says **where I draw the boundaries**. Policies are born here, and are applied to the assets.

![[iec62443-diagram-6-zone-conduit-model.png]]

## 3. The Life Cycles

There are two independent life cycles: the one of the **product**, on the vendor side, and the one of the **automation solution**, on the plant side.

The second one can be read in three phases (Assess, Develop & Implement, Maintain), in eight phases (diagram 7), or from the services point of view, who does what and when (diagram 8). In the eight-phase view, the ISA courses are mapped on the phases: IC32 covers the fundamentals of all of them, IC33 [[The initial risk assessment (ZCR2)|risk assessment]], IC34 design, IC37 maintenance.

![[iec62443-diagram-7-iacs-cybersecurity-lifecycle.png]]

![[iec62443-diagram-8-services-view.png]]

There is also a third cycle, the one of the **security level** (diagram 9): same scheme, but referred to a zone and not to a physical asset. The two cycles have different phase gates, but they influence each other: a change to an asset can trigger work on the security level, and a new vulnerability can force you to act on the asset.

![[iec62443-diagram-9-security-level-lifecycle.png]]

## 4. Two Processes to Keep at Hand

**The seven ZCR steps** of 62443-3-2 (diagram 10): identify the [[Mandate, perimeter (SUC) and inventory (ZCR1)|SUC]] (system under consideration), initial risk assessment (worst case), partition into zones and conduits, compare the initial risk with the tolerable one, detailed risk assessment (which gives the SL-T), document the CRS (cybersecurity requirement specification), approval by the [[The IEC 62443 roles|asset owner]]. If the initial risk is already tolerable, you skip straight to documentation.

![[iec62443-diagram-10-risk-assessment-zcr.png]]

**The five phases of patching** of 62443-2-3 (diagram 11): information gathering, monitoring and evaluation, patch testing, patch deployment, verification and reporting. And then it starts over. The installation times in the picture, one week for high priority, three months for medium, two years or the next outage for low, are indicative values from the course material, and in the real world they are agreed per plant.

![[iec62443-diagram-11-iacs-patching.png]]

## 5. The CCSC

Finally, the **CCSC** (Common Component Security Constraints, diagram 12): four constraints that hold for all the component requirements of 62443-4-2. Do not compromise the essential functions, provide compensating countermeasures outside the component where it is not enough, apply least privilege, develop with a secure process.

![[iec62443-diagram-12-ccsc.png]]
