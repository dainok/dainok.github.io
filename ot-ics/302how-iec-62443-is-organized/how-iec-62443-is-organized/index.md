---
cover: iec62443
date: 2026-09-05
tags:
- beginner
- governance
- iec62443
- ot-ics
---
In the [[Why OT security is not IT security (and why it matters)|previous article]] I explained why industrial control system security needs an approach different from IT. Now let's look at the structure of the standard from above.

The first time you open the table of contents of IEC 62443 it looks confusing. There are many parts, with cryptic numbering, and it is not obvious who each of them is for or what it is for.

The trick is to stop thinking of it as a book. The standard is organized in **six groups, each with a different audience**. They are not six chapters to read in sequence: they are six different tools, and you will rarely need all of them.

![[iec62443-structure.png]]

## The six groups

**General (62443-1-x).** Terminology, concepts and the security life cycle. Anyone approaching the subject for the first time should start here: before talking about zones and conduits you need to know what the words mean.

**Policy & Procedures (62443-2-x).** For people who have to build a security *program* inside an organization: [[The IEC 62443 roles|asset owners]], IT and security managers. Among other things, this is where you find 62443-2-1 (the security management system, the CSMS) and 62443-2-3 on [[VA scanners for patch management  good or bad|patch management]]. We will come back to both. Part 2-4 is also here: it contains the requirements for service providers.

**System (62443-3-x).** For people who design: system integrators, architects. This is where the [[The initial risk assessment (ZCR2)|risk assessment]] lives (3-2) and where you decide which security level is needed in which zone. Part 3-3 contains the system requirements, organized by the seven foundational requirements.

**Component (62443-4-x).** For people who build components: vendors of PLCs, HMIs, network devices. Part 4-1 is about the secure development process, part 4-2 about the technical requirements of the single component.

Then there are two more recent groups, with their own numbering:

**Profiles (62443-5-x).** Adapt the standard to a specific sector (pharma, energy...).

**Evaluation (62443-6-x).** How conformity is verified and certified, with the target on parts 2-x and 4-2.

For the IC32 course and exam, these last two are barely mentioned. Know that they exist and what they are for, and that is enough.

## Why the structure is not just bureaucracy

The structure mirrors exactly how a real project moves:

1. The **asset owner** defines the acceptable risk (Policy & Procedures).
2. The **system integrator** translates that risk into an architecture (System).
3. The **supplier** builds components that satisfy the requirements (Component).

If in a project someone skips one of these steps, everything that follows is built on a risk nobody actually defined. This is, in my experience, the most common failure mode: not a missing firewall, but a missing decision.
