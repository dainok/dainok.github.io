---
cover: ansible
date: 2024-11-20
tags:
- advanced
- ansible
---
In many environments, a particularly secure host, the bastion host, handles all the management operations that operators perform on production systems. It is usually subject to audits and continuous verification.

![[ansible-with-bastion-host.png]]

Ansible can work through a bastion host, but the configuration depends on the protocol used. Here we limit ourselves to SSH.

In our lab, our computer (Linux or macOS) is the Ansible controller, and the [EVE-NG](https://www.eve-ng.net/) server is the bastion host: the devices are reachable only from the [[Introduction to EVE-NG platform|EVE-NG]] server.

Note that the local Python environment is used, not that of the bastion host, so any library or module errors refer to the local system. The bastion host is only a bridge: it needs no special configuration, except public key authentication.

## SSH via Bastion Host

As the diagram above shows, we must be able to connect via SSH to the EVE-NG server using public key authentication. We therefore exchange the keys, manually or with a dedicated command, so that we can connect automatically to the bastion host as the user `dev`:

```bash
ssh-copy-id -i ~/.ssh/id_rsa.pub dev@172.25.82.110
```

At this point, we use the `ansible_ssh_common_args` parameter to force the connections through the bastion host.

We can set the `ansible_ssh_common_args` variable at the [[Ansible Playbooks and variables|playbook]] level:

```yaml
- ansible.builtin.set_fact:
    ansible_ssh_common_args: >-
      -o ProxyCommand="ssh
      -o IdentityFile=~/.ssh/id_rsa
      -o StrictHostKeyChecking=no
      -o UserKnownHostsFile=/dev/null
      -W %h:%p
      -q dev@172.25.82.110"
```

The `>-` syntax lets us write the content of a variable on multiple lines, without end-of-line characters in the value.

We can set it as an environment variable, which is probably the most convenient choice in a mixed development environment:

```bash
export ANSIBLE_SSH_COMMON_ARGS='-o ProxyCommand="ssh -o IdentityFile=~/.ssh/id_rsa -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -W %h:%p -q dev@172.25.82.110"'
```

Or we can set it on the command line:

```bash
./playbook-ntp-via-bastion.yml -i inventory.ini --ssh-common-args '-o ProxyCommand="ssh -o IdentityFile=~/.ssh/id_rsa -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -W %h:%p -q dev@172.25.82.110"'
```

If we run into problems, let's try to connect to R1 through the bastion host:

```bash
ssh -o ProxyCommand="ssh -o IdentityFile=~/.ssh/id_rsa -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -W %h:%p -q dev@172.25.82.110" admin@169.254.1.21
```

Then we analyze any errors.
