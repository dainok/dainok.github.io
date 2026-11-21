---
cover: eve-ng
date: 2024-07-27
tags:
- beginner
- eve-ng
---
I install an EVE-NG server every time I prepare a new course. For this reason, I created an [[Introduction to Ansible Automation|Ansible]] playbook that, starting from an Ubuntu Linux Server 22.04 LTS installation, installs EVE-NG as described in the previous chapters.

The playbook is available in the [GitHub repository](https://github.com/dainok/courses) dedicated to the DevNetOps courses. Let's install [Ansible](https://www.ansible.com/) and retrieve the playbook from the repository:

```bash
git clone https://github.com/dainok/courses
cd courses
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd "EVE-NG setup"
```

At this point, we need to modify the inventory (`inventory.yml`). In particular, we verify:

* The IP address of the EVE-NG server (`ansible_host`).
* That we can log in with a key (without a password) and, optionally, escalate privileges with `sudo` without being prompted for a password.
* Whether we want to create users and how many (`dev_users`).

To let the users in the `sudo` group run any command without a password prompt, we edit the `/etc/sudoers` file with the following configuration:

```text
%sudo ALL=(ALL:ALL) NOPASSWD:ALL
```

Finally, we run the playbook with the user we can log in with:

```bash
./playbook-eveng6-install.yml -u ubuntu
./playbook-eveng6-install.yml -u ubuntu --tags upload
./playbook-eveng6-install.yml -u ubuntu --tags python
```

At the end, we reboot the EVE-NG server.

To install EVE-NG 5, we start from an Ubuntu Linux Server 20.04 LTS installation and use the following playbooks:

```bash
./playbook-eveng5-install.yml -u ubuntu
./playbook-eveng5-install.yml -u ubuntu --tags upload
./playbook-eveng5-install.yml -u ubuntu --tags python
```
