---
cover: ad
date: 2024-11-27
tags:
- ansible
- beginner
- fundamentals
---
Before launching any automation project, even before opening our editor, we need to define the essential steps that make it succeed. It is equally important to understand the most common reasons why automation projects fail.

There is often a large gap between expectations and reality in the field, and this gap led me to build a practical approach from my own experience.

In an ideal world, the devices we work with are modern, standardized and compatible with each other, which makes tools, frameworks and orchestrators the perfect fit for rapid operational improvements. In reality, we often find a mix of newer devices and devices that reached end-of-support years ago, each with its own configuration that demands a precise and nuanced approach.

Formal training cannot fully prepare us for these scenarios, because their specific nature defies standardization in traditional courses. Ignoring them is no longer an option, though: the shortage of qualified personnel has made traditional infrastructure management unsustainable. Targeted training projects can improve operations greatly in a short time, and automation is the key to bringing the infrastructure back under control gradually.

## Key Factors for Project Success

Certain factors contribute significantly to the success of an automation project:

* **Understand the scenario:** process automation or task automation.
* **Engage decision-makers:** operational improvements require the involvement of the key stakeholders. Without their engagement and support, lasting improvements are nearly impossible.
* **Standardize processes and define use cases:** automation requires a clear process. We must be able to define and standardize each step we plan to automate.
* **Modeling:** part of the design phase, this step is crucial and often underappreciated. We must map and visualize each process, because this groundwork shapes the entire project.
* **Configuration approach:** the choice between a golden configuration and a differential approach has a deep impact on the project, and it is often a long-term commitment.
* **[[Ansible inventory|Inventory]]:** the inventory is not just a device list, but a structured set of input data for specific configurations.
* **Maintain an up-to-date lab:** each automation project should include a test environment for continuous development and validation.
* **Prepare for large-scale outages:** at scale, unmanaged errors can have significant repercussions. Accounting for potential issues is crucial.
* **Document thoroughly:** proper documentation keeps the automated processes maintainable.
* **Write reusable code:** reusable code lets us broaden the scope of the project over time.
* **Standardize the development environment:** standardized, certified environments ensure a reliable automation platform.

These factors are listed by importance and follow their typical order of occurrence in a project.

## Single Task Automation

I call single task automation an activity that arises from a purely personal need: automating a series of one's own activities (tasks). In most cases, automation in a company starts like this. There are repetitive tasks and, if the person who performs them is creative enough, they write a small piece of software to automate them. Its characteristics are:

* One-shot.
* Based on procedural scripts, written to solve a task and generally not reusable.
* Aimed at personal use.
* It does not involve the team and remains confined to the individual.
* Not included in any procedure.
* Closely tied to the person who developed it.

In short:

* It is easy to implement (pro).
* It does not scale, causes a proliferation of scripts and is limited to specific tasks (con).

What characterizes this type of automation the most is its short lifecycle. It is born from the need of an individual and almost never becomes a process, so when the author changes role or company, the automation ceases.

Despite the very high number of hours saved, 80% of my automation projects died as soon as I changed role or company.

## Process Automation

I call process automation the automation, possibly arising from single task automation, that is accepted at the company level and therefore becomes the way to perform one or more specific tasks. The scripts are documented, maintained and used by a team of people. Moreover, they are the only authorized way to perform the associated tasks. Its characteristics are:

* The automation is based on frameworks approved by the company and monitored for vulnerabilities.
* People cannot act except through the approved scripts, which can be a problem in an emergency.
* Compared to total freedom, the scripts offer little or no freedom of movement, which can also be a problem in an emergency.
* Changes to the scripts are allowed only with prior authorization and testing.
* The automation is approved by the company and defined as a standard.

In short:

* The process is defined, standardized, less subject to human error and, especially with some frameworks, self-documented (pro).
* Development is generally slower, because of the number of people involved in defining the process, standardizing it and developing it. In the long run, automation also erodes expertise: people get used to running scripts and lose sight of what lies underneath (con).

## Engaging Decision-Makers

In my experience, the push for operational improvements often comes from individual contributors. Automation projects fail, however, unless the process owners are involved from the beginning. Effective operations often involve multiple teams, and changing established workflows requires organizational buy-in. Once the automation is in place, those who resist the transition will need the guidance and support of decision-makers to adapt.

## Design First and Foremost

A "learning by doing" approach, where we start scripting while we explore the capabilities of a framework, can lead to working solutions but often falls short of reusability and optimization. At some point, we face two options: we scrap everything and rebuild with the knowledge we gained, or we continue with the current approach and accept technical debt, a concept well covered by [Gene Kim's books](https://www.amazon.it/gp/product/B091PYCCBQ?ref_=dbs_p_mng_rwt_ser_shvlr&storeType=ebooks). If left unchecked, that debt grows into a larger problem over time.

"Learning by doing" is invaluable, but more complex projects also need a structured approach. A thoughtful design lets us face automation challenges without bias. Asking the right questions leads to reusable, maintainable solutions:

* Who will use this automation? People, programs?
* How will they access it? Through the CLI, orchestrators, APIs?
* What parameters will they need?
* When will it be used? Daily, in emergencies, at high frequency?
* Why is it needed? For provisioning, troubleshooting, compliance?

## Standardize Processes and Define Use Cases

Building automation requires transforming manual processes into automatic ones. Before coding, we must analyze the current process thoroughly, but, like modeling, this phase is often overlooked. In practice, I often end up piecing together the operational processes from the client's habits. Without predefined, standardized procedures, automation risks turning into an endless list of [new features](https://www.sac.edu/AcademicProgs/Business/ComputerScience/Pages/Hester_James/HACKER.htm).

## Modeling

Modeling defines the infrastructure (the target of the automation) as a data structure, much like defining a database schema in application development. The choices made here should be as general as possible, while accommodating the tools we plan to use. Consider an example: an ACL that restricts access to devices:

```text
10.0.7.0/24
10.15.0/24
172.15.0/24
```

In our scenario, the ACLs manage the primary, secondary and decommissioned sites, and each ACL is "permit" only, with an implicit deny at the end. This ACL structure, however, does not work directly with the Ansible `cisco.ios.ios_acls` module, which requires specific network and wildcard inputs. We can either:

* Simplify our data model to match the requirements of the Ansible module, which makes it less readable and limits its flexibility.
* Use advanced techniques to bridge the data model and the framework of choice, such as Jinja [[Ansible parsers and filters|filters]] in Ansible.

## Configuration Approach

The choice between a golden configuration and an incremental approach depends not only on the capabilities of the devices, but also on the operational workflow. The choice is pivotal: once made, changing it often requires extensive redevelopment.

A golden configuration gives total control over the configuration but is complex, while the incremental approach is more adaptable but cannot track all the unauthorized changes.

## Inventory

In Ansible, an inventory is more than a device list: it includes all the parameters required to configure each device. A well-designed inventory depends on several factors, such as the device list, the input variables and the configuration approach.

## Up-to-Date Lab

Automation projects require a continuous test environment. Each update must be validated in a lab before it goes live in production.

## Prepare for Large-Scale Outages

Automation is essential to manage infrastructure at scale, but any error can affect multiple devices. A robust testing framework reduces this risk without eliminating it, so we should establish procedures for large-scale recovery.

## Development Environment

The development environment should be standardized, fully documented and reproducible. For Ansible projects, I recommend defining the Python dependencies in a `requirements.txt` file and the Ansible [[Ansible Galaxy|collections]] in a `requirements.yml` file, which gives us an isolated Python environment dedicated to Ansible.

Tracking the changes of the environment is essential. I prefer [[Git fundamentals for developers and IT professionals|Git]] for this, together with tools like:

* `.gitignore` to keep the environment clean.
* Linters to ensure consistent code syntax.
* Pipelines to validate every change.
