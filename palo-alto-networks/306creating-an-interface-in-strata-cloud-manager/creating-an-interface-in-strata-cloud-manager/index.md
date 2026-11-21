---
cover: paloalto-strata
date: 2025-10-05
tags:
- beginner
- palo-alto-networks
- scm
---
Let's look at the last relevant example: **creating a new interface**.

To create an interface, we use the `POST` method and provide the correct data structure. The challenge is determining what that structure should look like.

Earlier, we decided to adopt a **hybrid approach** and use both the documentation and the web interface to develop our automations.

Following this method, we create an interface in the browser, retrieve its data structure via API and use it as a template.

```json
{
    "comment": "$int-2 managed via API (8b7d5262)",
    "device": "023009004281",
    "id": "52ccaad7-ada5-42d4-b8e1-bd7305ba2abb",
    "layer3": {
        "adjust_tcp_mss": {
            "enable": false
        },
        "interface_management_profile": "mgmt-full",
        "ip": [
            {
                "name": "192.168.1.1/24"
            }
        ],
        "lldp": {
            "enable": false
        }
    },
    "link-duplex": "auto",
    "link-speed": "auto",
    "link-state": "auto",
    "name": "ethernet1/2"
}
```

Once we have the correct payload format, the code is straightforward:

```python
data = {
    "name": interface_name,
    "comment": "Created via API",
    "link-speed": "auto",
    "link-duplex": "auto",
    "link-state": "auto",
    "layer3": {
        "interface_management_profile": interface["mgmt_profile"],
        "ip": [{"name": interface["address"]}],
        "lldp": {"enable": False},
    },
}
req = client.post(
    f"/config/network/v1/ethernet-interfaces?device={device_id}", json=data
)
req.raise_for_status()
```

The full example code is available in the [GitHub repository](https://github.com/dainok/courses/tree/master/Palo%20Alto%20Networks/Strata%20Cloud%20Manager).
