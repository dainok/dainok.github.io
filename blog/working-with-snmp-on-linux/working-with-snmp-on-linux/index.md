---
cover: linux
date: 2017-03-29
tags:
- blog
- intermediate
- linux
- security
- snmp
---
Every time I work with the Linux SNMP utilities, I have to re-learn some commands. This post summarizes the useful SNMP commands for anyone who needs a reference guide.

## Common Options

I usually need to build a custom and trusted MIB repository. Every SNMP utility accepts the following flags:

* `-M` takes one or more directories where to look for MIB files.
* `-m` selectively loads MIB files from the directories above. I usually use `ALL`.

## SNMP Translate

Dealing with MIB files can be a pain. Sometimes it is faster and simpler to use numeric OIDs. But how can we find the numeric OID from the alphabetic one, and back?

Find the matching MIB files given a regex:

```bash
$ snmptranslate -m ALL -M mibs -TB sysName
SNMPv2-MIB::sysName
```

Print the numeric OID given an alphabetic one:

```bash
$ snmptranslate -m ALL -M $HOME/.snmp/mibs -On SNMPv2-MIB::sysName
.1.3.6.1.2.1.1.5
```

Print the alphabetic OID given a numeric one:

```bash
$ snmptranslate -m ALL -M $HOME/.snmp/mibs .1.3.6.1.2.1.1.5
SNMPv2-MIB::sysName
```

Print only the last symbolic element of an OID (numeric or alphabetic):

```bash
$ snmptranslate -m ALL -M $HOME/.snmp/mibs -Os .1.3.6.1.2.1.1.5
sysName
```

Print the full alphabetic OID given a numeric one:

```bash
$ snmptranslate -m ALL -M $HOME/.snmp/mibs -Of .1.3.6.1.2.1.1.5
.iso.org.dod.internet.mgmt.mib-2.system.sysName
```

## SNMP Get and Walk

Get a single SNMP entry:

```bash
$ snmpget -m ALL -M $HOME/.snmp/mibs -v3 -l authNoPriv -u username -a SHA -A password 10.1.1.6 sysName
SNMPv2-MIB::sysName = No Such Instance currently exists at this OID
```

The `snmpget` command does not "walk", so we must provide the exact OID:

```bash
$ snmpget -m ALL -M $HOME/.snmp/mibs -v3 -l authNoPriv -u username -a SHA -A password 10.1.1.6 sysName.0
SNMPv2-MIB::sysName.0 = STRING: router.example.com
```

For this reason, `snmpwalk` is usually preferred:

```bash
$ snmpwalk -m ALL -M $HOME/.snmp/mibs -v3 -l authNoPriv -u username -a SHA -A password 10.1.1.6 sysName
SNMPv2-MIB::sysName.0 = STRING: router.example.com
```

## Get a Table via SNMP

Some SNMP entries can be retrieved individually or aggregated in a table. Those attributes usually contain `Table` in the alphabetic OID. Let's retrieve `ifTable`, for example:

```bash
$ snmptable -m ALL -M $HOME/.snmp/mibs -v3 -l authNoPriv -u username -a SHA -A password -Cf , 10.1.1.6 ifTable
SNMP table: IF-MIB::ifTable

ifIndex,ifDescr,ifType,ifMtu,ifSpeed,ifPhysAddress,ifAdminStatus,ifOperStatus,ifLastChange,ifInOctets,ifInUcastPkts,ifInNUcastPkts,ifInDiscards,ifInErrors,ifInUnknownProtos,ifOutOctets,ifOutUcastPkts,ifOutNUcastPkts,ifOutDiscards,ifOutErrors,ifOutQLen,ifSpecific
1,Ethernet0/0,ethernetCsmacd,1500,10000000,0:2:16:cd:7:a0,up,up,0:13:59:40.11,1933415192,81395,19172271,114,102,7142667,129749909,1081118,186805,0,48,0,ccitt.0
2,Null0,other,1500,4294967295,,up,up,0:0:00:00.00,0,0,0,0,0,0,0,0,0,0,0,0,ccitt.0
```

The example above delimits the columns with a `,`, which is useful to generate CSV-compatible output.

For a large screen, we can use the following more readable output:

```bash
$ snmptable -m ALL -M $HOME/.snmp/mibs -v3 -l authNoPriv -u username -a SHA -A password -Cc 10 10.1.1.6 ifTable
SNMP table: IF-MIB::ifTable

   ifIndex   ifDescr    ifType     ifMtu   ifSpeed ifPhysAdd ifAdminSt ifOperSta ifLastCha ifInOctet ifInUcast ifInNUcas ifInDisca ifInError ifInUnkno ifOutOcte ifOutUcas ifOutNUca ifOutDisc ifOutErro ifOutQLen ifSpecifi
         1 Ethernet0 ethernetC      1500  10000000 0:2:16:cd        up        up 0:13:59:4 193354931     81408  19173500       114       102   7143018 129757359   1081161    186811         0        48         0   ccitt.0
         2     Null0     other      1500 429496729                  up        up 0:0:00:00         0         0         0         0         0         0         0         0         0         0         0         0   ccitt.0
```

## References

* [SNMP Object Navigator](http://snmp.cloudapps.cisco.com/Support/SNMP/do/BrowseOID.do?local=en "SNMP Object Navigator")
* [Private Enterprise Numbers](https://www.iana.org/assignments/enterprise-numbers/enterprise-numbers "Private Enterprise Numbers")
* [Private Enterprise Number (PEN) Request](http://pen.iana.org/pen/PenApplication.page "Private Enterprise Number (PEN) Request")
