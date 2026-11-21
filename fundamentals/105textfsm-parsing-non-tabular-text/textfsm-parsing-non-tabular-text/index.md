---
cover: ad
date: 2025-05-31
tags:
- advanced
- fundamentals
- textfsm
---
Many network devices provide two commands to retrieve specific information: the first returns a summarized output in tabular format, while the second provides a more detailed view, typically in a non-tabular format where each entry is separated into a specific section.

The tabular format is more human-readable, but non-tabular text is significantly easier for a machine to interpret.

Let's look at an example: the `show interfaces` command displays detailed information about the interfaces configured on a switch.

```text
GigabitEthernet1/0/1 is up, line protocol is up (connected)
  Hardware is Gigabit Ethernet, address is ecbd.1d38.a901 (bia ecbd.1d38.a901)
  Description: to SRV1:eth1-1
  MTU 1500 bytes, BW 1000000 Kbit/sec, DLY 10 usec,
     reliability 255/255, txload 1/255, rxload 1/255
  Encapsulation ARPA, loopback not set
  Keepalive set (10 sec)
  Full-duplex, 1000Mb/s, media type is 10/100/1000BaseTX
  input flow-control is on, output flow-control is unsupported
  ARP type: ARPA, ARP Timeout 04:00:00
  Last input 27w3d, output 00:00:01, output hang never
  Last clearing of "show interface" counters never
  Input queue: 0/2000/0/0 (size/max/drops/flushes); Total output drops: 0
  Queueing strategy: fifo
  Output queue: 0/40 (size/max)
  30 second input rate 0 bits/sec, 0 packets/sec
  30 second output rate 1000 bits/sec, 1 packets/sec
     4416551 packets input, 760890620 bytes, 0 no buffer
     Received 254313 broadcasts (23 multicasts)
     0 runts, 0 giants, 0 throttles
     0 input errors, 0 CRC, 0 frame, 0 overrun, 0 ignored
     0 watchdog, 23 multicast, 0 pause input
     0 input packets with dribble condition detected
     35009046 packets output, 5719203205 bytes, 0 underruns
     Output 10138785 broadcasts (0 multicasts)
```

The first step is to identify the pieces of information we are interested in, each of which must be associated with a regular expression. Here are a few examples:

* **Interface:** mandatory, it serves as the key: `\w+/\d+/\d+`.
* **Bandwidth:** a string delimited by a comma: `[^,]+`.
* **Description:** a generic string that ends at the end of the line: `.+`.
* **Line status:** one of several possible strings: `up|down|administratively down`.
* **MAC address:** three hexadecimal sequences separated by dots: `([0-9a-f.]{4}\.){2}[0-9a-f]{4}`.
* **MTU:** a number: `\d+`.
* **Protocol status:** one of several possible strings: `up|down`.
* **Interface type:** a string delimited by a comma: `[^,]+`.

The value definitions in the template look like this:

```text
Value Key,Required INTERFACE (\w+/\d+/\d+)
Value BANDWIDTH ([^,]+)
Value DESCRIPTION (.+)
Value LINE_STATUS (up|down|administratively down)
Value MAC (([0-9a-f.]{4}\.){2}[0-9a-f]{4})
Value MTU (\d+)
Value PROTOCOL_STATUS (up|down)
Value TYPE ([^,]+)
```

Next, we analyze the structure of the input text to decide where to insert the `Record` action that stores the data of each interface.

The information of each interface is grouped in a paragraph that begins with the interface name. Since the output starts with an interface name, we must work within the `Start` state (note that we cannot use a state transition together with the `Continue` action).

The line that specifies the interface name also signals the end of the previous record. A first attempt might be the following rule:

```text
^${INTERFACE} is .*$$ -> Record
```

This rule has a clear flaw: it closes the record, but the data that describes the interface appears afterwards.

The correct approach is this: when we read a new interface line, we close the previous record and use the same line to populate the fields of the new record:

```text
^\w+/\d+/\d+ is -> Continue.Record
^${INTERFACE} is .*$$
```

The first rule uses the same pattern as the second, but it does not assign any field values. It only closes the previous record and passes the line to the next rule, which opens the new record.

We can now add the subsequent rules to parse the rest of the text:

```text
Start
  ^\w+/\d+/\d+ is -> Continue.Record
  ^${INTERFACE} is ${LINE_STATUS}, line protocol is ${PROTOCOL_STATUS} .*$$
  ^\s+Hardware is ${TYPE}, address is ${MAC} .*$$
  ^\s+Description: ${DESCRIPTION}$$
  ^\s+MTU ${MTU} bytes, BW ${BANDWIDTH}, .*$$
  ^\s+reliability
  ^\s+Encapsulation
  ^\s+Keepalive
```

The last three rules consume lines we are not interested in. As a best practice, all lines should be consumed, and an error should be raised when unexpected text is found.

```text
Start
  ^\w+/\d+/\d+ is -> Continue.Record
  ^${INTERFACE} is ${LINE_STATUS}, line protocol is ${PROTOCOL_STATUS} .*$$
  ^\s+Hardware is ${TYPE}, address is ${MAC} .*$$
  ^\s+Description: ${DESCRIPTION}$$
  ^\s+MTU ${MTU} bytes, BW ${BANDWIDTH}, .*$$
  ^\s+reliability
  ^\s+Encapsulation
  ^\s+Keepalive
  ^\s+\w+-duplex
  ^\s+input
  ^\s+ARP
  ^\s+Last
  ^\s+Input
  ^\s+Queueing
  ^\s+Output
  ^\s+\d+ \w+ input
  ^\s+\d+ \w+ output
  ^\s+Received
  ^\s+\d+ runts
  ^\s+\d+ input
  ^\s+\d+ watchdog
  ^\s+\d+ output
  ^\s+\d+ unknown
  ^\s+\d+ babbles
  ^\s+\d+ lost
  ^. -> Error
```

The [input text](https://github.com/dainok/courses/blob/master/Various/TextFSM/example5.raw) and the [associated template](https://github.com/dainok/courses/blob/master/Various/TextFSM/example5.textfsm) are available in the [GitHub repository](https://github.com/dainok/courses/tree/master/Various/TextFSM).
