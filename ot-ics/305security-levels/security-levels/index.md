---
cover: iec62443
date: 2026-09-26
tags:
- beginner
- governance
- iec62443
- ot-ics
- security
---
**What is the security level (SL) of your plant?**

This question opens a mini-series inside the series. Squeezing the whole topic into one article would have made it unclear, so I split it in three: this one on the levels, the next on the three types of SL, and then SL as a vector.

![[iec62443-security-levels.png]]

## What an SL is

The security level is a number from 0 to 4 that says **how much a boundary, a zone or a conduit resists a category of attacker**. Mind the words: it is applied to zones and conduits ([[Zones and conduits|previous article]]), not to "the plant".

It is not a generic "more secure / less secure" scale. The standard ties each level to a precise attacker profile:

* **SL1**: protection against *casual or coincidental violation*. Someone stumbles where he should not, with no intention at all.
* **SL2**: protection against *intentional violation using simple means*: low resources, generic skills, low motivation.
* **SL3**: protection against *intentional violation using sophisticated means*: moderate resources, skills specific to industrial systems, moderate motivation.
* **SL4**: protection against *intentional violation using sophisticated means with extended resources*: IACS-specific skills and high motivation. The nation-state (sponsored) attacker profile.

SL0 also exists, but only as a value: it means no specific requirement or protection. You will see it later in the vector.

A small trap for the exam: the SL talks about the *attacker you protect against*, not about the *damage* you want to avoid. The damage enters the picture in the [[The initial risk assessment (ZCR2)|risk assessment]], which is how you choose the target.

## Two consequences

**First**: going up one level means designing countermeasures built to resist an adversary with more resources and more competence. It is not "the same plus a bit more". The cost and the effort do not grow linearly, and some measures that are fine at SL2 are simply not enough at SL3.

**Second**, and it is a prerequisite of the first: it is not that easy to define an attacker with "simple means", "sophisticated" or "extended". Who is that, in practice? A bored teenager, a competitor, a criminal group with ransomware, a state? And if we are not able to define these categories, we are not able to define the measures needed either.

That is why, in my opinion, SL is more useful as a *common language* than as a precise measure. It forces a conversation between [[The IEC 62443 roles|asset owner]], integrator and vendors about *who* we are afraid of, which is usually a conversation nobody has had. Rocco Sicilia and I already talked about this problem in the past on the *Info Sec. Unplugged* podcast.

SL alone still does not mean anything, because there are three different ways to measure it.
