---
cover: servicenow
date: 2026-04-19
tags:
- advanced
- ansible
- servicenow
---
[ServiceNow](https://www.servicenow.com/) is a cloud-based SaaS platform that digitalizes, automates and optimizes enterprise workflows.

One of its core capabilities is the definition of the services offered to users through a service catalog, together with the full lifecycle management of the requests. The goal here is to extend that catalog to all the relevant IT services, automating their provisioning end to end.

We walk through a practical example: a network provisioning entry in the service catalog, which end users can parameterize and order.

A Python script handles the incoming requests automatically and applies the changes in the production environment.

The architecture supports two integration modes:

* **Pull**: the script polls ServiceNow periodically to retrieve the unfulfilled requests.
* **Push**: a webhook notifies the script of new requests in real time.

Polling is generally discouraged, but many organizations apply infrastructure changes only within specific maintenance windows. In that context, it is natural to pull all the pending requests at the start of each window and process them one after the other until it closes.

This experiment requires a ServiceNow instance. I used a personal developer instance, available free of charge through the [ServiceNow Developer Program](https://developer.servicenow.com/dev.do).
