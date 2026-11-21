---
cover: ad
date: 2025-02-26
tags:
- beginner
- lab
- ot-ics
---
[VirtuaPlant](https://github.com/jseidl/virtuaplant) is an Industrial Control Systems (ICS) simulator developed by [Jan Seidl](https://wroot.org/) in 2015. Most PLC simulators only let you read and write tags, while VirtuaPlant adds real-world-like control logic, which makes it a more advanced and interactive learning tool.

It uses a game library and a 2D physics engine to provide a graphical user interface (GUI) that simulates the physical world behind the control system. This helps users visualize industrial processes and understand how control systems interact with real-world mechanics.

![[bottle-filling-plant-1.png]]

Originally, VirtuaPlant included only one scenario. Later, an external contributor ([GitHub user prjpet](https://github.com/prjpet/virtuaplant)) added a second one.

![[oil-refinery-plant.png]]

The biggest issue with VirtuaPlant today is that it has been stagnant since 2015. Installing it on modern systems is extremely difficult, because of outdated OS requirements, dependencies and libraries, many of which are now deprecated.

To overcome these problems, I modified the project and converted it into a Docker container, which makes installation and deployment much easier on modern systems.

The Dockerfiles for this setup are available in [my GitHub repository](https://github.com/dainok/courses/tree/master/Various/Dockerfiles). They are the foundation of our ICS/OT security lab.
