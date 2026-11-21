---
cover: proxmox
date: 2024-07-26
tags:
- intermediate
- proxmox
- unetlab
---
Let's prepare the templates that generate the nodes of our labs. We start with [VyOS](https://vyos.io/), an open-source router and firewall. VyOS is available as a [rolling release](https://support.vyos.io/support/solutions/articles/103000099218-rolling-release) and can be downloaded in ISO format from [GitHub](https://github.com/vyos/vyos-rolling-nightly-builds/releases). In this example, we use the `vyos-1.5-rolling-202407171706-amd64.iso` image, downloaded to `/usr/src` on a Proxmox host.

The [official documentation](https://docs.vyos.io/en/latest/installation/virtual/proxmox.html) guides us through creating a VyOS node on Proxmox. We go through the steps to create a VyOS template and a basic lab with two interconnected VyOS nodes.

On my Proxmox host, I added an external disk named `unetlab` to store the ISO images:

```bash
pvesh get /nodes/proxmox1/storage
```

![[pvesh-storage-output.png]]

`pvesh` is the CLI for the Proxmox REST APIs. Learning it now simplifies our future interactions with Proxmox hosts via API.

The [Proxmox documentation](https://pve.proxmox.com/pve-docs/api-viewer/#/nodes/{node}/storage/{storage}/upload) tells us the required location for the ISO file. We copy the downloaded file and import it:

```bash
cp /usr/src/vyos-1.5-rolling-202407171706-amd64.iso /var/tmp/pveupload-0001
pvesh create /nodes/proxmox1/storage/unetlab/upload -content iso -filename vyos-1.5-rolling-202407171706-amd64.iso -tmpfilename /var/tmp/pveupload-0001
```

We verify that the ISO file is available:

```bash
pvesh get /nodes/proxmox1/storage/unetlab/content
```

![[pvesh-content-output.png]]

Next, we create and configure the virtual machine so that it:

* Boots from the ISO image.
* Has a dedicated management network interface.

We use the parameters from the [Proxmox documentation](https://pve.proxmox.com/pve-docs/api-viewer/#/nodes/{node}/qemu) and the [VyOS documentation](https://docs.vyos.io/en/latest/installation/virtual/proxmox.html):

```bash
pvesh create /nodes/proxmox1/qemu -tags unl,template -name template-vyos-vyos-202407171706 -vmid 9001 -cpu host -socket 1 -cores 1 -memory 2048 -scsihw virtio-scsi-single -scsi0 unetlab:2 -net0 virtio,bridge=vmbr0 -serial0 socket -ostype other -cdrom unetlab:iso/vyos-1.5-rolling-202407171706-amd64.iso
```

We established a naming and tagging standard for our Proxmox templates: each template has a prefix, and every object is tagged with `unl` and a specific tag relevant to the object.

We start the node and configure it via CLI:

```bash
pvesh create /nodes/proxmox1/qemu/9001/status/start
```

We access the console via the web interface or the CLI:

```bash
qm terminal 9001
```

If the console is occupied, we free it with:

```bash
killall socat
```

The default credentials are:

* Username: `vyos`.
* Password: `vyos`.

We install the OS on the disk and reboot:

```bash
install image
reboot
```

We configure the device with a management VRF and an interface configured via DHCP:

```text
configure
set vrf name mgmt
set vrf name mgmt table 100
set interfaces ethernet eth0 vrf mgmt
set interfaces ethernet eth0 address dhcp
delete interfaces ethernet eth0 hw-id
commit
save
```

We configure only one network interface for now: additional interfaces are added when we create nodes from the template. In VyOS, each interface is initially assigned a specific MAC address. To use a node as a template, we remove this association with `hw-id`.

We exit the console and shut down the node:

```bash
pvesh create /nodes/proxmox1/qemu/9001/status/stop
```

We remove the CD-ROM drive, which is no longer needed, and convert the node to a template:

```bash
pvesh set /nodes/proxmox1/qemu/9001/config -delete cdrom
pvesh set /nodes/proxmox1/qemu/9001/config -boot legacy=c
pvesh create /nodes/proxmox1/qemu/9001/template
```

With these steps, we created a reusable VyOS template for Proxmox.
