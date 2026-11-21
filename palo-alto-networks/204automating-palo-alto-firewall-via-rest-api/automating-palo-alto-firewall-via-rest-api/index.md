---
cover: paloalto-strata
date: 2025-06-28
tags:
- advanced
- api
- firewall
- palo-alto-networks
---
Palo Alto Networks firewalls were originally designed around XML APIs. The JSON-based REST APIs were introduced later, so their implementation is currently incomplete and, as we will see, prone to certain errors. As noted earlier, the API documentation is available directly on the firewall at `https://172.25.10.4/restapi-doc`.

My recommendation is to use the REST API only for specific, well-tested tasks. In all other cases, it is preferable to rely on the [[Automating Palo Alto Firewall via XML API|XML API]].

## Configuration Commands via REST API

Currently, we can use the REST APIs only for configuration tasks. All the other operations, including the commit, must still be performed with the XML API.

Let's take the same example of the previous section and create the two DNS servers of Google on the firewall. The REST API documentation is more comprehensive, but it is sometimes incomplete and not always easy to interpret:

![[pan-os-rest-api-documentation.png]]

If we use the API without reading the documentation carefully, we receive the following error:

```text
{"code":3,"message":"Missing Query Parameter: name","details":[{"@type":"CauseInfo","causes":[{"code":7,"module":"pan_api","description":"Missing Query Parameter: name"}]}]}
```

Here is a working example:

```python
# Create elements
for name, ip in addresses.items():
    url = f"https://172.25.10.4/restapi/v10.2/Objects/Addresses?name={name}&location=vsys&vsys=vsys1"
    data = {
        "entry": {
            "@name": name,
            "ip-netmask": ip,
        },
    }
    req = requests.post(url, json=data, headers=headers, verify=False)
    req.raise_for_status()
```

The documentation lists the query parameters, but the examples often omit them. In particular:

* The URL must include both the `name` and `location` parameters. If the location is `vsys`, we must also specify the `vsys` name.
* The payload is sent via a POST request together with the required parameters. Its structure is similar to the XML example shown earlier.
* The token is passed in the `X-PAN-KEY` header.
* If the payload or the parameters are incorrect, the HTTP status code is 400.

We also note a redundancy: the `name` parameter is used in both the URL and the request body.

The script is available in the [GitHub repository](https://github.com/dainok/courses/tree/master/Palo%20Alto%20Networks/Strata).

## Removing Default Configuration via REST API

Let's now remove the default configuration with the REST API. The script is relatively simple, but we first need to identify the appropriate API endpoints. The documentation is available locally on the firewall at `https://172.24.1.34/restapi-doc/`.

These are the APIs to call with the DELETE method:

```python
urls = [
    f"{base_url}/Policies/SecurityRules?name=rule1&location=vsys&vsys=vsys1",
    f"{base_url}/Network/VirtualWires?name=default-vwire",
    f"{base_url}/Network/Zones?name=trust&location=vsys&vsys=vsys1",
    f"{base_url}/Network/Zones?name=untrust&location=vsys&vsys=vsys1",
    # f"{base_url}/Network/EthernetInterfaces?name=ethernet1/1", # Validation error
    # f"{base_url}/Network/EthernetInterfaces?name=ethernet1/2", # Validation error
]
```

Finding the correct API for the zone deletion took some time, because it is not documented. The last two API calls generate an error that does not occur in the web interface:

```text
{"code":9,"message":"Reference Not Zero","details":[{"@type":"CauseInfo","causes":[{"code":10,"module":"panui_mgmt","description":"Reference Not Zero: ethernet1\/1 cannot be deleted because of references from:. import -> network -> interface. import -> network -> interface. import -> network -> interface. import -> network -> interface."}]}]}
```

As a result, the script lacks part of the logic compared to what we do via CLI or the web interface. This happens because the REST APIs are effectively a wrapper over the XML API, and this layer still has limitations and bugs. The final script remains simple nonetheless:

```python
# Defining API
base_url = "https://172.24.1.34/restapi/v10.2"
urls = [
    f"{base_url}/Policies/SecurityRules?name=rule1&location=vsys&vsys=vsys1",
    f"{base_url}/Network/VirtualWires?name=default-vwire",
    f"{base_url}/Network/Zones?name=trust&location=vsys&vsys=vsys1",
    f"{base_url}/Network/Zones?name=untrust&location=vsys&vsys=vsys1",
    # f"{base_url}/Network/EthernetInterfaces?name=ethernet1/1", # Validation error
    # f"{base_url}/Network/EthernetInterfaces?name=ethernet1/2", # Validation error
]
# Deleting objects
for url in urls:
    req = requests.delete(url, headers=headers, verify=False)
    # req.raise_for_status()
```

The script is available in the [GitHub repository](https://github.com/dainok/courses/tree/master/Palo%20Alto%20Networks/Strata).
