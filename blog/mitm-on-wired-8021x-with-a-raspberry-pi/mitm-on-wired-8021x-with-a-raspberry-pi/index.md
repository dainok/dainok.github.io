---
cover: ad
date: 2024-03-10
tags:
- 802-1x
- advanced
- blog
- design
- security
---
In recent years, Network Access Control ([[Managing a brownfield Cisco ACI fabric with NaC and Terraform|NAC]]) solutions based on the 802.1x protocol have gained significant traction. Like any security solution, they must be evaluated carefully before we integrate them into a proper cybersecurity strategy.

I understand that this evaluation requires very specific technical knowledge, and those who assess these solutions often rely on what the datasheets say. This post has three purposes:

* To raise awareness that assessing a security solution incorrectly exposes organizations to threats.
* To describe the steps a threat actor can follow to exploit the weaknesses of NAC solutions.
* To be informative, and understandable even to non-technical readers.

## Introduction: NAC Solutions

First, we need an overview of NAC (Network Access Control) solutions. They are based on the 802.1x protocol to authenticate and authorize connected devices. Some solutions, through additional components, also assess the behavior of the devices to identify anomalies.

These solutions address the problem of unauthorized devices accessing Ethernet ports. Specifically, they protect the ports that people can reach easily, particularly in offices and public areas.

Over time, these solutions have evolved: they authenticate, authorize and profile the connected devices. In other words, we can configure Ethernet ports dynamically based on the connected devices. This greatly helps to improve and automate the management of large and dynamic campus networks.

Device authentication is based on the 802.1x protocol: the switch requests authentication from the device, and external servers validate the authentication. Authentication can use a username and password or certificates. Once the device is authenticated, the channel stays active until the session expires and must be renewed.

Solutions have also evolved to support multiple connected devices, such as:

* A phone with a computer cascaded behind it.
* A computer with virtual machines.
* ...

In the real world, however, many devices do not implement the 802.1x protocol. NAC solutions have "evolved" further (it would be more correct to say "devolved"), authenticating devices based on their MAC address: this functionality is called MAB, or MAC Address Bypass. The term "bypass" cannot be associated with a security feature, and we should remember that NAC solutions are also used for automation.

The most important consideration concerns how an authenticated session is established. 802.1x authenticates the channel, not the individual packets. The switch associates the authenticated session with the MAC address of the device. An attacker can therefore insert a malicious device between the authenticated device and the switch, and exploit the authenticated channel.

The final consideration concerns what I call "silent" devices. For NAC solutions to work, the connected devices must support 802.1x or transmit at least one packet, so that the switch learns their MAC address. Some devices are designed to receive data but not to transmit it, which makes it impossible to use any NAC solution.

## Switch Configuration

We should evaluate the switch configuration carefully to minimize the risks, which, as we will see later, are still present.

Each Ethernet port can be configured in different modes, depending on the vendor. On Cisco switches, the modes are:

* **Multi-Host:** once the connected device authenticates the port, any other device can use the channel (for example, virtual machines).
* **Multi-Domain:** each connected device, belonging to a specific VLAN, must authenticate (for example, a phone and a computer cascaded).
* **Multi-Auth:** each MAC address that appears on the Ethernet port must authenticate.
* **MAB:** no real authentication is performed, only a check that the MAC address is enabled.

Where possible, the preference should be, in order, Multi-Auth, Multi-Domain, Multi-Host and MAB (the definitions depend on the vendor: the important thing is to understand the concept).

## MITM on 802.1x

From the attacker's perspective, in the worst-case scenario, inserting a device between an authenticated device and a switch means being transparent. Specifically, the attacker must, in order:

1. Forward any data to and from the switch without applying any filters to the local frames.
2. Wait for the channel to be authenticated.
3. Emit data using only the MAC address and the IP address of the authenticated device.

There are two ways to implement this:

1. Build a software switch running in user space, which probably results in lower performance.
2. Use the components offered by Linux, working in kernel space with better performance, albeit with some limitations.

With the second approach, the three steps translate operationally into:

1. Compiling a custom kernel so that Linux Bridge forwards all the frames.
2. Reading the MAC address of the connected device.
3. Analyzing the passing data until we obtain the IP address of the connected device and the MAC address of the gateway.
4. Configuring a Linux Bridge, iptables and ebtables so that we can communicate with the outside using the MAC address and the IP address of the connected device.
5. Activating a covert channel that allows us to exploit the malicious device remotely.

The result is a practically invisible, remotely manageable device.

## Defense Strategies

Programming a device to exploit an authenticated 802.1x session transparently is not simple, but it is not overly complex either. We must therefore consider the risk that ports with promiscuous access are compromised as described above.

For several years, my approach has been to treat networks with promiscuous access like DMZ networks: high-risk areas that require high visibility and very restrictive policies. We cannot make any assumption about the security of the connected devices.

A first approach is to increase visibility by adding behavioral analysis of the devices: if a printer starts communicating with an unknown remote site and uploads a more or less significant amount of data, a red flag should go up somewhere.

A second approach is to apply zero trust, creating policies that allow only what is strictly necessary and limiting the scope of action of any malicious device. In this regard, Private VLANs can further reduce the attack surface. We must always keep in mind how a device is authenticated: for example, if a computer is authenticated based on the user using it, and the firewalls evaluate the policies based on the IP address of that user, we cannot consider this mechanism secure. The malicious device described above uses the same IP address assigned to the user.

A third approach, less common but extremely effective, is to add a layer based on IPsec or similar protocols. I like this approach a lot: it treats promiscuous networks as public networks, so users who authenticate on them must use VPN systems to reach the internal company networks.

One more approach, partially applicable, is to encrypt the channel between the device and the switch to make it unusable for MITM attacks. MACsec (802.1AE) is the standard that implements this functionality, but endpoint devices do not implement it natively at the moment. Third-party agents, such as [Cisco AnyConnect](https://www.cisco.com/go/anyconnect), can be installed on the client operating systems.
