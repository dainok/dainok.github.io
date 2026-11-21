---
cover: iec62443
date: 2026-09-12
tags:
- beginner
- governance
- iec62443
- ot-ics
---
**Who guarantees the security of a plant?**

It looks like a trivial question, and the naive answer is usually: the integrator. But, and there is always a "but", if you open the contract, there is no mention of it. No responsibility at all.

![[iec62443-stakeholders.png]]

IEC 62443 assigns the roles more precisely than it seems at first sight. And the **accountability**, the ultimate responsibility, the one you cannot delegate, always stays with the **asset owner**. Always, even when most of the technical work is handed over to an integrator. The asset owner can delegate activities. Not the risk.

## The four roles

**Asset owner.** The one who owns and operates the plant, and who is accountable. There is a task that is theirs and nobody else can do it for them: defining the **tolerable residual risk**, meaning how much risk the organization accepts to live with after the countermeasures. If this step is skipped, everything that follows is built on an implicit assumption instead of a decision. In the standard the asset owner is mainly in parts 2-1, 2-4, 3-2 and 3-3.

**Integration service provider.** Designs and implements the solution according to the asset owner's requirements (when there are any): technical specifications, installation, configuration, testing, up to handover.

**Maintenance service provider.** Comes in after handover and stays as long as needed: patching, updates, change management, up to the decommissioning of systems at end of life.

**Product supplier.** Builds the product (PLC, HMI, network component...) designed to be independent from the specific plant. Provides the hardening guidelines and handles [[Vulnerability Management|vulnerability management]] on its own product. Here the reference parts are 4-1 and 4-2, plus 3-3 for the system requirements the product has to support.

Around them there are the **support roles**: regulators, insurers, certification bodies. They do not execute anything on the plant, but they shape what is required, how it is verified and what happens when something goes wrong.

## A detail that creates a lot of confusion

These are **roles, not companies**. One organization can play several roles at the same time, and one role can be shared among several organizations. A plant that does its own maintenance is asset owner and maintenance service provider at once. A big vendor can be product supplier and integrator.

What the standard asks you to hold firm is not "who is who" on paper, but **who answers for what**. A good exercise: take your last project and write next to every activity the name of the person who is accountable and the one who is responsible. If you find activities with no name next to them, you found your first finding.

## Why this comes before the technical terms

With this map in mind, the technical vocabulary of the next articles (zones, conduits, security levels) makes much more sense: every concept exists to answer the responsibility of one of these roles.
