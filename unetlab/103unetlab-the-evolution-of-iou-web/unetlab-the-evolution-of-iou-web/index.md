---
cover: unetlab
date: 2024-07-22
tags:
- beginner
- unetlab
---
In 2013, I realized that iou-web was too limited. I needed a "unified" approach to emulate a network, including firewalls, load balancers and more. Multicasting with IOL was also problematic. I had several new prerequisites:

* Include vendor virtual appliances in labs.
* Integrate real IOS images in labs.
* Possibly include emulators from different vendors.
* Support multi-user environments.

I rewrote **iou-web** completely to create an extensible network emulator. The core idea was:

* Each node (emulated device) must be attached to a common layer.
* A suitable common layer is an Ethernet Linux bridge (with OVS support).

On October 6th, 2014, **UNetLab**, also known as **UNL**, was released to the public. It was developed in PHP with a REST API framework and a single-page application (jQuery), and within a few months it gained five to six hundred daily users. I wanted to name it UNL, but the website URL was not available.

![[unetlab-boot.png]]

![[unetlab-login.png]]

![[unetlab-topology.png]]

Initially, I considered including Huawei eNSP, but eNSP nodes required a specific string, so nobody was able to run eNSP nodes outside of eNSP.

Thousands of people around the world used UNetLab every month. It gave me immense satisfaction and hands-on experience in managing widely distributed production software.

In 2015, because I had limited spare time, a group of enthusiasts forked UNetLab, and [EVE-NG](https://www.eve-ng.net/) was released on January 5th, 2017. I am not part of the [[Introduction to EVE-NG platform|EVE-NG]] team.

![[uentlab-complex-topology.png]]

In 2014, I had an interesting chat with a member of the Cisco VIRL team during CLEUR 2014 in Milan.

![[unl-virl-guys.png]]

The old historical UNetLab repository is available to the public on [GitHub](https://github.com/dainok/unetlab/tree/archive_1.0.0-13).

Other resources that mention UNetLab:

* [Packet Pushers PQ Show 61: The UNetLab Project](https://packetpushers.net/podcast/pq-show-61-unetlab-project/).
* [Approaches and algorithms of virtual telecommunication networks analysis in UNetLab environment (IEEE conference)](https://ieeexplore.ieee.org/abstract/document/7905375).
