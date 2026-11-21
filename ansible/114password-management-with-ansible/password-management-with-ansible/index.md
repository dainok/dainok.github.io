---
cover: ansible
date: 2024-12-25
tags:
- ansible
- intermediate
- passwords
---
Password management is one of the topics that should be analyzed during the design phase, i.e., before starting to write code. For learning purposes, however, I prefer to postpone it until you have some basic knowledge.

In general, I discourage any approach that stores credentials in plain text in files or [[Ansible Playbooks and variables|playbooks]]. Where possible, I recommend named credentials, entered manually during playbook execution.

Orchestrators such as [Ansible Tower](https://docs.ansible.com/ansible-tower/) (now the automation controller) or [AWX](https://github.com/ansible/awx) might make it preferable to choose a particular vault, i.e., an encrypted password database accessible via API. In my opinion, using a vault when playbooks are executed manually makes little sense, because it simply shifts the problem: the credentials are in the vault, but the token that gives the playbook access to the vault must be saved somewhere.

Finally, as we saw earlier, dynamic [[Ansible inventory|inventories]] might make it preferable to keep the credentials in the inventory itself, which, being generated dynamically, leaves no trace except in RAM. Once again, however, we are shifting the problem: the script that generates the inventory must somehow authenticate itself.

Let's see two examples, knowing that each environment requires specific considerations about the security and confidentiality of credentials. Let's open the **Simple Network Lab** and start R1.

## Named Credentials

The simplest and safest way to manage credentials is to provide them on the command line at each execution:

```bash
./playbook-auth.yml -u admin -k
```

Before the execution, we are asked for the password of the `admin` user. If the user needs to perform privilege escalation, we can use the `-K` parameter, which prompts us for the `enable` password.

## Ansible Vault

Especially when we use an orchestrator, it is difficult to use named credentials to access devices. In this scenario, it is easier to keep one or more service accounts in the vault.

Let's see how to create a native Ansible vault:

```bash
ansible-vault create secrets.vault
```

The file is nothing but an encrypted key-value dictionary, protected by the password requested during creation. For example, we can save the password of the `admin` user:

```bash
ansible_ssh_pass: cisco
```

If necessary, the vault can be edited:

```bash
ansible-vault edit secrets.vault
```

As we said, we are shifting the problem: the playbook must know the vault password to read it and access the device. There are [several options](https://docs.ansible.com/ansible/2.9/user_guide/playbooks_vault.html):

* enter the vault password on the command line (`--ask-vault-pass`);
* read the password from a specific file or script (`--vault-password-file`);
* read the password from an environment variable through a script (see the previous point).

As mentioned, vaults should be preferred when the playbooks are managed by an orchestrator. In this case, the best choice depends on the orchestrator itself. Whatever system we choose, the vault file is loaded as a variable file and then used:

```yaml
#!/usr/bin/env ansible-playbook
- name: ANSIBLE VAULT
  hosts: all
  gather_facts: false
  vars_files:
    - secrets.vault
```

This is why we used the key `ansible_ssh_pass` in the vault.

## HashiCorp Vault

As we have seen, the integrated vault of Ansible is quite simple. In corporate environments, more advanced vaults are generally present, and I very often come across [[A local HashiCorp Vault server in ten minutes|HashiCorp Vault]]. Let's refer to the [official documentation](https://docs.ansible.com/ansible/2.9/plugins/lookup/hashi_vault.html) and see how to use it.

Let's install the `hvac` library and assume that HashiCorp Vault is configured with two keys, to be used as username and password:

```bash
$ vault read -tls-skip-verify kv/ansible
Key Value
--- -----
refresh_interval 768h
password cisco
username admin
```

We set environment variables for the vault access parameters:

```bash
export VAULT_TOKEN=hvs.R3R5z2SmlSFGi9aR1VJlBZJH
export VAULT_ADDR=https://localhost:8200
```

In particular, we use the `lookup` feature, which allows us to [define variables dynamically](https://docs.ansible.com/ansible/latest/collections/ansible/builtin/vars_lookup.html):

```yaml
#!/usr/bin/env ansible-playbook
- name: HASHICORP VAULT
  hosts: all
  gather_facts: false
  vars:
    ansible_user: "{{ lookup('hashi_vault', 'secret=kv/ansible:username validate_certs=no') }}"
    ansible_ssh_pass: "{{ lookup('hashi_vault', 'secret=kv/ansible:password validate_certs=no') }}"
```

By defining the variables at the **play** level, we can still use `gather_facts`.

All the sources are available on [GitHub](https://github.com/dainok/courses/tree/master/Ansible/14.%20Passwords).
