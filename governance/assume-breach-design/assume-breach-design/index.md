---
cover: governance
date: 2024-04-11
tags:
- advanced
- design
- governance
---
There is much discussion around Zero Trust Architecture (ZTA), but the concept of Assume Breach Design seems not to have been formalized yet. At least, a Google search does not return results. The term *Assume Breach Paradigm* is used, and I want to apply it to infrastructure design. So I am appropriating the term, in a manner of speaking, and explaining why changing the mindset could be beneficial.

As always, the idea comes from field experience: I realize that infrastructure design, from a cybersecurity perspective, follows a traditional approach. In the 1990s and 2000s, it was common to implement a DMZ network, a server network and sometimes a client network. Policies were designed based on application needs and were never formalized. This approach, still frequently used today, relies on the classic 3-tier architecture of web applications (clients, servers and databases), which had to be implemented separately. From a security standpoint, this led to separating these components logically with a firewall.

What I see today is precisely the consequence of this: systems are separated based on application logic, not security logic. The result is that companies have security zones that separate application components (Internet, DMZ, client, server, OT, Guest), and policies derive from application needs, not from security requirements.

A case in point: server networks typically contain the backend and the databases of the entire company. If one is compromised, the whole network is at risk.

A second, equally telling example: I imagine that anyone who has implemented firewall policies has done so based on an application request. The vast majority of firewall policies originate from application needs, and their impact is rarely evaluated because rejecting the request is not an option.

## Policy Design

The first attempt at a mindset shift was almost ten years ago. I was in a position to influence the network and security architecture of the company I worked for and, following the advice of an ISO 27001 auditor, I formalized the interactions between the different security zones.

The idea was to publish a manifesto so that everyone in the company would know the rules that govern the firewalls.

Here are some examples:

* The server network cannot receive connections from the Internet.
* The DMZ network can access the server network only through the HTTP/HTTPS protocols.
* The server and DMZ networks can access the Internet only on a specific list of addresses and protocols.

All the rules were designed to reduce the risk of compromise or lateral movement, but there were some fundamental errors.

The first error (mine) was that I conducted the evaluation myself, and at the time my experience was primarily in defensive security. A few years later, when I began working on offensive security as well, I realized that the approach was correct but the assumptions were incomplete.

The second error (company-wide) was failing to give this work the importance it deserved. It was seen as an obstacle created by a paranoid technician, rather than as a document meant to design secure applications within the company.

Specifically, the 3-tier paradigm was converted to Client (Internet) - Reverse Proxy (DMZ) - Server. A reverse proxy with no functionality other than forwarding connections from the Internet to the internal network has only one consequence: it exposes the internal network directly to the Internet. This should be obvious, but even today I find several configurations like this.

The last consequence was that, when I left that company, the manifesto was shelved and forgotten.

## A Technical Matter

The experience helped me over the years to offer an approach to the technical teams that need to organize firewall policies. Shifting the focus from the policy to the needs of the systems, before deciding where to place them, helps prevent problems instead of chasing them.

The formalization of the policies never worked because companies saw it as a technical issue, unrelated to the business.

In particular, the words a CEO said to me a few years ago were illuminating: cybersecurity is a technical problem, and thus it is entrusted to the CIO.

## The Purpose of the DMZ

Another factor that drove me to rethink the approach to defending companies is my frequent task of analyzing firewall policies to bring order and logic. Almost always, I find NAT rules that allow direct access from the Internet to internal systems. Often these are needs related to specific applications, [[Building an IoT testing lab|IoT]] systems, cameras or building automation in general.

In all these cases there is a DMZ, which makes me ask what the purpose of having a DMZ is if internal systems are still directly exposed.

What I discovered is that the DMZ is often created without a clear understanding of the concept behind it.

Originally, the DMZ network was meant to be the segment of the infrastructure most at risk: the policies that govern the traffic to and from the DMZ were meant to be particularly stringent. Some might call this the Zero Trust approach today.

Many years ago, the systems in the DMZ network did not have Internet access. If a system was compromised, it could not communicate outward.

Over the years, this paradigm has crumbled (like many others) because many application frameworks require external resources (XML schemas, telemetry, licenses).

The concept of "containment" in the DMZ has gradually eroded, and today a DMZ network risks becoming just another network. Quite frequently, I find:

* Databases residing in the DMZ.
* DMZ networks that can access the Internet indiscriminately.
* Internal systems that can access the DMZ indiscriminately.
* Unrestricted Internet access from the DMZ and the internal networks.
* Weak systems exposed on the Internet, residing in the DMZ or even in internal networks.
* Reverse proxies that map internal systems to the Internet without any security mechanism.

I could go on, but I believe the point is clear.

## Defense in Depth

The idea behind the *Defense in Depth* paradigm is to protect a system from cyberattacks with a multi-layered approach. In other words, we should not rely on a single protection (the firewall), but provide multiple layers that can act together if one or more protections fail.

To be clear, a defense layer could consist of:

* Firewall.
* VPN.
* Anti-malware.
* MFA.
* Monitoring.
* Vulnerability scanner.
* IDS/IPS.
* Physical security.

Defense in Depth is promoted by the [NSA](https://www.nsa.gov/portals/75/documents/what-we-do/cybersecurity/professional-resources/csi-nsas-top10-cybersecurity-mitigation-strategies.pdf), which advises associating each layer with one or more of the five cybersecurity functions defined in the [cybersecurity framework formalized by NIST](https://www.nist.gov/cyberframework).

I find the Defense in Depth approach absolutely correct but, in my opinion, it risks being too technical and thus disconnected from the business. In a way, it was the mistake I made: unable to speak to the business side, I could not secure the space I needed.

## Zero Trust Architecture

ZTA, unfortunately, is becoming a mantra. NIST defines ZTA in the document [SP 800-207](https://www.nist.gov/publications/zero-trust-architecture), which should be studied before discussing ZTA. I summarize some points that are useful for my reflections, quoting directly from the original document.

> That is, authorized and approved subjects (combination of user, application (or service), and device) can access the data to the exclusion of all other subjects (i.e., attackers). To take this one step further, the word "resource" can be substituted for "data" so that ZT and ZTA are about resource access (e.g., printers, compute resources, Internet of Things IoT actuators) and not just data access.

ZTA pertains to data access, where the data can reside on any system, including printers, IoT systems and, of course, servers, databases and so on. The subject is digital data in any form.

> Access to resources is determined by dynamic policy—including the observable state of client identity, application/service, and the requesting asset—and may include other behavioral and environmental attributes.

Data access is determined by dynamic policies built on who requests the data and who holds it. Policies may consider other environmental or behavioral attributes.

> Requesting asset state can include device characteristics such as software versions installed, network location, time/date of request, previously observed behavior, and installed credentials. Behavioral attributes include, but not limited to, automated subject analytics, device analytics, and measured deviations from observed usage patterns.

Today we build policies based on the identity of the source and the destination. The identity of the destination typically consists of an IP address and a port. The identity of the source is slightly more complex, because it considers not only the IP address but also the associated user. In more complex infrastructures, the source is also validated against specific requirements on patch status and the presence of anti-malware.

We rarely use attributes related to location and time. Even less frequently, we use behavioral attributes (e.g., whether the client behaves differently than expected).

The ZTA approach requires allowing access to data only when strictly necessary. To achieve this, we would need to:

* Identify the source in terms of device, user, application that requests the data, location of the client, time of the request, behavior of the source and compliance status.
* Identify the means by which the request arrives (Internet, VPN, private network, encryption, etc.).
* Identify the requested data and the requested operation.

Technologies that implement almost all (but not all) the features required by ZTA exist, but it is still not a paradigm that is widely implemented today.

The reason, in my opinion, is always the same: ZTA is seen as a technical approach, detached from the business.

## Assume Breach Design

Let's move on to the assume breach paradigm applied to design. The core idea is quite simple: my architectural choices are guided by the assessment of the risk of a potential breach. We could call it risk-based design, but in my opinion the term would be less effective.

There are two important premises:

* We must be able to assess thoroughly the possible attack paths against the infrastructure.
* We must be able to evaluate the impact of potential breaches on the business.

The first point requires specific offensive skills that differ from those of someone who designs and defends an infrastructure. Those who do not use these skills will make substantial mistakes in designing the defenses.

The second point requires the ability to conduct a Business Impact Analysis (BIA) for each attack scenario.

Only after these assessments can we determine which defenses to implement. In this sense, Defense in Depth and ZTA are consequences of Assume Breach Design, not its premises.

Let's return to the example of particularly large server networks that contain the backends and databases of all the company applications. The consequence of this design is that, if one is compromised, the attacker can move relatively easily to all the critical business systems. If we assess this scenario correctly, we realize that it is unacceptable. At this point, we can implement a microsegmentation technology and try to reduce the traffic flows between these hosts. We can also consider monitoring technologies that identify traffic anomalies. Both approaches have pros and cons, and there is no one-size-fits-all solution. The assessment of the business risk helps us determine the available budget and, consequently, select the solution that best fits our context.

I can, therefore, break down ZTA into parts and decide where it is important. The decision is based on a risk analysis of the attack scenarios: in other words, Assume Breach Design.

## Post Breach

All the infrastructures I know have grown gradually and without structure. In other words, there is never any documentation that describes how the infrastructure, in terms of servers and applications, was created. On the one hand, the task would be impossible with traditional tools. On the other, the assume breach paradigm forces us to think about how we would respond to an attack.

In almost all cases (and I am being optimistic), if we notice an ongoing attack in our infrastructure, we cannot say for sure how far it has spread. In other words, we do not know how to eradicate the attack from the infrastructure unless we rebuild it completely.

The Infrastructure as Code paradigm can help us build our infrastructure (or part of it) from text files. Microservices and containers allow us to do the same in the application domain. If we embrace this mindset, we realize that we can rebuild the entire infrastructure at any moment, and the build process can serve as documentation.

The advantages are immediate: documentation, standardization, compliance, and so on. The complexity of the tools, however, remains a barrier to adoption for many organizations. The rigidity of the infrastructure is an apparent problem that reveals the underlying operational chaos.

## Conclusions

The Assume Breach Design approach aims to bring the business back to the center of decision-making. The infrastructure exists to serve one purpose: the business of the company. The protections that the technical teams decide on today are implemented to safeguard that business.

Putting the business back at the center means shifting cybersecurity from a technical matter to a business necessity.

For too many years, I have seen IT departments treated as a black hole that absorbs budget. The effects of this mindset are clear to everyone. Maybe it is time for a change.
