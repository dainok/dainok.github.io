---
cover: paloalto-strata
date: 2025-07-12
tags:
- advanced
- firewall
- palo-alto-networks
---
In the [[Automating Palo Alto Firewall via Python PAN-OS SDK|previous post]], we explored the official [pan-os-python](https://pan.dev/panos/docs/panospython/) library maintained by Palo Alto Networks. We also noted that this library builds on the personal work of Kevin Steves, who developed the [pan-python](https://github.com/kevinsteves/pan-python) library for low-level operations on PAN-OS systems. Kevin also included several [command-line tools](https://github.com/kevinsteves/pan-python/tree/master/bin) to perform operations via CLI instead of Python.

The [documentation](https://github.com/kevinsteves/pan-python/tree/master/doc) is available online in [reStructuredText](https://www.sphinx-doc.org/en/master/usage/restructuredtext/index.html) format. The following modules are supported:

* [pan.afapi](https://github.com/kevinsteves/pan-python/blob/master/doc/pan.afapi.rst): provides CLI access to [AutoFocus](https://docs.paloaltonetworks.com/autofocus) via [panafapi](https://github.com/kevinsteves/pan-python/blob/master/doc/panafapi.rst).
* [pan.licapi](https://github.com/kevinsteves/pan-python/blob/master/doc/pan.licapi.rst): manages PAN-OS licenses via CLI with [panlicapi](https://github.com/kevinsteves/pan-python/blob/master/doc/panlicapi.rst).
* [pan.wfapi](https://github.com/kevinsteves/pan-python/blob/master/doc/pan.wfapi.rst): interfaces with WildFire via CLI with [panwfapi](https://github.com/kevinsteves/pan-python/blob/master/doc/panwfapi.rst).
* [pan.xapi](https://github.com/kevinsteves/pan-python/blob/master/doc/pan.xapi.rst): enables operations via the [[Automating Palo Alto Firewall via XML API|XML API]], accessible via CLI with [panconf](https://github.com/kevinsteves/pan-python/blob/master/doc/panconf.rst) and [panxapi](https://github.com/kevinsteves/pan-python/blob/master/doc/panxapi.rst).

As the examples show, the PAN SDK is essentially an interface to the XML API, with some added conveniences. The examples that follow resemble those of the XML API post.

The PAN SDK relies on the [ElementTree](https://docs.python.org/3/library/xml.etree.elementtree.html) module of Python, whose documentation reminds us:

> A large number of log entries can cause a memory exception which may not be possible to catch.

## Operational Commands via pan-python

Let's revisit a previous example and print the ARP table. The [documentation](https://github.com/kevinsteves/pan-python/blob/master/doc/pan.xapi.rst#user-content-op-cmd-none-vsys-none-cmd-xml-false) is minimal and has no examples. First, we create an `api` object with the connection details of the firewall:

```python
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
fw = xapi.PanXapi(hostname="172.24.1.34", api_key=token, ssl_context=ctx)
```

We can now issue a command to print the ARP table:

```python
fw.op(cmd="<show><arp><entry name='all'/></arp></show>", cmd_xml=False)
root = fw.element_root
for entry in root.iterfind(".//result/entries/"):
    interface = entry.find("interface").text
    ip = entry.find("ip").text
    mac = entry.find("mac").text
    print(f"{interface},{ip},{mac}")
```

The command syntax is identical to the one covered in the XML API post.

The script is available in the [GitHub repository](https://github.com/dainok/courses/tree/master/Palo%20Alto%20Networks/Strata).

## Configuration Commands via pan-python

Let's now see how to add objects to the configuration of the firewall. According to the [documentation](https://github.com/kevinsteves/pan-python/blob/master/doc/pan.xapi.rst#user-content-set-xpath-none-element-none), the supported methods include `set()`, `get()`, `edit()`, `delete()`, `move()`, `rename()` and `clone()`.

As discussed before, this example also follows the XML API syntax:

```python
for name, ip in addresses.items():
    # xpath = "/config/shared/address/entry" # Shared (Panorama)
    xpath = "/config/devices/entry[@name='localhost.localdomain']/vsys/entry[@name='vsys1']/address/entry" # VSYS
    xpath = xpath + f"[@name='{name}']"
    element = f"<ip-netmask>{ip}</ip-netmask>"
    fw.set(xpath=xpath, element=element)
```

We can print the configured addresses in a similar way:

```python
xpaths = [
    "/config/shared/address/entry", # Shared (Panorama)
    "/config/devices/entry/vsys/entry[@name='vsys1']/address", # VSYS
]
for xpath in xpaths:
    if "/shared/" in xpath:
        location = "Shared"
        find_path = ".//result/"
    else:
        location = "VSYS"
        find_path = ".//result/address/"

    fw.get(xpath=xpath)
    root = fw.element_root
    for entry in root.iterfind(find_path):
        name = entry.attrib["name"]
        address = entry.find("ip-netmask").text
        print(f"{name},{address},{location}")
```

The script is available in the [GitHub repository](https://github.com/dainok/courses/tree/master/Palo%20Alto%20Networks/Strata).

## Commit via pan-python

The `xapi` class includes the [commit()](https://github.com/kevinsteves/pan-python/blob/master/doc/pan.xapi.rst#user-content-commit-cmd-none-action-none-sync-false-interval-none-timeout-none) method, which manages the commit operation and the associated job:

```python
cmd = "<commit></commit>"
fw.commit(cmd=cmd, sync=True)
if "no changes to commit" in fw.status_detail:
    pass
elif fw.status != "success" or "successfully" not in fw.status_detail:
    print("ERROR: failed to commit.")
```

The code is not particularly clean, because it checks both the status of the job and its textual description. As an alternative, we can use an asynchronous commit together with the `job()` method to verify the status manually:

```python
cmd = "<commit></commit>"
fw.commit(cmd=cmd, sync=False)
root = fw.element_root
job = root.find("./result/job")
job_id = None
if job is not None:
    # msg = root.find("./result/msg")
    job_id = job.text
else:
    msg = root.find("./msg")

# Wait for job
if job_id:
    progress = 0
    result = None
    while progress < 100:
        fw.op(cmd=f"<show><jobs><id>{job_id}</id></jobs></show>", cmd_xml=False)
        root = fw.element_root
        result_el = root.find("./result/job/result")
        if result_el is not None:
            result = result_el.text
        progress = int(root.find("./result/job/progress").text)
        print(f"Job ID {job_id}: {progress}%")
        time.sleep(5)

    if result != "OK":
        print("ERROR: failed to commit.")
```

This example is similar to the one covered with the XML API.

The script is available in the [GitHub repository](https://github.com/dainok/courses/tree/master/Palo%20Alto%20Networks/Strata).

## Removing Default Configuration via pan-python

Finally, let's see how to remove the default configuration with the `pan-python` library. The previous examples showed the similarities between the XML API and `pan-python`:

```python
token = getpass("Token: ")
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
fw = xapi.PanXapi(hostname="172.24.1.34", api_key=token, ssl_context=ctx)

# Defining paths
xpaths = [
    "/config/devices/entry/vsys/entry[@name='vsys1']/rulebase/security/rules/entry[@name='rule1']",
    "/config/devices/entry/network/virtual-wire/entry[@name='default-vwire']",
    "/config/devices/entry/vsys/entry[@name='vsys1']/zone/entry[@name='trust']",
    "/config/devices/entry/vsys/entry[@name='vsys1']/zone/entry[@name='untrust']",
    "/config/devices/entry/vsys/entry[@name='vsys1']/import/network/interface/member[text()='ethernet1/1']",
    "/config/devices/entry/vsys/entry[@name='vsys1']/import/network/interface/member[text()='ethernet1/2']",
    "/config/devices/entry/network/interface/ethernet/entry[@name='ethernet1/1']",
    "/config/devices/entry/network/interface/ethernet/entry[@name='ethernet1/2']",
]
for xpath in xpaths:
    fw.delete(xpath=xpath)
```

The script is available in the [GitHub repository](https://github.com/dainok/courses/tree/master/Palo%20Alto%20Networks/Strata).
