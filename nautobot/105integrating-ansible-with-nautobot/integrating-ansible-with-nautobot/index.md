---
cover: nautobot
date: 2024-07-11
tags:
- ansible
- intermediate
- nautobot
---
Integrating Ansible with Nautobot involves two main aspects:

* Reading information from Nautobot with Ansible.
* Running Ansible [[Ansible Playbooks and variables|playbooks]] to update device configurations.

Let's focus on the first point. To make the information in Nautobot available to Ansible, we need a [dynamic inventory](https://docs.ansible.com/ansible/latest/inventory_guide/intro_dynamic_inventory.html). [Network to Code](https://networktocode.com/) provides a [specific Ansible collection for Nautobot](https://galaxy.ansible.com/ui/repo/published/networktocode/nautobot) that includes an [[Ansible inventory|inventory]] plugin. We can install the [[Ansible Galaxy|collection]] with:

```bash
ansible-galaxy collection install networktocode.nautobot
```

Before configuring the inventory, we make sure the following information is complete in Nautobot for the device:

* The IP address for device access.
* The username and password for device access.
* The connection method Ansible uses to access the device.
* The device interfaces with the associated profiles.

## Configure the Primary IP Address

To configure the management IP address, we follow these steps:

**Create a network prefix:** navigate to `IPAM` → `Prefixes` → `Add`:

![[ipam-add-prefix.png]]

**Create an IP address:** go to `IPAM` → `IP Addresses` → `Add`:

![[ipam-add-ip.png]]

**Associate the IP address with a device interface:** go to `Devices` → `Devices`, select the device, then `Interfaces`, edit the management interface, open `IP Addresses` and select the newly created IP address:

![[associate-device-ip.png]]

**Set the IP address of the interface as the primary address:** go to `Devices` → `Devices`, select the device, then `Primary IPv4` and select the correct IP address:

![[set-interface-ip.png]]

## Device Custom Attributes

Next, we create two custom attributes to define the parameters Ansible uses to connect to the devices.

We go to `Extensibility` → `Custom Fields` and add the `connection` and `network_os` attributes, both associated with the `dcim|device` type:

![[add-custom-fields.png]]

Now we populate the attributes for each device:

* `connection`: `ansible.netcommon.network_cli`.
* `network_os`: `cisco.ios.ios`.

![[set-custom-fields.png]]

## Interface Profiles

We define the profiles to associate with the interfaces. Let's assume we have three profiles initially:

* `access`: for interfaces connecting PCs.
* `isl`: for inter-switch link interfaces.
* `trunk`: for interfaces connecting servers or firewalls.

We go to `Organization` → `Roles` → `Add` and add the three profiles of type `dcim|interface`:

![[add-organization-role.png]]

Finally, we associate some interfaces with the newly defined roles by going to `Devices` → `Devices`, selecting the device and opening `Interfaces`:

![[associate-device-interface.png]]

## Ansible Inventory

We define the Ansible inventory file that reads the configuration from Nautobot. Following the [official documentation](https://nautobot-ansible.readthedocs.io/en/latest/plugins/inventory_inventory.html), we create an `inventory.yml` file that returns the necessary information:

```yaml
plugin: networktocode.nautobot.inventory
api_endpoint: http://localhost:8000
token: <NAUTOBOT_API_TOKEN>
validate_certs: false
config_context: false
interfaces: true
compose:
  ansible_connection: custom_fields.connection
  ansible_network_os: custom_fields.network_os
keyed_groups:
  - key: device_types
    prefix: type
  - key: manufacturers
    prefix: manufacturers
  - key: location
    prefix: location
  - key: device_roles
    prefix: role
```

This simple configuration is not suitable for a production environment, but it allows us to:

* Retrieve a list of devices with the parameters Ansible needs.
* Retrieve the list of interfaces for each device with the associated profile.
* Group devices into groups.

We verify that the inventory works with the following command:

```bash
ansible-inventory -i inventory.yml --list
```

The output should include:

* For each device, the variables `ansible_connection`, `ansible_host` and `ansible_network_os`.
* For each device, the `interfaces` list containing all the interfaces.
* For each interface, the variables `description`, `enabled`, `role` and `status`.

The Ansible inventory can be downloaded from [GitHub](https://github.com/dainok/courses/tree/master/Nautobot/05.%20Integrating%20Ansible%20with%20Nautobot).
