---
cover: ansible
date: 2024-09-01
tags:
- ansible
- beginner
---
Variables in Ansible can be defined in various ways, which gives you flexibility in managing configuration and customizing [[Ansible Playbooks and variables|playbooks]].

**Defining Variables in the Playbook:** one simple and direct way is to include the variables in the playbook itself:

```yaml
#!/usr/bin/env ansible-playbook
- name: NTP PEERS
  vars:
    ntp_server_1: 194.239.208.213
    ntp_server_2: 130.60.204.10
```

In this example, the variables `ntp_server_1` and `ntp_server_2` are defined within the playbook.

**Defining Variables in a Configuration File:** to keep playbooks cleaner and manage the configuration separately, variables can be defined in an external file:

```yaml
#!/usr/bin/env ansible-playbook
- name: NTP PEERS
  vars_files:
    - config.yml
```

The `config.yml` file contains the variable definitions:

```yaml
ntp_server_1: 194.239.208.213
ntp_server_2: 130.60.204.10
```

**Defining Variables in the [[Ansible inventory|Inventory]]:** variables can also be defined directly in the inventory, and applied to all hosts or to specific groups:

```ini
[all:vars]
ntp_server_1=194.239.208.213
ntp_server_2=130.60.204.10
```

This option is useful when you want to apply the same configuration to multiple hosts.

**Defining Variables at the Role Level:** variables can also be defined within roles, which makes them available only when the role is used:

```yaml
# roles/cisco_ios_ntp/vars/main.yml
ntp_server_1: 194.239.208.213
ntp_server_2: 130.60.204.10
```

**Defining Variables at the Host or Group Level:** you can define variables specific to a single host or to a group of hosts with `host_vars` and `group_vars` files, respectively:

* `host_vars/sw1.example.com`
* `group_vars/all.yml`

**Using the `set_fact` Module:** variables can also be created dynamically while a playbook runs, with the `set_fact` module:

```yaml
- ansible.builtin.set_fact:
    ntp_server_1: 194.239.208.213
    ntp_server_2: 130.60.204.10
```

## Accessing Variables from Other Hosts

In some cases, you need to access the variables of another host while a playbook runs. You can do it with the `hostvars` syntax:

```python
hostvars['sw2.example.com']['ansible_host']
```

## Storing the Output of a Task

To store the output of a task in a variable, you do not use `set_fact`: you use the `register` parameter in the task whose output you want to capture:

```yaml
- name: GETTING NTP CONFIGURATION
  cisco.ios.ios_command:
    commands:
      - "show running-config | include ntp peer"
  register: show_run_ntp_peer
```
