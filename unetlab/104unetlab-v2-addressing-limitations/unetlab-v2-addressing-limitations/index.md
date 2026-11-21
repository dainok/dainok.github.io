---
cover: unetlab
date: 2024-07-22
tags:
- beginner
- docker
- unetlab
---
In recent years, my focus has shifted towards network automation. I still need a unified network emulator platform, but the prerequisites have evolved. Before diving into the new requirements, let's highlight the limitations of UNetLab:

* **Per-host pod limit:** each host can run up to 256 independent pods because of the console port limit.
* **Per-lab node limit:** each pod or lab can run up to 127 nodes because of the console port limit.
* **Per-user pod limit:** each user can run only one pod or lab at a time because of the console port limit.
* **Single host:** there is no support for distributed installations of UNetLab (we can use OVS, but many frame types are filtered by default).
* **Config management:** using expect scripts to get and put startup configurations is slow, unpredictable and cannot cover all node types.
* **No support for Dynamips serial interfaces.**
* **No topology changes:** by design, we cannot change the topology while the lab is running.

The console port limit exists because each node console has a fixed port, calculated as follows:

```text
ts_port = 32768 + 128 * tenant_id + device_id
```

Moreover, no more than 512 IOL nodes can run in the same lab, because the `device_id` must be unique for each tenant.

UNetLab v2 must address these issues and meet new requirements:

* Run a distributed lab (across local or geographically distributed nodes).
* Support an unlimited number of nodes in a lab.
* Allow each user to customize a lab without affecting the original copy.
* Link the serial interfaces between IOL and Dynamips.
* Configure the nodes via [[Introduction to Ansible Automation|Ansible]], NAPALM or other tools.

I knew how to create a distributed network emulator, but I needed an easy way to run nodes within a dedicated namespace. The answer came from [vrnetlab](https://github.com/vrnetlab/vrnetlab): using [Docker](https://www.docker.com/).

Because of the limitations of UNetLab, I decided to rewrite it from scratch. [EVE-NG](https://www.eve-ng.net/), a fork of UNetLab, works to overcome these limitations, but I pursued a new path.

## UNetLab v2 Architecture

The architecture may seem complex, but it was straightforward to implement.

![[unatlabv2-flows.png]]

UNetLab v2 was based on:

* **Docker:** controllers, routers and lab nodes run inside Docker containers.
* **Python:** replaces C, PHP and Bash with Python 3.
* **Python-Flask + NGINX:** implements and exposes the APIs.
* **Memcached:** caches authentication for a better user experience.
* **Celery + Redis:** manages long asynchronous tasks in the background.
* **MariaDB:** stores all the data, user information and running labs.
* **[[Git fundamentals for developers and IT professionals|Git]]:** manages version control for the original labs.
* **jQuery + Bootstrap:** implements the UI as a single-page application.
* **iptables + Linux bridge:** allows SSH connections to just-started lab nodes.
* **IOL, QEMU and Dynamips:** run the lab nodes.

A UNetLab v2 cluster must have at least one node, which can be physical or virtual. The first node is the master and contains a controller and a router, while the additional nodes contain only routers. Each node also runs multiple lab nodes. Controllers, routers and lab nodes are Docker instances.

The controller container:

* Exposes the web UI and the APIs to user clients, routers and lab nodes.
* Receives registration requests from routers and lab nodes.
* Manages lab nodes via routers.
* Contacts lab nodes via Ansible, NAPALM, etc.
* Provides routing tables to routers.
* Is accessible via SSH on port 2222.

The router containers:

* Register with the controller.
* Expose the Docker Remote API and the lab node API.
* Obtain routing tables from the controller.
* Route lab packets between nodes and routers.
* Ensure connectivity between the controller and the remote lab nodes via OpenVPN.

The node containers:

* Register with the controller.
* Run emulated nodes (IOL, Dynamips or QEMU).
* Bind a management interface of the emulated nodes to a local bridge.
* Route packets between the local router and the emulated node for the non-management interfaces.
* Manage emulated links (up/down).

Since the controller and the routers know both the inside and the outside IP addresses, users can deploy UNetLab v2 nodes anywhere (in the same LAN, AWS, Google Compute Engine, Azure, behind a firewall). Each UNetLab v2 cluster requires the following ports:

* **TCP 2222:** SSH connection to the controller.
* **TCP 80/443:** HTTP/HTTPS requests to the controller.
* **TCP 5443:** HTTPS requests to the router.
* **UDP 5005:** routed packets between different UNetLab v2 nodes.
* **UDP 1194:** network reachability between the controller and the remote lab nodes.

UNetLab v2 was never completed, but the source code is available on [GitHub](https://github.com/dainok/unetlab/tree/archive_2.0.0-dev).
