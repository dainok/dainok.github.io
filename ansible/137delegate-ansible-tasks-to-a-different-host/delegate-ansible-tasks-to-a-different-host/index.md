---
cover: ansible
date: 2025-04-12
tags:
- ansible
- intermediate
---
By default, each task runs on the host that is being configured. In various scenarios, however, tasks need to be executed across multiple hosts in a specific sequence. A common example is a web server that must be taken offline from the load balancer before being modified. A typical [[Ansible Playbooks and variables|playbook]] for this scenario would:

* Reconfigure the load balancer to take the web server offline.
* Reconfigure the web server.
* Reconfigure the load balancer to bring the web server back online.

In our network fabric, we can adapt this approach:

![[leaf-spine-topology-2.png]]

We can write a playbook that configures the access switches while enabling the corresponding core switch interfaces step by step.

In other words, once an access switch is configured, a specific task connects to the core switches to configure the interfaces associated with that switch.

To do this, we use the `delegate_to` functionality.

## Using delegate_to in Ansible

The syntax is straightforward: in a task, we specify which host is delegated to execute it. In many cases, we can use localhost to run a task locally. In our scenario, we delegate the configuration tasks to the core switches:

```yaml
- name: "CONFIGURING UPSTREAM SW1"
  delegate_to: sw1.example.com
  cisco.ios.ios_config:
    lines:
      - switchport trunk encapsulation dot1q
      - switchport mode trunk
      - switchport nonegotiate
      - udld port aggressive
    parents: "interface {{ upstream_interface }}"
    before: "default interface {{ upstream_interface }}"
- name: "ENABLING UPSTREAM SW1 INTERFACE"
  delegate_to: sw1.example.com
  cisco.ios.ios_interfaces:
    config:
      - name: "{{ upstream_interface }}"
        enabled: true
        description: "to {{ inventory_hostname }}"
```

## Key Considerations

There are some important points to keep in mind when using `delegate_to`:

* `delegate_to` **cannot be used with loops (with_items)**. We can work around this limitation by including a separate task, as shown above.
* `delegate_to` **does not work correctly with a [[Running Ansible playbooks through a Bastion host|bastion host]]**. If misconfigured, we might get the following error:

```text
fatal: [sw6.example.com -> sw1.example.com(169.254.1.101)]: FAILED! => {"changed": false, "msg": "unable to connect to socket /Users/dainese/.ansible/pc/ff42547828. See the socket path issue category in Network Debug and Troubleshooting Guide"}
```

The [official documentation](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_delegation.html) provides a detailed explanation of this functionality, including specific cases related to variable handling.

When we run the playbook, the output of Ansible indicates that a task for a specific switch has been delegated to another host, such as `sw1.example.com`:

```text
TASK [cisco_ios_uplink_interface : CONFIGURING UPSTREAM SW1] *******************
ok: [sw3.example.com -> sw1.example.com(169.254.1.101)]
ok: [sw5.example.com -> sw1.example.com(169.254.1.101)]
ok: [sw6.example.com -> sw1.example.com(169.254.1.101)]
ok: [sw4.example.com -> sw1.example.com(169.254.1.101)]
```

The playbook is available in the [GitHub repository](https://github.com/dainok/courses/tree/master/Ansible/A7.%20Delegate%20tasks).
