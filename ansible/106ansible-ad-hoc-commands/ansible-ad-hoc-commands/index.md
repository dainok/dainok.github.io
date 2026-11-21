---
cover: ansible
date: 2024-08-03
tags:
- ansible
- intermediate
---
Ansible can execute single commands without building a [[Ansible Playbooks and variables|playbook]]. This mode is called [ad hoc](https://docs.ansible.com/ansible/latest/command_guide/intro_adhoc.html) and is useful for one-time commands in very specific scenarios.

Let's open the `Simple Network Lab` and start **R1**. Make sure the router is up and reachable:

```bash
$ ping -c3 169.254.1.21
PING 169.254.1.21 (169.254.1.21) 56(84) bytes of data.
64 bytes from 169.254.1.21: icmp_seq=1 ttl=255 time=0.515 ms
64 bytes from 169.254.1.21: icmp_seq=2 ttl=255 time=0.539 ms
64 bytes from 169.254.1.21: icmp_seq=3 ttl=255 time=0.522 ms

--- 169.254.1.21 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2051ms
rtt min/avg/max/mdev = 0.515/0.525/0.539/0.010 ms
```

If it is not, connect to the console and check that it is powered on, configured and has the correct IP address.

Now let's run `ping` in ad hoc mode:

```bash
$ ansible all -m ping
r1.example.com | SUCCESS => {
    "changed": false,
    "ping": "pong"
}
r2.example.com | SUCCESS => {
    "changed": false,
    "ping": "pong"
}
```

We immediately notice that **R2** appears to be active even though it is not powered on. This happens because the command we used is not a real **ping**, but a connectivity test performed via SSH, which checks the access and the presence of a usable Python interpreter on the remote host. This is the classic mode used to manage Linux systems, but as we have seen, we are working with network devices, and here the behavior changes significantly. In particular, Ansible uses a local Python interpreter, and for this reason the `ping` module does not work as expected.

The correct module is `net_ping`, which requires the destination IP address. In our case, it is the IP address of the node itself, defined in the `ansible_host` variable:

```bash
$ ansible all -m net_ping -a "dest='{{ ansible_host }}'"
r2.example.com | FAILED! => {
    "changed": false,
    "msg": "ssh connection failed: ssh connect failed: Failed to resolve hostname r2.example.com (Name or service not known)"
}
r1.example.com | SUCCESS => {
    "changed": false,
    "commands": "ping ip 169.254.1.21",
    "packet_loss": "0%",
    "packets_rx": 5,
    "packets_tx": 5,
    "rtt": {
        "avg": 1,
        "max": 1,
        "min": 1
    }
}
```

In the example, `dest` is set to the value of `ansible_host` using Jinja syntax. We also see that an IOS command was executed, not a Linux one. We are not pinging **R1** from the Ansible host: we are running a ping command on **R1** itself, which pings its own interface.

There is no simple fix, and the reason is that we are asking the wrong thing of Ansible: it is not a monitoring system, but a task execution system. Tasks fail if the system is unreachable, and that is enough for our needs.

In the last example, we run the `show version` command:

```bash
$ ansible r1.example.com -m ios_command -a "commands='show version'"
r1.example.com | SUCCESS => {
    "changed": false,
    "stdout": [
        "Cisco IOS Software, Linux Software (I86BI_LINUX-ADVENTERPRISEK9-M), Version 15.7(3)M2, DEVELOPMENT TEST SOFTWARE\nTechnical Support: http://www.cisco.com/techsupport\nCopyright (c) 1986-2018 by Cisco Systems, Inc.\nCompiled Wed 28-Mar-18 11:18 by prod_rel_team\n\nROM: Bootstrap program is Linux\n\nR1 uptime is 5 minutes\nSystem returned to ROM by reload at 0\nSystem image file is \"unix:/opt/unetlab/addons/iol/bin/i86bi_LinuxL3-AdvEnterpriseK9-M2_15\"\nLast reload reason: Unknown reason\n\n\n\nThis product contains cryptographic features and is subject to United\nStates and local country laws governing import, export, transfer and\nuse. Delivery of Cisco cryptographic products does not imply\nthird-party authority to import, export, distribute or use encryption.\nImporters, exporters, distributors and users are responsible for\ncompliance with U.S. and local country laws. By using this product you\nagree to comply with applicable laws and regulations. If you are unable\nto comply with U.S. and local laws, return this product immediately.\n\nA summary of U.S. laws governing Cisco cryptographic products may be found at:\nhttp://www.cisco.com/wwl/export/crypto/tool/stqrg.html\n\nIf you require further assistance please contact us by sending email to\nexport@cisco.com.\n\nLinux Unix (Intel-x86) processor with 863257K bytes of memory.\nProcessor board ID 73402369\n4 Ethernet interfaces\n1024K bytes of NVRAM.\n\n\n\nConfiguration register is 0x0"
    ],
    "stdout_lines": [
        [
            "Cisco IOS Software, Linux Software (I86BI_LINUX-ADVENTERPRISEK9-M), Version 1
[...]
```

The output shows the result of the command for R1.
