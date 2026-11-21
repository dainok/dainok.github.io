---
cover: proxmox
date: 2024-07-25
tags:
- advanced
- proxmox
- unetlab
---
Proxmox offers various constructs for building virtual networks. We focus on bridges to emulate physical links, as we did in UNetLab v1.

Linux bridges handle frames differently:

* Broadcast frames are forwarded to all ports.
* Multicast frames are forwarded to a subset of ports.
* Peer-to-peer frames are not forwarded.
* All other frames are forwarded to all ports.

The key files in the [Linux kernel sources](https://github.com/torvalds/linux/tree/master/net/bridge) are `br_input.c` and `br_sysfs_br.c`.

In `br_input.c`, the `br_handle_frame` function decides whether to forward or discard a frame based on the destination MAC address. Frames with destination `0x01` are always discarded. A [mask](https://interestingtraffic.nl/2017/11/21/an-oddly-specific-post-about-group_fwd_mask/) called `fwd_mask` affects the outcome of the function in some cases.

We want to introduce the mask concept for the `0x01` case as well.

In `br_sysfs_br.c`, the `set_group_fwd_mask` function sometimes prevents the evaluation of `group_fwd_mask`. We modify it to always evaluate the mask.

With the modified kernel, we can control the `/sys/class/net/vmbr1/bridge/group_fwd_mask` mask to enable or disable the forwarding of any packet. Our modified kernel accepts values up to `65535`, which forwards any frame and achieves our goal.

## Compiling the Kernel

To compile a kernel for Proxmox, we need a system with Proxmox VE installed.

We install the dependencies:

```bash
apt-get install -y git build-essential dh-make dh-python sphinx-common asciidoc-base bison dwarves flex libdw-dev libelf-dev libiberty-dev libnuma-dev libslang2-dev libssl-dev lintian lz4 python3-dev xmlto zlib1g-dev
```

We remove the conflicting packages:

```bash
apt-get purge -y proxmox-headers\*
```

We check the installed kernel version:

```bash
uname -r
```

In the [Proxmox kernel sources](https://git.proxmox.com/), we find the commit titled "update ABI file for 6.8.4-2-pve". The corresponding commit is [4cab886f26f9c8638593b8c553996c97ca9acc21](https://git.proxmox.com/?p=pve-kernel.git;a=commit;h=4cab886f26f9c8638593b8c553996c97ca9acc21).

We clone the repository:

```bash
git clone git://git.proxmox.com/git/pve-kernel.git /usr/src/pve-kernel
cd /usr/src/pve-kernel
```

We check out the specific version:

```bash
git checkout 4cab886f26f9c8638593b8c553996c97ca9acc21
make clean
make build-dir-fresh
```

We modify `/usr/src/pve-kernel/Makefile`, adding `-unl` to the `EXTRAVERSION` variable. Then we edit `br_input.c` and `br_sysfs_br.c` in `/usr/src/pve-kernel/submodules/ubuntu-kernel/net/bridge`.

We compile the kernel:

```bash
make
```

We install the newly compiled packages on each Proxmox host:

```bash
dpkg -i /usr/src/pve-kernel/unl.deb
```

## Enabling the Transparent Bridge

We activate the patch by modifying the mask of each bridge:

```bash
echo 65535 > /sys/class/net/br1/bridge/group_fwd_mask
```

## Updating the Patch

The [unetlab-kernel repository](https://github.com/dainok/unetlab-kernel/) contains updated scripts and precompiled packages. To update the patch:

* Save the original `br_input.c` and `br_sysfs_br.c` files in a safe location.
* Modify the files according to the latest patch.
* Create a new patch with `diff -Naur`.
* Update the patch.

The precompiled patches and packages are available on [GitHub](https://github.com/dainok/unetlab-kernel/).
