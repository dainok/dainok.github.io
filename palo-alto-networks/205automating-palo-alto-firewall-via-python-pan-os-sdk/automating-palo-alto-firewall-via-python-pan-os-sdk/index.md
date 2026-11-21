---
cover: paloalto-strata
date: 2025-07-05
tags:
- advanced
- firewall
- palo-alto-networks
---
In previous posts, we explored how to automate some operations on Palo Alto Networks firewalls by using the [[Automating Palo Alto Firewall via XML API|XML API]] and the REST API directly. According to the [official documentation](https://pan.dev/panos/docs/), ready-to-use libraries are available for several programming languages (PHP, Go, Python).

I believe Python is the most suitable language to write automations and integrations, so we focus on the Python SDKs. Two libraries are available:

* [pan-python](https://github.com/kevinsteves/pan-python): developed and maintained personally by Kevin Steves. It allows low-level operations on PAN-OS systems.
* [pan-os-python](https://pan.dev/panos/docs/panospython/): developed and maintained officially by Palo Alto Networks. It enables high-level interaction with firewalls and Panorama, similar to the CLI or the Web interface. It depends on specific versions of [[Automating Palo Alto Firewall via Python PAN SDK|pan-python]] and is not compatible with the latest one.

The [documentation](https://pan-os-python.readthedocs.io/en/latest/howto.html) is available online, and the relationships between the APIs are [described](https://pan-os-python.readthedocs.io/en/latest/reference.html) through diagrams.

On some systems, we may encounter the following error:

```text
from distutils.version import LooseVersion # Used by PanOSVersion class ModuleNotFoundError: No module named 'distutils'
```

In this case, we need to install a specific version of `setuptools`:

```bash
pip install 'setuptools>=75.1.0'
```

The library organizes its methods into the following modules:

* [base](https://pan-os-python.readthedocs.io/en/latest/module-base.html)
* [device](https://pan-os-python.readthedocs.io/en/latest/module-device.html)
* [errors](https://pan-os-python.readthedocs.io/en/latest/module-errors.html)
* [firewall](https://pan-os-python.readthedocs.io/en/latest/module-firewall.html)
* [ha](https://pan-os-python.readthedocs.io/en/latest/module-ha.html)
* [network](https://pan-os-python.readthedocs.io/en/latest/module-network.html)
* [objects](https://pan-os-python.readthedocs.io/en/latest/module-objects.html)
* [panorama](https://pan-os-python.readthedocs.io/en/latest/module-panorama.html)
* [plugins](https://pan-os-python.readthedocs.io/en/latest/module-plugins.html)
* [policies](https://pan-os-python.readthedocs.io/en/latest/module-policies.html)
* [predefined](https://pan-os-python.readthedocs.io/en/latest/module-predefined.html)
* [updater](https://pan-os-python.readthedocs.io/en/latest/module-updater.html)
* [userid](https://pan-os-python.readthedocs.io/en/latest/module-userid.html)

## Operational Commands via pan-os-python

Let's revisit the previous example and print the ARP table. According to the [documentation](https://pan-os-python.readthedocs.io/en/latest/getting-started.html), we can use the same syntax as the CLI:

![[pan-os-python-documentation.png]]

Doing so, however, results in the following error:

```text
panos.errors.PanDeviceXapiError: show -> arp -> all has unexpected text. show -> arp is unexpected show is unexpected
```

On closer inspection, we learn that the library translates the CLI syntax into XML. This translation is not available for all the commands, and in such cases we must use the XML format:

![[missing-pan-os-python-translation.png]]

As shown earlier, we can translate commands from the CLI format to the XML format with `debug cli on`.

At this point, the script becomes almost identical to the one shown earlier:

```python
token = getpass("Token: ")
fw = Firewall("172.24.1.34", api_key=token)

# Getting elements
root = fw.op("<show><arp><entry name='all'/></arp></show>", cmd_xml=False)
for entry in root.iterfind(".//result/entries/"):
    interface = entry.find("interface").text
    ip = entry.find("ip").text
    mac = entry.find("mac").text
    print(f"{interface},{ip},{mac}")
```

The library returns an [ElementTree](https://docs.python.org/3/library/xml.etree.elementtree.html) object, which we can handle as discussed before.

The script is available in the [GitHub repository](https://github.com/dainok/courses/tree/master/Palo%20Alto%20Networks/Strata).

## Configuration Commands via pan-os-python

Modifying the configuration of the firewall via SDK becomes simpler once we understand how the library works. Here is an example:

```python
fw = Firewall("172.24.1.34", api_key=token)

# Create elements
for name, ip in addresses.items():
    fw.add(AddressObject(name=name, value=ip, type="ip-netmask")).create()
```

First, the [Firewall](https://pan-os-python.readthedocs.io/en/latest/module-firewall.html) class defines the access parameters. It does not perform any action itself: it only defines the configuration to access the firewall.

Then the [AddressObject](https://pan-os-python.readthedocs.io/en/latest/module-objects.html#panos.objects.AddressObject) class manages the objects of type Address. In the example, we create two `ip-netmask` objects that contain the addresses of the DNS servers of Google. The script updates the configuration but does not commit the changes.

Similarly, we can read the configured objects:

```python
fw = Firewall("172.24.1.34", api_key=token)

# Getting configured elements
for entry in AddressObject.refreshall(fw):
    name = entry.name
    address = entry.value
    location = entry.vsys
    print(f"{name},{address},{location}")
```

In this case, the `refreshall` method retrieves the configuration from the firewall and returns the Address objects section.

The scripts are available in the [GitHub repository](https://github.com/dainok/courses/tree/master/Palo%20Alto%20Networks/Strata).

## Commit via pan-os-python

The Firewall class includes a convenient method to commit the changes. As discussed before, the commit is an asynchronous job: we must wait for its completion and verify the exit code:

```python
fw = Firewall("172.24.1.34", api_key=token)

# Commit
job_id = fw.commit()
if job_id:
    result = fw.syncjob(job_id)
    if not result["success"]:
        print("ERROR: failed to commit.")
```

The script is available in the [GitHub repository](https://github.com/dainok/courses/tree/master/Palo%20Alto%20Networks/Strata).

## Removing Default Configuration via pan-os-python

Finally, let's see how to delete the default configuration with the `pan-os-python` library. With the previous examples, we now understand how the library works. The challenge is identifying the appropriate classes for the different object types:

* [SecurityRule](https://pan-os-python.readthedocs.io/en/latest/module-policies.html#panos.policies.SecurityRule) (child of [Rulebase](https://pan-os-python.readthedocs.io/en/latest/module-policies.html#panos.policies.Rulebase)).
* [VirtualWire](https://pan-os-python.readthedocs.io/en/latest/module-network.html#panos.network.VirtualWire).
* [Zone](https://pan-os-python.readthedocs.io/en/latest/module-network.html#panos.network.Zone).
* [EthernetInterface](https://pan-os-python.readthedocs.io/en/latest/module-network.html#panos.network.EthernetInterface).

Once we identify the correct classes, the script becomes straightforward:

```python
fw = Firewall("172.24.1.34", api_key=token)

# Delete default rule
rulebase = Rulebase.refreshall(fw)
for rule in SecurityRule.refreshall(rulebase):
    if rule.name == "rule1":
        rule.delete()

# Delete default vwire
for vwire in VirtualWire.refreshall(fw):
    if vwire.name == "default-vwire":
        vwire.delete()

# Delete default zones
for zone in Zone.refreshall(fw):
    if zone.name in ["trust", "untrust"]:
        zone.delete()

# Delete default interfaces
for intf in EthernetInterface.refreshall(fw):
    if intf.name in ["ethernet1/1", "ethernet1/2"]:
        intf.delete()
```

The script is available in the [GitHub repository](https://github.com/dainok/courses/tree/master/Palo%20Alto%20Networks/Strata).
