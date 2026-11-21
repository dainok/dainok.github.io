---
cover: ad
date: 2025-04-23
tags:
- intermediate
- ot-ics
---
Compared to VirtuaPlant, this scenario is more complex and lets us explore attacks on a PLC in greater detail.

## Reconnaissance Phase

As before, we analyze the holding registers and the coils:

```bash
./modbus_monitor.py -i 172.26.104.32 -t holding
```

![[chemical-plant-modbus-values.png]]

```bash
./modbus_monitor.py -i 172.26.104.32 -t coil
```

Among the coils, only register 0 is set.

## Attack Phase

Coils store binary values, which makes them ideal for controlling the operational state of the entire plant.

We can modify coil 0 and verify that it stops the plant:

```bash
./modbus_write.py -i 172.26.104.32 -s c 0 1
```

From this point on, the HMI can no longer start the plant, because every interaction is immediately overridden by the attack.

## Uploading a Malicious Program

In VirtuaPlant the PLC was simulated by the same application as the plant. Here, instead, we have a PLC that runs its own control program (OpenPLC), together with its Engineering Workstation (EWS). The EWS is typically used to develop, test and deploy PLC programs.

An attacker who gains access to the EWS can analyze the existing program, modify it and upload a malicious version to the PLC.

In real environments, PLCs often have a hardware switch that must be in the correct position to allow software overwrites. In every facility I have visited, however, these switches were left in "Program Mode", which nullifies this security measure.

![[plc-program-mode.png]]

Let's assume that the attacker gains control of the EWS and can upload the `grficsv2-simplified_te` program.

* Among the Function Blocks, there is a function called `pressure_control`.
* At the top, we can see all the defined variables, including `pressure_sp` (setpoint).
* The variable is initialized to `58981`.
* The attacker changes it to `65535`, so that the pressure rises uncontrollably.

![[plc-program.png]]

Once the program is compiled and uploaded to the PLC, the pressure slowly increases and stresses the plant:

![[plant-warning.png]]

![[plant-critical.png]]

Eventually, the pressure reaches a critical point and the plant explodes:

![[plant-damaged.png]]

The original training videos, Fortiphyd ICS Training - GRFICS, are available on their [YouTube channel](https://www.youtube.com/playlist?list=PL2RSrzaDx0R670yPlYPqM51guk3bQjFG5).
