---
cover: servicenow
date: 2026-05-10
tags:
- advanced
- ansible
- servicenow
---
In this post, we process ServiceNow requests in pull mode, through periodic polling.

The first step is to retrieve all the RITMs that are still in the open state, that is, not yet taken over.

```python
def get_ritms(category=None):
    """Get active RITMs for a specific category."""
    url = f"{SN_INSTANCE}/api/now/table/sc_req_item"
    params = {
        "sysparm_query": f"state={STATE_MAP.get('open')}",
        "sysparm_fields": "sys_id,state,number,variables,cat_item,sc_item_option"
    }
    if category:
        params["sysparm_query"] += f"^cat_item={CATALOG_MAP[category]}"

    r = requests.get(url, auth=AUTH, params=params)
    r.raise_for_status()
    return r.json()["result"]
```

The field values in ServiceNow are not plain strings but integers that reference entries in lookup tables. To handle this cleanly, we define a set of maps for the states of the items and for the catalog entries.

```python
STATE_MAP = {
    "open": 1,
    "work_in_progress": 2,
    "closed_complete": 3,
    "closed_incomplete": 4,
}

CATALOG_MAP = {
    "network_request": "8ea0b64593908710be22fd245d03d61b",
    "whitelist_request": "e91336da4fff0200086eeed18110c7a3",
}
```

More dynamic solutions exist, but for this experiment static maps are more than adequate.

For each RITM, we retrieve the associated variables in two steps: first we fetch the IDs of the variables used in the request, then we resolve them to their actual values.

```python
def get_ritm_variables(ritm_sys_id):
    url = f"{SN_INSTANCE}/api/now/table/sc_item_option_mtom"
    params = {
        "sysparm_query": f"request_item={ritm_sys_id}",
        "sysparm_fields": "sc_item_option",
        "sysparm_limit": 100,
    }
    r = requests.get(url, auth=AUTH, params=params)
    r.raise_for_status()
    option_ids = [
        item["sc_item_option"]["value"]
        for item in r.json()["result"]
    ]

    # Get all RITM variables
    variables = {}
    ids_query = "^ORsys_id=".join(option_ids)
    url = f"{SN_INSTANCE}/api/now/table/sc_item_option"
    params = {
        "sysparm_query": f"sys_id={ids_query}",
        "sysparm_fields": "item_option_new.name,item_option_new.question_text,value",
        "sysparm_display_value": "all",
        "sysparm_limit": 100,
    }
    r = requests.get(url, auth=AUTH, params=params)
    r.raise_for_status()
    for item in r.json()["result"]:
        name  = item.get("item_option_new.name", {}).get("value", "")
        value = item.get("value", {}).get("display_value", "")
        if name:
            variables[name] = value

    return variables
```

Once we have the RITM and its variables, we mark the item as **Work in Progress**.

```python
def update_ritm(ritm_sys_id, state, output=None):
    """Update RITM."""
    url = f"{SN_INSTANCE}/api/now/table/sc_req_item/{ritm_sys_id}"
    payload = {
        "state": STATE_MAP[state],
    }
    if output:
        payload["work_notes"] = output

    requests.patch(url, json=payload, auth=AUTH)

    # Close REQ if all RITMs are closed
    req_sys_id = get_req_from_ritm(ritm_sys_id)
    ritm_list = get_all_ritm_from_req(req_sys_id)
    if all_ritm_closed(ritm_list):
        close_req(req_sys_id)
```

We then pass the variables to the Ansible [[Ansible Playbooks and variables|playbook]] for execution.

```python
# Run Ansible
result = run_ansible_network(**variables)
rc = result.rc
stdout = result.stdout.read()
stderr = result.stderr.read()
if rc == 0:
    update_ritm(sys_id, "closed_complete", stdout)
else:
    update_ritm(sys_id, "closed_incomplete", stdout + "\n" * 3 + stderr)
```

Finally, we update the ticket based on the outcome of the playbook run. Whether it succeeds or fails, the Ansible output is attached to the ticket as a work note.

![[servicenow-ticket-comments-1.png]]

The full script is available in the [GitHub repository](https://github.com/dainok/courses/tree/master/Various/ServiceNow).
