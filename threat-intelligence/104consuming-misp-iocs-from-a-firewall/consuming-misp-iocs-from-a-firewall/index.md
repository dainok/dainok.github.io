---
cover: misp
date: 2025-05-24
tags:
- firewall
- intermediate
- misp
- threat-intelligence
---
Once our MISP instance is configured, it contains threat intelligence data that prevention tools such as firewalls and email gateways can use.

Let's see how to extract IoCs from MISP. Specifically, we create a list of IP addresses that perimeter systems block proactively.

Modern firewalls can ingest [External Dynamic Lists (EDLs)](https://docs.paloaltonetworks.com/pan-os/11-0/pan-os-admin/policy/use-an-external-dynamic-list-in-policy/external-dynamic-list), which are text files, hosted on web servers, that contain lists of IP addresses. We can reference these lists in security policies to take specific actions.

The number of IP addresses that EDLs can manage might seem substantial, but the limits are relatively low compared to [the global volume of IP-based IoCs](https://iplists.firehol.org/).

![[global-unique-ips.png]]

This shows why we must manage IoCs in a structured way, with particular attention to their lifecycle.

## Native Export

MISP natively supports exporting attributes in multiple formats. Under `Event Actions` → `Export`, we can generate IoC lists in various formats:

![[misp-ioc-generators.png]]

Further down the page, we can immediately retrieve the lists of IoCs for a specific attribute type in plain text:

![[misp-attribute-filters.png]]

For instance, clicking `ip-dst` returns a file with all the `ip-dst` attributes marked as exportable for IDS purposes.

As discussed, however, the list might exceed the limits of our firewall. We therefore need more control over the export process.

## Export via API

By building our own IoC export mechanism, we gain control over the number, type, date and format of the indicators.

We want a list of all the IP-type IoCs, with a limited number of entries, and we want the most recent ones first. The request looks simple, but fulfilling it requires a robust lifecycle management of the IoCs, which is a non-trivial task. Consider, for example, an IP address related to a C2 server:

* When can we consider it obsolete?
* How do we define it as obsolete?
* Can an obsolete IP become relevant again? How do we handle this case?

In this post, we assume that the lifecycle of the IoCs is already managed properly, and we focus only on the automation process.

Our goal is to generate a list of IP addresses (both `ip-src` and `ip-dst`), limit the total number and prioritize the most recent entries.

We use the [restSearch](https://www.misp-project.org/openapi/#tag/Attributes) API, which provides paginated lists of attributes based on the specified parameters.

The request is a POST with the following parameters:

```python
data = {
    "controller": "attributes",
    "type": ["ip-src", "ip-dst"],
    "to_ids": True,
    "deleted": False,
    "timestamp": last_days_unix,
    "order": "timestamp desc",
    "limit": config["export"]["last_ioc"],
}
url = f"{config['misp']['url']}/attributes/restSearch"
req = requests.post(url, json=data, **params_post)
req.raise_for_status()
```

We then parse the output into a plain-text list of unique IP addresses:

```python
for item in req.json()["response"]["Attribute"]:
    if item["value"] not in ip_list:
        ip_list.append(item["value"])
ioc_page = "\n".join(ip_list).encode("utf-8")
```

The full script is available in the GitHub repository. When we run it, it provides the IoC list in plain text via HTTP:

```bash
./get_ioc_to_edl_api.py
```

```text
Most recent IoC:  Wed May 14 15:38:15 2025
Most old IoC:     Wed Nov 27 09:37:03 2024
Exporting 2549 IP addresses
Webserver started on port 8080
127.0.0.1 - - [17/May/2025 10:31:50] "GET / HTTP/1.1" 200 -
127.0.0.1 - - [17/May/2025 10:31:50] "GET /favicon.ico HTTP/1.1" 200 -
127.0.0.1 - - [17/May/2025 10:32:01] "GET / HTTP/1.1" 200 -
127.0.0.1 - - [17/May/2025 10:32:01] "GET /favicon.ico HTTP/1.1" 200 -
```

![[edl-web-page.png]]

Generating the list consumes time and computing resources of the MISP server. In production environments, it is advisable to update the list on an event-driven or scheduled basis and to populate a cache file that we then serve to the security tools.

## Export via SDK

We can generate the same list with PyMISP. The code is very similar to the API-based approach:

```python
res = misp.search(
    controller="attributes",
    type_attribute=["ip-src", "ip-dst"],
    # to_ids=True, # Filter not working
    deleted=False,
    timestamp=last_days_unix,
    order="timestamp desc", # Filter not working asc/desc
    limit=config["export"]["last_ioc"],
    pythonify=False,
)
```

In my tests, however, I ran into some issues: the `to_ids` filter does not seem to work correctly, and neither does the sorting. The sorting issue directly affects the ability to retrieve the most recent IoCs.

At the moment, I prefer the API-based approach.

Both scripts are available in the [GitHub repository](https://github.com/dainok/courses/tree/master/Various/MISP).
