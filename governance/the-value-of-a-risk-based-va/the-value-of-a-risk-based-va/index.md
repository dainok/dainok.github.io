---
cover: governance
date: 2022-05-18
tags:
- advanced
- governance
- risk-assessment
- vulnerability-management
---
In this article, I explain why we run a VA, why the traditional approach is dangerous and how we should manage the risk bound to vulnerabilities.

I also discuss a few false myths about VA.

I hope this article helps you approach the vulnerability management process in a way that reduces the unmanaged risk bound to vulnerabilities.

## The Purpose of a VA

Almost every company should request a yearly VA. In practice, they often request a `VAPT` (whatever that means). When I try to understand the reason behind this legitimate request, I realize it is not so clear: we do a `VAPT` every year because everybody does.

So let's start from the beginning. A Vulnerability Assessment (VA) is a measure. Specifically, a VA counts the known vulnerabilities present in systems and applications. VA scanners are **signature-based**: if they find application X, they **estimate** vulnerability Y.

Yes, VA scanners estimate vulnerabilities: they do not verify them. Most modern VA scanners include DAST (Dynamic Application Security Testing): they try to break web applications and report estimated web vulnerabilities.

Finally, VA scanners exclude custom applications and often exclude popular web frameworks (WordPress, Drupal...) too. The reason is simple: VA scanners rarely include signatures for a specific web application framework. Other specialized scanners exist: WordPress users, for example, should use specific scanners such as [WPScan](https://wpscan.com "WPScan WordPress Security Scanner").

The outcome of a VA is a list of detected vulnerabilities:

* An estimated risk value is usually included for each vulnerability (VAs are not context-aware).
* Custom systems and applications are not evaluated (VA scanners do not include specific signatures).
* Risk mitigations are not evaluated (VAs are not context-aware).

## Legacy Approach

In a legacy VA approach, the outcome is the input of a patch management process: we know what is vulnerable, and we need to patch.

This approach has some issues:

* **Blind patching:** patching everything is not sustainable. In practice, IT teams start patching from the easiest systems with a best-effort approach. The result is that critical, mission-critical systems (SAP, Oracle, CRM...) are rarely patched.
* **Context-less:** VA outcomes do not consider the security controls in place. Systems and applications in a high-security zone are patched with the same urgency as exposed services, just because they are affected by the same critical vulnerability.
* **Time-to-patch:** with a yearly VA, in the worst case, a critical patch could be considered 1 year after its release.

## Risk-Based VA

In a risk-based approach, we add the context. The outcome of a VA must be enriched with:

* **Inherent risk:** the risk bound to each specific vulnerability, excluding the mitigations in place.
* **Mitigation factor:** how much the security controls in place (firewalls, IPSs, WAFs...) mitigate the risk.
* **Residual risk:** the risk bound to each specific vulnerability, considering all the mitigation factors.

We can calculate the inherent risk as `impact x likelihood`.

All values depend on the application, but we can simplify and assume that:

* Impact depends on the vulnerable networks, because once a network is compromised, all the systems it includes can be compromised too.
* Likelihood depends on the vulnerability (available exploits, difficulty of exploitation...).
* The mitigation factor depends on the security zone, because we can assume that security controls are deployed equally to secure a specific set of networks.
* Residual risk is `inherent risk x mitigation factor`.

We need to define another value, the risk appetite: the risk value that the organization is willing to accept.

With a risk-based approach, the VA report is enriched (as discussed above) and ordered by residual risk:

1. Vulnerabilities with a residual risk lower than or equal to the risk appetite are discarded.
2. Vulnerabilities with a medium risk must be managed within, for example, 10 working days.
3. Vulnerabilities with a critical risk must be managed within, for example, 3 working days.

A risk-based approach is deterministic and does not leave the risk unmanaged.

## False Myth: Provider Rotation

The first false myth I want to discuss is provider rotation. Many organizations I know change the provider (the company that executes the VA) every year, because they believe a different partner will detect different vulnerabilities. This is wrong, because:

* VA providers use commercial software from Tenable, Rapid7 and others. I am not saying they are all equal, I am saying that changing the partner does not mean the tool is different.
* Even if I change the VA scanner every year, it is unacceptable to discover vulnerabilities one year later just because I changed the tool (unmanaged risk).
* Changing the tool means a different VA report format: to evaluate the process, I need to correlate KPIs between different tools, which is not easy.

## False Myth: VAPT

Organizations focus on VAPT only, often meaning a legacy VA. As discussed before, VA scanners are not designed to detect all the vulnerabilities that can affect organizations. VA scanners are a precious way to scan a large infrastructure quickly, within an acceptable time, but they are not designed to go deep.

DAST can help, but it is still bound to a specific context.

PT should be considered after the previous steps (VA and DAST) to evaluate critical custom services (HR portals, CRM...).

Organizations that limit themselves to VA do not manage the risk bound to custom applications.

## False Myth: VA as a Patch Management Tool

As mentioned, with a yearly VA we can have unmanaged vulnerabilities for one year (in the worst case). We can reduce the interval, but unless we execute a complete VA every week, we need a different approach.

A working vulnerability management process requires discovering, prioritizing and remediating vulnerabilities.

We can use a VA in the discovery phase, but the right input comes from vendor security feeds (Microsoft, Cisco, Red Hat...). We should:

* Obtain new vulnerabilities on a daily basis.
* Evaluate the associated risk.
* Define how to mitigate it (patching, additional security controls...).

With this approach, VAs are used to verify the vulnerability management process, not to start it. Of course, this approach depends on other processes such as asset management, software management and change management.

## DIY and Automate

I am an automation addict, and I automate every boring process I can. In my view, large organizations should be able to execute VAs by themselves, and automate them from the scan phase to the report phase, including most of the risk assessment considerations.

Let's try to design the process:

* The asset and software inventories contain what is running within the organization. The inventories also contain the impact score (the business value of the asset).
* We can estimate a mitigation factor for each security zone, calculated by taking into account the security controls in place (firewalls, IPSs, WAFs...). This is not accurate, but it can work initially.
* Based on the asset and software inventories, we can get the relevant vulnerabilities from vendor feeds.
* Based on the estimated risk score (usually provided by vendors), we can calculate the inherent risk and report the medium and critical vulnerabilities.
* An analyst analyzes the report and defines the next steps.

![[vulnerability-management.png]]

## Conclusions

We learned how to move from the legacy `VAPT` approach to a risk-based vulnerability management process. It is not easy, but the legacy approach leaves the risk unmanaged. VA scanners are valuable tools if used in the right way. They are dangerous if we use them as the single input of the vulnerability management process.
