---
cover: ad
date: 2025-03-12
tags:
- attack
- intermediate
- modbus
- ot-ics
---
This scenario is an introduction to attacking a Modbus-based PLC. The goal is to understand the behavior of the system gradually, by monitoring the PLC registers before launching the attack.

## Reconnaissance Phase

Before attacking, we must analyze the behavior of the plant. This means monitoring the PLC registers to identify the active ones and understand how they are used.

For this purpose, I developed a small tool that continuously monitors the Modbus registers to determine which ones are in use. The tool is available in [my GitHub repository](https://github.com/dainok/courses/tree/master/Various/Modbus%20tools).

To monitor the PLC for 15 seconds, we run:

```bash
./modbus_monitor.py -i 172.26.104.12 -p 502 -t holding -k 15
```

From our observations, only holding registers are used, specifically registers 1, 2, 3, 4 and 16. Register 16 holds the value 1, which deserves further investigation.

![[bottle-filling-plant-monitor.png]]

We also see that these registers store binary information (0 or 1), even though Modbus offers dedicated boolean registers for this purpose.

The system operates in three phases:

* **Initialization:** the conveyor moves the first bottle under the nozzle.
* **Filling:** the nozzle opens and fills the bottle.
* **Moving:** the conveyor moves the next bottle into position.

This cycle repeats indefinitely. In a real attack, the adversary would probably have no physical view of how the system operates, but for this lab we simplify the analysis.

From the three phases above, we can identify:

* **Sensors:** used to read the state of the plant. There are two sensors: bottle presence and full bottle.
* **Actuators:** used to change the state of the plant. There are three actuators: plant (on/off), roller and nozzle.

After observing the behavior of the plant and the associated states for some time, we can state that:

* The only registers in use are holding registers.
* Five holding registers are used.
* The holding registers store binary information, using `0` and `1`.
* Registers `1`, `3` and `16` are set when the roller is moving the bottle and the nozzle is closed.
* Registers `2`, `4` and `16` are set when the roller is stopped and the nozzle is filling a bottle.
* In a newly started plant, only registers `3` and `16` are set.

From this, we can deduce that:

* Register `16` (actuator) defines the state of the plant (on/off).
* Register `3` (actuator) defines the state of the conveyor (on/off).
* Register `1` (red sensor) defines whether the bottle is full.
* Registers `2` and `4` change value together.

They are associated with the nozzle actuator and the green bottle presence sensor, but we need further analysis to tell them apart.

## Attack Phase

An attack on a PLC assumes that we can overwrite the values of the registers and that the PLC reacts accordingly. This may seem paradoxical to those coming from IT: does the PLC act on external values written by the attacker, instead of executing its programmed logic? The answer is yes. PLCs often rely on external inputs without strict validation, so they are susceptible to register manipulation. The attacker writes directly into the memory registers of the PLC, and the control logic treats those values as valid.

In the previous phase, we observed that only holding registers with the values 0 and 1 are used, specifically:

* **Register 1:** red sensor, defines whether the bottle is full.
* **Register 2:** to be verified.
* **Register 3:** actuator, defines the state of the conveyor (on/off).
* **Register 4:** to be verified.
* **Register 16:** actuator, defines the state of the plant (on/off).

Now let's try to force the register values by overwriting them continuously. For this purpose, I developed a small tool that continuously writes a specific value to one or more Modbus registers of a PLC. The tool is available in [my GitHub repository](https://github.com/dainok/courses/tree/master/Various/Modbus%20tools).

First, let's check register `4`:

```bash
./modbus_write.py -i 172.26.104.12 -p 502 -s h 4 1
```

The nozzle remains permanently open:

![[bottle-filling-plant-attack-test.png]]

We can now complete our analysis:

* **Register 1:** red sensor, defines whether the bottle is full.
* **Register 2:** green sensor, defines whether the bottle is in position.
* **Register 3:** actuator, defines the state of the conveyor (on/off).
* **Register 4:** actuator, defines the state of the nozzle (open/closed).
* **Register 16:** actuator, defines the state of the plant (on/off).

Now we can plan different attack scenarios by manipulating the actuators.

## Scenario 1: Plant Permanently Off

Regardless of the state of the sensors, the plant remains off, even if an operator intervenes manually via the HMI.

```bash
./modbus_write.py -i 172.26.104.12 -p 502 -s h 16 0
```

**Effect:** the production line remains halted.

## Scenario 2: Nozzle Open and Conveyor Stopped

In this attack, the plant is active and the nozzle remains open, but the conveyor does not operate.

```bash
./modbus_write.py -i 172.26.104.12 -p 502 -s h 3 0 -s h 4 1 -s h 16 1
```

**Effect:** water waste and potential flooding of the facility.

![[bottle-filling-plant-attack-scenario-2a.png]]

In this scenario, the attack script competes with the PLC: the script tries to stop the motor, while the PLC tries to start it as soon as the sensor detects a full bottle.

A more advanced version of the attack also manipulates the two sensors:

```bash
./modbus_write.py -i 172.26.104.12 -p 502 -s h 1 0 -s h 2 1 -s h 3 0 -s h 4 1 -s h 16 1
```

The effect is more stable:

![[bottle-filling-plant-attack-scenario-2b.png]]

If the operator tries to turn off the plant via the HMI, the action has no effect.

## Scenario 3: Conveyor Active and Nozzle Closed

In this attack, the plant is active, the nozzle remains closed and the conveyor runs continuously:

```bash
./modbus_write.py -i 172.26.104.12 -p 502 -s h 1 0 -s h 2 0 -s h 3 1 -s h 4 0 -s h 16 1
```

**Effect:** the production line produces empty bottles.

![[bottle-filling-plant-attack-scenario-3.png]]

Here too, if the operator tries to shut down the plant via the HMI, the action has no effect.
