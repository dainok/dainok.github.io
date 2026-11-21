---
cover: paloalto-strata
date: 2025-06-14
tags:
- beginner
- firewall
- netmiko
- palo-alto-networks
---
The first method we discuss is screen scraping, a topic already covered in previous posts. We use screen scraping to automate devices that are designed to be managed via CLI and have no APIs that cover all the scenarios we are interested in. It is commonly used with network devices.

As we will see, Palo Alto Networks firewalls offer XML-based APIs that make screen scraping less attractive, except in very specific cases.

On Palo Alto Networks firewalls, screen scraping can be useful to perform specific monitoring and troubleshooting actions.

Let's look at a couple of examples.

The first example is a request from a client several years ago. The client wanted a device locator that identifies the location of a device based on its MAC address or IP address. We needed to gather the MAC address table and the ARP table from all the devices. For the ARP table, we retrieved the output of the `show arp all` command and converted it into a machine-readable format (parsing): this is screen scraping.

![[show-arp-output.png]]

We use two tools:

* [netmiko](https://github.com/ktbyers/netmiko) to connect to the devices, execute the command and collect the output.
* [NTC Templates](https://github.com/networktocode/ntc-templates/tree/master) to transform the output into JSON.

The sample script is quite simple:

* It defines the data needed to connect to the device.
* It defines the command to execute.
* It connects to the device, sends the command and uses [[Contributing to NTC Templates with Git and GitHub|NTC Templates]] to structure the output.

```python
device = {
    "device_type": "paloalto_panos",
    "ip": "172.25.10.4",
    "username": "admin",
    "password": getpass(),
    "fast_cli": False,
}
net_connect = ConnectHandler(**device)
result = net_connect.send_command("show arp all", use_textfsm=True)
```

Netmiko offers a wide range of connectors to manage different devices. The device must specify a type that combines the vendor and the operating system. The full list is available in the [GitHub source](https://github.com/ktbyers/netmiko/tree/develop/netmiko). In our case, we selected `paloalto_panos`.

Generally, we do not need to specify additional options, but there still seems to be a [bug](https://github.com/ktbyers/netmiko/issues/2864) in prompt recognition. With screen scraping, it is normal to run into anomalies caused by the interpretation of the output.

Finally, we use [NTC Templates](https://github.com/networktocode/ntc-templates/) to transform the text into JSON. We can use NTC Templates by installing the Python package:

```bash
pip install ntc-templates
```

Or by using a local repository and setting the `NET_TEXTFSM` environment variable:

```bash
export NET_TEXTFSM=/Users/dainese/src/ntc-templates/ntc_templates/templates
```

The output of the script is as follows:

![[ntc-template-output.png]]

In this specific case, the output was added to a database, which, through a web interface, let the user find the location of a specific MAC address.

The script is available on [GitHub](https://github.com/dainok/courses/tree/master/Palo%20Alto%20Networks/Strata).

## Configuration Commands with Netmiko

We can use Netmiko for some basic configurations. For example, we can remove the default configuration or add basic settings (NTP, DNS, etc.). Netmiko may be simpler to implement and maintain than a full Python script.

Let's look at a simple script that deletes the default configuration:

```python
commands = [
    'delete rulebase security rules "rule1"',
    "delete network virtual-wire default-vwire",
    "delete zone trust network virtual-wire",
    "delete zone untrust network virtual-wire",
    "delete network interface ethernet ethernet1/1 virtual-wire",
    "delete network interface ethernet ethernet1/2 virtual-wire",
    "delete zone trust",
    "delete zone untrust",
    "delete network interface ethernet ethernet1/1",
    "delete network interface ethernet ethernet1/2",
    "commit",
]
net_connect = ConnectHandler(**device)
net_connect.send_config_set(commands)
net_connect.disconnect()
```

The script is available on [GitHub](https://github.com/dainok/courses/tree/master/Palo%20Alto%20Networks/Strata).
