---
cover: ansible
date: 2024-08-01
tags:
- ansible
- beginner
---
Ansible is often described as an agentless automation framework. However, it relies on Python, which must be installed, together with certain modules, on the managed hosts. In this sense, Python acts as the necessary "agent" on the remote system.

Originally designed to automate Linux hosts, Ansible has expanded to support various systems, including Windows, network devices and security appliances.

In this series, we focus on automating network devices. In this case, Ansible really is agentless.

## Declarative vs. Procedural

There are two main approaches to automation: declarative and procedural.

* **Declarative approach:** You define the desired state of a system. The automation system works out the steps needed to move from the current state to the desired one. [Terraform](https://www.terraform.io/) is a popular example of this approach.
* **Procedural approach:** You specify the exact steps the automation system must take to reach the desired state. This method is generally more intuitive, because it follows the way humans break a task into smaller sub-tasks. Troubleshooting is also simpler, because there is no underlying "magic." Ansible is a prime example of this approach.

Ansible is often considered a hybrid system, because some modules let you declare a desired state, which Ansible then translates into multiple sub-tasks. For instance, the [community.vmware.vmware_guest](https://docs.ansible.com/ansible/latest/collections/community/vmware/vmware_guest_module.html#ansible-collections-community-vmware-vmware-guest-module) module can create a virtual machine in a single task (declarative), but the VM depends on a vSwitch that must already exist (procedural).

A third concept is immutability: instances cannot be modified, and any change requires redefining the instance from scratch. It is common in container management and can be applied to network automation through golden configurations.

## Pros and Cons of Ansible

Knowing the strengths and weaknesses of Ansible helps you decide whether it is the right framework for your project.

**Pros:**

* **No Programming Skills Required:** Playbooks are written in YAML, which is human-readable and requires no complex programming knowledge. This lowers the entry barrier: network engineers and administrators can automate tasks without learning a programming language.
* **Idempotency:** Running a playbook multiple times leads to the same state on the managed hosts. This reduces the risk of errors and ensures consistency across deployments, which makes Ansible reliable in continuous integration and delivery pipelines.
* **Procedural Approach:** Playbooks follow a step-by-step approach, which matches the way people naturally think about task execution. This makes them easier to write, understand and debug, and keeps the automation workflow clear and organized.
* **Integrated Documentation:** Tasks can include names and comments, which serve as in-line documentation: the purpose of each task is clear without separate documentation files.
* **Compliance Checks:** Playbooks can verify whether network devices or systems comply with predefined configurations, ensuring that they adhere to company policies and standards. This improves security and governance.
* **Standardization:** Playbooks provide a standard way to execute tasks and manage configurations. This promotes consistency across environments and reduces the variability and errors of manual processes.
* **Reusable Code:** Roles and [[Ansible Galaxy|collections]] can be reused across multiple playbooks. This encourages modular design, reduces duplicated code and saves time when maintaining the automation.
* **Sensitive Data Protection:** [[Password Management with Ansible|Ansible Vault]] encrypts sensitive data such as passwords and API keys, so that they are not exposed in plain text in playbooks.
* **Troubleshooting:** Individual steps can be isolated and run on their own to find and fix errors, so you can focus on the tasks that cause the problem.
* **Multiple Connection Methods:** Ansible can connect to managed nodes via SSH, local connections, WinRM and network connections. This flexibility lets it manage a wide range of devices and platforms in diverse environments.
* **User Interfaces:** Tools such as [[Orchestrating playbooks with Ansible AWX|AWX]] and the automation controller (formerly Ansible Tower) provide graphical interfaces that simplify the execution and monitoring of playbooks, making large-scale automation easier to manage.

**Cons:**

* **Performance:** Ansible can be slower than other automation tools, especially in large environments. Optimizing playbooks for speed requires specific strategies.
* **Complexity in Statements:** Complex logic, such as conditionals (if-then-else) and loops, is not intuitive to write in a playbook. It makes playbooks harder to read and maintain, and it requires a deeper understanding of the syntax and capabilities of Ansible.
* **Troubleshooting:** Debugging playbooks can be complex and time-consuming. Errors can be hard to trace, especially in large playbooks or complex workflows, and effective troubleshooting requires experience with Ansible.
* **Limited [[Enhancing Ansible output|Callback Plugins]]:** The options for customizing output and logging via callback plugins are limited. Ansible tends to operate as a stand-alone system, which makes it harder to integrate with some external monitoring and logging tools.
* **Breaking Changes:** Major Ansible versions can introduce changes that break existing playbooks. Playbooks must be updated and tested continuously to ensure compatibility, which adds maintenance overhead.
* **Module Limitations:** Ansible supports a wide range of platforms, but not equally well. Some platforms lack comprehensive module support, which requires custom modules or workarounds.

With these pros and cons in mind, you can decide whether Ansible is the right tool for your projects.

## Ansible Components

These are the core components of Ansible:

* **Data Format:** YAML. YAML (YAML Ain't Markup Language) is a human-readable data serialization format used by Ansible to define playbooks and variable files. Its readability makes playbooks easy to write and understand without extensive programming knowledge, and its simple structure reduces the likelihood of syntax errors.
* **Templating:** Jinja. Jinja is a templating engine for Python, which Ansible uses to render dynamic content in playbooks. With Jinja, you can use variables, control structures (such as loops and conditionals) and [[Ansible parsers and filters|filters]] to generate configuration files or scripts dynamically, based on the needs of each host.
* **Parsers:** [[Parsing text with TextFSM|TextFSM]], [[Contributing to NTC Templates with Git and GitHub|NTC Templates]], pyATS and TTP. Parsers are tools that Ansible uses to convert raw text into structured data.
* **Plugins:** Python. Plugins extend the core functionality of Ansible: they are small pieces of Python code that add new capabilities.

Several interfaces can simplify playbook execution, such as:

* **Ansible Navigator:** A command-line tool that improves the experience of running and troubleshooting playbooks.
* **Automation controller (formerly Ansible Tower):** A web-based interface with enterprise features such as role-based access control, job scheduling and logging.
* **Red Hat Ansible Automation Platform:** A complete enterprise framework for automating across IT operations, including security, network and infrastructure.
* **AWX:** The open-source upstream project of the automation controller (formerly Ansible Tower), with a web-based interface and an API to manage playbooks.
* **[[Ansible reporting with ARA|ARA]] Records Ansible:** A tool that records Ansible playbook runs and provides reporting and analysis.
* **eNMS:** An open-source network management system that integrates with Ansible to provide automation and orchestration capabilities.

## Learning Approach

We follow a learn-by-doing approach: we start with simple cases and expand them gradually. Documenting your work and keeping your set of recipes up to date will be invaluable for implementing specific scenarios in the future.
