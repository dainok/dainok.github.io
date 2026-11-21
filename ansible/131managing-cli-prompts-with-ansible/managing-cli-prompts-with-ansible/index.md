---
cover: ansible
date: 2025-03-01
tags:
- ansible
- intermediate
---
Some commands ask the operator for confirmation before they run. Ansible has a basic capability to handle these situations thanks to the `cli_command` and `ios_command` modules. The first one is generic, the second one is specific to Cisco IOS systems, but both essentially perform the same function, with some peculiarities and limitations. In general, vendor-specific modules should handle syntax errors correctly but, as we will see, this is not always true.

Let's see some examples based on the `Simple Network Lab` lab.

## Resetting Interface Counters

The first example is resetting the interface counters. The command requires a simple confirmation:

```text
R1#clear counters
Clear "show interface" counters on all interfaces [confirm]
```

We can use `cli_command` to execute the command and answer the confirmation. We refer to the [official documentation](https://docs.ansible.com/ansible/latest/collections/ansible/netcommon/cli_command_module.html):

```yaml
- name: CLEARING INTERFACE COUNTERS WITH cli_command
  ansible.netcommon.cli_command:
    command: clear counters
    check_all: true
    prompt:
      - Clear "show interface" counters on all interfaces
    answer:
      - y
```

Technically, the `check_all` parameter should check all the listed prompts. However, if we change the command to `show interfaces`, we can verify that the task does not generate any errors. In other words, it is not always possible to tell whether the operation was successful.

Alternatively, we can use `ios_command`. We refer to the [official documentation](https://docs.ansible.com/ansible/latest/collections/cisco/ios/ios_command_module.html):

```yaml
- name: CLEARING INTERFACE COUNTERS WITH ios_command
  cisco.ios.ios_command:
    commands:
      - command: clear counters
        prompt: Clear "show interface" counters on all interfaces
        answer: y
```

We can verify that this option has the same problem.

## Saving Configuration

The second example is saving the configuration. Previously, we used `write memory`, which does not require any confirmation. Now let's implement a task that handles the following command:

```text
R1#copy running-config startup-config
Destination filename [startup-config]?
Building configuration...

  [OK]
```

The implementation with `cli_command` is similar to the previous one:

```yaml
- name: SAVING CONFIGURATION WITH cli_command
  ansible.netcommon.cli_command:
    command: copy running-config startup-config
    check_all: true
    prompt:
      - Destination filename
    answer:
      - startup-config
```

Here is the implementation with `ios_command`:

```yaml
- name: SAVING CONFIGURATION WITH ios_command
  cisco.ios.ios_command:
    commands:
      - command: copy running-config startup-config
        prompt: Destination filename
        answer: startup-config
```

## Multiple Prompts

Some commands require handling multiple prompts, for example:

```text
R1#ping
Protocol [ip]: ip
Target IP address: 8.8.8.8
Repeat count [5]: 3
Datagram size [100]: 40
Timeout in seconds [2]: 1
Extended commands [n]: n
Sweep range of sizes [n]: n
Type escape sequence to abort.
Sending 3, 40-byte ICMP Echos to 8.8.8.8, timeout is 1 seconds:
!!!
Success rate is 100 percent (3/3), round-trip min/avg/max = 13/13/13 ms
```

We can handle multiple prompts with `cli_command` as follows:

```yaml
- name: PING WITH cli_command
  ansible.netcommon.cli_command:
    command: ping
    check_all: true
    prompt:
      - Protocol
      - Target IP address
      - Repeat count
      - Datagram size
      - Timeout in seconds
      - Extended commands
      - Sweep range of sizes
    answer:
      - ip
      - 8.8.8.8
      - 3
      - 40
      - 1
      - n
      - n
```

All the sources are available on [GitHub](https://github.com/dainok/courses/tree/master/Ansible/A1.%20Managing%20prompts).
