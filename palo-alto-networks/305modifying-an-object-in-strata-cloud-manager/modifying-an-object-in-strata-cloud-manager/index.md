---
cover: paloalto-strata
date: 2025-09-28
tags:
- intermediate
- palo-alto-networks
- scm
---
This example is particularly relevant because it directly affects operational workflows.

Before diving into it, let's review the **HTTP methods** used in REST APIs. HTTP defines five default methods that map to the CRUD operations: **Create, Read, Update, Delete**:

* `GET`: retrieve a resource.
* `POST`: create a new resource.
* `DELETE`: remove a resource.
* `PUT` and `PATCH`: update an existing resource.

The difference between `PUT` and `PATCH` is crucial:

* `PATCH` updates only the specified fields.
* `PUT` replaces the entire resource with the provided fields.

## Example: Updating Interface Comments

As an example, let's modify the comment of the interfaces associated with a firewall.

Note that the SCM APIs implement only the `PUT` method: `PATCH` is not supported.

This means we cannot update a single attribute, such as the comment, on its own.

```python
# Edit comment (WRONG)
interface_details = {
    "comment": f"{interface_name} managed via API ({api_timestamp})"
}
req = client.put(interface_url, json=interface_details)
req.raise_for_status()
```

If we set only the comment field with `PUT`, the interface is reset to its default settings and only the comment is preserved. This happens because `PUT` overwrites the resource entirely with the supplied data.

## Workaround for the Missing PATCH Method

Since `PATCH` is unavailable, the correct approach is to:

* **Retrieve** the full interface structure with `GET`.
* **Modify** the desired attribute (in this case, the comment).
* **Apply** the updated structure back with `PUT`.

```python
# Get interface details
interface_url = f"/config/network/v1/ethernet-interfaces/{interface_id}"
req = client.get(interface_url)
req.raise_for_status()
interface_details = req.json()

# Edit comment
interface_name = interface_details["name"]
interface_details["comment"] = f"{interface_name} managed via API ({api_timestamp})"
req = client.put(interface_url, json=interface_details)
req.raise_for_status()
```

The full example code is available in the [GitHub repository](https://github.com/dainok/courses/tree/master/Palo%20Alto%20Networks/Strata%20Cloud%20Manager).
