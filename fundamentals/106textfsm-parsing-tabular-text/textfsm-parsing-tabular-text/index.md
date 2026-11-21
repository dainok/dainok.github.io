---
cover: ad
date: 2025-05-17
tags:
- advanced
- fundamentals
- textfsm
---
In the [[TextFSM parsing non-tabular text|previous post]], we discussed how to structure the output of the `show interfaces` command. Now, for educational purposes, let's see how to structure the equivalent command that returns its output in tabular format: `show interfaces status`.

```text
Port        Name               Status       Vlan       Duplex  Speed Type
Gi1/0/1     to SRV1:eth1-1     connected    58         a-full a-1000 10/100/1000BaseTX
Gi1/0/2     to SRV2:mgmt0      notconnect   58           auto   auto 10/100/1000BaseTX
Gi1/0/3                        disabled     1            auto   auto 10/100/1000BaseTX
Gi1/0/4     to SRV3:mgmt0      notconnect   58           auto   auto 10/100/1000BaseTX
```

The first step is to identify the relevant pieces of information, each of which must be associated with a regular expression:

* **Interface:** mandatory, it is also the key: `\w+/\d+/\d+`.
* **Name (description):** an **optional**, generic string that **may include spaces**: `.+?`.
* **Status:** one of several possible strings: `connected|notconnect|disabled`.
* **VLAN:** a number: `\d+`.
* **Duplex:** a non-space string: `\S+`.
* **Speed:** a non-space string: `\S+`.

The value definitions in the template look like this:

```text
Value Key,Required INTERFACE (\w+/\d+/\d+)
Value DESCRIPTION (.+?)
Value DUPLEX (\S+)
Value SPEED (\S+)
Value STATUS (connected|notconnect|disabled)
Value VLAN (\d+)
```

The structure of the input text is simpler than in the previous example: each line is a record.

```text
^${INTERFACE} -> Record
```

The table includes a header, which we can either consume or use to define a specific state.

Our template therefore includes only the `Start` and `Interface` states. Since each line is a record, we need only a minimal number of rules:

```text
Start
  ^Port -> Interface
  ^\s*$$
  ^. -> Error

Interface
  ^${INTERFACE}\s+${DESCRIPTION}\s+${STATUS}\s+${VLAN}\s+${DUPLEX}\s+${SPEED}\s+.*$$ -> Record
  ^\s*$$
  ^. -> Error
```

The [input text](https://github.com/dainok/courses/blob/master/Various/TextFSM/example6.raw) and the [associated template](https://github.com/dainok/courses/blob/master/Various/TextFSM/example6.textfsm) are available in the [GitHub repository](https://github.com/dainok/courses/tree/master/Various/TextFSM).
