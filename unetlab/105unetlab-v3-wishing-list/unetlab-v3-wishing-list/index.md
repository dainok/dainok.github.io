---
cover: unetlab
date: 2024-07-23
tags:
- beginner
- unetlab
---
UNetLab v2 was a partly good idea, but some choices complicated the implementation and hurt performance. In particular, managing UNetLab's network in user space would have caused serious problems, even though it would have made horizontal scalability easier.

I also had a serious doubt: does it make sense to build my own virtualization system today, when several already exist and are maintained by companies that can do it far better than I can? I first considered [ESXi](https://www.vmware.com/products/esxi-and-esx.html), but after the [Broadcom acquisition](https://investors.broadcom.com/news-releases/news-release-details/broadcom-completes-acquisition-vmware) I leaned towards [Proxmox](https://www.proxmox.com/). ESXi would have forced me to give up physical link simulation, while [[Proxmox optimizing virtualization|Proxmox]] lets me use the same strategy as in UNetLab.

Using an existing hypervisor greatly simplifies development, at the cost of a substantial sacrifice: systems such as IOL and Dynamips would no longer be supported. Dynamips is not a big loss, but IOL has always been my favorite system for building lightweight labs.

## UNetLab v3 Wishlist

I should split the list into functional and non-functional requirements, but for now let's simply build a wishlist together.

My hypothetical UNetLab v3 wishlist includes:

* Free, open source and community-driven.
* The ability to share labs, template repositories and playbooks easily.
* Support for [[Introduction to Ansible Automation|Ansible]], Nornir, NAPALM and [[Gathering structured network data with Netmiko and NTC Templates|Netmiko]] playbooks.
* A unified platform, focused on network and security labs.
* Multi-user, multi-tenant and multi-role (e.g., student and teacher).
* Easy scalability.
* An API-first approach, with a CLI and a web interface.

**Lab features:**

* Each lab is isolated by default.
* Labs can be interconnected.
* Labs can be shared between users.
* A management network is deployed per lab.
* The management network is hidden in the topology.
* The management network is reachable by all nodes.
* A DHCP server is deployed per lab.
* An Internet gateway can be deployed per lab.
* A fake Internet gateway can be deployed.
* Labs are described by a human-readable YAML file.
* Labs could contain an inventory compatible with Ansible.
* Imported labs should allow selecting alternative templates if the original ones are not available.
* Labs could be signed by users.
* Live changes (jitter, delay, interface up/down) should be reflected immediately in the running lab.
* Marketplace: a place where users and teachers can share labs and learning paths.
* Automation: all relevant nodes in a lab should be reachable by automation software by default.
* Packet capture: users should be able to capture packets from any interface.
* Scale-out: labs could be run on multiple compute nodes.

**Template features:**

* Templates are described by a YAML file.
* The descriptor specifies the vendor, OS, version, management interface and credentials.
* The vendor and OS fields should be defined to make templates compatible with external labs.
* Plugins should be provided for node configuration.
* Playbooks could be provided to configure specific node features (interfaces, OSPF, etc.).
* Templates are preconfigured with DHCP, a user and a password.
* Templates could be signed by users.

**Link features:**

* Links can be L1 or L2.
* L1 links are transparent bridges that forward any frame.
* Bridges can connect a physical port to a lab to include physical devices (e.g., PLCs).

**Node features:**

* Nodes could be configured automatically via playbooks (e.g., IP addresses, loopbacks, OSPF, CDP, LLDP).
* Users can send commands to multiple nodes.
* Users can send commands through a Jinja template.

**Scalability:**

* L1 links are intra-host.
* L2 links can be inter-host and used to span a lab across multiple hosts.

**Teaching features:**

* Multi-tenancy: each teacher can manage an independent environment.
* Classes: users are divided into classes within each tenant (class-level visibility).
* Users should be able to start and possibly modify their lab (user-level visibility).
* Shared access: users could access the same running lab.
* Design mode: changing a lab should not affect running copies; any lab could be converted into a "template".
* Solo mode: non-teachers should be able to write and run labs without worrying about classes or students.
* Content writer: labs should include additional content, such as slides and videos.
* Auto-evaluation: teachers could include scripts to evaluate users automatically.

**Definitions:**

* **Host:** a system that runs nodes.
* **Lab:** a topology that interconnects multiple nodes.
* **Node:** a virtualized system, part of a lab, running on a host.
* **Link:** a virtual network connection between nodes.
* **Template:** the base image from which a node can be executed.

## Conclusions

Developing UNetLab has been one of the most rewarding hobbies I have ever had. I have met many interesting people, most of whom I am still in touch with. It also taught me how critical it is to maintain software used worldwide without letting bugs disappoint its users. Sometimes, I still dream about developing UNetLab again.
