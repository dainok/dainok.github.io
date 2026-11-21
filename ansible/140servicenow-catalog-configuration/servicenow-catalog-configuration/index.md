---
cover: servicenow
date: 2026-04-26
tags:
- advanced
- ansible
- servicenow
---
In this post, we extend the ServiceNow service catalog with a new item to create networks. The example is intentionally simple, but in real environments a thorough analysis of the architecture, the services offered and the existing processes must come first. Automation improves processes: if the processes do not exist yet, that is where the work needs to start.

Open ServiceNow and navigate to `All` → `Service Catalog` → `Catalog` → `Catalog Definitions` → `Maintain Catalogs`, then go to `Technical Catalog` → `Catalog Items` → `New`.

![[servicenow-new-catalog-item.png]]

After filling in the details of the item as shown, confirm with Submit and reopen the object to add the associated variables.

We need to define three variables:

* `name`: What is the network name?
* `vlan`: What is the network ID (VLAN)?
* `ip_address`: What is the gateway IP address (if required)?

![[servicenow-catalog-attributes.png]]

At this point, the new **Network Provisioning** item should appear in the catalog. Users can select it and order a new network by entering the desired parameters.

![[servicenow-network-provisioning.png]]

Once the order is submitted, ServiceNow creates a Request (REQ) that contains the corresponding Requested Item (RITM).

![[servicenow-request-1.png]]
