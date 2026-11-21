---
cover: proxmox
date: 2024-07-24
tags:
- beginner
- proxmox
- unetlab
---
During the development of the first version of UNetLab, I dedicated significant time to creating a flexible QEMU/KVM orchestrator. At that time, virtualization-ready images were rare. Choosing a specific QEMU version or parameter could determine the success or failure of virtualizing a particular device.

Years later, the landscape has changed completely: virtualization is almost always an option, because vendors use virtualized environments to build labs. Most vendors now release images for both VMware and QEMU/KVM.

IOU remains a topic of interest, though: it is a lightweight image that simulates a Cisco IOS XE environment. We can think of IOU as a container that does not use standard networking. It could be transformed into a container, but that is another story.

By forgoing IOU (and Dynamips), we can simplify virtualization management. Specifically, we can rely on an existing hypervisor. For years, I considered [ESXi](https://www.vmware.com/products/esxi-and-esx.html), but after the [Broadcom acquisition](https://investors.broadcom.com/news-releases/news-release-details/broadcom-completes-acquisition-vmware), I explored other options. After analyzing various environments, including [libvirt](https://libvirt.org/), I chose [Proxmox](https://www.proxmox.com/) for several reasons:

* It runs on top of a standard Linux OS, which we can modify if needed.
* It provides REST APIs, which we still need to verify.
* It allows kernel modifications to simulate physical links.
* It is well supported and under active development.
* It is open source.
* It scales horizontally and supports VXLAN.
* It supports LXC natively (but not Docker).

On paper, Proxmox looks like the perfect base for UNetLab v3. During development, however, we want to abstract the interaction between UNetLab and Proxmox, so that we can substitute the hypervisor without rewriting code.

## Scalability

Scalability is a key factor for UNetLab v3. UNetLab v1 was designed to scale up, i.e., by increasing the resources of the host, which is costly and limited.

For UNetLab v2, I considered implementing an MPLS-like network to simulate the physical links between nodes on different hosts. This had two issues:

* Slow performance, because packets were handled in user space, not kernel space.
* Complexity, because it required writing a new network protocol.

For UNetLab v3, I plan to use VXLAN to extend the networks between hosts. It has both advantages and disadvantages:

* Hypervisors and operating systems support VXLAN natively.
* VXLAN does not allow the simulation of physical links (some frames are filtered).

The solution is to divide the problem:

* L1 links, implemented as in UNetLab v1, are intra-host only.
* L2 links, implemented via VXLAN, extend labs across multiple hosts.
* At lab startup, an algorithm defines groups of nodes on the same host and distributes them across the hosts, allowing user modifications.

The complexity lies in the last point, but it is theoretically feasible. The open question is whether we can move nodes between servers, and how to manage it.

By following these principles and leveraging modern tools, UNetLab v3 aims to be a powerful, flexible and scalable network emulator for the next generation of network professionals.
