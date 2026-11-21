---
cover: eve-ng
date: 2025-09-20
tags:
- advanced
- docker
- eve-ng
- linux
- troubleshooting
---
**Special thanks to [Carlo Cianfarani](https://www.linkedin.com/in/cianfarani-carlo-b7a86478/) for providing this post.**

In this post, we explore how to troubleshoot and fix an issue on EVE-NG involving Linux VMs connected through a virtual router instance (Cisco XRd) implemented as a Docker container. Some time ago, I managed to extend EVE-NG to support Docker containers.

## Lab Scenario

![[xrd-lab.png]]

In the scenario depicted, the Ethernet interfaces of the Linux VMs (e.g., plain `e1000` or paravirtualized `virtio-net`) are attached to two different IP subnets, each implemented by a Linux bridge. The Linux VMs run on the QEMU hypervisor, which starts a multithreaded process in userspace for each VM: a main thread plus additional threads, one for each vCPU assigned to the VM.

We can check how EVE-NG networking is implemented under the hood with:

![[brctl-show.png]]

In the output above, `vnet0_1` and `vnet0_2` are both Linux bridges that implement the Ethernet links connecting the VMs to the interfaces of the virtual router. `vunl0_1_0` and `vunl0_2_0` are Linux TAP network devices that implement the backend of the virtual Ethernet interfaces of the VMs.

![[ethtool-1.png]]

![[ethtool-2.png]]

`vnet0_3_1` and `vnet0_3_2`, on the other hand, are Linux `veth` network devices whose paired `veth` lives inside the network namespace of the Docker container.

![[ethtool-3.png]]

![[ethtool-4.png]]

![[ip-link-1.png]]

![[ip-link-2.png]]

The following command enters the namespaces (PID, network and user) of the **XRd** container and confirms the associations between the `veth` pairs.

![[docker-inspect-1.png]]

![[nsenter.png]]

In this lab, we can ping both local and remote IP addresses successfully, but SSH to the remote VM fails. Let's troubleshoot it.

When we attempt SSH from Linux VM1 to VM2, we can check the `TcpInSegs`, `TcpInErrs` and `TcpInCsumErrors` counters on VM2: they keep incrementing by the same amount (4 packets for each run).

![[nstat-1.png]]

This means VM2 is receiving TCP SYN packets (segments) with an invalid TCP checksum. To confirm it, I used the Linux [ftrace](https://www.kernel.org/doc/html/v5.0/trace/ftrace.html) framework through the [trace-cmd](https://www.trace-cmd.org/) frontend.

The virtual router instance connected to the Linux bridges is a Cisco XRd Docker container running IOS-XR 7.10.2. From a networking perspective, each Docker container runs in a Linux network namespace other than the root (or default) network namespace. EVE-NG creates a veth pair for every Ethernet link connected to the container. In our scenario, one veth device is connected to a Linux bridge in the root network namespace, while its pair lives in the dedicated network namespace of the container. With ftrace, we can dig into the Linux `sk_buff` kernel structures involved, checking the value of the field we are interested in (`skb` → `ip_summed`).

From the viewpoint of the Linux host, ftrace reports that the TCP SYN packets handled by the TAP backend of the Ethernet interface of VM1 in the RX path have `ip_summed` set to `3`, while the TCP packets handled in the RX path by the veth device connected to the remote bridge have `ip_summed` set to `0`.

These values are defined in the Linux kernel C header [/include/linux/skbuff.h](https://github.com/torvalds/linux/blob/cbf658dd09419f1ef9de11b9604e950bdd5c170b/include/linux/skbuff.h#L247):

![[skbuff.png]]

They correspond to `CHECKSUM_PARTIAL` and `CHECKSUM_NONE`, respectively. To understand clearly what was really going on, I opened this [discussion](https://unix.stackexchange.com/questions/797717/tcp-checksum-offloading-on-virtio-net-paravirtualized-interfaces) on Stack Exchange.

![[trace-cmd-1.png]]

![[trace-cmd-2.png]]

The Linux ftrace framework lets us enable static tracepoints built into the kernel. Here we enabled the tracepoints `netif_receive_skb_entry` and `netif_rx_entry`, which sit within the relevant kernel network functions implemented by the host Linux kernel and exposed to the low-level device driver code. Then, in the reporting step, we filtered the trace file (`trace.dat`) with the `-F` option (nonessential trace entries for ARP requests and replies were filtered out).

According to the trace above, the process `qemu-system-x86-11472` with PID `11472` is the main thread (Linux lightweight process) running the QEMU instance of VM1. The RX path processing on the `vunl0_1_0` TAP interface runs in the context of this process (EVE-NG assigned node ID 1 to the VM1 node, hence the name `vunl0_1_0` for the backend of the virtual Ethernet interface of VM1).

![[ps-1.png]]

Likewise, `spp-17445` is the PID of the thread running within the XRd Docker container. This thread runs the driver code that handles the RX path processing for the `vnet0_3_2` veth device, paired with the corresponding veth device within the network namespace of the XRd container (here too, EVE-NG assigned node ID `3` to the XRd node).

![[ps-2.png]]

As we can see, when we try SSH from VM1 to VM2, VM1 sends out TCP SYN packets with the `ip_summed` field of the `sk_buff` set to `3` (`CHECKSUM_PARTIAL`). This means the network stack of the VM1 kernel sends out TCP packets with an incomplete TCP checksum.

After many hours of troubleshooting, I identified the issue: by default, the Ethernet interfaces exposed to the VMs (e.g., `e1000` or `virtio-net`) have TCP/UDP checksum offloading enabled. The network stack of the Linux kernel assumes that the underlying "NIC hardware" computes and fills in the correct TCP/UDP checksum in outgoing packets.

The problem is that the virtual NIC does not perform that computation at all in its TX path. As a result, TCP/UDP packets are sent with zeroed or corrupted checksum fields. On the receiving side, in the RX path processing, they are delivered to the network stack of the VM Linux kernel, which discards these invalid packets.

## The Fix

The solution is straightforward: disable TX checksum offloading at the virtual NIC level. We can do it from within the Linux VM as follows (note that disabling RX checksum offloading is not an option, since it is not configurable).

![[ethtool-5.png]]

![[ethtool-7.png]]

Of course, we need to do the same on the remote Linux VM:

![[ethtool-8.png]]

And SSH to the remote VM works.

![[ssh-1.png]]

A different kind of fix is also available. According to the Cisco [documentation](https://xrdocs.io/virtual-routing/tutorials/2022-08-25-user-interface-and-knobs-for-xrd/), there is an optional flag (`chksum`) applicable to the XRd interfaces. We can set it per interface through the Linux environment variables passed to the container (`XR_MGMT_INTERFACES` for management interfaces and `XR_INTERFACES` for data-plane interfaces). It forces the virtual router to compute the relevant TCP/UDP checksum for the ingress packets coming from that interface.

Let's check the current setting of those environment variables:

![[docker-inspect-2.png]]

In the `XR_INTERFACES` environment variable above, the `chksum` flag is not set for the first two XRd interfaces (`Gi0/0/0/0` and `Gi0/0/0/1`) used in the lab. Let's try to set the `chksum` flag for the `Gi0/0/0/0` interface only (the XRd ingress interface for the traffic coming from VM1 to VM2). To do so, we stop and wipe the XRd node, so that the XRd Docker container restarts from scratch.

![[docker-inspect-3.png]]

SSH to VM2 still fails, but we can confirm that VM2 receives TCP packets with the correct TCP checksum (`TcpInErrs` and `TcpInCsumErrors` no longer keep incrementing on VM2).

![[nstat-2.png]]

In the next step, we fix the issue the other way around by setting the `chksum` flag for the `Gi0/0/0/1` interface:

![[docker-inspect-4.png]]

And this works as well.

![[ssh-2.png]]
