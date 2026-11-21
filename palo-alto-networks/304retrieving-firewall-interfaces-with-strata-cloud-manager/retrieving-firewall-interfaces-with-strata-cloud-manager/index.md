---
cover: paloalto-strata
date: 2025-09-21
tags:
- beginner
- firewall
- palo-alto-networks
- scm
---
Let's look at a second example that illustrates both the functionality and the complexity of the SCM APIs.

In this scenario, we want to retrieve the **Ethernet interfaces** of the firewalls. A quick search in the documentation leads us to the correct [API endpoint](https://pan.dev/scm/api/config/ngfw/network/list-ethernet-interfaces/).

With the custom class we created earlier, the code is straightforward:

```python
# Get interfaces
req = client.get(f"/config/network/v1/ethernet-interfaces")
req.raise_for_status()
interfaces = req.json()
pprint(interfaces)
```

This, however, returns no results.

## Understanding API Parameters

The documentation shows that we can specify certain parameters, although they are not mandatory.

Logically, requesting a list of interfaces without specifying the target firewall is incomplete. It also makes sense to identify the firewall by its `ID` rather than its hostname, because hostnames can change.

If we adapt the code to request the interfaces of each device ID, we get:

```python
# Get devices
req = client.get("/config/setup/v1/devices")
req.raise_for_status()
devices = req.json()

# For each device, get interfaces
for device in devices["data"]:
    device_id = device["id"]
    device_hostname = device["hostname"]

    req = client.get(f"/config/network/v1/ethernet-interfaces?device={device_id}")
    req.raise_for_status()
    interfaces = req.json()
```

## Final Output

With this change, the script works as expected and produces the following output:

![[pan-interface-table.png]]

The full example code is available in the [GitHub repository](https://github.com/dainok/courses/tree/master/Palo%20Alto%20Networks/Strata%20Cloud%20Manager).
