---
cover: ad
date: 2026-04-12
tags:
- advanced
- fundamentals
---
In the previous posts, we covered how to automate an infrastructure assessment and how to manage the data to generate meaningful reports. This post closes the series with some considerations on how to optimize the automation.

## Parallel Execution

[[Gathering structured network data with Netmiko and NTC Templates|Netmiko]] generally operates sequentially: it connects to a device only after the previous one is complete. In the past I have used [Nornir](https://nornir.readthedocs.io/en/latest/) and I consider it a very efficient scheduler, but it has its own logic and is not immediately intuitive.

Again, because of the very tight timeline, I preferred a quick-and-dirty solution: `concurrent.futures`.

```python
with ThreadPoolExecutor(max_workers=max_workers) as executor:
    futures = [executor.submit(worker, device)
               for device in config.get("inventory")]

    for future in as_completed(futures):
        device, result = future.result()
```

The `worker` function encapsulates all the steps to connect to a device, execute the commands and handle the output. We can set the number of parallel executions with the `max_workers` parameter.

## Credentials

The access credentials can be read from a file or from an environment variable. An environment variable is generally the preferred choice, but the decision depends heavily on where the automation runs.

In principle, the system should be hardened and secure, but on a project with very tight deadlines it is easy to underestimate this step. We can still do our best by using a restricted account that can run only `show` commands.

## JSON Conversion

The conversion of the output of each command to JSON deserves a brief explanation.

Netmiko handles this conversion [automatically](https://pynet.twb-tech.com/blog/netmiko-and-textfsm.html) with the `use_textfsm` parameter. In our example, however, we took a different approach and managed the conversion manually with the `get_structured_data` function.

The reason comes from experience: we always want the raw output of each command to be available. It is useful during troubleshooting, or when we need to verify the exact output of a command. Moreover, the JSON conversion performed by the `ntc_templates` library could introduce errors that we cannot anticipate at this stage. By saving the original output of the command, we can verify later whether any error occurred and correct it if needed.

## MAC Address Randomization

Endpoint devices increasingly use pseudo-random MAC addresses when they connect to wireless networks. We can identify these MAC addresses by analyzing their format.

In our assessment, we set the vendor of such addresses to `Unknown`. To do this, we create a function that detects whether a MAC address is randomized:

```python
def mac_to_vendor(mac: str) -> str:
    parts = mac.split(":")
    first_byte = int(parts[0], 16)
    if first_byte & 0x02:
        return "Locally Administered", None

    for prefix, vendor in vendor_map:
        if mac.startswith(prefix):
            return vendor, prefix
    return "Unknown", None
```
