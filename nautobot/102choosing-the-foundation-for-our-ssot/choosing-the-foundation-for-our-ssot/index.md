---
cover: nautobot
date: 2024-07-10
tags:
- beginner
- nautobot
- ssot
---
The first topic is the choice of the software that serves as the foundation for our SSOT (Single Source of Truth). Our goal is a data structure that consolidates the critical information about our infrastructure, such as:

* VLANs, IP networks, IP addresses and VRFs (IPAM).
* Sites, physical and virtual devices.
* Rack configuration and cabling.

In essence, we are looking for an IPAM (IP Address Management) tool that can also store other types of data. This data structure is the base for automated workflows, so it needs to be:

* Well documented.
* Designed with an API-first approach.
* Open source.
* Extensible via plugins.
* Written in a widely used automation language (Python).

We have two main candidates: [Nautobot](https://networktocode.com/nautobot/) and [NetBox](https://netboxlabs.com/oss/netbox/). Nautobot is a fork of NetBox created in 2021. The [main reason](https://blog.networktocode.com/post/why-did-network-to-code-fork-netbox/) for its development was to evolve the product into a platform that automates the processes of an organization.

Both products are undergoing significant restructuring, often with substantial breaking changes. This affects the future of our integration:

* Our implementation must keep up with the updates of the product: our integration must not prevent future updates of the SSOT.
* The closer we stay to the official features of the product, the fewer customizations we need, which simplifies future updates.
* Fewer customizations mean fewer problems, so we use standard constructs.
* The product must support interface roles.

Demo versions of both products are available:

* [demo.netbox.dev](https://demo.netbox.dev/): registration required.
* [demo.nautobot.com](https://demo.nautobot.com): username `demo`, password `nautobot`.
* [next.demo.nautobot.com](https://next.demo.nautobot.com): username `demo`, password `nautobot`.

The demos show that the next version of Nautobot can assign roles to interfaces, a feature that is not available in the current versions of NetBox or Nautobot. The demo had a [bug](https://github.com/nautobot/nautobot/issues/5841), which should now be resolved and integrated in the demo.

The decision is therefore clear: we use the upcoming version of Nautobot to implement our SSOT.
