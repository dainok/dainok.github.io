---
cover: eve-ng
date: 2024-07-27
tags:
- beginner
- eve-ng
- linux
---
Now let's see how to install Ubuntu Linux Server 20.04 LTS so that it can host EVE-NG.

## Virtual Environment

In a virtual environment, typically VMware vSphere, I suggest creating a virtual machine with the following specifications:

* Guest OS family: Linux.
* Guest OS version: Ubuntu Linux (64-bit).
* CPU: 4.
* Hardware virtualization: expose hardware-assisted virtualization to the guest OS.
* Memory: 8 GB.
* Hard disk: 50 GB.
* CD/DVD drive: the ISO file of Ubuntu Linux Server 20.04 LTS, previously uploaded to the ESXi server.

![[vm-hardware-settings.png]]

Pay special attention to the advanced CPU features: the hardware virtualization option must be enabled.

![[vm-cpu-settings.png]]

## Physical Environment

As in the virtual environment, in a physical environment we need to enable hardware-assisted virtualization. This feature is in the BIOS configuration, and the specific setting may vary from computer to computer.

![[enable-bios-virtualization.png]]

## Ubuntu Linux

Next, we boot the system and start the installation. In order, we are prompted to configure:

* Language: English.
* Layout: the keyboard layout we use.
* Installation: Ubuntu Server.
* Network connection: configure the network card according to our environment.
* Disk: use the entire disk with LVM.
* Profile: set up a user with a password.
* Hostname: `eve-ng`.
* Install the OpenSSH server.

We confirm the defaults for all the other settings and wait for the system to finish the installation. Once done, we restart the system.
