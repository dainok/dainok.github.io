---
cover: unetlab
date: 2024-10-30
tags:
- intermediate
- proxmox
- unetlab
---
As our first image, we choose VyOS, which is publicly available on [GitHub](https://github.com/vyos/vyos-nightly-build/releases). We work from a single host, and later we can distribute our image. Let's download the image to the host:

```bash
wget -O- https://github.com/vyos/vyos-nightly-build/releases/download/1.5-rolling-202409220007/vyos-1.5-rolling-202409220007-generic-amd64.iso > /var/tmp/pveupload-0000
```

The file name must strictly follow the regex `/var/tmp/pveupload-[0-9a-f]+`.

We upload the image to the `unetlab` datastore with the correct name:

```bash
pvesh create /nodes/proxmox1/storage/unetlab/upload -content iso -filename vyos-vyos-1.5-202409220007.iso -tmpfilename /var/tmp/pveupload-0000
```

We delete the image from the temporary directory:

```bash
rm -f /var/tmp/pveupload*
```

## Preparing the Template

Next, we create a temporary VM to install and configure VyOS:

```bash
pvesh create /nodes/proxmox1/qemu -cores 1 -cpu host -cdrom unetlab:iso/vyos-vyos-1.5-202409220007.iso,media=cdrom -memory 2048 -name template-vyos-vyos-1.5-202409220007 -net0 virtio,bridge=vmbr0 -ostype other -scsihw virtio-scsi-single -sockets 1 -tags "unl;template" -virtio0 unetlab:2,format=qcow2,backup=1,iothread=on -vmid 1000 -serial0 socket -vga none
```

In this case, we disabled the graphics card and added a serial interface to use as a terminal.

We start the virtual machine:

```bash
pvesh create /nodes/proxmox1/qemu/1000/status/start
```

At this point, we open the console of the VM from the web interface of the Proxmox host. We log in with the user `vyos` and the password `vyos`, then install the operating system on the disk with the command:

```text
install image
```

The installation guides us through a few questions:

```text
[...]
Would you like to continue? [y/N] y
What would you like to name this image? (Default: 1.5-rolling-202409220007)
Please enter a password for the "vyos" user:
Please confirm password for the "vyos" user:
What console should be used by default? (K: KVM, S: Serial)? (Default: S)
[...]
Which one should be used for installation? (Default: /dev/vda)
Installation will delete all data on the drive. Continue? [y/N] y
[...]
Would you like to use all the free space on the drive? [Y/n]
[...]
Which file would you like as boot config? (Default: 1)
[...]
```

Once the installation is complete, we reboot the node with the `reboot` command.

As soon as the node is back online, we configure it for UNetLab. Specifically, we set up a management interface, ideally in a dedicated VRF:

```text
configure
set vrf name mgmt
set vrf name mgmt table 100
set interfaces ethernet eth0 vrf mgmt
set interfaces ethernet eth0 address dhcp
set service ssh vrf mgmt
delete interfaces ethernet eth0 hw-id
commit
save
```

We shut down the node:

```bash
pvesh create /nodes/proxmox1/qemu/1000/status/shutdown
```

We remove the CD-ROM and set the boot order:

```bash
pvesh set /nodes/proxmox1/qemu/1000/config -delete cdrom
pvesh set /nodes/proxmox1/qemu/1000/config -boot legacy=c
```

Now we convert the node into a template:

```bash
pvesh create /nodes/proxmox1/qemu/1000/template
```

## Verifying the Template

Before continuing, let's verify that the template works correctly. We create a node from the template and check that the first interface gets an IP address via DHCP, and that SSH access works with the username and password:

```bash
pvesh create /nodes/proxmox1/qemu/1000/clone -newid 10001 -full 0 -name node-vyos1
pvesh set /nodes/proxmox1/qemu/10001/config -tags "unl;node;user_root" -net0 virtio,bridge=vmbr0
pvesh create /nodes/proxmox1/qemu/10001/status/start
```

Once finished, we shut down the node and delete it:

```bash
pvesh create /nodes/proxmox1/qemu/10001/status/stop
pvesh delete /nodes/proxmox1/qemu/10001
```

If the template has issues, we can convert it back to a VM and reconfigure it:

```bash
pvesh create /nodes/proxmox1/qemu/1000/config -template 0
```

## Backup and Export

Finally, we create a backup:

```bash
pvesh create /nodes/proxmox1/vzdump -storage local -vmid 1000 -mode stop
```

We can retrieve the file `/var/lib/vz/dump/vzdump-qemu-1000-*.vma*`, which is the image of our template. We can use this file to recreate the template on other nodes. For simplicity, we rename it to `vzdump-qemu-template-vyos-vyos-1.5-202409220007.vma`.

## Import

If the `unetlab` datastore is not shared among all the hosts in the cluster, we copy the backup to the other hosts:

```bash
scp /var/lib/vz/dump/template-vyos-vyos-1.5-202409220007.vma root@172.25.82.158:/var/lib/vz/dump
```

Then we import the backup, assigning a new ID to the template:

```bash
pvesh create /nodes/proxmox2/qemu -vmid 1001 -archive local:backup/vzdump-qemu-template-vyos-vyos-1.5-202409220007.vma
```
