---
cover: ansible
date: 2025-04-05
tags:
- advanced
- ansible
---
Rebooting a device and waiting for it to be available again is a more complex interactive task than those seen so far. Ansible is not designed specifically for this purpose, but it can be useful, for example, in a procedure that updates the firmware of a device.

Let's analyze the manual procedure:

* The device must obviously be reachable.
* The configuration register should be set to `0x2101`.
* The configuration must be saved.

At this point, the `reload` command can be issued, and we wait for the device to be reachable again before issuing further commands.

The preliminary tasks, which we have already analyzed, can be implemented very simply:

```yaml
- name: READING SHOW VERSION
  cisco.ios.ios_command:
    commands: show version
  register: output
- name: CHECKING CONFIGURATION REGISTER
  ansible.builtin.fail:
    msg: The configuration register must be 0x2101
  when: "'0x2101' not in output['stdout'][0]"
- name: SAVING CONFIGURATION
  cisco.ios.ios_config:
    save_when: modified
```

The check of the register could have been done with a single task, but with significantly lower usability:

```yaml
- cisco.ios.ios_command:
    commands: show version
  failed_when: "'Configuration register is 0x2101' not in output['stdout'][0]"
```

In case of error, the output would have been as follows:

```text
fatal: [r1.example.com]: FAILED! => {"changed": false, "failed_when_result": true, "stdout": "Cisco IOS Software, Linux Software (I86BI_LINUX-ADVENTERPRISEK9-M), Version 15.7(3)M2, DEVELOPMENT TEST SOFTWARE\nTechnical Support: [http://www.cisco.com/techsupport\nCopyright (c) 1986-2018 by Cisco Systems, Inc.\nCompiled Wed 28-Mar-18 11:18 by prod_rel_team\n\nROM: Bootstrap program is Linux\n\nR1 uptime is 10 minutes\nSystem returned to ROM by reload at 0\nSystem restarted at 10:01:15 UTC Sun Apr 7 2024\nSystem image file is \"unix:/opt/unetlab/addons/iol/bin/i86bi_LinuxL3-AdvEnterpriseK9-M2_15\"\nLast reload reason: Unknown reason\n\n\n\nThis product contains cryptographic features and is subject to United\nStates and local country laws governing import, export, transfer and\nuse...
```

Using `fail` instead of `failed_when` lets us specify the error message, which is much more usable:

```text
fatal: [r1.example.com]: FAILED! => {"changed": false, "msg": "The configuration register must be 0x2101"}
```

The task to reboot the device is similar to what we have seen before:

```yaml
- name: RELOADING DEVICE
  ansible.netcommon.cli_command:
    command: reload
    check_all: true
    prompt:
      - Proceed with reload
    answer:
      - y
  async: 1
  poll: 0
```

The difference from the previous examples is the `async` and `poll` parameters. The reboot will surely close the SSH connection. The `async` mode lets us disconnect from the SSH connection and move on to the next task immediately (`poll: 0`).

The version with `ios_command` is very similar:

```yaml
- name: RELOADING DEVICE
  cisco.ios.ios_command:
    commands:
      - command: reload
        prompt: Proceed with reload
        answer: "y"
  async: 1
  poll: 0
```

Finally, we need to wait for the device to be available again. Technically, we are waiting for port 22 (SSH) to be listening again. This is done locally by the Ansible controller (`connection: local`):

```yaml
- name: WAITING FOR REBOOT
  ansible.builtin.wait_for:
    delay: 30
    connect_timeout: 3
    sleep: 10
    port: 22
    host: "{{ ansible_host }}"
    timeout: 600
  connection: local
```

The `wait_for` module waits for an event, such as a particular line in a log file or, as in our case, the availability of a port:

* `port`: specifies the TCP port number to check.
* `host`: specifies the IP address of the device on which to check the port.
* `delay`: specifies the time to wait before starting the test.
* `connect_timeout`: specifies the time to wait before declaring the port inactive.
* `sleep`: specifies the time between two tests.
* `timeout`: specifies the maximum waiting time (task duration).

This method cannot be used with bastion hosts, because it requires direct connectivity between the Ansible controller and the device.

After this task, all the post-reboot verification operations can be performed.

All the sources are available on [GitHub](https://github.com/dainok/courses/tree/master/Ansible/A2.%20Device%20reload%20and%20wait).
