---
cover: ad
date: 2026-02-15
tags:
- advanced
- fundamentals
- pexpect
---
Twenty years ago, when I started automating tasks on the distributed network I was managing, practically no automation tools were available. I started with [Expect](https://core.tcl-lang.org/expect/index), which is still my lifesaver today: when I have no other way to interact with a system, Expect is my last resort.

Since I have moved all my development to Python, I now use [Pexpect](https://pexpect.readthedocs.io/en/stable/), which lets me integrate automation into an ecosystem I already know well.

## Preconfiguring Templates for EVE-NG

The goal I set for myself, as part of a larger project, is to preconfigure templates for [[Introduction to EVE-NG platform|EVE-NG]]. Specifically, I need to:

* Import new templates.
* Preconfigure each template so that the first interface always belongs to a management VRF, receives an IP address via DHCP, has a privileged user preconfigured and has SSH enabled.
* Verify that the generated images work as expected (ping, login).
* Verify the entire process in CI/CD mode after every significant change.

I divided the problem into four parts:

* [[Introduction to Ansible Automation|Ansible]] searches for the required files and prepares the environments under `/opt/unetlab/addons/qemu`.
* A script configures each image.
* A script runs an instance and verifies network reachability (ping) and login.
* Pytest creates temporary instances, configures them and verifies them.

In this article, we focus on the two scripts that handle the configuration and the testing of the images with Pexpect.

## Starting the Node

In our case, we need to start a command (QEMU) and make decisions based on the output displayed on the screen.

```python
cmd = get_start_qemu_node_cmd(template, **kwargs)
child = pexpect.spawn(
    cmd,
    encoding=None,
    timeout=10,
    echo=False,
)
child.logfile = TeeLogger()
```

In particular, we treat the output as a stream of bytes. This is necessary because most nodes do not output plain text, but a byte stream that may include special characters (screen clears, colors, etc.).

We needed the `TeeLogger` class to handle the output correctly and, optionally, save it to a file:

```python
class TeeLogger:
    """Print output in stdout and in file."""

    def __init__(self, log_file=None):
        self.raw = None
        if log_file:
            self.raw = open(log_file, 'wb')

    def write(self, data):
        if isinstance(data, bytes):
            if self.raw:
                self.raw.write(data)
                self.raw.flush()
            text = data.decode(errors='ignore')
        else:
            if self.raw:
                self.raw.write(data.encode(errors='ignore'))
                self.raw.flush()
            text = data

        sys.stdout.write(text)
        sys.stdout.flush()
```

All that remains is to execute the process:

```python
# Starting node
child = start_qemu_node(template, boot_from_cd=False, **NODE_CONFIG)

# Close before exit
def cleanup():
    """Cleanup before exit."""
    child.kill(signal.SIGTERM)

atexit.register(cleanup)
```

The `cleanup` function is called every time the script completes, whether successfully or with errors. Since we do not want the QEMU process to outlive the script, `cleanup` terminates QEMU before the script exits.

## Managing the Interactive Session

We are now ready to manage the boot process of the image and configure it as desired. Pexpect lets us detect a string sent by QEMU and execute actions accordingly.

First, for example, we want to send `ENTER` as soon as the bootloader screen appears:

```python
# Boot menu
child.expect(rb'GNU GRUB', timeout=300)
child.sendline('')
```

If we are configuring a vIOS image, the next step is to exit the interactive configuration:

```python
# Skip initial configuration
expect_output(
    child,
    'Would you like to enter the initial configuration dialog',
    ERRORS,
    timeout=300,
)
send_cmd(child, 'no')
```

Here we used two helper functions that simplify the management of the workflow.

The `expect_output` function waits for a specific text and raises an exception in case of errors or timeouts:

```python
def expect_output(child, expected, errors, timeout=10):
    if isinstance(expected, (bytes, str)):
        expected = [expected]

    patterns = list(expected) + list(errors)
    output = b''

    try:
        res = child.expect(patterns, timeout=timeout)
        output += child.before

        if res < len(expected):
            while True:
                # Consume the rest of the line
                try:
                    child.expect(rb'.+', timeout=0.1)
                    output += child.before
                except pexpect.TIMEOUT:
                    break
            return res, output

        err = errors[res - len(expected)]
        raise RuntimeError(f'Command error {err!r} (expected={expected})')
    except pexpect.TIMEOUT:
        raise pexpect.TIMEOUT(
            f'Timeout occurred (expected={expected}, timeout={timeout})'
        )
    except pexpect.EOF:
        raise RuntimeError(f'EOF reached (expected={expected})')
```

The `send_cmd` function displays the text sent to QEMU in green, which makes the process easier to read:

```python
GREEN = '\033[92m'
RESET = '\033[0m'

def send_cmd(child, text, delay=1):
    """Send command using to pexpect process."""
    time.sleep(delay)
    print(f'{GREEN}{text}↵{RESET}')
    child.send(text.encode() + b'\r')
```

We can then configure the image:

```python
for line in [
    'configure terminal',
    f'username {NODE_CREDENTIALS["username"]} privilege 15 password {NODE_CREDENTIALS["password"]}',
    'hostname vios',
    'ip domain name example.com',
    'crypto key generate rsa modulus 2048',
    'ip ssh version 2',
    'line vty 0 15',
    'login local',
    'transport input ssh',
    'vrf definition mgmt',
    'address-family ipv4',
    'interface GigabitEthernet0/0',
    'vrf forwarding mgmt',
    'ip address dhcp',
    'no shutdown',
]:
    send_cmd(child, line)
    expect_output(child, CONFIG_PROMPT, ERRORS)
send_cmd(child, 'end')
```

And save the configuration before exiting:

```python
# Save configuration
expect_output(child, EXEC_PROMPT, ERRORS)
send_cmd(child, 'write memory')
expect_output(child, '[OK]', ERRORS)
time.sleep(5)
```

## Execution

Running the script manually lets us observe the entire configuration process:

![[pexpect-demo-1.png]]

The scripts are available in the [GitHub repository](https://github.com/dainok/courses/tree/master/Various/Pexpect) dedicated to the DevNetOps courses.
