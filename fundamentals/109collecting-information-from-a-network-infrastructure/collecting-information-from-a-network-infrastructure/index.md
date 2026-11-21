---
cover: ad
date: 2026-03-22
tags:
- advanced
- fundamentals
---
During an assessment, we need to gather information from network devices, structure the data, organize it and prepare reports according to the requirements of the stakeholders. If we do this manually, the operational cost is very high. Automating it is not complex, but we need to understand how all the pieces fit together.

This series of articles is inspired by a real project. These are the requirements:

* Collect information from dozens of devices.
* The data to collect is partially known, and more may be added later.
* Data collection must be schedulable and recurring.
* We must be able to compare the differences between two time intervals.
* Some reports must be generated whose structure is not known in advance.
* The time available to implement the automation is extremely limited.

Some products meet part of these requirements, but others are so loosely defined that they demand a level of flexibility rarely found in off-the-shelf solutions. We therefore need a fast, if not immediate, approach that gets us to the result.

## Approach

The problem is actually quite straightforward: for simplicity, we separate the discovery phase from the reporting phase.

For the discovery, we proceed as follows:

* We start from an inventory of all the devices (Cisco IOS XE).
* We log into each device and retrieve all the necessary information by running a set of commands from a predefined list.
* We save the raw output of each command to a dedicated file.
* We use `ntc-templates` to convert the raw output to JSON.
* We save all the outputs of a single scan in a specific directory.
* The scan runs in parallel across multiple devices.

For the reporting, we proceed as follows:

* We analyze only the data needed for the report, reading the JSON files.
* We insert the relevant data into a SQLite database.
* We generate the reports based on the specifications defined during the project.

The following reports will definitely be included:

* Connected endpoints: MAC address, vendor, IP address, device and port the endpoint is connected to, and VLAN.
* Physical interfaces: device, interface, CDP and LLDP neighbors, and total number of connected MAC addresses.
