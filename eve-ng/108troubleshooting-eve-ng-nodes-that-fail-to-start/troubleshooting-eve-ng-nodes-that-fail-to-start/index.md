---
cover: eve-ng
date: 2025-08-03
tags:
- advanced
- eve-ng
- troubleshooting
---
In this article, we will explore how to troubleshoot EVE-NG nodes that fail to start properly. The symptom is simple yet frustrating: when you start a node, it appears to launch but shuts down after a few seconds without any explanation.

Some architectural decisions made early on make it hard to surface backend errors to the user. It was a deliberate choice: with correct usage, such failures should be extremely rare. That held true for the most part, but in the few cases where it does not, the user is left helpless.

Here, we will walk through the troubleshooting steps. We will connect to the EVE-NG system via SSH as root and replicate the backend process manually to find the point of failure.

## Logs

Logs are located in `/opt/unetlab/data/Logs` (note that **[[UNetLab the evolution of iou-web|UNetLab]]** was the predecessor of **EVE-NG**, and much of its original structure remains). The file we need is `unl_wrapper.txt`, which records all the operations performed by the wrapper, the program that mediates communication between the node and the backend. Specifically, the wrapper manages the start, stop and console operations of a node.

Follow the log with this command:

```bash
tail -f /opt/unetlab/data/Logs/unl_wrapper.txt
```

Start the failing node and watch the output. The key lines are:

```text
Aug 01 10:07:03 INFO: CWD is /opt/unetlab/tmp/5/1fdf27c0-5e97-4706-a9da-1a82b01c0fde/2
Aug 01 10:07:03 INFO: starting /opt/unetlab/wrappers/qemu_wrapper -C 54179 -T 5 -D 2 -t "vIOS" -F /opt/qemu-2.4.0/bin/qemu-system-x86_64 -d 0 -- -nographic -device e1000,netdev=net0,mac=50:05:00:02:00:00 -netdev tap,id=net0,ifname=vun003000500200,script=no ...
```

## The Wrapper

As mentioned, the wrapper handles the communication between the backend and the node. It launches the node and manages the console.

The lines above reveal:

* The current working directory of the wrapper (`/opt/unetlab/tmp/5/1fdf27c0-5e97-4706-a9da-1a82b01c0fde/2`).
* The wrapper executable (`/opt/unetlab/wrappers/qemu_wrapper`).
* The command the wrapper runs to launch the node (`/opt/qemu-2.4.0/bin/qemu-system-x86_64` and its parameters).

The wrapper hides the errors raised by the virtualization software (QEMU in this case). To see them, we launch the node directly, bypassing the wrapper. This involves two simplifications:

* We run the node as root, which has fewer restrictions.
* We launch the node directly, without the wrapper.

In all the cases I analyzed, these simplifications did not prevent the error from reproducing. If an error appears, it is likely the root cause. If not, the problem may lie in the user's permissions or in the wrapper itself.

The command the wrapper uses is visible in the log: the `-F` parameter specifies the binary, and all the arguments after `--` are passed to it. The other flags set the tenant ID (`-T`), the node ID (`-D`), the console port (`-C`) and the terminal title (`-t`). The terminal title is the node name, which helps to find the right process or log lines on a busy EVE-NG server.

## Manually Starting the Node

Connect to the EVE-NG server via SSH as root and go to the working directory of the node:

```bash
cd /opt/unetlab/tmp/5/1fdf27c0-5e97-4706-a9da-1a82b01c0fde/2
```

From there, launch the node binary directly: run the program specified after the `-F` flag with all the parameters that follow `--`. The `-d` debug flag of the wrapper is not passed. For example:

```bash
/opt/qemu-2.4.0/bin/qemu-system-x86_64 -nographic -device e1000,netdev=net0,mac=50:05:00:02:00:00 -netdev tap,id=net0,ifname=vun003000500200,script=no ... -cpu host
```

Without the `-d` flag, error messages are printed directly to the terminal. In my case, the error was:

```text
qemu-system-x86_64: -drive file=virtioa.qcow2,if=virtio,bus=0,unit=0,cache=none: Could not open 'virtioa.qcow2': No such file or directory
```

This indicates that the disk image `virtioa.qcow2` was probably deleted after the node first started. Wiping the node and starting it again usually fixes the problem, because the image is recreated.

## Example: Troubleshooting IOL Nodes

The procedure is the same for IOL nodes. For instance, the log might show:

```text
Aug 01 10:29:58 INFO: CWD is /opt/unetlab/tmp/5/1fdf27c0-5e97-4706-a9da-1a82b01c0fde/3
Aug 01 10:29:58 INFO: starting /opt/unetlab/wrappers/iol_wrapper -C 47265 -L 3 -T 5 -D 3 -t "R3" -k 0 -F /opt/unetlab/addons/iol/bin/x86_64_crb_linux_l2-adventerprisek9-ms.bin -d 0 -e 1 -s 0 -- -n 1024 -q -m 1024
```

Change to the node directory:

```bash
cd /opt/unetlab/tmp/5/1fdf27c0-5e97-4706-a9da-1a82b01c0fde/3
```

Run the node binary manually (note the instance number required at the end):

```bash
/opt/unetlab/addons/iol/bin/x86_64_crb_linux_l2-adventerprisek9-ms.bin -n 1024 -q -m 1024 1
```

The number `1` at the end is the IOL instance.
