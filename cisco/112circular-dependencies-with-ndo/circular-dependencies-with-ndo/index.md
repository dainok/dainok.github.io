---
cover: cisco
date: 2025-10-01
tags:
- cisco
- intermediate
- ndo
---
We have already highlighted how critical the design phase is in any automation project. This is even more true with NDO, because a design mistake can easily compromise the entire project.

When we design templates, we must plan the deployment order carefully, so that no circular dependency is created. NDO checks the dependencies at the **template level**, not at the level of the individual objects inside the templates. Let's look at an example:

![[ndo-circular-dependencies.png]]

In this example (courtesy of [Mario Rosi](https://www.linkedin.com/in/mariorosi71/)), we have a single schema that contains six templates. Each template includes the objects listed below:

* The first two templates are site-specific and contain objects that are meaningful only within their site. These objects do not need to communicate with objects in other sites.
* The third template is shared across all the sites and includes objects that must communicate with those in other sites.
* The remaining templates contain reusable objects that are also shared across all the sites.
* The arrows in the diagram represent dependencies: they start from the dependent object and point to the object it relies on. For example, a Bridge Domain requires a VRF to be created first.

In this case, the deployment order of the templates is:

1. **Template #6:** Contracts and Filters.
1. **Template #4:** VRFs.
1. **Templates #1, #2, #3:** objects specific to each site or shared across all the sites (no dependencies between them).
1. **Template #5:** External EPGs.

A circular dependency occurs when an object in one template depends on an object in another template, and the reverse is also true. For instance, if we put both External EPGs and VRFs in the same template, that template would have to be deployed both before and after others, because:

* External EPGs depend on L3Outs.
* Bridge Domains depend on VRFs.

## Key Factors for Approaching Automation

From an automation perspective, there are several important consequences:

* NDO has limitations, and using [NaC (Network as Code)](https://netascode.cisco.com) on NDO adds more. We must always validate how our specific use case is handled.
* Some objects are configured through NDO while others are managed directly on the APIC, so it is essential to validate the final outcome.
* With Cisco [[Managing a brownfield Cisco ACI fabric with NaC and Terraform|NaC]], [the deployment sequence of the templates should not exceed three steps](https://netascode.cisco.com/docs/data_models/ndo/schema/template/).

In the example above, we need to reduce the deployment sequence from four steps to three. The template with Contracts and Filters and the template with VRFs are independent from each other, so they can either be merged or deployed simultaneously.

From the customer's perspective, there is often an additional requirement: stretching networks across multiple sites **without service disruption**. We must factor this expectation into both the design and the automation workflow.
