---
cover: paloalto-strata
date: 2025-08-31
tags:
- beginner
- palo-alto-networks
- scm
---
The management of Palo Alto Networks firewalls is gradually shifting from traditional on-premises administration, either directly or via [Panorama](https://www.paloaltonetworks.com/network-security/panorama), to a cloud-based model. The product that enables centralized, cloud-based management of Palo Alto Networks firewall infrastructures is [Strata Cloud Manager (SCM)](https://www.paloaltonetworks.it/network-security/strata-cloud-manager).

This management paradigm introduces several fundamental changes:

* **Data format:** Panorama is XML-based, while SCM uses JSON.
* **Configuration model:** Panorama relies on Device Groups, Templates and Template Stacks. SCM uses *configuration scopes*, where *snippets* are reusable scopes that we can apply to folders or devices.
* **Variables:** variables exist in Panorama but with a limited scope. SCM extends them and allows their use even within security policies.

The approach to structuring complex infrastructures changes significantly. Our focus here is **not** the design of the architecture, but the creation of automation that makes migrations and ongoing operations more efficient.

We do not cover how to work manually within SCM. We explore how to interact with SCM through its API.

## CLI

There is no official CLI for SCM. [Calvin Remsburg](https://www.linkedin.com/in/calvinremsburg/), however, developed a personal [CLI module](https://github.com/cdot65/pan-scm-cli) and an accompanying [SDK](https://github.com/cdot65/pan-scm-sdk) that enable command-line management.

The project is worth reviewing, but several caveats apply:

* It is a personal project, not an official tool.
* It does not cover all the operational scenarios.
* It can be complex to use.
* It was developed with [Claude](https://claude.ai/) by [Anthropic](https://www.anthropic.com/).

In my view, SCM-CLI can help to automate some tasks. I prefer, however, to use official tools or build my own, so that I can maintain them freely. The reason is simple: when we work with APIs or SDKs, bugs are common, and we need either vendor support or full control to implement workarounds.

## Ansible

[Calvin Remsburg](https://www.linkedin.com/in/calvinremsburg/) also developed an [Ansible module](https://github.com/cdot65/pan-scm-ansible), built on [pan-scm-sdk](https://github.com/cdot65/pan-scm-sdk). The same considerations as for the CLI apply here.

## Terraform

Palo Alto Networks released an [official Terraform provider](https://registry.terraform.io/providers/PaloAltoNetworks/scm/latest), but it comes with no guarantees: the software is provided *as is*. The current version (0.11.0) indicates that the provider is still considered unstable.

The associated [GitHub repository](https://github.com/PaloAltoNetworks/terraform-provider-scm/tree/main) shows active development, but many features are still missing.

## Documentation

Before writing any code, we need to understand the ecosystem and its complexity.

SCM is a web-based application that builds its interface through multiple API calls:

![[scm-interface-list-example.png]]

Inspecting the application with the browser developer tools shows that the web interface does not always use the same APIs exposed to developers. For instance, the network activity of the interface shows no calls to `/config/network/v1/ethernet-interfaces`.

![[api-request-analysis.png]]

In some cases, such as the view of the interface details, we can identify the specific API calls that populate the page. As we will see, however, the web UI uses a different backend API system, which makes it largely irrelevant for automation.

![[scm-interface-detail-example.png]]

When we automate SCM, we must therefore rely entirely on the official API documentation. From experience, this increases complexity and development time significantly because:

* The documentation is never fully complete.
* The documentation is rarely up to date.
* Examples for specific use cases are often missing.
* We need iterative testing to develop reliable automations.

## Recommended Approach

Ideally, web applications follow an **API-first** design, where the UI consumes the same APIs available to developers. This ensures consistency and reduces the complexity of automation.

With SCM, a hybrid approach is often necessary:

* Rely on the official documentation despite its limitations.
* Use the web UI and the APIs in parallel, to understand the exact impact of each operation and the structure of the objects involved.
