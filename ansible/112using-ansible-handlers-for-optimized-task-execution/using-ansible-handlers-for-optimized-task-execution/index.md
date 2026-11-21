---
cover: ansible
date: 2024-10-16
tags:
- ansible
- intermediate
---
Handlers let you associate actions with tasks that change devices. Their key feature is that they are executed once, right before the end of the [[Ansible Playbooks and variables|playbook]].

A good example is saving a configuration. Throughout a playbook, the configuration may be modified multiple times, but it only needs to be saved once, at the end.

Here is a task that configures NTP servers:

```yaml
- cisco.ios.ios_ntp_global:
    config:
      peers:
        - peer: "{{ ntp_server_1 }}"
        - peer: "{{ ntp_server_2 }}"
    state: replaced
  notify: SAVE CONFIG
```

The task calls (`notify`) the `SAVE CONFIG` handler. At the end of the playbook, the handler is triggered once, even if it is notified by multiple tasks.

```yaml
- name: SAVE CONFIG
  cisco.ios.ios_config:
    save_when: always
```

The handler is simply a task stored in the `handlers` directory. The only thing to keep in mind is to give it a name, which is used to invoke it.

However, handlers have a significant drawback. Let's look at an example:

* A series of tasks modify the configuration of a device, and the execution of the handler is deferred.
* Due to an error, the playbook stops before the handler is executed.
* The next time the playbook is run, no changes are made to the device configuration, so no handler is triggered.

In this scenario, we end up in an undesirable state: the device has been reconfigured, but the changes have not been saved.

For this reason, I tend to avoid using handlers.
