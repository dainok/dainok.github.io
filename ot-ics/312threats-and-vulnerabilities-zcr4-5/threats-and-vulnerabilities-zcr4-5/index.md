---
cover: iec62443
date: 2026-11-26
tags:
- advanced
- governance
- iec62443
- ot-ics
- risk-assessment
- security
---
We have zones and conduits. The comparison with the tolerable risk (ZCR 4) was made on **the worst case, without looking at who attacks**: we assumed the incident happens. If that risk exceeds the threshold, the detailed risk assessment starts: ZCR 5 in ISA/IEC 62443-3-2, clause 4.6. It applies to every zone and conduit. Here threats are needed, because now we estimate how likely they are. It begins with two questions: who can hurt us, and where are we weak.

![[iec62443-threats.png]]

## Why We Are Here: ZCR 4

Before the threats, a quick look at the door we came through. ZCR 4.1 is the comparison I described in [[The initial risk assessment (ZCR2)|the initial risk assessment]]: **the worst-case risk of the SUC is compared with the tolerable risk** of the organization. If it exceeds it, the detailed assessment (ZCR 5) is mandatory. If it does not, you document the result and you stop.

So ZCR 5 is not optional "extra work" that the security team decides to do. It is the consequence of a comparison, and the asset owner owns the other side of that comparison, the tolerable risk.

The two assessments look similar, but they are different:

| | Initial (ZCR 2, then ZCR 4) | Detailed (ZCR 5) |
|---|---|---|
| Scope | the SUC as a whole | each zone and conduit |
| Question | how bad can it get? | what can go wrong, and how likely is it? |
| Input | worst-case consequences | threats, vulnerabilities, likelihood |
| Result | go / no go for the detailed assessment | the target security level (SL-T) |

The scale must be the same in both, otherwise the results cannot be compared. We will meet the second comparison with the tolerable risk in the next post (ZCR 5.7), this time per threat.

## The vocabulary

These terms are asked in the exam, and they are easy to confuse. The definitions are in 3-2, clause 3.1.

* **Threat:** a circumstance or event with the potential to adversely impact operations or assets, including the IACS.
* **Threat source:** the intent and method targeted at the intentional exploitation of a vulnerability, **or** a situation and method that may accidentally exploit a vulnerability.
* **Threat vector:** the path or means by which a threat source can gain access to an asset.
* **Threat environment:** a summary of information about threats (sources, vectors, trends) that can affect a defined target, such as a company, a facility or a SUC.
* **Vulnerability:** the weakness. For a threat to succeed, it has to exploit at least one.

Note that the threat source includes accidents. We will come back to this.

## ZCR 5.1: Identify the Threats

The requirement is a list of the threats that could affect the assets in the zone or conduit. Each threat description should include:

* the **threat source**
* its **capability or skill level**
* the possible **threat vectors**
* the **assets** potentially affected

The examples in the standard are deliberately unspectacular:

* a non-malicious employee physically accesses the process control zone and plugs a USB memory stick into one of the computers;
* an authorized support person logically accesses the process control zone using an infected laptop;
* a non-malicious employee opens a phishing email, compromising their access credentials.

If you read the section on the maintenance laptop and the USB stick in [[Zones and conduits]], you already know the first two: it is the scenario behind the temporary devices zone.

Notice that in all three nobody wants to cause damage. The threat source is not only the attacker. ISA/IEC 62443-1-1 lists **accidental** threats and **non-validated changes** among the common forms of threat, and describes the insider as a trusted person (employee, contractor or supplier) who can be a threat even without intent, for example by bypassing a security control "to get the job done".

You don't need a hundred rows. The standard says it is acceptable to summarize by grouping sources, assets and entry points into **classes**. Ten realistic scenarios are better than eighty invented ones.

## ZCR 5.2: Identify the Vulnerabilities

The requirement: analyze the zone or conduit to identify and document the **known vulnerabilities** of the assets it contains, **including the access points**.

The standard explains why: a threat is successful only if it exploits one or more vulnerabilities in an asset, so knowing the vulnerabilities helps to understand the threat vectors.

A generally accepted approach is a vulnerability assessment (the standard refers to ISA-TR84.00.09). Known vulnerabilities can also be found through ICS-CERT and the IACS product suppliers. The technical report on patching (ISA-TR62443-2-3) adds national CERTs and other situational awareness organizations, and strongly recommends checking these sites throughout the week, or better, subscribing to their email notifications.

This is where the [[Mandate, perimeter (SUC) and inventory (ZCR1)|inventory]] pays back. Without vendor, model and firmware or software version, you cannot know whether a known vulnerability applies to you.

## An Aid That Is Not in the Standard

To understand how real attackers target industrial systems, **MITRE ATT&CK for ICS** catalogs tactics and techniques observed in real events. NIST SP 800-82 suggests it for characterizing threats. NIST also groups threat sources into four categories: adversarial, accidental, structural and environmental. This is not part of IEC 62443, but it is a useful checklist so you don't forget the accidents.

## The Table

In practice, you write a table per zone. The columns: threat source, skill, vector, affected assets. The figure shows four rows. The first three are the standard's examples. The fourth, a criminal group using vendor remote access, is my own example, and the skill levels are illustrative.

A second list, per asset, holds the known vulnerabilities: asset ID, vendor, model, version, the reference of the vulnerability, and where you found it.

## Typical mistakes

* A threat list made only of hackers. Many real incidents start with a mistake or a change nobody validated.
* Copying a generic list from the internet, with nothing about your zones and your access points.
* Looking for vulnerabilities without an inventory that has versions.
* Forgetting the access points: ZCR 5.2 asks for them explicitly.
* Starting with a hundred scenarios and never finishing.

## What You Have in Hand at the End

Two things:

* The list of threats for each zone and conduit.
* The list of known vulnerabilities for each asset.

---

To follow this post, it helps to review the ZCR diagram we already covered in [[The IEC 62443 map]].

![[iec62443-diagram-10-risk-assessment-zcr.png]]
