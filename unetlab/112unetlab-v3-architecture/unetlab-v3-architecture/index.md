---
cover: unetlab
date: 2024-10-23
tags:
- beginner
- unetlab
---
The architecture of UNetLab involves several components that must interact with each other and report the progress of tasks to the user. We can identify the following components:

* The web interface lets users interact with UNetLab and manage users and labs.
* The [[Proxmox optimizing virtualization|Proxmox]] hosts manage the nodes and networks of the labs according to the instructions received from the users, and notify the status of the nodes.
* The orchestrator is the engine that manages the tasks and the input received from the user through the web interface and from the hosts through a specific agent.

## The Orchestrator

At first glance, we can imagine a Redis server that collects the input from the users (via the web interface) and from the hosts. The orchestrator receives the messages from Redis, transforms them and forwards them to the web interface or to the agents running on the hosts.

In this sense, the orchestrator is a background daemon.

We can imagine two types of data stored in Redis:

* **Actions:** for example, starting a specific node.
* **Messages:** for example, a notification that a node started successfully.

## The Web Interface

The web interface is served through Django. It receives the user input and transforms it into tasks sent to the orchestrator via Redis. Similarly, it receives the messages used to notify users via Redis.

## The Agent

On the Proxmox hosts, we can envision an agent that:

* Executes the requested actions, such as starting a node.
* Notifies the outcome of the requested actions.
* Regularly reports the status of the system (host, nodes, templates, networks...).
* Executes actions that Proxmox does not support natively (see the L1 links mentioned before).

Regarding the status notifications, we can imagine that the agent reports only the actual changes, to reduce the workload of the orchestrator and the web interface. If you recall, the old version of UNetLab polled continuously to check the status of the nodes. This put a significant burden on both the client-side web interface and the server-side resources.

We can also imagine that, at regular intervals, the agent sends a complete set of information to avoid any discrepancy that might grow over time.

The system status should include:

* **Host status:** reachability and resources used.
* **Data store status:** available space and user quota usage.
* **Network status:** which networks are available and their type (L1, L2).
* **Node status:** which nodes are available, whether they are on or off, resource consumption, associated users and associated images.
* **Image status:** which images are available and their characteristics.
