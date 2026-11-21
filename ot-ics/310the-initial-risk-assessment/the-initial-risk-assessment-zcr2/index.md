---
cover: iec62443
date: 2026-11-18
tags:
- advanced
- governance
- iec62443
- ot-ics
- risk-assessment
- security
---
You have a mandate, a defined [[Mandate, perimeter (SUC) and inventory (ZCR1)|SUC]] and an inventory. Before talking about firewalls, security measures and security levels, there is one question to ask: **what is the worst that can happen if this system is unavailable or tampered with?**

ISA/IEC 62443-3-2 calls this the initial cyber security risk assessment (ZCR 2, clause 4.3). It is not the detailed analysis. It is a first, rough picture of the worst case, and it comes before you split the system into zones and conduits.

![[iec62443-initial-risk-assessment.png]]

## What the Standard Asks

ZCR 2.1 says the organization shall perform a cyber security risk assessment of the SUC, or confirm that a previous one still applies, to identify the worst-case unmitigated risk that could result from interference with, breach of, or disruption of mission-critical IACS operations.

Three words matter here:

* **Worst case:** you are not estimating what is likely, you are estimating what hurts most.
* **Unmitigated:** you reason as if firewalls, passwords and procedures did not exist.
* **SUC:** you assess the system as a whole, not each component.

The standard lists the areas to look at: **health**, **safety**, **environmental impact**, **business interruption**, **production loss**, **product quality**, financial, legal, regulatory and reputation.

## The Table

In practice it is a table. The rows are the worst-case scenarios and the columns are the impact areas. In each cell: high, medium or low.

Example rows: loss of control of the process, safety system disabled or altered, plant stopped for days because ransomware reached the OT network, theft of recipe data. The last column asks whether the result exceeds the tolerable risk.

The scenarios in the figure are illustrative. Yours will depend on the plant.

## You Don't Start from Zero

* If the process is hazardous, a process hazard analysis (PHA) almost certainly exists. The standard says to reference the results of the PHA and of the functional safety assessment (IEC 61511) to identify the worst-case impacts.
* The standard also suggests taking into account threat intelligence from governments and sector ISACs.
* The answers from your one-page mandate (maximum sustainable downtime, loss per day of stop) are the natural input for the business columns.

The assessment of the initial risk is often done with a risk matrix that relates likelihood, impact and risk, such as a corporate risk matrix. Examples are in Annex B of the standard.

## The Comparison: ZCR 4

ZCR 4.1 is a single requirement. The initial risk is compared with the tolerable risk of the organization. If it exceeds it, a detailed risk assessment (ZCR 5) is mandatory. If it does not, you document the result and you stop there.

Who defines what is tolerable? The [[The IEC 62443 roles|asset owner]]. It is the same point I made in the post about stakeholders: if nobody has formalized the tolerable risk, this comparison has nothing to compare against.

The standard also says that the initial assessment helps in two other ways: it prioritizes the detailed assessments, and it helps group assets into zones and conduits, which is the next step.

## Two Practical Notes

* **Use one method.** The standard says initial and detailed assessments should come from the same framework and use a consistent risk ranking scale, otherwise the results are not comparable. Use your corporate risk matrix if you have one.
* **Don't chase precision.** This is a first pass. If another hour of discussion doesn't change the color of a cell, the cell is fine. (This one is my opinion, not the standard's.)

## Typical Mistakes

* Counting the existing countermeasures, and so ending up with a table that says everything is fine.
* Mixing up impact and likelihood. Here we only ask how bad it can get.
* Running it inside the security department only, without production and safety.
* Using a different scale from the one used later in the detailed assessment.

## What You Have in Hand at the End

Three things:

* The worst-case table for the SUC.
* The comparison with the tolerable risk.
* A priority list for the detailed risk assessment.

---

To follow this post, it helps to review the ZCR diagram we already covered in [[The IEC 62443 map]].

![[iec62443-diagram-10-risk-assessment-zcr.png]]
