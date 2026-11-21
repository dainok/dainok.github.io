---
cover: ad
date: 2025-03-05
tags:
- beginner
- ot-ics
---
The first scenario available in VirtuaPlant simulates a basic bottle-filling plant. It includes a graphical Human-Machine Interface (HMI) that lets users interact with the simulated industrial process.

![[bottle-filling-plant-2.png]]

The simulation and the HMI communicate using the [[Introduction to Modbus protocol|Modbus]] protocol. The simulation acts as a basic PLC, handling both the control logic and the visualization of the plant.

Both the simulation and the HMI are graphical applications developed in Python 2.7 with the Pygame library. Since they rely on Linux-based systems, both components must run on Linux machines.

## Installing the Simulation (PLC) Container

Before installing the scenario, we need two Linux systems with Docker installed. I used the latest Ubuntu LTS and followed the official [Docker installation guide](https://docs.docker.com/engine/install/ubuntu/). Once the systems are ready, we install the PLC simulation container on the first machine:

```bash
docker run --name plc --rm -d -p 443:6901 -p 502:5020 -e VNC_PW=password dainok/virtuaplant-bottle-filling-plc:latest
```

This command:

* Downloads and runs the latest PLC simulation container for the Bottle Filling Plant.
* Automatically removes the container when it is stopped (`--rm`).
* Exposes port 443 (web interface) and port 502 (Modbus communication with the PLC).
* Sets a password for VNC access.

After a few moments, we can access the PLC simulation by entering the IP address of the host in a web browser, on port 443:

![[bottle-filling-plant-login.png]]

We log in with the username `kasm_user` and the password set in the Docker command.

Once logged in, the simulation environment is ready to start:

![[bottle-filling-plant-stopped.png]]

We can press `ESC` at any time to restart the simulation.

## Installing the HMI Container

Next, we install the HMI container on the second Linux machine:

```bash
docker run --name hmi --rm -d -p 443:6901 -e PLC=172.26.104.12 -e VNC_PW=password dainok/virtuaplant-bottle-filling-hmi:latest
```

This command:

* Downloads and runs the latest HMI container for the Bottle Filling Plant.
* Automatically removes the container when it is stopped (`--rm`).
* Exposes port 443 for web-based interaction.
* Defines the IP address of the PLC (`-e PLC=<PLC_IP>`) to establish the communication.
* Sets a password for access.

We open the HMI web interface using the IP address of the second machine and port 443, and log in with `kasm_user` and the password set when the container was started:

![[bottle-filling-plant-hmi.png]]

We press "Run" to start the plant simulation. If everything is configured correctly, the bottle-filling plant begins operating.

![[bottle-filling-plant-started.png]]
