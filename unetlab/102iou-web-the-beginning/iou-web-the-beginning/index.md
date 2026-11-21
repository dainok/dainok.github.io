---
cover: unetlab
date: 2024-07-22
tags:
- beginner
- unetlab
---
I have been working with network simulators since around 2011, when I decided to pursue my CCIE R&S certification. Around that time, another pivotal event set me on the path of development: Cisco released a binary called IOL (IOS on Linux), which essentially simulated a Cisco IOS router. Unlike other solutions, it required significantly fewer resources to simulate this router.

Back then, GNS3 was the only available option. It used Dynamips to emulate the hardware needed to run official IOS images. The emulated platforms were limited, though, and we had to optimize them manually to minimize resource usage. I faced two major issues that were deal-breakers for me:

* I was working with two different computers, and synchronizing the environment between them with GNS3 was complicated.
* The combination of GNS3 and Dynamips was unstable.

I decided to create my own interface to manage simulators based on IOL. After a few months, iou-web was born: a PHP-based web interface that orchestrated the creation and management of labs for IOL. My requirements were:

* **Portability:** labs must be exportable and importable.
* **Stability:** running labs must be stable and avoid crashes.
* **Performance:** labs must run on a cheap laptop or VM.

Meanwhile, I discovered that Cisco had developed similar software internally, called **WebIOL**. WebIOL was developed in Perl and released exclusively to Cisco employees, with basic labs from the Cisco 360 program.

After a couple of alpha versions, I released **iou-web** publicly on January 23rd, 2012.

![[iou-web-topology.png]]

Unlike GNS3, which supported real IOS images via Dynamips, iou-web supported only IOL. IOL was faster than Dynamips, though, so many users preferred iou-web.

Basically, iou-web, often referred to as **webiou**, was a web interface for IOU. It allowed users to:

* **Create network topologies:** build topologies for IOU easily through a user-friendly web interface.
* **Manage devices:** start and stop devices with simple web-based controls.
* **Visualize topologies:** view a graphical L2 diagram of the network topology for better understanding and management.

The old historical iou-web repository is available to the public on [GitHub](https://github.com/dainok/iou-web).
