---
cover: iec62443
date: 2026-11-24
tags:
- advanced
- governance
- iec62443
- ot-ics
- risk-assessment
- security
---
We have the SUC and the worst case. Now the system has to be divided into zones and conduits. This is ZCR 3 in ISA/IEC 62443-3-2 (clause 4.4), and it is where you see whether security is designed or improvised.

### The base requirement: ZCR 3.1

The organization shall group IACS and related assets into zones or conduits as [[The initial risk assessment (ZCR2)|determined by risk]]. The grouping shall be based on the results of the initial cyber security risk assessment, or on other criteria:

* criticality of assets
* operational function
* physical or logical location
* required access (for example, least privilege)
* responsible organization

The intention, as the standard puts it, is to identify the assets that share common security requirements, so that common security measures can be defined for them.

## How you start

The standard gives an example. First **divide the facility into operational areas**, such as materials storage, processing, finishing. Then **divide each area into functional layers**: manufacturing execution systems (MES), supervisory systems (HMIs), primary control (BPCS, DCS, RTUs, PLCs) and safety systems. Models such as the **Purdue reference model** are often used as a basis. Product supplier reference architectures can help too. If you read the post on the map of the models, this is the Reference Model at work.

![[purdue-model-1.png]]

### The cases the standard spells out

ZCR 3.2 to 3.6 give guidance based on best practice. The standard says explicitly that this is not an exhaustive list.

* **ZCR 3.2, business vs IACS**: IACS assets shall be in zones logically or physically **separated from business or enterprise assets**. They are different systems, with different functions, owners, locations and impact on health, safety and environment.
* **ZCR 3.3, safety**: **safety related assets shall be separated** from non-safety assets. If they cannot be separated, the entire zone shall be identified as safety related. Safety zones typically need higher protection.
* **ZCR 3.4, temporary devices**: maintenance laptops, portable equipment, USB devices **should be in a separate zone**. They face a wider variety of threats and may connect to other networks. An exception: a handheld that never leaves a single zone may be included in it.
* **ZCR 3.5, wireless**: wireless devices should be in zones **separated from wired ones**. A wireless access point is typically modelled as the conduit between the two, and may need extra controls such as a firewall.
* **ZCR 3.6, external networks**: remote access is outside the physical boundary of the SUC, so it should be modelled **as separate zones** with its own security requirements. Think of employees, suppliers and partners connecting for maintenance, optimization or reporting.

Note the verbs. ZCR 3.2 and 3.3 say "shall". ZCR 3.4, 3.5 and 3.6 say "should". It is the kind of detail that shows up in exam questions.

ZCR 3.1 also asks for special attention to safety instrumented systems, wireless systems, systems directly connected to Internet endpoints, systems that interface to the IACS but are managed by other entities, and mobile devices.

### How many zones?

This is my opinion, not the standard's: don't make fifty. **Every extra zone is a boundary to design, a conduit to defend, a record to maintain**. Start with few zones, each with a written reason. If two zones have the same requirements, they are one zone.

And it is not a one-shot decision. The standard says the assignment of assets to zones and conduits may be adjusted based on the results of the detailed risk assessment.

If you wonder where the printers go, or when to use a sub-zone, I covered that in the [[Zones and conduits|post on zones and conduits]]. The short version: it depends on whether they need different security requirements.

If you come from network security, a zone with no IP range may sound strange. The maintenance laptop and the USB stick are the best example: [[Zones and conduits|the risk travels with the device]], so the device gets its own zone. I added a section on this to the zones and conduits article.

## The card of each zone

Later (ZCR 6.4, clause 4.7.5) the standard asks to **document, for each zone and conduit**: a name or identifier, accountable organization, logical boundary, physical boundary if applicable, safety designation, logical and physical access points, data flows for each access point, connected zones or conduits, list of assets with classification, criticality and business value, SL-T, applicable security requirements and policies, assumptions and external dependencies.

Right now the SL-T field stays empty. It is filled in after the detailed risk assessment. But it is worth opening a card per zone now, and filling what you already know.

## Typical mistakes

* One big zone for "the plant". It is easy to draw and it protects nothing.
* A zone for every device. It cannot be maintained.
* Forgetting remote access, the maintenance laptop or the wireless network because they are "not part of the system".
* Mixing safety and non-safety assets without declaring the whole zone as safety related.
* Drawing a conduit as a cable. A conduit is a logical grouping of the communication channels and the measures that protect them.

## How to build the three outputs

The standard asks for two things in the cyber security requirements specification (CRS): a drawing, or a set of drawings, that illustrates the zone and conduit partitioning of the entire SUC, with each asset assigned to a zone or a conduit (ZCR 6.3); and the characteristics of every zone and conduit (ZCR 6.4). It does not say how they must look. What follows is my practical way, not the standard's.

### The zone and conduit drawing

Don't start from a blank page. Take the network diagram from step zero and draw the zones on top of it.

* Draw the SUC perimeter first, dashed, with all the access points you identified.
* One box per zone, with an identifier (Z-01, Z-02) and a name that says what is inside, not where it is.
* One line per conduit, with an identifier (C-01, C-02) and the measures written on it: "firewall", "VPN with MFA", "check-in station". If you cannot write a measure on it, you have drawn a cable, not a conduit.
* Mark the safety related zones in a different colour, so nobody has to look for them.
* Show the zones outside the perimeter too: remote access, temporary devices, wireless.
* Keep one overview page that a non-specialist can read. Detail goes on separate pages, one per zone if needed.
* Put a date, a version and an owner on it. A drawing that nobody maintains is wrong within a year.

![[iec62443-suc-partitioning.png]]

The figure is an overview drawing in this spirit.

### Every asset assigned to a zone or conduit

This is the inventory from step zero with one more column: the zone. A small example:

| Asset ID | Asset | Type | Location | Zone or conduit |
|---|---|---|---|---|
| PLC-01 | Packaging line PLC | Controller | Line 2 cabinet | Z-03 Control |
| SW-01 | Control switch | Network | Line 2 cabinet | Z-03 Control |
| HMI-01 | Operator panel | HMI | Line 2 | Z-02 Supervisory |
| SCADA-01 | SCADA server | Server | Control room | Z-02 Supervisory |
| HIST-01 | Historian | Server | Control room | Z-02 Supervisory (talks to business: candidate sub-zone) |
| SIS-01 | Safety controller | Safety | Line 2 cabinet | Z-04 Safety |
| FW-01 | Firewall to office network | Network | Server room | C-01 Business to supervisory |
| LAPTOP-01 | Engineering laptop | Laptop | Maintenance | Z-05 Temporary devices |
| USB-01..06 | Maintenance USB sticks | Media | Maintenance | Z-05 Temporary devices |

Three checks that take ten minutes and find real problems:

* The number of assets in this table is the same as in the inventory. If not, someone is missing.
* Every asset is in exactly one zone or conduit. None in zero, none in two.
* Every conduit connects exactly two zones, and every zone has at least one conduit.

Most of the arguments in a workshop happen on the rows with a note in the last column. That is fine: write the note and the decision.

### A card for each zone

One page per zone and per conduit, with the items listed in ZCR 6.4. The next figure shows the card of the temporary devices zone, filled in. Two things to notice. The fields SL-T and security requirements stay open for now, and that is correct: they are filled in after the detailed risk assessment (the standard notes that the security requirements cannot be finalized until then). And the logical boundary of this zone is not an IP range: it is "these laptops and this media".

If a field cannot be filled, don't leave it blank. Write what is missing and who will find out. That list of open points is the first to-do list of the next steps.

![[iec62443-zone-card-example.png]]

## What you have in hand at the end

Three things: the zone and conduit drawing, every asset assigned to a zone or conduit, and a card for each zone.

---

To follow this post, it helps to review the ZCR diagram we already covered in [[The IEC 62443 map]].

![[iec62443-diagram-10-risk-assessment-zcr.png]]
