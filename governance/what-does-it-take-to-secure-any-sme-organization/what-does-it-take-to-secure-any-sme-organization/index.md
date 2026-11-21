---
cover: governance
date: 2022-05-25
tags:
- governance
- intermediate
---
Managing cybersecurity is expensive, we all know that. Not managing it is even more expensive. In my experience, an SME recovers from a critical cyberattack in 5-10 days, if it can recover at all (I know companies that lost everything because of a cyberattack).

So how can an SME adopt a minimal but effective cybersecurity strategy?

To plan a strategy, we need to understand common cyberattacks and threat actors.

## SMEs, Threat Actors and Cyberattacks

First, let's describe an SME:

* Privately owned (I often find a single owner).
* Manufacturing sector.
* A maximum of 150 employees, most of them working in production.
* A maximum of $50 million in annual receipts.
* A very small or outsourced IT department.
* A low IT budget.
* Low cybersecurity awareness: management often does not want to be bothered with security topics.
* Increasing security compliance requirements.

SMEs need to protect:

* Production.
* CRM.
* Intellectual property.

Threat actors targeting SMEs probably want to:

* Compromise the company and ask for a ransom (usually).
* Steal intellectual property (seldom).
* Sabotage the company (rarely).

Based on the above, the most frequent cyberattack is ransomware.

## Lifecycle of a Ransomware Attack

The New Zealand CERT describes the [lifecycle of a ransomware attack](https://www.cert.govt.nz/it-specialists/guides/how-ransomware-happens-and-how-to-stop-it/initial-access/ "Lifecycle of a ransomware attack").

![[cert-individual-lifecycle-elements.png]]

In short, there are 4 ways for an attacker to get inside an organization:

* Phishing.
* Password guessing.
* Vulnerability exploitation.
* Email.

Three out of four are people-based attacks. Using social engineering techniques, attackers try to:

* Steal valid credentials by persuading people to enter them in malicious web portals.
* Guess passwords using public data breaches, assuming people reuse passwords.
* Persuade people to download and execute malware to take control of computers inside the organization.

## Designing an Effective Cybersecurity Strategy

Based on the most probable attack, we can design a cybersecurity strategy that reduces the risk. We must always remember that we are talking about SMEs, so the budget is limited.

We can mitigate the risk of an attacker getting inside the organization as follows:

* Technical measures:
  * **Multi-Factor Authentication:** MFA for email access and remote access VPNs (mitigates phishing and password guessing).
  * **Antispam:** filter out malicious emails (mitigates phishing and email).
  * **Logging:** detect invalid login attempts (mitigates password guessing).
  * **Security Assessment:** detect vulnerabilities via VA, DAST and PT (mitigates vulnerability exploitation).
  * **Patching:** keep applications up to date. Because the IT department is very small, patching must happen automatically (mitigates vulnerability exploitation).
  * **Endpoint Detection and Response:** a good EDR to stop malware (mitigates email).
  * **Segregation:** well-configured network and host-based firewalls that drop malicious incoming and outgoing connections (mitigate the last attack phases).
  * **Data Protection:** in the worst-case scenario, we must be able to get our data back (mitigates the last attack phase).
* Organizational measures:
  * **Policies and Procedures:** enforce password security (mitigates password guessing).
  * **Training:** test how good employees are at detecting social engineering attacks (mitigates phishing and email).

## Conclusions

I think this is the minimal set of technical and organizational measures that any organization should implement to reduce the risk of cyberattacks. Even very small organizations should evaluate the security controls described above.
