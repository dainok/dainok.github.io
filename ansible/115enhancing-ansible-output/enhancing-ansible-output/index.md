---
cover: ansible
date: 2025-01-01
tags:
- ansible
- intermediate
---
By default, the output of Ansible lists the tasks executed on each device, with a brief summary at the end of what has been done. The color indicates the outcome of each task: green if no changes were made, yellow if the configuration was modified, red in case of an error, and blue if the task was skipped.

The output can be customized with `callbacks`, in the `ansible.cfg` configuration file:

* `stdout_callback` sets the main plugin that generates the output (by default `ansible.builtin.default`);
* `callbacks_enabled` specifies which plugins are enabled (by default the list is empty).

The [official documentation](https://docs.ansible.com/ansible/latest/plugins/callback.html) lists numerous plugins, which you can also list with:

```bash
ansible-doc -t callback -l
```

Let's see the ones I find most interesting.

## ansible.builtin.default

We already know the [default plugin](https://docs.ansible.com/ansible/latest/collections/ansible/builtin/default_callback.html#ansible-collections-ansible-builtin-default-callback): it is explanatory enough, and you can increase the detail with `-v`.

```text
PLAY [TEST OUTPUT] *************************************************************

TASK [READING OUTPUT] **********************************************************
ok: [r1.example.com]

PLAY RECAP *********************************************************************
r1.example.com             : ok=1    changed=0    unreachable=0    failed=0    skipped=0
   rescued=0    ignored=0
```

The `default` plugin is the best choice for normal operation.

## ansible.builtin.minimal

The [minimal plugin](https://docs.ansible.com/ansible/latest/collections/ansible/builtin/minimal_callback.html#ansible-collections-ansible-builtin-minimal-callback) provides a minimal output: only the result of each task, for each host:

```text
r1.example.com | SUCCESS => {
    "changed": false,
    "stdout": [
        "Interface                  IP-Address      OK? Method Status                Protocol\nEthernet0/0                169.254.1.118   YES DHCP   up                    up      \nEthernet0/1                unassigned      YES NVRAM  administratively down down    \nEthernet0/2                unassigned      YES NVRAM  administratively down down    \nEthernet0/3                unassigned      YES NVRAM  administratively down down"
    ],
    "stdout_lines": [
        [
            "Interface                  IP-Address      OK? Method Status                Protocol",
            "Ethernet0/0                169.254.1.118   YES DHCP   up                    up      ",
            "Ethernet0/1                unassigned      YES NVRAM  administratively down down    ",
            "Ethernet0/2                unassigned      YES NVRAM  administratively down down    ",
            "Ethernet0/3                unassigned      YES NVRAM  administratively down down"
        ]
    ]
}
```

The `minimal` plugin can be helpful on very complex [[Ansible Playbooks and variables|playbooks]].

## ansible.posix.json

The [JSON plugin](https://docs.ansible.com/ansible/latest/collections/ansible/posix/json_callback.html#ansible-collections-ansible-posix-json-callback) returns the execution information in JSON format.

```json
{
    "custom_stats": {},
    "global_custom_stats": {},
    "plays": [
        {
            "play": {
                "duration": {
                    "end": "2024-10-26T06:58:57.910802Z",
                    "start": "2024-10-26T06:58:54.813940Z"
                },
                "id": "72edea89-cc55-4261-0c41-000000000002",
                "name": "TEST OUTPUT",
                "path": "/Users/dainese/src/courses/Ansible/15. Output/playbook-output.yml:2"
            },
            "tasks": [
                {
                    "hosts": {
                        "r1.example.com": {
                            "_ansible_no_log": false,
                            "action": "cisco.ios.ios_command",
                            "changed": false,
```

The **JSON** plugin is particularly useful when the output of the playbook must feed other processes.

## community.general.log_plays

The [log_plays plugin](https://docs.ansible.com/ansible/latest/collections/community/general/log_plays_callback.html#ansible-collections-community-general-log-plays-callback) saves a log file for each device. The plugin must be configured by specifying the directory where the logs are saved:

```ini
[callback_log_plays]
log_folder = /var/log/ansible/hosts
```

The plugin is designed to be used together with a plugin that handles the screen output.

```text
Oct 26 2024 09:00:03 - ./playbook-output.yml - READING OUTPUT - cisco.ios.ios_command - OK - {"module_args": {"commands": ["show ip interface brief"], "match": "all", "retries": 9, "interval": 1, "wait_for": null}} => {"changed": false, "stdout": ["Interface                  IP-Address      OK? Method Status                Protocol\nEthernet0/0                169.254.1.118   YES DHCP   up                    up      \nEthernet0/1                unassigned      YES NVRAM  administratively down down    \nEthernet0/2                unassigned      YES NVRAM  administratively down down    \nEthernet0/3                unassigned      YES NVRAM  administratively down down"], "stdout_lines": [["Interface                  IP-Address      OK? Method Status                Protocol", "Ethernet0/0                169.254.1.118   YES DHCP   up                    up      ", "Ethernet0/1                unassigned      YES NVRAM  administratively down down    ", "Ethernet0/2                unassigned      YES NVRAM  administratively down down    ", "Ethernet0/3                unassigned      YES NVRAM  administratively down down"]], "_ansible_no_log": false}
```

All the sources are available on [GitHub](https://github.com/dainok/courses/tree/master/Ansible/15.%20Output).
