---
cover: cisco
date: 2026-01-11
tags:
- aci
- api
- cisco
- intermediate
---
Previously, we created a simple script that prints a table of the CDP neighbors of all the interfaces in the fabric. While writing it, we realized that it could be optimized.

To optimize the script, we need to change the way we retrieve the data.

The class used to get the fabric nodes is `fabricNode`. Let's open Visore and run a query with `role == leaf`:

![[aci-visore-3.png]]

In the address bar, we can see that parameters have been added to filter the query. To get the same effect with the APIs, we call this URL:

```text
https://172.25.82.1/api/class/fabricNode.json?query-target-filter=and(eq(fabricNode.role,"leaf"))
```

We queried the objects of the `fabricNode` class, filtering the nodes where `role == leaf`.

We can build our filters with different functions. The most common are:

* `eq(attr, val)` → equals.
* `ne(attr, val)` → not equal.
* `like(attr, "pattern")` → pattern matching.

These functions can be combined with:

* `and(...)`.
* `or(...)`.

Now we can improve our script that shows the CDP neighbors by querying just two [[Cisco ACI Classes|classes]]: `fabricNode` and `cdpAdjEp`. We can then combine the two results as follows:

```python
# Print output

for neighbor in neighbor_list:
    m = re.search(r"topology/pod-(\d+)/node-(\d+)/.*?/if-\[([^\]]+)\]", neighbor["dn"])
    pod_id, leaf_id, interface_id = m.groups()
    leaf_id = int(leaf_id)
    leaf_name = None
    for leaf in leaf_list:
        if leaf["id"] == leaf_id:
            leaf_name = leaf["name"]

    data.append([
        pod_id, # PodID
        leaf_id, # LeafID
        leaf_name, # LeafName
        interface_id, # Interface
        neighbor["devId"], # RemoteName
        neighbor["portId"], # RemoteInterface
    ])

print(tabulate(data, headers=headers))
```

The second version of the script is **13× faster**.

The full example code is available in the [GitHub repository](https://github.com/dainok/courses/tree/master/Cisco/ACI).
