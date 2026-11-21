---
cover: cmdbuild
date: 2017-11-22
tags:
- advanced
- blog
- cmdb
- governance
- ssot
---
Can we use a CMDB for the whole IT management? In this post, we see what a CMDB should be and how to import existing network devices into a CMDB using NAPALM. Finally, we see how to operate on network devices from a CMDB and how to push configurations. This post is a compendium to my speech in Milan at the AutomateIT² event.

Suppose an IT manager asks his staff for the total number of active VMs:

* Alice consults an Excel file and reports 1984 running systems. (What should be.)
* Bob consults AWS, Azure, Google Compute Engine and the internal vCenter, and reports 2010 running systems. (What is.)
* Carol remembers that 5 internal VMs are running 33 Docker containers, and asks whether to include them or not. (Exception.)

What happened?

The number of running VMs reported by an Excel file does not match the real world. The real world is reported by vCenter, AWS, Azure and Google Compute Engine. We can call them the [[Leveraging Nautobot as a SSOT|Source of Truth]].

> Source of Truth (SOT)
> The source of truth is a trusted data source that gives a complete picture of the data object as a whole. (What is.)

The Excel file reports what should be. We can call it the Source of Record and, because it should be unique, the Single Source of Record:

> System of Record (SOR)
> A system of record is the authoritative data source for a given data element or piece of information. (What should be.)

I know that these definitions differ from what others use, but I guess you agree that vCenter is a Source of Truth, not an Excel file. Let me give you an example.

Suppose you have a fantastic system that synchronizes vCenter with an Excel file. Are you sure that a manually created VM is added to the Excel file? Are you sure that a powered-off, orphaned VM is added to the Excel file? Are you sure that Excel reports the real number of VMs at any moment?

That is why I am convinced that the definition "Single Source of Truth" is wrong, and why I changed it to "Single System of Record".

Suppose now that we want to store all the IT data in a single place: Excel is obviously not the right place. We should use a different and more flexible data structure, depending on our needs: we could use CMDBuild, iTop, or simply [[Git fundamentals for developers and IT professionals|Git]]/CVS, depending on the requirements.

In this example, we suppose that we want to store every single IT item (device, service, database schema...) in a single place. In this case, we need a CMDB:

> A configuration management database (CMDB) is a repository that acts as a data warehouse for information technology (IT) installations. It holds data relating to a collection of IT assets (commonly referred to as configuration items (CI)), as well as to descriptive relationships between such assets.

Let's now focus on CMDBuild as a CMDB.

![[cmdbuild-01.png]]

## CMDBuild Installation on Ubuntu 16.04

Before starting, we download the following three packages:

1. The latest [JRE](https://www.java.com/it/download/manual.jsp "Latest Java version").
2. The latest [Tomcat](https://tomcat.apache.org/download-90.cgi "Latest Apache Tomcat").
3. The latest [CMDBuild](http://www.cmdbuild.org/en/download "Latest CMDBuild").

We make sure the locale is set to `en_US.UTF-8`. If not, we reconfigure it:

```bash
dpkg-reconfigure locales
```

We install PostgreSQL and set the admin password:

```bash
$ sudo dpkg-reconfigure locales
$ sudo apt-get -y install postgresql
$ sudo -u postgres psql
\password postgres
\q
```

We unpack Java and set it as the default for the system:

```bash
$ tar -xzf jre-8u141-linux-x64.tar.gz -C /opt
$ update-alternatives --install /usr/bin/java java /opt/jre1.8.0_141/bin/java 1
$ echo 1 | update-alternatives --config java
$ java -version
java version "1.8.0_141"
Java(TM) SE Runtime Environment (build 1.8.0_141-b15)
Java HotSpot(TM) 64-Bit Server VM (build 25.141-b15, mixed mode)
```

We unpack Tomcat, add the CMDBuild app to it and start the container:

```bash
$ tar -xzf apache-tomcat-8.5.16.tar.gz -C /opt
$ unzip cmdbuild-2.4.3.zip
$ cp cmdbuild-2.4.3/cmdbuild-2.4.3.war /opt/apache-tomcat-8.5.16/webapps
$ cp cmdbuild-2.4.3/extras/tomcat-libs/6.0\ or\ higher/postgresql-9.4.1207.jar /opt/apache-tomcat-8.5.16/lib
$ /opt/apache-tomcat-8.5.16/bin/startup.sh
Using CATALINA_BASE:   /opt/apache-tomcat-8.5.16
Using CATALINA_HOME:   /opt/apache-tomcat-8.5.16
Using CATALINA_TMPDIR: /opt/apache-tomcat-8.5.16/temp
Using JRE_HOME:        /usr
Using CLASSPATH:       /opt/apache-tomcat-8.5.16/bin/bootstrap.jar:/opt/apache-tomcat-8.5.16/bin/tomcat-juli.jar
Tomcat started.
```

Now CMDBuild is available at `http://cmdb.example.com:8080/cmdbuild-2.4.3/`. We connect to the CMDBuild web app and do the first configuration:

* Type: Empty.
* Name: `cmdbuild`.
* Host: `localhost`.
* Port: `5432`.
* Super user: `postgres`.
* Password: `<the password configured before>`.
* User type: `Super user`.

We make sure the `cmdbuild` database does not exist. If it does (or if we want to start from the beginning), we delete it with:

```bash
psql -h localhost -U postgres -W -c "drop database cmdbuild"
```

If we encounter errors, we also check `/var/log/postgresql` for logs.

## Minimal Configuration of CMDBuild

The configuration of CMDBuild is out of scope, but a brief introduction is needed for this post.

CMDBuild presents two views:

* The data management module, the default after login, which lets us manage data.
* The administration module, which lets us manage structures.

The first step is to build the structures for our asset data. We open the administration module, go to classes and add the following classes:

* Name: `asset`
  * Description: `Asset`
  * Type: `Standard`
  * Inherits from: `Class`
  * Superclass: `yes`
* Name: `infrastructure`
  * Description: `Infrastructure`
  * Type: `Standard`
  * Inherits from: `Asset`
  * Superclass: `yes`
* Name: `networkdevices`
  * Description: `Network Devices`
  * Type: `Standard`
  * Inherits from: `Infrastructure`
  * Superclass: `no`
* Name: `networks`
  * Description: `Networks`
  * Type: `Standard`
  * Inherits from: `Asset`
  * Superclass: `yes`
* Name: `ipv4addresses`
  * Description: `IPv4 Addresses`
  * Type: `Standard`
  * Inherits from: `Networks`
  * Superclass: `no`
* Name: `ipv4networks`
  * Description: `IPv4 Networks`
  * Type: `Standard`
  * Inherits from: `Networks`
  * Superclass: `no`
* Name: `interfaces`
  * Description: `Interfaces`
  * Type: `Standard`
  * Inherits from: `Networks`
  * Superclass: `no`

The second step is to build the relationships for the classes above. The idea is the following:

* A network device (a router, for example) contains many interfaces.
* Each interface can have VLANs, one VRF, IPv4 addresses and one OSPF area.
* Each IPv4 address is part of an IPv4 network.

We go to domains and add the following domains:

* Name: `networkdevice2interfaces`
  * Description: `Network Device to Interfaces`
  * Origin: `Network Devices`
  * Destination: `Interfaces`
  * Direct description: `Interface`
  * Inverse description: `Device`
  * Cardinality: `1:N`
* Name: `interface2ipv4addresses`
  * Description: `Interface to IPv4 Addresses`
  * Origin: `Interfaces`
  * Destination: `IPv4 Addresses`
  * Direct description: `IPV4 Address`
  * Inverse description: `Interface`
  * Cardinality: `1:N`
* Name: `ipv4addresstoipv4network`
  * Description: `IPv4 Address to IPv4 Network`
  * Origin: `IPv4 Addresses`
  * Destination: `IPv4 Networks`
  * Direct description: `IPv4 Network`
  * Inverse description: `IPV4 Address`
  * Cardinality: `N:1`
* Name: `interface2interface`
  * Description: `Interface to Interface`
  * Origin: `Interfaces`
  * Destination: `Interfaces`
  * Direct description: `Connected to`
  * Inverse description: `Connected to`
  * Cardinality: `1:1`

Finally, we configure the attributes of each class:

* Network Devices:
  * Code: Serial (Unique, Mandatory, `STRING(100)`)
  * Description: Hostname (Unique, Mandatory, `STRING(250)`)
  * Vendor: Vendor (Unique, Mandatory, `STRING(256)`)
  * Version: Version (Mandatory, `STRING(256)`)
* Interfaces:
  * Code: MAC Address (Mandatory, `STRING(100)`)
  * Description: Interface Name (Unique, Mandatory, `STRING(250)`)
* IPv4 Addresses:
  * Description: IPV4Address (Unique, Mandatory, `STRING(100)`)
  * FQDN: FQDN (`STRING(250)`)
* IPv4 Networks:
  * Description: IPv4 Network (Unique, Mandatory, `STRING(100)`)

Now a basic structure of the CMDB is ready.

![[cmdbuild-02.png]]

## Discovering a Network Device

Nowadays there are many ways to discover a network device. The classic one is based on the widely supported [[Review of SNMP Fundamentals|SNMP]] protocol. Suppose we have a Cisco router, and we configure it with an SNMPv3 user:

```bash
snmp-server view ISO iso included
snmp-server group MONITORING v3 auth read ISO
snmp-server user snmpmonitor MONITORING v3 auth sha snmppassword
```

Now we can get some useful information via SNMPv3:

```bash
apt-get -y install snmp snmp-mibs-downloader
snmpwalk -mALL -v3 -l authNoPriv -a SHA -u snmpmonitor -A snmppassword -On 192.168.6.201 sysName
snmpwalk -mALL -v3 -l authNoPriv -a SHA -u snmpmonitor -A snmppassword -On 192.168.6.201 ifName
snmpwalk -mALL -v3 -l authNoPriv -a SHA -u snmpmonitor -A snmppassword -On 192.168.6.201 ipAddrTable
```

Finding all the information via SNMP can be hard, because the data structures (MIBs) are not easy to find and understand. Another way to get information from network devices is NAPALM:

```bash
apt-get -y install python3-pip
pip3 install napalm
```

Before using NAPALM with a classic Cisco IOS device (via SSH), we must configure the device:

```text
hostname R1
ip domain name infra.example.com
username admin privilege 15 password cisco
crypto key generate rsa
line vty 0 4
 login local
 transport input ssh
```

Remember that we need a key of at least 768 bits and, of course, a reachable IP address.

Now we can discover the devices using the first script:

```bash
./1-scan.py 192.168.6.201
./1-scan.py 192.168.6.202
```

After the execution, CMDBuild is populated with some information gathered from the discovered devices. The script:

* Collects the hostname, interfaces, MAC addresses and IP addresses.
* Adds all the collected data to CMDBuild and creates the relationships between the objects.

![[cmdbuild-03.png]]

## Managing the Infrastructure from a CMDB

Every network change should start from a CMDB. Let's see, for example, how to configure a new interface. In `Asset` → `Networks` → `IPv4 Networks`, we add a card: `10.1.2.0/24`. Then we go to `Asset` → `Networks` → `IPv4 Addresses` and add two IP addresses: `10.1.2.1` and `10.1.2.2`. We make sure that we link each IP address to the parent network (`10.1.2.0/24`), creating the proper relationship. Then we go to `Asset` → `Networks` → `Interfaces` and create two relationships, each between an interface and an IP address.

![[cmdbuild-04.png]]

The configuration is complete, so we push it to the devices:

```bash
./2-push.py R1
./2-push.py R2
```

Now R1 can ping R2:

```bash
$ ./3-test.py 192.168.6.201 10.1.2.2 | python -m json.tool
{
    "success": {
        "packet_loss": 0,
        "probes_sent": 5,
        "results": [
            {
                "ip_address": "10.1.2.2",
                "rtt": 0.0
            },
            {
                "ip_address": "10.1.2.2",
                "rtt": 0.0
            },
            {
                "ip_address": "10.1.2.2",
                "rtt": 0.0
            },
            {
                "ip_address": "10.1.2.2",
                "rtt": 0.0
            },
            {
                "ip_address": "10.1.2.2",
                "rtt": 0.0
            }
        ],
        "rtt_avg": 1.0,
        "rtt_max": 2.0,
        "rtt_min": 1.0,
        "rtt_stddev": 0.0
    }
}
```

## Useful CMDBuild APIs

I found the official documentation by Tecnoteca not very exhaustive. Here are the APIs I used.

### Authentication and Sessions

The first request must authenticate against CMDBuild and get a session token:

```bash
$ curl -s -X POST -H "Content-Type: application/json" --data-binary '{"username": "admin", "password": "admin"}' "http://localhost:8080/cmdbuild-2.4.3/services/rest/v1/sessions" | python3 -m json.tool
{
    "data": {
        "username": "admin",
        "role": "SuperUser",
        "availableRoles": [
            "SuperUser"
        ],
        "_id": "hb90u9d3l4jqunf8ni6s7jisli"
    }
}
```

The session token is `hb90u9d3l4jqunf8ni6s7jisli`. All the queries must include the token in the HTTP headers: `CMDBuild-Authorization: hb90u9d3l4jqunf8ni6s7jisli`.

### List the Classes

```bash
$ curl -s -X GET -H "CMDBuild-Authorization: hb90u9d3l4jqunf8ni6s7jisli" "http://localhost:8080/cmdbuild-2.4.3/services/rest/v2/classes" | python3 -m json.tool
{
    "data": [
        {
            "name": "Class",
            "description": "Class",
            "parent": null,
            "prototype": true,
            "_id": "Class"
        },
        {
            "name": "asset",
            "description": "Asset",
            "parent": "Class",
            "prototype": true,
            "_id": "asset"
        },
        {
            "name": "infrastructure",
            "description": "Infrastructure",
            "parent": "asset",
            "prototype": true,
            "_id": "infrastructure"
        },
        {
            "name": "interfaces",
            "description": "Interfaces",
            "parent": "networks",
            "prototype": false,
            "_id": "interfaces"
        },
        {
            "name": "ipv4addresses",
            "description": "IPv4 Addresses",
            "parent": "networks",
            "prototype": false,
            "_id": "ipv4addresses"
        },
        {
            "name": "ipv4networks",
            "description": "IPv4 Networks",
            "parent": "networks",
            "prototype": false,
            "_id": "ipv4networks"
        },
        {
            "name": "networkdevices",
            "description": "Network Devices",
            "parent": "infrastructure",
            "prototype": false,
            "_id": "networkdevices"
        },
        {
            "name": "networks",
            "description": "Networks",
            "parent": "asset",
            "prototype": true,
            "_id": "networks"
        }
    ],
    "meta": {
        "total": 8,
        "positions": {},
        "references": {}
    }
}
```

### List All the Entries (Cards) of a Class

```bash
$ curl -s -X GET -H "CMDBuild-Authorization: hb90u9d3l4jqunf8ni6s7jisli" "http://localhost:8080/cmdbuild-2.4.3/services/rest/v2/classes/networkdevices/cards" | python3 -m json.tool
{
    "data": [
        {
            "Description": "R1",
            "Version": "Linux Software (I86BI_LINUX-ADVENTERPRISEK9-M), Version 15.5(2)T, DEVELOPMENT TEST SOFTWARE",
            "_type": "networkdevices",
            "Vendor": "Cisco",
            "_id": 275,
            "Code": "67108880",
            "Notes": null
        },
        {
            "Description": "R2",
            "Version": "Linux Software (I86BI_LINUX-ADVENTERPRISEK9-M), Version 15.5(2)T, DEVELOPMENT TEST SOFTWARE",
            "_type": "networkdevices",
            "Vendor": "Cisco",
            "_id": 301,
            "Code": "67108896",
            "Notes": null
        }
    ],
    "meta": {
        "total": 2,
        "positions": {},
        "references": {}
    }
}
```

### List a Specific Entry (Card) of a Class

```bash
$ curl -s -X GET -H "CMDBuild-Authorization: hb90u9d3l4jqunf8ni6s7jisli" "http://localhost:8080/cmdbuild-2.4.3/services/rest/v2/classes/networkdevices/cards/275" | python3 -m json.tool
{
    "data": {
        "Description": "R1",
        "Version": "Linux Software (I86BI_LINUX-ADVENTERPRISEK9-M), Version 15.5(2)T, DEVELOPMENT TEST SOFTWARE",
        "_type": "networkdevices",
        "Vendor": "Cisco",
        "_id": 275,
        "Code": "67108880",
        "Notes": null
    },
    "meta": {
        "total": null,
        "positions": {},
        "references": {}
    }
}
```

### Filter the Output (Cards)

We prepare a filter like the following:

```json
{
    "attribute": {
        "simple": {
            "attribute": "Description",
            "operator": "equal",
            "value": [
                "R1"
            ]
        }
    }
}
```

The operators can be `contain`, `equal`, `notequal`, `like` (using `%`), `isnull`, `isnotnull`, `greater` and `lower`.

We can combine filters with `and` or `or`:

```json
{
    "attribute": {
        "or": [{
            "simple": {
                "attribute": "Description",
                "operator": "equal",
                "value": ["R1"]
            }
        }, {
            "simple": {
                "attribute": "Description",
                "operator": "equal",
                "value": ["R2"]
            }
        }]
    }
}
```

We apply the URL-encoded filter using a GET request:

```bash
$ curl -s -X GET -H "CMDBuild-Authorization: hb90u9d3l4jqunf8ni6s7jisli" --data-urlencode 'filter={"attribute":{"simple":{"attribute":"Description","operator":"equal","value":["R1"]}}}' -G "http://localhost:8080/cmdbuild-2.4.3/services/rest/v2/classes/networkdevices/cards" | python3 -m json.tool
{
    "data": [
        {
            "Description": "R1",
            "Version": "Linux Software (I86BI_LINUX-ADVENTERPRISEK9-M), Version 15.5(2)T, DEVELOPMENT TEST SOFTWARE",
            "_type": "networkdevices",
            "Vendor": "Cisco",
            "_id": 275,
            "Code": "67108880",
            "Notes": null
        }
    ],
    "meta": {
        "total": 1,
        "positions": {},
        "references": {}
    }
}
```

### List All the Relationships (Domains)

```bash
$ curl -s -X GET -H "CMDBuild-Authorization: hb90u9d3l4jqunf8ni6s7jisli" "http://localhost:8080/cmdbuild-2.4.3/services/rest/v2/domains" | python3 -m json.tool
{
    "data": [
        {
            "name": "networkdevice2interfaces",
            "description": "Network Device to Interfaces",
            "_id": "networkdevice2interfaces"
        },
        {
            "name": "ipv4addresstoipv4network",
            "description": "IPv4 Address to IPv4 Network",
            "_id": "ipv4addresstoipv4network"
        },
        {
            "name": "interface2ipv4addresses",
            "description": "Interface to IPv4 Addresses",
            "_id": "interface2ipv4addresses"
        },
        {
            "name": "interface2interface",
            "description": "Interface to Interface",
            "_id": "interface2interface"
        }
    ],
    "meta": {
        "total": 4,
        "positions": {},
        "references": {}
    }
}
```

### List All the Relationships of a Specific Domain

```bash
$ curl -s -X GET -H "CMDBuild-Authorization: hb90u9d3l4jqunf8ni6s7jisli" "http://localhost:8080/cmdbuild-2.4.3/services/rest/v2/domains/networkdevice2interfaces/relations" | python -m json.tool
{
    "data": [
        {
            "_destinationDescription": "R1:Ethernet0/0",
            "_destinationId": 289,
            "_destinationType": "interfaces",
            "_id": 291,
            "_sourceDescription": "R1",
            "_sourceId": 275,
            "_sourceType": "networkdevices",
            "_type": "networkdevice2interfaces"
        },
        {
            "_destinationDescription": "R1:Ethernet0/1",
            "_destinationId": 277,
            "_destinationType": "interfaces",
            "_id": 279,
            "_sourceDescription": "R1",
            "_sourceId": 275,
            "_sourceType": "networkdevices",
            "_type": "networkdevice2interfaces"
        },
        {
            "_destinationDescription": "R1:Ethernet0/2",
            "_destinationId": 281,
            "_destinationType": "interfaces",
            "_id": 283,
            "_sourceDescription": "R1",
            "_sourceId": 275,
            "_sourceType": "networkdevices",
            "_type": "networkdevice2interfaces"
        },
        {
            "_destinationDescription": "R1:Ethernet0/3",
            "_destinationId": 285,
            "_destinationType": "interfaces",
            "_id": 287,
            "_sourceDescription": "R1",
            "_sourceId": 275,
            "_sourceType": "networkdevices",
            "_type": "networkdevice2interfaces"
        },
        {
            "_destinationDescription": "R2:Ethernet0/0",
            "_destinationId": 311,
            "_destinationType": "interfaces",
            "_id": 313,
            "_sourceDescription": "R2",
            "_sourceId": 301,
            "_sourceType": "networkdevices",
            "_type": "networkdevice2interfaces"
        },
        {
            "_destinationDescription": "R2:Ethernet0/1",
            "_destinationId": 307,
            "_destinationType": "interfaces",
            "_id": 309,
            "_sourceDescription": "R2",
            "_sourceId": 301,
            "_sourceType": "networkdevices",
            "_type": "networkdevice2interfaces"
        },
        {
            "_destinationDescription": "R2:Ethernet0/2",
            "_destinationId": 303,
            "_destinationType": "interfaces",
            "_id": 305,
            "_sourceDescription": "R2",
            "_sourceId": 301,
            "_sourceType": "networkdevices",
            "_type": "networkdevice2interfaces"
        },
        {
            "_destinationDescription": "R2:Ethernet0/3",
            "_destinationId": 321,
            "_destinationType": "interfaces",
            "_id": 323,
            "_sourceDescription": "R2",
            "_sourceId": 301,
            "_sourceType": "networkdevices",
            "_type": "networkdevice2interfaces"
        }
    ],
    "meta": {
        "positions": {},
        "references": {},
        "total": 8
    }
}
```

### Filter the Output (Domains)

We prepare a filter like the following:

```json
{
    "attribute": {
        "or": [{
            "simple": {
                "attribute": "_sourceId",
                "operator": "equal",
                "value": ["275"]
            }
        }, {
            "simple": {
                "attribute": "_destinationId",
                "operator": "equal",
                "value": ["275"]
            }
        }]
    }
}
```

We apply the URL-encoded filter using a GET request:

```bash
$ curl -s -X GET -H "CMDBuild-Authorization: hb90u9d3l4jqunf8ni6s7jisli" --data-urlencode 'filter={"attribute":{"or":[{"simple":{"attribute":"_sourceId","operator":"equal","value":["275"]}},{"simple":{"attribute":"_destinationId","operator":"equal","value":["275"]}}]}}' -G "http://localhost:8080/cmdbuild-2.4.3/services/rest/v2/domains/networkdevice2interfaces/relations" | python -m json.tool
{
    "data": [
        {
            "_destinationDescription": "R1:Ethernet0/0",
            "_destinationId": 289,
            "_destinationType": "interfaces",
            "_id": 291,
            "_sourceDescription": "R1",
            "_sourceId": 275,
            "_sourceType": "networkdevices",
            "_type": "networkdevice2interfaces"
        },
        {
            "_destinationDescription": "R1:Ethernet0/1",
            "_destinationId": 277,
            "_destinationType": "interfaces",
            "_id": 279,
            "_sourceDescription": "R1",
            "_sourceId": 275,
            "_sourceType": "networkdevices",
            "_type": "networkdevice2interfaces"
        },
        {
            "_destinationDescription": "R1:Ethernet0/2",
            "_destinationId": 281,
            "_destinationType": "interfaces",
            "_id": 283,
            "_sourceDescription": "R1",
            "_sourceId": 275,
            "_sourceType": "networkdevices",
            "_type": "networkdevice2interfaces"
        },
        {
            "_destinationDescription": "R1:Ethernet0/3",
            "_destinationId": 285,
            "_destinationType": "interfaces",
            "_id": 287,
            "_sourceDescription": "R1",
            "_sourceId": 275,
            "_sourceType": "networkdevices",
            "_type": "networkdevice2interfaces"
        }
    ],
    "meta": {
        "positions": {},
        "references": {},
        "total": 4
    }
}
```

### Add a New Entry (Card)

```bash
$ curl -s -X POST -H "CMDBuild-Authorization: hb90u9d3l4jqunf8ni6s7jisli" -H "Content-Type: application/json" --data-binary '{"Code":"67108912","Description":"Router R3","Vendor":"Cisco","Version":"1"}' "http://localhost:8080/cmdbuild-2.4.3/services/rest/v2/classes/networkdevices/cards" | python3 -m json.tool
{
    "data": 363
}
```

Let's also add a new interface:

```bash
$ curl -s -X POST -H "CMDBuild-Authorization: hb90u9d3l4jqunf8ni6s7jisli" -H "Content-Type: application/json" --data-binary '{"Code":"00:11:22:33:44:55","Description":"R3:Ethernet0/0"}' "http://localhost:8080/cmdbuild-2.4.3/services/rest/v2/classes/interfaces/cards" | python3 -m json.tool
{
    "data": 367
}
```

### Add a New Relationship (Domain)

```bash
$ curl -s -X POST -H "CMDBuild-Authorization: hb90u9d3l4jqunf8ni6s7jisli" -H "Content-Type: application/json" --data-binary '{"_sourceType":"networkdevices","_sourceId":363,"_destinationType":"interfaces","_destinationId":367,"DefaultGroup":"false"}' "http://localhost:8080/cmdbuild-2.4.3/services/rest/v2/domains/networkdevice2interfaces/relations" | python3 -m json.tool
{
    "data": 369
}
```

## References

* [Web Service Manual](http://www.cmdbuild.org/file/manuali/webservice-manual-in-english "Web Service Manual")
* [AutomateIT²](https://automateit2.com/ "AutomateIT²")
