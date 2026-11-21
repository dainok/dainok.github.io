---
cover: ad
date: 2026-02-22
tags:
- advanced
- eve-ng
- fundamentals
- pexpect
---
As in the previous post, we now start a QEMU node and verify that:

* The management interface receives an IP address via DHCP.
* We can ping the Internet through the management interface.
* We can log into the node via SSH with privileged access.

## Waiting for DHCP Configuration

If we did this manually, we would check the interface status until we find a configured IP address. After a few minutes, we would probably suspect a network issue and stop the test.

We need to do exactly the same with Pexpect:

```python
# Wait for IP address
ip_address = None
expect_output(child, EXEC_PROMPT, ERRORS)
for _ in range(10):
    try:
        send_cmd(child, 'show interfaces GigabitEthernet0/0')
        _, output = expect_output(child, EXEC_PROMPT, ERRORS)
        match = re.search(rb'Internet address is (\d{1,3}(?:\.\d{1,3}){3})', output)
        if match:
            ip_address = match.group(1).decode()
            break
    except pexpect.TIMEOUT:
        pass

if not ip_address:
    raise RuntimeError('IP Address not found')
```

The script makes 10 attempts with a 10-second pause between them. If no IP address is configured after 10 attempts, the script fails.

## Reachability Test

At this point, we test connectivity with ping:

```python
# Test reachability
send_cmd(child, 'ping vrf mgmt 8.8.8.8 repeat 5 source GigabitEthernet0/0')
expect_output(child, '!!', ERRORS)
```

Here too, we wait for a confirmation which, on Cisco IOS-XE devices, means receiving at least two `!` characters in response.

## Login Test

For the login test, we use the IP address detected earlier and test the access from the current system to the QEMU node. The most suitable library for this task is Paramiko:

```python
ssh_client = paramiko.SSHClient()
ssh_client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    ssh_client.connect(
        hostname=ip_address,
        username=NODE_CREDENTIALS['username'],
        password=NODE_CREDENTIALS['password'],
        timeout=10,
        look_for_keys=False,
    )
except Exception:
    raise RuntimeError('Cannot connect via SSH')
```

In this specific case, we do not verify the host key, because the system is disposable.

## Execution

Running the script manually lets us observe the entire testing process:

![[pexpect-demo-2.png]]

## CI/CD

At this point, we can optionally consolidate all these steps into a single CI/CD validation pipeline, which runs on every change or whenever a new image is introduced.

![[pytest-with-pexpect.png]]

The scripts are available in the [GitHub repository](https://github.com/dainok/courses/tree/master/Various/Pexpect) dedicated to the DevNetOps courses.
