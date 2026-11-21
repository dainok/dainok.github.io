---
cover: nautobot
date: 2024-07-12
tags:
- ansible
- beginner
- nautobot
---
It is currently not possible to run Ansible [[Ansible Playbooks and variables|playbooks]] directly from Nautobot. There are some [proposals](https://github.com/orgs/nautobot/discussions/996), but nothing concrete has been implemented yet.

The only option is an external orchestrator that runs the playbook regularly or when an operator requests it. Here are some options:

* **Crontab:** schedules playbook runs at regular intervals.
* [Ansible Tower](https://docs.ansible.com/ansible-tower/index.html): a web-based solution to manage and schedule Ansible playbooks.
* [AWX](https://github.com/ansible/awx): the open-source version of Ansible Tower.
* [Spacelift](https://spacelift.io/): a flexible CI/CD platform for infrastructure as code.

Each of these tools has its own features and capabilities, so we choose the one that best fits our environment and requirements.
