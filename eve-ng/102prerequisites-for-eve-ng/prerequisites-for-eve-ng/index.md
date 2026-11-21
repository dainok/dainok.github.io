---
cover: eve-ng
date: 2024-07-27
tags:
- beginner
- eve-ng
- fundamentals
---
To set up an EVE-NG environment, you need some prerequisites in terms of knowledge, hardware and software.

## Skills

Diving into network automation generally requires a solid understanding of Linux system usage and management. Linux is the most flexible system, rich in languages, libraries and frameworks that simplify the development of automation and integrations. I designed this series of courses to be accessible to anyone in the IT field, but experience in managing Linux systems is undeniably helpful.

## Hardware

You can install EVE-NG in both physical and virtualized environments. A virtual environment is undoubtedly the easiest route initially. Over time, however, you will likely need a more performant environment based on physical hardware. Installing EVE-NG directly on physical hardware avoids the overhead caused by excessive layers of virtualization: EVE-NG already adds a virtualization layer to run the various devices, and if EVE-NG itself is virtualized, the overall performance may degrade.

## Software

To get a complete EVE-NG environment, you need:

* [Ubuntu Linux Server 20.04 LTS](https://releases.ubuntu.com/focal/) for EVE-NG 5, or [Ubuntu Linux Server 22.04 LTS](https://releases.ubuntu.com/jammy/) for EVE-NG 6.
* One or more [images supported by EVE-NG](https://www.eve-ng.net/index.php/documentation/supported-images/).

You can install [EVE-NG Community Edition](https://www.eve-ng.net/index.php/download/) directly from the ISO or OVF, but I encountered some issues in the past, so we proceed with a manual installation. This approach also lets us see some customizations in detail.
