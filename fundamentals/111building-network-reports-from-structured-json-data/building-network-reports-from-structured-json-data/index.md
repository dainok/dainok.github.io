---
cover: ad
date: 2026-04-05
tags:
- advanced
- cisco
- fundamentals
---
In the [[Gathering structured network data with Netmiko and NTC Templates|previous post]], we saw how to collect information from dozens of devices and convert it, where possible, to JSON.

Now we need to read the necessary information, store it and generate the required reports. We do not know in advance exactly which reports will be requested, but we can reasonably expect that we will need:

* MAC address, IP address and VLAN of each connected endpoint.
* CDP and LLDP neighbors of all the physical interfaces across all the devices.
* Number of MAC addresses connected to each physical interface.

All this information is collected by our discovery script: we only need to read it, save it to a database, update it after each scan and generate the reports.

## Standardization

To correlate the data, we must define a standard and apply it consistently. In our case, two fields need to be standardized: the MAC address format and the interface name.

Cisco uses a proprietary format to represent MAC addresses. We want to standardize it so we can cross-reference it with external data, in particular to look up the vendor in the IEEE database.

We create a function that converts a MAC address from the Cisco format to the standard format:

```python
def cisco_to_standard_mac(mac: str) -> str:
    """Convert a MAC Address from Cisco to standard format."""
    hex_digits = re.sub(r'[^0-9a-fA-F]', '', mac).lower()
    if len(hex_digits) != 12:
        raise ValueError(f"Invalid MAC address: {mac}")
    return ":".join(hex_digits[i:i+2] for i in range(0, 12, 2))
```

We can then look up the vendor using, for example, the database provided by [MAC Lookup](https://maclookup.app/).

The second point of attention is the interface naming: Cisco uses both the full name and an abbreviated form. Going from the full name (e.g., `GigabitEthernet0/1`) to the abbreviated form (e.g., `Gi0/1`) is straightforward, but the reverse can be tricky. We therefore always use the abbreviated name, converting the full name when necessary:

```python
def truncate_interface_name(iface: str) -> str:
    """Truncate an Interface name so we can match rows on tables."""
    if iface.startswith("FiveGigabitEthernet"):
        iface = iface.replace("FiveGigabitEthernet", "Fi")
    if iface.startswith("FortyGigabitEthernet"):
        iface = iface.replace("FortyGigabitEthernet", "Fo")
    if iface.startswith("GigabitEthernet"):
        iface = iface.replace("GigabitEthernet", "Gi")
    if iface.startswith("TenGigabitEthernet"):
        iface = iface.replace("TenGigabitEthernet", "Te")
    if iface.startswith("TwentyFiveGigE"):
        iface = iface.replace("TwentyFiveGigE", "Twe")
    if iface.startswith("TwoGigabitEthernet"):
        iface = iface.replace("TwoGigabitEthernet", "Tw")
    return iface
```

This lets us correlate the data from verbose outputs (e.g., `show interfaces`) with the data from table outputs (e.g., `show mac address-table`).

## Vendor Lookup

During an assessment, it can be very useful to know how many devices belong to a specific vendor. We have already seen how to standardize the MAC address format. We now load the database provided by [MAC Lookup](https://maclookup.app/) into memory, so we can use it for each MAC address:

```python
# Load MAC Address lookup table
with open("maclookup-20260204.json", encoding="utf-8") as f:
    vendor_list = json.load(f)
vendor_map = []
for entry in vendor_list:
    prefix = entry["macPrefix"].lower()
    vendor_map.append((prefix, entry["vendorName"]))
vendor_map.sort(key=lambda x: -len(x[0]))
```

## Loading Data

We now scan the directory that contains the JSON outputs and look for the following files:

* `show-mac-address-table-dynamic.json`
* `show-ip-arp.json`
* `show-cdp-neighbors-detail.json`
* `show-lldp-neighbors-detail.json`

For each file type, we load the data into the SQLite database:

```python
for json_file in arp_table_json_files:
    # Get discovery data (timestamp, device)
    timestamp_str = str(json_file).split("/")[1]
    timestamp_dt = datetime.strptime(timestamp_str, "%Y-%m-%d-%H:%M:%S")
    device = str(json_file).split("/")[2]
    vrf = str(json_file).split("/")[3].split("-")[4]

    with json_file.open(encoding="utf-8") as fh:
        # Load output file
        arp_table_data = json.load(fh)
        for row in arp_table_data:
            # Load entry
            ip_address = row["ip_address"]
            mac_address = row["mac_address"]
            iface = row["interface"]
            if mac_address == "Incomplete":
                # Skip incomplete MAC address
                continue
            mac_address = cisco_to_standard_mac(mac_address)

            # Add to bulk database operation
            arp_table_rows.append((
                device,
                mac_address,
                ip_address,
                iface,
                vrf,
                timestamp_dt,
                timestamp_dt
            ))
```

On large infrastructures, working on one object at a time is not feasible: we must prepare a list of operations and execute them all at once (bulk operations):

```python
cursor.executemany("""
INSERT INTO arp_table (
    device,
    mac_address,
    ip_address,
    interface,
    vrf,
    created_at,
    updated_at
) VALUES (?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(device, mac_address, ip_address, interface, vrf)
DO UPDATE SET
    updated_at = excluded.updated_at
WHERE excluded.updated_at > arp_table.updated_at;
""", arp_table_rows)
conn.commit()
```

## Creating Reports

Once all the data is in the database, generating the reports is straightforward. We produce them in CSV format, which is flexible and easy to work with:

```python
cursor.execute(
    "SELECT device, interface, vrf, mac_address, ip_address, vendor, " \
    "vendor_prefix, created_at, updated_at FROM arp_table")
rows = cursor.fetchall()
with open(ARP_TABLE_CSV_FILE, "w", newline="", encoding="utf-8-sig") as fh:
    writer = csv.writer(fh, delimiter=";", quotechar='"', quoting=csv.QUOTE_MINIMAL)
    writer.writerow(["Device", "Interface", "VRF", "MAC Address", "IP Address",
                     "Vendor", "Vendor Prefix", "First Seen", "Last Seen"])
    writer.writerows(rows)
```
