---
cover: ad
date: 2025-02-19
tags:
- beginner
- modbus
- ot-ics
---
Modbus is a widely used industrial communication protocol, originally developed by Modicon (now part of Schneider Electric) in 1979. It is open, royalty-free and simple to implement, which makes it one of the most popular protocols for connecting Programmable Logic Controllers (PLCs), Remote Terminal Units (RTUs), sensors and other industrial devices.

Modbus is primarily used for data exchange in supervisory control and data acquisition (SCADA) systems and distributed control systems (DCS). The protocol is designed for reliable and deterministic communication, which is essential in industrial automation environments.

## Modbus Protocol Overview

Modbus uses a client-server architecture (historically called master-slave):

* The client (master) initiates the requests, reading from or writing to the devices.
* The servers (slaves) respond to the requests but never initiate communication on their own.

A client (such as an HMI or a SCADA system) communicates with one or more servers (such as PLCs, RTUs or field devices) over a network. In RTU mode, each server is assigned a unique 8-bit address, from 1 to 247. Modbus RTU (Remote Terminal Unit) usually runs over RS-485 (serial network).

Modbus TCP (Modbus over TCP/IP):

* Encapsulates Modbus messages inside TCP/IP packets, for transmission over Ethernet networks.
* Uses port 502 as the standard communication port.
* Does not need the timing-based message separation of RTU, which makes it easier to integrate with modern IT networks.
* Allows multiple clients to communicate with a single server, unlike Modbus RTU, which supports only one master.

Modbus data is organized in "registers", which store information in predefined formats. Each register type serves a specific purpose:

| Register Numbers | Type       | Address | Name                                 | Data Type  | Value Range |
| ---------------- | ---------- | ------- | ------------------------------------ | ---------- | ----------- |
| 1-9999           | Read-Write | %IX     | Status/Coil (State controls)         | bool       | 0 or 1      |
| 10001-19999      | Read-Only  | %QX     | Input Contact (State information)    | bool       | 0 or 1      |
| 30001-39999      | Read-Only  | %QW     | Input Registers (Numerical values)   | uint, word | 0 to 32767  |
| 40001-49999      | Read-Write | %IW     | Holding Registers (Numerical values) | uint, word | 0 to 32767  |

Holding registers and input registers handle analog values, while coils and discrete inputs handle binary (on/off) signals.

## Modbus Function Codes

Modbus uses function codes to perform operations on registers and coils. The function code specifies whether data is read or written and which type of data is accessed.

| Function Code | Description                      | Register Type             |
| ------------- | -------------------------------- | ------------------------- |
| 1             | Read Coil                        | Coil (Discrete Output)    |
| 2             | Read Discrete Input              | Discrete Input            |
| 3             | Read Holding Registers           | Holding Register (16-bit) |
| 4             | Read Input Registers             | Input Register (16-bit)   |
| 5             | Write Single Coil                | Coil (Discrete Output)    |
| 6             | Write Single Holding Register    | Holding Register (16-bit) |
| 15            | Write Multiple Coils             | Coil (Discrete Output)    |
| 16            | Write Multiple Holding Registers | Holding Register (16-bit) |

Each request consists of:

* Function code (e.g., `03` for reading holding registers).
* Start address (the register or coil address).
* Number of registers or coils.
* Data (for write operations).
* Error checking (CRC for RTU, checksum for ASCII, or TCP checksum for Modbus TCP).

## Conclusion

Modbus remains one of the most widely used industrial communication protocols, thanks to its simplicity, reliability and interoperability. As IT and OT networks converge, however, securing Modbus communication is critical to prevent cyber threats and operational disruptions.

Despite its widespread use, Modbus has no built-in security mechanisms, which exposes it to threats such as:

* Eavesdropping: Modbus traffic can be intercepted and read.
* Unauthorized commands: there is no authentication, so any device can issue commands.
* Man-in-the-Middle (MITM) attacks: an attacker can modify Modbus traffic.

For more information, see [Modbus 101 - Introduction to Modbus](https://www.csimn.com/CSI_pages/Modbus101.html).
