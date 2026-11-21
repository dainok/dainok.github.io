---
cover: proxmox
date: 2024-09-30
tags:
- intermediate
- proxmox
- unetlab
---
UNetLab requires a cluster with one or more correctly configured PVE hosts. This page contains all the commands needed to configure a PVE host.

## Install the Custom Kernel for UNetLab

To enable **L1** links, UNetLab needs a kernel with a specific patch. The kernel and the patch are released in the [unetlab-kernel repository](https://github.com/dainok/unetlab-kernel). You can either download the correct release or compile your own with the provided script.

To download the custom kernel, run the following commands:

```bash
cd /usr/src
export TAG=6.8.8-3
wget https://github.com/dainok/unetlab-kernel/releases/download/${TAG}/proxmox-headers-${TAG}-pve-unl_${TAG}_amd64.deb
wget https://github.com/dainok/unetlab-kernel/releases/download/${TAG}/proxmox-kernel-${TAG}-pve-unl_${TAG}_amd64.deb
```

Now install the custom kernel:

```bash
apt-get update
apt-get install -y build-essential
dpkg -i proxmox-*-${TAG}-pve-unl_${TAG}_amd64.deb
```

When it is done, reboot the host:

```bash
reboot
```

## Add Nodes to the Cluster

Create a cluster and add the current node:

```bash
pvesh create /cluster/config -clustername unetlab -nodeid 1
```

Retrieve the fingerprint value with the following command:

```bash
pvesh get /cluster/config/join -output-format json-pretty | grep pve_fp
```

Next, add the remaining hosts to the cluster by running the following command on each host:

```bash
pvesh create /cluster/config/join -fingerprint <pve_fp> -hostname <primary_ip> -password <root_password>
```

Finally, verify that all nodes have been added:

```bash
pvesh get /cluster/config/nodes
```

## Configure a Dedicated Datastore

In this specific case, a separate disk is dedicated to UNetLab. Let's partition, format and mount it:

```bash
echo "start=2048, type=83" | sfdisk /dev/sdb
mkfs -t ext4 /dev/sdb1
mkdir /unetlab
echo "/dev/sdb1 /unetlab ext4 defaults 0 0" >> /etc/fstab
mount /unetlab
```

Before proceeding, repeat the same operation on any other Proxmox host.

Next, add the directory so that it can be used as a datastore:

```bash
pvesh create /storage -storage unetlab -type dir -path /unetlab -shared 0 -nodes proxmox1,proxmox2 -content images,rootdir,iso,vztmpl
```
