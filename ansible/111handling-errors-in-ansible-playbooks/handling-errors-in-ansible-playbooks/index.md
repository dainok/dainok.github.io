---
cover: ansible
date: 2024-10-09
tags:
- ansible
- intermediate
---
When developing [[Ansible Playbooks and variables|playbooks]], it is often necessary to change the default behavior of Ansible in case of errors.

Here are three common scenarios:

* When a task should only run in a specific mode.
* When a task should never report changes.
* When a task should fail under certain conditions.

We will also see three scenarios that are useful to know but rarely needed in practice.

## Running Tasks in a Specific Mode

You can make a task run only in a specific mode. For instance, the following task runs only in check mode (`-C`):

```yaml
- cisco.ios.ios_command:
    commands:
      - "show running-config | include ntp peer"
  when: ansible_check_mode
```

However, this does not change the behavior of the task, only when it is executed. In check mode, commands that can alter the system are not executed. Each module handles check mode differently.

For example, in check mode the `ios_command` module only runs commands that start with `show`: a command like `dir` is not executed.

You can force the `ios_command` module to behave normally, even in check mode:

```yaml
- name: Forced in check mode
  cisco.ios.ios_command:
    commands:
      - "dir"
  check_mode: false
```

## Forcing Changed and Failed Status

Task execution returns the `changed` and `failed` status, to indicate whether something in the system has changed and whether the task completed successfully.

You can force the behavior as follows:

```yaml
- cisco.ios.ios_command:
    commands: show version
  register: output
  changed_when: false
  failed_when: '"I86BI_LINUX" in output.stdout[0]'
```

## Custom Failure Messages

To print a more informative error message when forcing a failed state, split the task into two parts, as shown:

```yaml
- cisco.ios.ios_command:
    commands: show version
  register: output
- ansible.builtin.fail:
    msg: "Router is IOL"
  when: '"I86BI_LINUX" in output.stdout[0]'
```

## Try-Catch with Blocks

In Ansible, you can implement a try-catch block to handle errors across multiple tasks:

```yaml
- block:
    - ansible.builtin.debug:
        msg: "{{ value | int }}"
  rescue:
    - ansible.builtin.debug:
        msg: "Value is not defined"
```

## Running Playbooks on Failed Hosts

Ansible can keep track of the hosts where a playbook has failed. To enable it, set the `retry_files_enabled` parameter in the configuration:

```ini
[defaults]
retry_files_enabled: True
```

Then you can rerun the playbook, limiting it to the failed hosts only:

```bash
./playbook.yml -i inventory.ini --limit @playbook.retry
```

## Ignoring Unreachable Hosts

A task can be configured so that an unreachable host does not interrupt the playbook:

```yaml
- cisco.ios.ios_command:
    commands: show version
  ignore_unreachable: true
```

If a host is unreachable at this task, the playbook continues with the following tasks.
