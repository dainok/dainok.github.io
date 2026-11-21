---
cover: ansible
date: 2024-09-16
tags:
- advanced
- ansible
- jinja2
---
If you have some experience with programming languages, you might find the constructs of Ansible a bit clunky. Let's break them down with practical examples.

## Conditionals (if, then, else)

In Ansible, the **if-then-else** construct is simplified to a single word: `when`.

```yaml
- ansible.builtin.command: /sbin/shutdown -t now
  when: ansible_facts['os_family'] == "Debian"
```

Unlike traditional languages, there is no **else** or **elif**: you handle those cases with separate `when` statements and the right expressions.

If several conditions must all be true at the same time (logical **AND**), list them:

```yaml
- ansible.builtin.command: /sbin/shutdown -t now
  when:
    - ansible_facts['distribution'] == "CentOS"
    - ansible_facts['distribution_major_version'] == "6"
```

Each variable in Ansible can be one of the following types:

* List.
* Dictionary.
* Boolean (True/true/yes/on or False/false/no/off).
* Integer.
* Float.
* String (if wrapped in quotes, or if it does not fit the other types).

Ansible relies heavily on [Jinja](https://jinja.palletsprojects.com/), which adds some complexity. Any variable created with Jinja is treated as a string, and you often need to convert it before use. Sometimes, however, Ansible does it for you: for example, it automatically converts a string containing JSON into a list or a dictionary when it is used in a loop.

In short:

* Variables can be either `defined` or `undefined`.
* A defined variable can be empty (`None`) or hold data.
* The type of a variable depends on the data it holds (Ansible uses weak typing).
* Jinja often produces strings, which may need to be converted.
* Ansible automatically converts strings into lists or dictionaries when needed.
* Before mathematical operations, convert variables explicitly with Jinja [[Ansible parsers and filters|filters]] such as `| int` or `| float`.

The best approach is to always check how Ansible handles each case. You can use debug tools to inspect the type and the value of your variables:

```yaml
- ansible.builtin.debug:
    msg: "Type of var is {{ var | type_debug }}"
- ansible.builtin.debug:
    msg: "Content of var is {{ var }}"
```

For more details and examples, see the [official Ansible documentation](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_conditionals.html).

## Blocks

A [block](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_blocks.html) is a group of tasks. Blocks can be used to:

* Group tasks that share the same `when` condition.
* Handle errors with the `rescue` and `always` directives.

```yaml
- block:
    - ansible.builtin.debug:
        msg: "{{ value | int }}"
  rescue:
    - ansible.builtin.debug:
        msg: "Value is not defined"
```

## Loops

A loop can be applied to lists or dictionaries to iterate over their elements and perform an action on each of them. There are two important considerations:

* Using loops directly impacts performance.
* A loop can only be applied to a single action, not to a group of actions.

For simplicity, let's look at three common approaches and leave deeper insights to the [official documentation](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_loops.html).

With `with_items`, you iterate over a list of elements. In each iteration, by default, the `item` variable takes the value of the current list element:

```yaml
- ansible.builtin.debug:
    msg: "{{ item }}"
  with_items:
    - red
    - green
    - blue
```

With `with_dict`, you iterate over a dictionary. In each iteration, `item.key` and `item.value` hold the key and the value of the current key-value pair:

```yaml
- ansible.builtin.debug:
    msg: "{{ item.value }} is {{ item.key }}"
  with_dict:
    red: tomato
    green: grass
    blue: sky
```

Ansible later standardized loops with the `loop` construct. Out of habit, I still tend to use `with_items` and `with_dict`, which feel more straightforward to me, but `loop` can be more useful in complex scenarios.

## Nested Loops

We have already seen how to implement loops in Ansible. Sometimes, however, you need loops within loops (nested loops) or loops over groups of tasks. In both cases the solution is similar and uses external files:

```yaml
- ansible.builtin.include_tasks: sub_task1.yml
  with_items:
    - macos
    - windows
    - linux
  loop_control:
    loop_var: os_item
```

In this example, we iterate over a list and call an external task file, `sub_task1.yml`. All the tasks in this file can use the variable `os_item`, which takes each value of the list.

When I call an external task file, I always prefer to specify the variable name explicitly. This avoids confusion and prevents the variable from being overwritten by loops inside the external file.

## Until

Finally, let's look at how to execute a task until the desired result is achieved:

```yaml
- ansible.builtin.shell: /usr/bin/foo
  register: result
  until: result.stdout.find("ready") != -1
  retries: 5
  delay: 10
```

In this example, we run a (fictional) command until the output contains the word `ready`. The execution stops with an error after 5 failed attempts, with 10 seconds between attempts.

## Configuring NTP with ios_config

Let's see how to configure NTP peers with the `ios_config` module. Before writing the [[Ansible Playbooks and variables|playbook]], we review the [official documentation](https://docs.ansible.com/ansible/latest/collections/cisco/ios/ios_config_module.html) and think about how we would configure NTP peers manually. The typical process is:

* Configure the NTP servers.
* Verify the NTP servers configured on the device.
* Remove any NTP servers configured on the device that are not in the desired NTP server list.

We now write a role that performs these three steps exactly as described.

First, following the official documentation, we add the missing NTP peers:

```yaml
- cisco.ios.ios_config:
    lines:
      - "ntp peer {{ ntp_server_1 }}"
      - "ntp peer {{ ntp_server_2 }}"
```

Next, we need to remove any unnecessary NTP peers. When working manually, we would retrieve the `running-config` to check for unknown addresses. In Ansible, we do something similar:

```yaml
- cisco.ios.ios_command:
    commands:
      - "show running-config | include ntp peer"
  register: show_run_ntp_peer
```

The `register` option saves the output into a variable that we define. If we print this variable with `debug`, we can analyze its structure.

The output is in JSON format and contains the raw output (`stdout`) and the output split into lines (`stdout_lines`). Both are arrays because multiple commands can return output at the same time.

For convenience, we extract only the NTP peer IP addresses into specific variables:

```yaml
- ansible.builtin.set_fact:
    current_ntp_peers: "{{ show_run_ntp_peer['stdout'][0] | regex_findall('^ntp peer .*$', multiline=True) | regex_replace('ntp peer ', '') }}"
    expected_ntp_peers:
      - "{{ ntp_server_1 }}"
      - "{{ ntp_server_2 }}"
```

The `current_ntp_peers` variable stores all the lines starting with `ntp peer`. Before saving, the prefix `ntp peer` is removed, which leaves a list of only the NTP peer IP addresses.

Note: if any of our IP addresses is configured as `preferred`, the configuration becomes more complex.

At this point, we need to compare the current configuration with the expected one and remove any unnecessary peers. Specifically, we compare each element of the configuration, and if it is not in the expected NTP peer list, we remove it:

```yaml
- name: REMOVING NTP PEERS
  cisco.ios.ios_config:
    lines:
      - "no ntp peer {{ item }}"
  with_items: "{{ current_ntp_peers }}"
  when: item not in expected_ntp_peers
```

The code above loops (`with_items`) through the `current_ntp_peers` list, and each item is compared with the `expected_ntp_peers` list. If (`when`) the address is not found, it is removed with the `ios_config` module.

This playbook could be optimized, but I designed it to be readable and easy to understand.
