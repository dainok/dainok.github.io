---
cover: ansible
date: 2024-07-31
tags:
- ansible
- beginner
---
[Ansible](https://www.ansible.com/) is built on [Python](https://www.python.org/) and can be installed easily with the package manager [pip](https://pypi.org/). The available functionality obviously depends on the Ansible version, which is closely tied to the Python version in use. The examples that follow assume Ansible core 2.15.10 and Python 3.10.

To set up your own development lab, refer to [[EVE-NG|EVE-NG for DevNetOps]], which describes it in detail. In particular, we will use the [GitHub repository for the DevNetOps courses](https://github.com/dainok/courses), available in `/opt`.

Let's prepare a dedicated Python environment and install Ansible:

```bash
python3.10 -m venv venv
source venv/bin/activate
pip install -r /opt/courses/requirements.txt
```

We can verify the installed version by running:

```bash
$ ansible --version
ansible [core 2.15.10]
  config file = None
  configured module search path = ['/home/dev/.ansible/plugins/modules', '/usr/share/ansible/plugins/modules']
  ansible python module location = /home/dev/venv/lib/python3.10/site-packages/ansible
  ansible collection location = /home/dev/.ansible/collections:/usr/share/ansible/collections
  executable location = /home/dev/venv/bin/ansible
  python version = 3.10.13 (main, Oct 29 2023, 09:51:31) [GCC 9.4.0] (/home/dev/venv/bin/python3.10)
  jinja version = 3.1.3
  libyaml = True
```
