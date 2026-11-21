---
cover: nautobot
date: 2024-07-12
tags:
- advanced
- ansible
- nautobot
---
Now we need to translate the interface roles defined in Nautobot into specific configurations for the switches. We create an Ansible role that uses the [[Ansible inventory|inventory]] described in the [[Integrating Ansible with Nautobot|previous post]] to configure the interfaces of each device.

## Fetch Running Configuration

First, we retrieve the current running configuration from the switch:

```yaml
- name: GETTING RUNNING CONFIGURATION
  cisco.ios.ios_command:
    commands:
      - show running-config
  register: show_running_config
```

Retrieving the running configuration once, and reusing it in the following tasks, improves overall performance.

## Create Data Structures

Next, we generate the data structures with the details we need from Nautobot:

```yaml
- name: SETTING INTERFACE PROFILES
  ansible.builtin.set_fact:
    interface_profiles: >-
      {
        {% for interface in interfaces %}
          {% if interface.role %}
            "{{ interface.name }}": "{{ interface.role.name }}",
          {% endif %}
        {% endfor %}
      }
    interface_cfgs: >-
      [
        {% for interface in interfaces %}
          {% if interface.role %}
            {
              "name": "{{ interface.name }}",
              {% if interface.enabled %}
                "description": "{{ interface.description }} ({{ interface.role.name }})",
                "enabled": true,
              {% else %}
                "enabled": false,
              {% endif %}
            },
          {% endif %}
        {% endfor %}
      ]
```

* `interface_profiles` links each interface to its profile.
* `interface_cfgs` holds the configurations for the [ios_interfaces module](https://docs.ansible.com/ansible/latest/collections/cisco/ios/ios_interfaces_module.html).

We process only the interfaces that have an associated profile.

## Limit the Data Structure (Optional)

Optionally, we can limit the data structure to a single interface from the command line:

```yaml
- name: FILTERING INTERFACES
  ansible.builtin.set_fact:
    interface_profiles: >-
      {
        {% for interface_name, profile in interface_profiles.items() %}
          {% if interface_name == interface_limit %}
            "{{ interface_name }}": "{{ profile }}",
          {% endif %}
        {% endfor %}
      }
    interface_cfgs: >-
      [
        {% for interface in interface_cfgs %}
          {% if interface.name == interface_limit %}
            {{ interface }},
          {% endif %}
        {% endfor %}
      ]
  when: interface_limit is defined
```

## Apply the Interface Profile Configuration

For each interface, we include an external configuration file:

```yaml
- name: ATTACHING PROFILE TO INTERFACE
  ansible.builtin.include_tasks: "profile_{{ interface.value }}.yml"
  with_dict: "{{ interface_profiles }}"
  loop_control:
    loop_var: interface
```

The profile file uses the [ios_config module](https://docs.ansible.com/ansible/latest/collections/cisco/ios/ios_config_module.html) to apply the configuration commands:

```yaml
- name: "APPLYING PROFILE ISL TO INTERFACE {{ interface.key }}"
  cisco.ios.ios_config:
    config: "{{ show_running_config.stdout.0 }}"
    lines:
      - switchport trunk encapsulation dot1q
      - switchport mode trunk
      - switchport nonegotiate
      - udld port aggressive
    parents: "interface {{ interface.key }}"
    before: "default interface {{ interface.key }}"
```

This step is the slowest, so optimizations are crucial.

## Set Interface Description and State

Finally, we apply the configuration data we prepared:

```yaml
- name: "SETTING INTERFACE STATUS"
  cisco.ios.ios_interfaces:
    config: "{{ interface_cfgs }}"
    state: merged
```

This task manages the state of the interface (`shutdown` and `no shutdown`) with the native module.

## Running the Playbook

We run the [[Ansible Playbooks and variables|playbook]] on all the devices, or we limit it to a specific interface:

```bash
./playbook-interface-configuration.yml
./playbook-interface-configuration.yml --extra-vars interface_limit=GigabitEthernet1/0/47 --limit MGMTSWITCH1
```

With these steps, we automate the configuration of the network interfaces with Ansible and Nautobot.

We can download the Ansible role from [GitHub](https://github.com/dainok/courses/tree/master/Nautobot/06.%20The%20Ansible%20role%20breakdown).
