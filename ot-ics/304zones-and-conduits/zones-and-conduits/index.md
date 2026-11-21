---
cover: iec62443
date: 2026-09-19
tags:
- beginner
- governance
- iec62443
- ot-ics
- security
---
**Our network is segmented.**

I hear this sentence often, and have for years, and it means nothing. So much that I ended up introducing another word: **segregation**. Different word, maybe clearer meaning.

IEC 62443 speaks about **security zones**: an area that groups assets with the **same acceptable risk level**, with a clear boundary between inside and outside. Note what the definition is built on: not the technology, not the IP addresses, but the risk.

![[iec62443-zones-conduits.png]]

## The printers example

The simplest example I found in the course is also the most effective: the **printers**.

Industrial printers (for labels, reports, alarms) do not control the process, but they are very easy to compromise: old firmware, default passwords, nobody ever updates them.

Putting them in a separate area is not an excess of zeal. It is acknowledging that in there the acceptable risk is different from the one of the control room, and acting on it. PLCs and printers have different criticalities and different needs. If they are treated the same, you have to protect the printers like PLCs (expensive and often impossible) or the PLCs like printers (dangerous).

## Sub-zones: inherit from the parent, add your own

In the first version of this article I left sub-zones out, because I found it hard to explain them in a way that was both clear and short. A comment made me realize that, without them, the printers example is incomplete. So let me try.

In the very common case, the printers already sit *together* with the production systems. They live in the production zone, so they **inherit** a set of its characteristics: the policies, the rules, the way they are managed. That is the "parent" relationship. On top of that, they have **their own** characteristics, stricter in some aspects (isolation, restrictions on who can talk to them), and that is the sub-zone: the dashed box inside the production zone in the picture.

The mental model I use: the sub-zone is not a separate world. It is a part of the parent zone that has **additional** rules.

Two more examples that I find useful:

* **The historian.** It lives in the production zone, but it needs *wider* policies than the rest, because it has to talk with the enterprise side to deliver its data. Here the sub-zone is the opposite of the printers: not more restricted, but more open, and for that reason it is better to have it as an explicit exception than to open up the whole production zone for it.
* **External vendors.** Suppliers who access remotely are a good candidate for a **dedicated zone**, not a sub-zone. Their risk profile is different, they are not under your control, and their access has to go through well-defined conduits.

The question to ask is always the same: **is the acceptable risk of these assets the same as their neighbours'?** If yes, they stay together. If it differs a little and the rest is shared, think sub-zone. If it differs a lot, think a dedicated zone.

## A zone with no network: the laptop and the USB stick

If you come from network security, a zone looks like a VLAN or a subnet. Something with an IP range and a firewall in front. So a zone made of a USB stick sounds strange. It is not, and the standard asks for it ([[Partitioning the SUC into zones and conduits|ZCR 3.4]], in 3-2): devices that make **temporary connections** to the system should be grouped into a separate zone.

Think of the engineering laptop of a maintenance technician. In one week it is on the office network to read email, in the vendor's lab to download a firmware, on the hotel Wi-Fi during a business trip. Then it goes into the plant and gets plugged into the control network to modify a PLC program. With a USB stick carrying the project files, going back and forth.

![[iec62443-usb-zone-example.png]]

The risk of that laptop is not the risk of the control network. It is the sum of every place it has been. And that risk **travels with the device**. This is the reason it gets its own zone: not because of where it sits, but because of what it brings with it. The standard says the same thing in its own words: because of the temporary nature of the connection, these devices may also connect to other networks outside the zone.

So how do you draw a zone that has no IP range? The boundary is **the device and the media**, plus the physical place where they live and where they are checked. The logical boundary says "these laptops and these USB sticks". The physical boundary says "the maintenance cabinet and the check-in station".

And the conduit? Same lesson as the next section, with a very concrete case. The conduit between this zone and the control zone is not a cable. It is a **check-in station**: a malware scan, a list of approved media, a log of who plugged what and when. The measures are the conduit.

The standard also gives an exception worth knowing: a handheld device that is used inside a single zone and never leaves its physical boundary may be included in that zone. The risk comes from the travelling, not from the device itself.

## Conduits are not cables

Between one zone and another you need **conduits**: the controlled communication channels that let data through without compromising it.

A very common mistake is to think that a conduit is a cable. It is not. A conduit is **the set of measures that govern that connection**: a firewall, a VPN, an authentication system, the protocols you allow and the ones you block. The cable is only part of it. And this is important for the exam: a conduit has its own security level, just like a zone.

## Who draws it, and greenfield vs brownfield

The architecture is typically designed by the **[[The IEC 62443 roles|integration service provider]]** (see the [[The IEC 62443 roles|previous article]]). But the designer always starts from a decision that cannot be taken alone: **how much risk the asset owner is willing to accept**. A zone model drawn without that input is a drawing, not a security architecture.

The examples above are the brownfield case: the plant exists, the printers are already there next to the production systems, and you work with what you have. If instead you are designing a **new plant**, you can make different evaluations and start from a cleaner sheet. But be careful: in the end every zone, sub-zone and conduit has to be translated into **technical configurations** (VLANs, firewall rules, access lists). That is where the discussion opens on microsegmentation and similar approaches, which is a topic for another day.

## Practical rules I take away

* Every boundary must exist for a precise reason that you can write in one sentence. If you cannot, remove it or justify it.
* Group by risk and function, not by "what is physically close".
* Remember that the only way into a zone is a conduit, and every conduit has an owner.
* Before creating a new zone, ask whether a sub-zone is enough. It is easier to keep and to explain.

A well segmented network is not the one with the most firewalls. It is the one where every boundary exists for a precise reason.
