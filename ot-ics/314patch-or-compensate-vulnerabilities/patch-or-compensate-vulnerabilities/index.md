---
cover: iec62443
date: 2026-12-04
tags:
- advanced
- governance
- iec62443
- ot-ics
- security
- vulnnerability-management
title: Patch or compensate OT/ICS vulnerabilities?
---
**Patch or compensate? A risk decision, not a rule.**

We have the list of vulnerabilities. The textbook answer is: patch them. In OT, most of the time, that does not work.

## Why patching is slow in OT

* Equipment lives fifteen or twenty years, and the vendor stops releasing patches long before that. When no patch exists, there is nothing to apply.
* When a patch exists, it has to be validated with the integrator, tested, and installed in an outage window that may be a year away.
* HMIs are often Windows PCs, but in my experience they are usually left alone, because the vendor does not guarantee the system will keep working if you change something. Sometimes you cannot even install an antimalware.
* A PLC that works is left as it is.

So the update cycle is slow. The risk management cycle has to be faster.

## What the standard says

IEC 62443 is less far from this than it may look. ISA-TR62443-2-3, the patch management report, says that when a vulnerability is announced the asset owner should assess whether it applies to their systems. If the patch is not available, or the system cannot be patched right away because of its criticality, the appropriate action may be to take countermeasures. It also says that patching should be scheduled in an outage window when feasible, and tested in a non-production environment ahead of the window when possible.

There is a second mechanism, from the security level part of the series. If a component cannot reach the SL-T required by its zone (its SL-C is lower), the gap is closed with compensating countermeasures around the component. This is the idea behind the common component security constraints, which we saw in the map post. The standard does not ask you to update the PLC. It asks you to know that you cannot, to write it down, and to compensate.

## A decision, not a rule

For each vulnerability there are three options: patch, compensate, or accept. The figure shows the flow. The question that matters first is whether a patch exists and the integrator has validated it on your system. If yes, plan it in a window and test first. If no, compensate.

![[iec62443-patch-or-compensate.png]]

## Where to act

These are my practical suggestions, not the standard's.

1. **The entry points you control:** firewalls, VPNs, remote access gateways → patch them fast. These are what stands between the outside and the PLC you cannot patch. Here lies your main compensation: segregation, filters and IPS can reduce the exposure and prevent attacks.
2. **Ports and media on the HMIs:** USB disabled or blocked, and removable media passed through a check-in station, as in the [[Zones and conduits|temporary devices zone]]. It does not touch the vendor's software.
3. **Passive network monitoring:** if you cannot install anything on the device, monitoring has to sit on the network. There are OT products designed for this, which observe traffic without agents (Cisco Cyber Vision is one example). I mention it as a category, not as a recommendation: it has a cost, and its value depends on how well your zones are already defined. It's a technical shift, not a solution: technologies must be managed and maintained. But at least here we can act.
4. **The residual risk, in writing:** what is left after the controls is accepted by the asset owner, as we said in the [[The IEC 62443 roles|post on roles]]. Without that signature, "we compensated" is just a hope.

## Compensating controls are not free

They have to be maintained, tested, and they fail too. Moving everything there moves the debt, it does not remove it. A vulnerability that is not fixed behind a single firewall is a risk that depends on that firewall. That is why the inventory, the zones and the vulnerability list matter: a fast risk cycle is only possible if the work was done before.

## What about buying better equipment?

On new purchases you can ask for products developed under ISA/IEC 62443-4-1 and components certified to 4-2. But that does not change the installed base, and a vendor's commitment is worth what the vendor is worth if it disappears or discontinues the line. I would not make it a pillar of the strategy.

## My opinion, in one sentence

In OT, the patch is the exception you plan. The controls are the rule.
