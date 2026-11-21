---
cover: ansible
date: 2024-10-02
tags:
- ansible
- intermediate
- troubleshooting
---
One of the biggest challenges when using Ansible, especially at the beginning, is troubleshooting. You often run into errors that are unclear, poorly described or misleading.

Let's look at some strategies to resolve otherwise incomprehensible errors.

`dos2unix`: In rare cases, issues arise from how different operating systems handle text files (line endings). When working in Linux environments, make sure your files use Unix line endings.

`yamllint` and `yamlfmt`: Ansible [[Ansible Playbooks and variables|playbooks]] are written in YAML. Before troubleshooting further, make sure your files are valid, correctly formatted YAML.

`ansible-lint`: Ansible playbooks follow a specific structure, which can be validated with the `ansible-lint` linter.

**Verbosity:** You can make the execution of playbooks more verbose by adding one or more `-v` flags. Usually, `-vvv` is enough to reveal hidden errors.

**Simplify:** If the cause of the error is still unclear, simplify the playbook until you isolate the task that causes the issue.

`ansible.builtin.debug`: The debug feature lets you print the content of variables, which helps to identify anomalies.

`type_debug`: In addition to checking the content of a variable, make sure its type is correct, especially if you are performing mathematical operations.

`fail`...`when`: Using **fail-when** lets you check whether conditional tests return the expected result.

**Facts:** Before using facts, always check that they are available and have the correct values. The `to_nice_json` [[Ansible parsers and filters|filter]] prints them in a readable format.

**Debugger:** Once you have identified the task that causes the issue, you can enable the debugger:

```yaml
- ansible.builtin.command: "false"
  debugger: on_failed
```

**Timeout:** If tasks take too long, you can increase the timeout for SSH connections:

```yaml
- ansible.builtin.command: "false"
  debugger: on_failed
```

**Async:** For long-running tasks, it is good practice to configure them as asynchronous:

```yaml
- ansible.builtin.command: /bin/sleep 15
  async: 45
  poll: 5
```

**SSH no match:** If you need to manage outdated devices, you might run into issues where a common set of encryption ciphers cannot be established between the Ansible host and the device:

```text
fatal: [pe.example.com]: FAILED! => {"changed": false, "msg": "ssh connection failed: ssh connect failed: kex error : no match for method encryption client->server: server [aes128-cbc,3des-cbc,aes192-cbc,aes256-cbc], client [aes192-ctr,aes256-ctr]"}
```

This example shows a failed connection because there is no matching encryption cipher. If you use libssh, the `~/.ssh/config` file is loaded by default. You can specify a different configuration file in `ansible.cfg`:

```ini
[persistent_connection]
ssh_type = libssh

[libssh_connection]
config_file = ansible_ssh.conf
```
