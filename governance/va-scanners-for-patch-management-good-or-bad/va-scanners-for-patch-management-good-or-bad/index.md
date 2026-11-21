---
cover: governance
date: 2022-03-29
tags:
- advanced
- governance
- risk-assessment
- vulnerability-management
title: "VA scanners for patch management: good or bad?"
---
Nowadays (hopefully) all companies run regular vulnerability assessments. They often use different partners or tools each year, and they often limit themselves to vulnerability assessments.

A VA is not the end of a security strategy, it is just a small step at the beginning. And changing providers every year is not as useful as you think: in my opinion, there are more cons than pros.

A VA does what its name says: a vulnerability assessment. VA scanners just find and count network vulnerabilities. Once you have a VA report, you are doing vulnerability management, not patch management or application life cycle management: those are different, concatenated processes.

Let me say it again:

> VA scanners are used in vulnerability management, not patch management.

And:

> VA scanners are used in vulnerability management, not in application life cycle management.

We mentioned three different processes:

* **Patch management:** updating software to the currently supported versions.
* **Application life cycle management:** disposing of or migrating legacy end-of-life applications.
* **Vulnerability management:** reducing the risk of known vulnerabilities.

## Patch Management

Patch management is the process of distributing and applying software updates. Patches correct errors (bugs), and sometimes bugs lead to security issues (vulnerabilities). In this post, we focus on vulnerabilities: the bugs that can affect confidentiality, integrity and/or availability (CIA). The GDPR uses the same attributes (Art. 32.1.b):

> the ability to ensure the ongoing confidentiality, integrity, availability, and resilience of processing systems and services;

The patch management process should describe:

* How to be notified of a new software update.
* How to evaluate the risk of installing or not installing the software update.
* The SLA associated with the risk from the previous step.
* How to request the installation of the software update.

Examples:

1. [CVE-2019-0708 (BlueKeep)](https://msrc.microsoft.com/update-guide/vulnerability/CVE-2019-0708 "Remote Desktop Services Remote Code Execution Vulnerability"): a remote code execution vulnerability with a CVSSv3 score of 9.8 in Microsoft Windows RDP.
2. [CVE-2020-2021](https://security.paloaltonetworks.com/CVE-2020-2021 "CVE-2020-2021 PAN-OS: Authentication Bypass in SAML Authentication"): an authentication bypass vulnerability with a CVSSv3 score of 10 in Palo Alto Networks GlobalProtect.

The first vulnerability affects Microsoft Windows systems with RDP enabled, the second one affects Palo Alto Networks GlobalProtect with SAML authentication enabled.

What is the associated risk?

Of course, it depends. It depends on the vulnerable assets: where they are (network location), how they are protected (security measures), the "value" they have for the organization... This information is stored in the asset inventory and governed by the asset management process.

Examples:

1. We have a vulnerable, exposed Palo Alto Networks firewall with GlobalProtect. The impact is high, the likelihood is high (a public exploit is available) and there is no mitigation: the risk is severe.
2. We have several vulnerable Microsoft Windows systems in the industrial network. The network is restricted and protected by a firewall with an IPS feature. We cannot upgrade those endpoints, the impact is high and the likelihood is high (a public exploit is available): the risk is maximum, but the firewall mitigates it by 80% (the risk is low).

Most organizations implement time-based patch management. In other words, they declare that they patch everything every 6 months. In many cases, this is wrong because:

* Every organization has something that cannot be patched or disposed of.
* There is always some urgency that delays the update process.

Moreover, in the example above, there is no patch for the Palo Alto Networks vulnerability, so the patch management process cannot mitigate it.

Acting this way leads to unmanaged risk (see the conclusions).

## Application Life Cycle Management

Application Life Cycle Management (ALM) covers several aspects of an application, from its initial planning through its retirement. In this post, we focus on the update and retirement phases.

To simplify, applications and their components must be updated. When (not if) components become obsolete, we must update the application to support newer or different components. In the real world, when components are retired, nobody updates the application anymore: after years, nobody knows how to change the code.

Finally, at the end of their life, applications must be retired. In the real world, applications are retired when nobody uses them anymore, and that can take years.

## Vulnerability Management

Vulnerability management is the process of evaluating the risk of known vulnerabilities and deciding how to mitigate them. Security assessments (including vulnerability assessments, penetration tests, attack simulations...) are the tools used to discover unknown vulnerabilities. Another important input of the vulnerability management process is the security feeds.

The output of any security assessment is a list of prioritized actions required to manage the risks of the discovered vulnerabilities.

Many companies use the VA as the basis of patch management: once the VA has detected the vulnerabilities, they are analyzed, evaluated and patched.

This is a pretty common approach in enterprises, and it is the fastest way to understand what is in place and plan the remediation. If you use the VA in the patch management process, however, consider that:

* You discover vulnerabilities only after the VA.
* In the worst-case scenario, you are vulnerable from the day after the previous VA until the next one (unmanaged risk).

Without a vulnerability management process, organizations that run the VA yearly can have unmanaged risk for 12 months (see the conclusions).

## VA Scanner Limits

Please be aware that:

* Network vulnerabilities are just a minor part: we should also look for local vulnerabilities. Attackers use local vulnerabilities for privilege escalation after they gain local access, maybe through malware or a custom vulnerable application (e.g., [Log4j](https://logging.apache.org/log4j/2.x/security.html "Apache Log4j Security Vulnerabilities")).
* VA scanners look for known, signature-based vulnerabilities. Sometimes they try to analyze web applications (DAST), but they never recognize uncommon or custom applications. For example, VA scanners do not detect all the vulnerabilities in WordPress, Joomla and similar applications. We need specialized scanners (e.g., [wpscan](https://wpscan.com/ "Enterprise-strength WordPress protection for everyone")).

![[vulnerability-risk.png]]

## Conclusions

VA scanners are great tools to find out quickly what is running within the organization and the associated vulnerabilities. Even if we run the VA every month, a critical vulnerability can put the organization at risk for one month (worst case). Sometimes this is acceptable, sometimes not. If we cannot define it clearly, we are not managing the risk properly.

![[vulnerabilities-risk.png]]

VA scanners are still a fundamental tool for organizations, and they are the fast path to assess unknown environments. After a while, however, organizations should introduce vulnerability management together with patch management: monitoring security feeds reduces the risk of newly released vulnerabilities in days, not months.

For severe vulnerabilities, we can assume that patches must be installed within 24 hours. In the example above, the change request for the Palo Alto Networks patch has high priority. We can skip the Microsoft Windows patch because the risk is lower than the risk appetite (and also because updating an HMI is a mess).

If everything is going fine, VA scanners do not find severe vulnerabilities. In practice, if the processes above are in place, the vulnerability assessment verifies that the critical patches are installed and the obsolete applications are retired.

Moreover, if you change the VA provider every year, ask yourself whether it makes sense, considering that:

* Most partners use VA scanners from two or three vendors.
* It is not easy to compare KPIs automatically between different software.
* The value is not in the automatic VA report, but after it (risk analysis, remediation plan).

And finally, if you run the n-th yearly VA and nothing more, you are not managing cyber risk at all. You are just following some odd guidelines. Sad but true.
