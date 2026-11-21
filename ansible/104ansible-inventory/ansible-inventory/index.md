---
cover: ansible
date: 2024-08-02
tags:
- ansible
- beginner
---
The inventory is the [[Leveraging Nautobot as a SSOT|source of truth]] for the information Ansible uses to connect to devices. It also allows defining variables at the host or group level. In advanced scenarios, variables can define all the infrastructure parameters, such as interfaces, IP addresses and router IDs.

Ansible supports both static and dynamic inventories. A static inventory is a file in INI or YAML format, while a [[Integrating Ansible with Nautobot|dynamic inventory]] is an executable that prints JSON to standard output.

We must also select the correct [protocol](https://cn-ansibledoc.readthedocs.io/zh-cn/latest/network/getting_started/network_differences.html#multiple-communication-protocols) to communicate with the remote devices and the correct [platform](https://cn-ansibledoc.readthedocs.io/zh-cn/latest/network/user_guide/platform_index.html#platform-options) for each device. In the examples that follow, we connect to Cisco IOS devices, which require running commands over an SSH connection. We therefore need to set:

* `ansible_connection: ansible.netcommon.network_cli`, indicating that we use the CLI over an SSH channel;
* `ansible_network_os: cisco.ios.ios`, indicating that we use the module written for Cisco IOS devices.

Initially, we assume that we can log in with a privileged user. We will address how to manage non-privileged users later.

## Static Inventory in INI Format

The static inventory in INI format has the following structure:

```ini
[all]
r1.example.com ansible_host=169.254.1.21

[routers]
r[1:9].example.com

[routers:vars]
ansible_user=admin
ansible_ssh_pass=cisco
ansible_connection=ansible.netcommon.network_cli
ansible_network_os=cisco.ios.ios
```

All devices belong to the group **all** and can then be added to other groups. We can also define variables at the `host` or `group` level.

We can verify the correctness of our inventory with the following command:

```bash
ansible-inventory -i inventory.ini --list
```

## Static Inventory in YAML Format

The static inventory in YAML format has the following structure:

```yaml
all:
  hosts:
    r1.example.com:
      ansible_host: 169.254.1.21

routers:
  hosts:
    r[1:9].example.com:
  vars:
    ansible_user: admin
    ansible_ssh_pass: cisco
    ansible_connection: ansible.netcommon.network_cli
    ansible_network_os: cisco.ios.ios
```

We can verify the correctness of our inventory with the following command:

```bash
ansible-inventory -i inventory.yml --list
```

## Dynamic Inventory in JSON Format

As described earlier, a dynamic inventory must write the inventory to standard output, in JSON format, with the following structure:

```json
{
    "_meta": {
        "hostvars": {
            "r1.example.com": {
                "ansible_host": "169.254.1.21"
            }
        }
    },
    "routers": {
        "hosts": [
            "r1.example.com"
        ],
        "vars": {
            "ansible_connection": "ansible.netcommon.network_cli",
            "ansible_network_os": "cisco.ios.ios",
            "ansible_ssh_pass": "cisco",
            "ansible_user": "admin"
        }
    }
}
```

Now suppose that our inventory is stored in the following CSV file:

```csv
FQDN;IP Address;Groups
r1.example.com;169.254.1.21;routers
r2.example.com;169.254.1.22;routers
sw1.example.com;169.254.1.101;switches,core
sw2.example.com;169.254.1.102;switches,core
sw3.example.com;169.254.1.103;switches,access
sw4.example.com;169.254.1.104;switches,access
sw5.example.com;169.254.1.105;switches,access
sw6.example.com;169.254.1.106;switches,access
```

We can write a simple Python script that creates the inventory dynamically. First, let's create the inventory structure:

```python
inventory = {
    "_meta": {
        "hostvars": {},
        "vars": {
            "ansible_connection": "ansible.netcommon.network_cli",
            "ansible_network_os": "cisco.ios.ios",
        },
    },
    "routers": {
        "hosts": [],
        "vars": {"ansible_ssh_pass": "cisco", "ansible_user": "admin"},
    },
    "switches": {
        "hosts": [],
        "vars": {"ansible_ssh_pass": "cisco", "ansible_user": "admin"},
    },
    "core": {
        "hosts": [],
    },
    "access": {
        "hosts": [],
    },
}
```

For now we do not worry about security: handling passwords is deferred to a later lesson.

Next, we read the CSV file line by line:

```python
with open(INVENTORY_CSV, "r") as fh:
    csv_reader = csv.reader(fh, delimiter=";", dialect="excel")
    next(csv_reader, None)  # skip first row (header)

    for row in csv_reader:
        # Parse each row
```

For each row, we populate the structure described earlier:

```python
fqdn = row[0]
ip_address = row[1]
groups = row[2].split(",")

# Add device to group "all"
inventory["_meta"]["hostvars"][fqdn] = {"ansible_host": ip_address}

for group in groups:
    # Add device to group
    inventory[group]["hosts"].append(fqdn)
```

Finally, we print the inventory in a readable format to standard output:

```python
# Print inventory
print(json.dumps(inventory, sort_keys=True, indent=2))
```

We can verify the correctness of our inventory with the following command:

```bash
python3 inventory.py
ansible-inventory -i inventory.py --list
```

This provides a flexible and scalable way to manage inventories for network automation with Ansible.

The inventories used in this article can be downloaded from [GitHub](https://github.com/dainok/courses/tree/master/Ansible/04.%20Inventory).
