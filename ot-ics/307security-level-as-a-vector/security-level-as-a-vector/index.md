---
cover: iec62443
date: 2026-10-10
tags:
- governance
- iec62443
- intermediate
- ot-ics
- security
---
In the last two articles I talked about the four security levels and the three ways to measure them. But the security level can also be represented as a **vector**.

![[iec62443-sl-vector.png]]

## Seven values, seven questions

SL can be written as a vector of seven values, one per **foundational requirement (FR)**. Moving from an SL **number** to an SL **vector** lets you differentiate the fundamental requirements. Here they are, with the question I use to remember each one:

* **FR1, IAC (Identification and Authentication Control).** *Who are you?* Do you really know who is accessing the system?
* **FR2, UC (Use Control).** *What can you do?* Once inside, what are you allowed to do, and what not?
* **FR3, SI (System Integrity).** *Has it been modified?* Did somebody alter code, configuration or data without authorization?
* **FR4, DC (Data Confidentiality).** *Who can read?* Who has access to the information that circulates?
* **FR5, RDF (Restricted Data Flow).** *Where can data go?* Does data stay where it should, or can it end up where it shouldn't?
* **FR6, TRE (Timely Response to Events).** *How do I react?* What happens when something goes wrong, and how fast?
* **FR7, RA (Resource Availability).** *Does it stay available?* Does the system hold, even under attack?

The order above is the official one and it is worth learning by heart: in the exam, "FR5" has to immediately mean "restricted data flow". Each value goes from 0 to 4, where 0 means no specific requirement.

Why is it useful? Because "SL3" says very little. A zone with the vector `{2 2 1 1 3 1 3}` is **not** "SL3": it needs strong protection on data flow and availability (a typical choice for a control zone), and much less on confidentiality (the data of a PLC loop is rarely a secret). Same SL3, different protection on each requirement.

## Closing the theory

Let me wrap up this theoretical part:

* SL is a value from 1 to 4: every level is associated with a threat actor profile.
* SL has three types: **SL-T** (the goal), **SL-C** (the potential), **SL-A** (the current state). The aim is SL-A ≥ SL-T. Before building a plant I must have clear ideas and select components with an adequate SL-C.
* For clarity, SL can be written as a vector of seven components, each answering a specific question.

A formal remark: saying "the plant has SL3" is formally incorrect, because SL applies to zones and conduits, not to the whole plant. In informal use, "the plant is SL3" usually means that the highest value is 3.

## In practice: twin matrices

What follows is my own suggestion, not something from the standard, but it works well for me.

### SL-T and SL-A as twin matrices

For every zone and conduit you have an SL-T and an SL-A. Put them side by side: FR per row, zone or conduit per column. Where SL-A < SL-T, color the cell. You see the gaps in one glance.

![[iec62443-zones-conduis-sl-matrix.png]]

In the example, the gaps are Z2 on FR3 (integrity), Z1 on FR6 (response), and the conduit C2 on FR5 (data flow). Notice that the Z3 printers zone has SL-T 0 on FR6: it is a choice, not a mistake, and it should be written down and approved by the [[The IEC 62443 roles|asset owner]].

### SL-C of components against SL-T of the zone

Once SL-T is defined, I must make sure that the components have a compatible SL-C. The same trick works: one column per component, one row per FR.

![[iec62443-component-sl-matrix.png]]

A gap in a component does not automatically block the zone: another component or a countermeasure around it can compensate. But the compensation has to be a conscious, documented decision.
