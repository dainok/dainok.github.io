---
cover: governance
date: 2024-10-12
tags:
- beginner
- governance
title: "Cybersecurity: fashion or strategy"
---
I could not find a suitable title for this post, in which I gather various insights from the past few days. Sooner or later I plan to discuss them with [Rocco Sicilia](https://roccosicilia.com/).

I start with a provocation: cybersecurity has been under the spotlight for some years now, and I would call it "trendy" (we will see why). Various hypes follow one another, creating needs and fears with the aim of selling solutions and services. There is nothing wrong with this, but we need to distinguish acting out of "trendiness" from strategic action.

Acting out of "trendiness" is an impulse, aesthetic and sometimes very personal, often done out of emulation. It is difficult to trace the motivation behind such choices, precisely because they are impulses. For the purpose of this post, security measures chosen on impulse are not guided by a strategy and, as [we have discussed several times](https://www.spreaker.com/podcast/info-sec-unplugged--6025156), they are often ineffective. This mode is extremely widespread and easy to identify: if I ask "why" a security measure ([[Managing a brownfield Cisco ACI fabric with NaC and Terraform|NAC]], firewall, security awareness training software...) was implemented, the answer tends to be (I exaggerate and simplify) "because". Almost always, these measures are not integrated into a process and are not monitored, which [we have also discussed](https://www.spreaker.com/podcast/info-sec-unplugged--6025156).

Strategic action starts with an analysis and inserts security measures into a higher-level design. Each measure is chosen and placed with a specific purpose and measured accordingly. There may be exceptions, but they are well documented and temporary (with an end date), because an exception weakens the protections we have implemented.

A real example that touches on the fundamentals is the firewall. All companies have one, whether perimeter or dual bastion. Almost no company defines policies, though: they are written by technicians and are often hated because they limit other people's work. Strategic action starts from the purpose of the infrastructure, which is to support the business. The infrastructure must provide services, which are implemented through servers. To function, these servers have connectivity needs and therefore risks. We mitigate the risks by dividing servers into areas, and these areas can communicate with each other only under certain rules, which are translated into firewall policies. In an ideal world, I should NEVER find publicly exposed systems placed in networks considered secure. I do find them, and they are often historical relics, abandoned and unchecked, exposed precisely for "historical reasons".

Because security in companies is done by technicians, nobody has the strength to bring cybersecurity to the corporate level.

And then the CISO arrives.

The responsibility for cybersecurity is dumped onto the CISO. I mean "dumped": the problem, once relegated to technicians, is now relegated to a manager so that the company can keep forgetting about it. Let's start with the basics:

* A CISO who does not report to the board cannot do the job.
* A CISO who does not have a budget cannot do the job.
* A CISO who does not have veto power cannot do the job.
* A CISO who is not consulted before any technological choice cannot do the job.

It has been said many times: cybersecurity is a corporate problem, but everyone keeps pretending otherwise. A couple of years ago, I had the opportunity to interview some CEOs of enterprises close to me. Their answers were enlightening because they let me enter their mindset and understand their needs. In short, cybersecurity is not a topic of interest to them, because it is delegated to the CIO or CISO (depending on the company).

There are many exceptions, of course, but the dominant behavior I notice is the one I described.
