---
cover: nautobot
date: 2024-07-12
tags:
- advanced
- ansible
- behind-the-scene
- nautobot
---
Beyond the topics of the previous posts, my work on this project focused on four key areas:

* The data structure of Nautobot.
* The REST API of Nautobot.
* Integrating Ansible with Nautobot.
* Running Ansible [[Ansible Playbooks and variables|playbooks]] from Nautobot.

Let's look at the challenges I encountered and the solutions that I left out of the previous posts.

## Nautobot's Data Structure

To use Nautobot effectively, we need to plan the data structure carefully to avoid costly changes later. Understanding the structure also lets us simplify the automation scripts.

Each object in Nautobot is identified by a UUID, such as `2170a207-43b2-422a-a90d-51a4908b85fb`. This choice allows us to change any attribute without issues. Since the identifier of a device is a UUID and not a name, we must consider:

* Can two devices have the same name?
* Can two interfaces on the same device have the same name?

Quick tests show that the answer is no to both questions, so we can simplify the automation scripts safely.

## Django Shell

Nautobot is built on [Django](https://www.djangoproject.com/), a Python-based web application framework. Django provides a shell that allows easy interaction with the data structure.

I had to decide whether to develop the automations with the shell or with the REST API.

We invoke the shell with the command:

```bash
nautobot-server shell
```

For example, to retrieve the list of the interfaces associated with a device, we can use this simple script:

```python
from nautobot.dcim import models

models.Interface.objects.filter(device__name="MGMTSWITCH1")
```

This option is appealing, but the shell is available only locally on the instance that runs Nautobot. When Nautobot runs in containers, accessing the shell can be complex or impossible.

## REST API

REST APIs are useful when they are well documented, which is not the case with Nautobot. The [documentation](https://docs.nautobot.com/projects/core/en/stable/user-guide/platform-functionality/rest-api/overview/) includes examples, and local installations provide the documentation of the API calls at [http://localhost:8000/api/docs/](http://localhost:8000/api/docs/). Some features, such as [filtering](https://docs.nautobot.com/projects/core/en/v1.4.7/rest-api/filtering/#filtering-by-choice-field), are poorly documented and require trial and error.

The `device_id` [[Ansible parsers and filters|filter]] worked, but `device_name` returned an error:

```json
{"device_name": ["Unknown filter field"]}
```

After numerous attempts, I found a [bug from 2023](https://github.com/nautobot/nautobot/issues/4370). Eventually, I realized that the API filters are actually [FilterSets](https://github.com/nautobot/nautobot/blob/develop/nautobot/dcim/filters/__init__.py), so `device` can filter by name or label.

The equivalent code is:

```python
url = "http://localhost:8000/api/dcim/interfaces/?device=MGMTSWITCH1"

req = requests.get(url, headers=headers).json()
```

Remember to handle [pagination](https://docs.nautobot.com/projects/core/en/stable/user-guide/platform-functionality/rest-api/overview/#pagination).

## Django Shell or REST API

I chose the REST API for its broader compatibility, despite the difficulties.

## Integrating Ansible with Nautobot

[network.toCode()](https://networktocode.com/) provides a [specific Ansible collection for Nautobot](https://galaxy.ansible.com/ui/repo/published/networktocode/nautobot/). I needed a way to use Nautobot as an Ansible [[Ansible inventory|inventory]] without building one from scratch.

The [plugin documentation](https://nautobot-ansible.readthedocs.io/en/latest/plugins/inventory_inventory.html) is a good starting point and includes examples.

The challenge is defining a data structure that includes:

* The Ansible-specific parameters (`ansible_connection`, `ansible_network_os`, `ansible_host`, `ansible_user`, `ansible_ssh_pass`).
* A group that identifies the devices.
* A list of interfaces, with a profile for each device.

There are three options:

* The inventory contains all the necessary information from Nautobot.
* The playbook defines the information, except for the group with the correct variables.
* A mix of both.

I chose to move the information to Nautobot, to experiment with [custom fields](https://docs.nautobot.com/projects/core/en/v1.1.6/additional-features/custom-fields/). In practice, usernames and passwords are stored in a [[Password Management with Ansible|vault]]; for simplicity, I hardcoded them in the playbook.

After testing, I found the correct combination. Two custom fields map to variables:

```yaml
compose:
  ansible_connection: custom_fields.connection
  ansible_network_os: custom_fields.network_os
```

Each device is associated with three groups, based on its attributes:

```yaml
keyed_groups:
- key: device_types
  prefix: type
- key: manufacturers
  prefix: manufacturers
- key: location
  prefix: location
```

`compose` and `keyed_groups` are standard Ansible features, and they required some trial and error. I used the following command to test:

```bash
ansible-inventory -i inventory.yml --list
```

## The Ansible Playbook

Creating an optimized Ansible playbook requires experience. I reused a [role I had developed previously](https://github.com/dainok/courses/tree/master/Ansible/17.%20Final%20lab/roles/cisco_ios_interface_profile) with slight modifications.

First, I read the configuration from Nautobot and created two data structures:

* `interface_profiles`: maps the interfaces to the profiles.
* `interface_cfgs`: contains the data structure for the [ios_interfaces module](https://docs.ansible.com/ansible/latest/collections/cisco/ios/ios_interfaces_module.html).

This approach was necessary because the [ios_l2_interfaces module](https://docs.ansible.com/ansible/latest/collections/cisco/ios/ios_l2_interfaces_module.html) does not support all the parameters we need. The solution was to use the [ios_config module](https://docs.ansible.com/ansible/latest/collections/cisco/ios/ios_config_module.html) for the configuration of the interface and `ios_interfaces` for the specific parameters (`description` and `status`).

The result is a simple list of CLI commands that any network engineer can read and modify:

```yaml
lines:
- switchport access vlan 53
- switchport voice vlan 54
- no cdp enable
- no lldp receive
- no lldp transmit
- spanning-tree bpduguard enable
- spanning-tree portfast edge
- switchport mode access
- switchport nonegotiate
```

I used [Jinja](https://jinja.palletsprojects.com/en/) to create the data structure, for better performance:

```yaml
ansible.builtin.set_fact:
  interface_profiles: >-
    {
      {% for interface_name, profile in interface_profiles.items() %}
        {% if interface_name == interface_limit %}
          "{{ interface_name }}": "{{ profile }}",
        {% endif %}
      {% endfor %}
    }
```

We verify the data structure as JSON with the `debug` module, to avoid issues such as missing commas:

```text
ok: [MGMTSWITCH1] => {
"msg": "{\n\"GigabitEthernet1/0/44\": \"interface_access\"\n\"GigabitEthernet1/0/45\": \"
interface_isl\"\n\"GigabitEthernet1/0/47\": \"interface_trunk\"\n}"

}
```

Once corrected:

```text
ok: [MGMTSWITCH1] => {
    "msg": {
        "GigabitEthernet1/0/44": "interface_access",
        "GigabitEthernet1/0/45": "interface_isl",
        "GigabitEthernet1/0/47": "interface_trunk"
    }
}
```

The next step is to enable the execution of the playbook for a specific interface:

```bash
./playbook-interface-configuration.yml --extra-vars interface_limit=GigabitEthernet1/0/47
```

I cleaned the data structures to keep only the filtered element. The association of the profile is done with `include_tasks`, which is optimal for network engineers who deal with a profile for each interface.

Finally, `description` and the status of the interface are configured with the `ios_interfaces` module, which simplifies the management of the `shutdown` and `no shutdown` commands.
