---
cover: ad
date: 2025-04-16
tags:
- intermediate
- ot-ics
---
As we have seen, the GRFICSv2 simulator consists of four main components: HMI, PLC, simulator and EWS.

In a real ICS environment, the HMI, the PLC and the simulator are connected to the field network, where a gateway handles the communication between the OT network and the field devices. The EWS (Engineering Workstation) is instead located in the OT network and communicates with the HMI and the PLC through the router/gateway.

![[chemical-plant-started.png]]

We can organize these components as best suits our needs. The following instructions configure all the components in the same OT network, as we did previously with VirtuaPlant.

The HMI, the PLC and the simulator communicate using the [[Introduction to Modbus protocol|Modbus]] protocol. Unlike real systems, the HMI is a web-based interface. The EWS, which is typically Windows-based, is represented here by a Linux system with the OpenPLC SDK.

The complete scenario consists of four distinct components, each running in its own container. They can also all run on the same Docker host.

## Installing the Chemical Plant Container

Before setting up the environment, we need four Linux systems with Docker installed (or a single one, if we run everything on the same host). I used the latest Ubuntu LTS and followed the official Docker installation guide.

Once the systems are ready, we install the simulation container on the first machine:

```bash
docker run --name simulation --rm -d -p 80:80 -p 5020:5020 -p 5021:5021 -p 5022:5022 -p 5023:5023 -p 5024:5024 -p 5025:5025 dainok/grficsv2-simulation:latest
```

This command:

* Downloads and runs the latest Chemical Plant simulation container.
* Automatically removes the container when it is stopped (`--rm`).
* Exposes port 80 (web interface) and ports 502X (Modbus communication with the PLC).

After a few moments, we can access the simulator web interface by entering the IP address of the host in a web browser, on port 80.

![[chemical-plant-stopped.png]]

## Installing the PLC Container

The PLC is implemented with OpenPLCv2. A newer version of OpenPLC exists, but the differences are too significant, so the only way to ensure compatibility was to keep this outdated version.

We install the PLC container on the second machine:

```bash
docker run --name plc -d -p 502:502 -p 80:8080 -e SIM=172.26.104.33 dainok/grficsv2-plc:latest
```

This command:

* Downloads and runs the latest PLC container for the Chemical Plant.
* Does not remove the container automatically when it is stopped (`--rm` is omitted).
* Exposes port 80 (web interface) and port 502 (Modbus communication with the simulator).
* Configures OpenPLC to connect to the simulator at the IP address 172.26.104.33.

After a few moments, we can access the PLC web interface using the IP address of the host in a web browser, on port 80.

![[openplc-server-running.png]]

## Installing the HMI Container

Next, we install the HMI container on the third Linux machine:

```bash
docker run --name hmi --rm -d -p 80:8080 dainok/grficsv2-hmi:latest
```

This command:

* Downloads and runs the latest HMI container for the Chemical Plant.
* Automatically removes the container when it is stopped (`--rm`).
* Exposes port 80 for web-based interaction.

After a few moments, we open the HMI web interface using the IP address of the host and port 80, and log in with:

* Username: `admin`.
* Password: `admin`.

![[hmi-login.png]]

## Configuring the PLC Connection in the HMI

We navigate to Data Sources and edit the PLC source.

![[hmi-plc-connection.png]]

We change the host address, setting it to the IP address of the Docker host where OpenPLC is running.

![[hmi-modbus-settings.png]]

We save the configuration and return to the main screen. The HMI should now display real-time values from the PLC.

![[hmi-plant.png]]

Finally, we press the Start button to activate the plant. If everything is configured correctly, the production process begins.

![[chemical-plant-started.png]]

The quantity of product should increase over time. If nothing changes, or if the pressure slowly decreases, something is wrong. In that case, we restart both the PLC and the simulation containers:

* Stop both containers.
* Restart the simulation first.
* Wait a few seconds, then restart the PLC.

## Installing the EWS Container

Finally, we install the Engineering Workstation (EWS) container on the fourth Linux machine:

```bash
docker run --name ews -d -p 443:6901 --privileged --shm-size=512m -e VNC_PW=password dainok/ews:latest
```

This command:

* Downloads and runs the latest EWS container for the Chemical Plant.
* Does not remove the container automatically when it is stopped (`--rm` is omitted).
* Exposes port 443 for web-based access.
* Sets a password for login.

We open the EWS web interface using the IP address of the machine and port 443, and log in with `kasm_user` and the password set when the container was started.

The EWS is an Ubuntu Linux 22.04 system with the following pre-installed software:

* OpenPLC Editor: to develop and modify PLC programs.
* Web browser: to upload software to OpenPLC.

![[ews-desktop.png]]

## Uploading a PLC Program

In `Applications` → `Development`, we find the OpenPLC Editor application. In the Documents folder, the project `grficsv2-simplified_te` is already available and preloaded on the PLC.

If needed, we can load the project and generate the program for OpenPLC:

![[plc-program-generator.png]]

We open a web browser, connect to the PLC and upload the program by clicking Upload Program:

![[plc-program-upload.png]]

OpenPLC uploads, compiles and runs the program.

![[plc-program-compiled.png]]

This is an older version of OpenPLC, so issues may occur. If we run into problems, we try restarting the PLC container.
