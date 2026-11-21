---
cover: ad
date: 2026-03-29
tags:
- advanced
- fundamentals
- netmiko
- ntc-templates
---
In the [previous post](Collecting%20information%20from%20a%20network%20infrastructure.md), we planned how to collect information automatically from a large number of devices. Let's now walk through how to address each requirement step by step. Keep in mind that, because of the tight timeline, the automation is spaghetti code that is not easily reusable.

## Inventory

Any automation requires a configuration file to store the global parameters, and a place to store the credentials needed to access the devices. In our case, we save the configuration in a `config.yaml` file.

The inventory is described by a list that contains the FQDN and the IP address of each device:

```yaml
inventory:
  - fqdn: switch11.example.com
    ip: 172.25.80.11
  - fqdn: switch12.example.com
    ip: 172.25.80.12
  - fqdn: switch13.example.com
    ip: 172.25.80.13
```

In our case, using only the FQDN was not enough, because:

* Not all the device FQDNs were resolvable via DNS.
* Identifying the devices only by IP address was not practical.

## Data to Collect

As in the previous step, we use `config.yaml` to specify all the data to retrieve from the devices:

```yaml
commands:
  - show authentication sessions
  - show cdp neighbors detail
  - show dot1x all
  - show interfaces
  - show interfaces status
  - show interfaces switchport
  - show interfaces trunk
  - show inventory
  - show ip arp
  - show ip interface
  - show lldp neighbors detail
  - show logging last 200
  - show mac address-table dynamic
  - show running-config
  - show spanning-tree
  - show standby
  - show version
  - show vlan
  - show vrf
```

All the data needed for the assessment can be retrieved with `show` commands, so specifying the full list of commands to run on each device is straightforward:

* Adding or removing a command is within anyone's reach.
* Commands not supported by a specific device simply produce an empty or error output, which we can ignore.

## Device Access

The automation must access the devices via SSH, execute a command, collect the output, convert it to JSON and save both the raw and the JSON output to file.

We achieve this as follows:

* [Netmiko](https://github.com/ktbyers/netmiko) handles the device access and the command execution.
* [TextFSM](https://github.com/google/textfsm) with [NTC Templates](https://github.com/networktocode/ntc-templates) converts the output to JSON.

We use Netmiko to connect to a device:

```python
ip_address = device.get("ip")
hostname = device.get("fqdn").upper()
netmiko_cfg = {
    'device_type': "cisco_ios",
    'host': ip_address,
    'username': secrets.get("username"),
    'password': secrets.get("password"),
}
try:
    ssh = ConnectHandler(**netmiko_cfg)
except NetmikoTimeoutException:
    print(f"{hostname} ({ip_address}): CONNECTING (TIMEOUT)")
    return device, 'Timeout'
```

Once connected, and before running any command, we prepare the environment: we create the directory structure that holds the output files and we disable the terminal paging on the connected device:

```python
device_dir = f"output/{timestamp}/{hostname}"
timestamp = datetime.now().strftime("%Y-%m-%d-%H:%M:%S")
os.makedirs("output", exist_ok=True)
os.makedirs(f"output/{timestamp}", exist_ok=True)
os.makedirs(device_dir, exist_ok=True)
ssh.send_command("terminal length 0")
```

We then execute each command:

```python
for command in config.get("commands"):
    try:
        output = ssh.send_command(command, read_timeout=read_timeout)
    except ReadTimeout:
        print(f"{hostname} ({ip_address}): GETTING {command} (READTIMEOUT)")
        return device, 'ReadTimeout'
```

We save the raw output to a dedicated TXT file:

```python
filename = f"{device_dir}/{slugify(command)}"
with open(f"{filename}.txt", "w") as fh:
    fh.write(output)

parsed_output = None
```

We then convert the output to JSON and save it to a dedicated file, but only if the conversion was successful:

```python
parsed_output = None
try:
    parsed_output = get_structured_data(output, platform=platform, command=command)
except TextFSMError:
    pass
if isinstance(parsed_output, dict) or isinstance(parsed_output, list):
    with open(f"{filename}.json", "w", encoding="utf-8") as fh:
        json.dump(
            parsed_output,
            fh,
            indent=2,
        )
```

Remember to disconnect from the device after the last command has been executed:

```python
ssh.disconnect()
```
