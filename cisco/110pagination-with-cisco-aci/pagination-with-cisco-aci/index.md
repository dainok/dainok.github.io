---
cover: cisco
date: 2026-01-18
tags:
- aci
- cisco
- intermediate
---
When we deal with a large number of records, we need pagination. By default, Cisco ACI pagination lets us retrieve up to **500 objects**. A maximum value is not explicitly [documented](https://www.cisco.com/c/en/us/td/docs/dcn/aci/apic/all/apic-rest-api-configuration-guide/cisco-apic-rest-api-configuration-guide-42x-and-later/m_using_the_rest_api.html#concept_ACBD6DDCEDE64FCF9DAE8134123C8F3C), but going beyond this limit is not recommended, to avoid overloading the APIC.

Pagination is controlled with the following parameters:

* `page-size`: defines the size of each page.
* `page`: defines which page to retrieve, starting from 0.

The response includes the `totalCount` attribute, which indicates the total number of objects available for the specific query.

To use pagination correctly, each page should be requested only when it is actually needed. We can do this with `yield`, which returns one object at a time and suspends the iteration until the next request.

```python
def fetch_objects(class_name, page_size=10):
    page = 0
    while True:
        url = f"https://{apic_address}/api/class/{class_name}.json?page-size={page_size}&page={page}"
        res = session.get(url, verify=False)
        res.raise_for_status()
        items = res.json().get("imdata", [])
        if not items:
            # No more data
            break
        for item in items:
            # Return one object
            yield item
        # Next page
        page += 1
```

We can retrieve the list of interfaces with:

```python
interface_list = fetch_objects("l1PhysIf")
```

No API call is made, however, until we actually start using `interface_list`. The API calls are performed progressively while we iterate over the list, so we spread them out and execute them only when necessary.

Keep in mind that `interface_list` can be used only once. If we want to reuse it several times, we must convert the generator into a list:

```python
leaf_list = list(fetch_objects("fabricNode"))
```

We can now use what we built to write a simple script that prints all the interfaces:

```python
# Get leaves

leaf_list = list(fetch_objects("fabricNode"))

# Get interfaces

interface_list = fetch_objects("l1PhysIf")

for interface in interface_list:
    interface_attrs = interface["l1PhysIf"]["attributes"]
    m = re.search(r"topology/pod-(\d+)/node-(\d+)/.*?/.*", interface_attrs["dn"])
    pod_id, leaf_id = m.groups()
    leaf_name = None
    for leaf in leaf_list:
        leaf_attribute = leaf["fabricNode"]["attributes"]
        if leaf_id == leaf_attribute["id"]:
            leaf_name = leaf_attribute["name"]
    data.append([
        pod_id, # PodID
        leaf_id, # LeafID
        leaf_name, # LeafName
        interface_attrs["id"], # Interface
        interface_attrs["adminSt"], # Admin
        interface_attrs["autoNeg"], # AutoNeg
        interface_attrs["descr"], # Description
    ])
```

The full example code is available in the [GitHub repository](https://github.com/dainok/courses/tree/master/Cisco/ACI).
