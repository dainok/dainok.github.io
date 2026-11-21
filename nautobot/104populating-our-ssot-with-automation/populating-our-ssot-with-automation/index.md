---
cover: nautobot
date: 2024-07-10
tags:
- intermediate
- nautobot
- ssot
---
Now we need to populate our Single Source of Truth (SSOT). Adding the interfaces of each device manually is impractical, so we automate the process: we read the configuration of the devices and create the corresponding SSOT objects.

There is currently no official system for automatic device discovery. This is why I developed [NetDoc](https://github.com/dainok/netdoc) years ago, although it works only with NetBox.

Let's create a simple automation for this task.

We use the following tools:

* [Netmiko](https://github.com/ktbyers/netmiko) to connect to the devices and retrieve information.
* [NTC Templates](https://github.com/networktocode/ntc-templates) to parse the information into structured data.
* The [REST API of Nautobot](https://docs.nautobot.com/projects/core/en/stable/user-guide/platform-functionality/rest-api/overview/) to create the SSOT objects.

We assume that the device is created manually in our SSOT for convenience, so our automation only populates the interfaces.

Let's develop the automation step by step.

## Parameters Needed for Our Automation

Our automation requires the following parameters:

* `nautobot_base_url`: the URL to access Nautobot.
* `nautobot_apikey`: the API key to make REST API requests to Nautobot.
* `host`: the IP address of the physical device to read.
* `username`: the username to access the physical device.
* `password`: the password to access the physical device.

We create the API key in Nautobot under `User` → `Profile` → `API Tokens` → `Add a token`.

![[nautobot-api-token.png]]

In the example script, some parameters are read interactively while others are defined statically in the code. The script is a simple example and must not be used as it is in production environments.

## Connecting to the Device and Retrieving Information

Next, we connect to the device and retrieve the information we need. In this example, the device is a Cisco IOS XE switch, and two commands provide the data we need:

* `show version`: to retrieve the hostname of the device.
* `show interfaces`: to retrieve all the configured interfaces and their additional parameters.

```python3
with ConnectHandler(**data) as net_connect:
    show_version = net_connect.send_command("show version", use_textfsm=True)
    show_interfaces = net_connect.send_command("show interfaces", use_textfsm=True)
```

The `use_textfsm` parameter transforms the human-readable output into structured data immediately. The transformation (parsing) is performed with the [[Parsing text with TextFSM|TextFSM]] library by Google and [[Contributing to NTC Templates with Git and GitHub|NTC Templates]].

## Processing the Retrieved Data

Now that we have the data in a structured format, we clean it up and extract only the following parameters:

* Hostname (standardized to uppercase).
* Interface name, description and link status.

```python
device_name = show_version[0]["hostname"].upper()
device_interfaces = {
    item["interface"]: {
        "description": item["description"],
        "status": "Active" if item["link_status"] == "up" else "Decommissioning",
    }
    for item in show_interfaces
}
```

## Updating Data on Nautobot

We are now ready to update the data on Nautobot. To do this, we need to:

* Retrieve the device ID by its name. We assume that the device already exists in Nautobot.
* Add the interfaces associated with the device only if they do not already exist.

First, we retrieve the devices by filtering on their name:

```python
# Ingesting data to Nautobot
headers = {
    "Authorization": f"Token {nautobot_apikey}",
    "Accept": "application/json",
}

# Get device ID
url = f"{nautobot_base_url}/api/dcim/devices/?name={device_name}"
req = requests.get(url, headers=headers, timeout=30).json()
if req["count"] < 1:
    raise ValueError(f"{device_name} not found")
device_id = req["results"][0]["id"]
```

If the device exists, we use `device_id` to retrieve the interfaces associated with it. If an interface does not exist, we create it:

```python
# Ingesting data to Nautobot
headers = {
    "Authorization": f"Token {nautobot_apikey}",
    "Accept": "application/json",
}

# Get device ID
url = f"{nautobot_base_url}/api/dcim/devices/?name={device_name}"
req = requests.get(url, headers=headers, timeout=30).json()
if req["count"] < 1:
    raise ValueError(f"{device_name} not found")
device_id = req["results"][0]["id"]
```

In both cases, we assume that the structure of Nautobot does not allow multiple devices with the same name, or multiple interfaces with the same name within the same device.

## Preparing to Run the Script

Before running the script, we must create the device in Nautobot. Here are the steps.

**Create a Device Role:** we navigate to `Organization` → `Roles` → `Add`, with `Content Type = dcim|device`:

![[nautobot-role-switch.png]]

**Create a Manufacturer:** we go to `Devices` → `Manufacturers` → `Add`:

![[nautobot-manufacturer.png]]

**Create a Device Type:** in `Devices` → `Device Type` → `Add`, we associate it with the Manufacturer created before:

![[nautobot-create-device-type.png]]

**Create a Location Type:** we set up a [Location Type](https://docs.nautobot.com/projects/core/en/stable/user-guide/platform-functionality/rest-api/overview/) in `Organization` → `Location Type` → `Add`, with `Content Type = dcim|device`:

![[nautobot-location-type.png]]

**Create a Location:** we add a Location in `Organization` → `Locations` → `Add`, and associate it with the Location Type created before:

![[nautobot-create-location.png]]

**Create the Device:** finally, in `Devices` → `Devices` → `Add`, we associate the Device Role, the Device Type and the Location, and we use the hostname in uppercase:

![[nautobot-create-hardware.png]]

## Running the Script

Now we can run the script. If everything works, the device in Nautobot is populated with all its interfaces:

![[populate-nautobot.png]]

This process ensures that the device is set up correctly in Nautobot before the automation script populates its interfaces.

We can download the script from [GitHub](https://github.com/dainok/courses/tree/master/Nautobot/04.%20Populating%20Nautobot).
