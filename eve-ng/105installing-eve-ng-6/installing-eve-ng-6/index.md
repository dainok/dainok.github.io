---
cover: eve-ng
date: 2024-10-05
tags:
- beginner
- eve-ng
---
EVE-NG is installed from packages downloaded via APT from the [official repository](http://www.eve-ng.net/jammy). We run all the following commands as the `root` user via SSH.

First, we add the official repository and the GPG key used to verify the packages:

```bash
wget -O - http://www.eve-ng.net/jammy/eczema@ecze.com.gpg.key | gpg --dearmor -o /etc/apt/trusted.gpg.d/eve-ng.gpg
cat << EOF > /etc/apt/sources.list.d/eve-ng.list
deb [arch=amd64] http://www.eve-ng.net/jammy jammy main
# deb-src [arch=amd64] http://www.eve-ng.net/jammy jammy main
EOF
```

Next, we reload the repositories, upgrade the system and install [EVE-NG CE](https://www.eve-ng.net/index.php/community/) along with other packages we will use later:

```bash
apt-get update
apt-get -y upgrade
apt-get -y install build-essential dnsmasq eve-ng iptables-persistent libbz2-dev libffi-dev libgdbm-dev libncurses5-dev libnss3-dev libreadline-dev libsqlite3-dev libssl-dev python3-pip zlib1g-dev
```

If we are prompted on how to handle the existing configuration file versions, we answer:

```text
install the package maintainer's version
```

Before rebooting the system, we set a password for the `root` user and enable root login:

```bash
passwd
sed -i 's/#PermitRootLogin./PermitRootLogin Yes/' /etc/ssh/sshd_config
```

Then we perform an initial reboot:

```bash
reboot
```

We connect again via SSH as `root`, keeping in mind that the IP address may have changed. Then we complete the configuration by:

* Changing the password of the `root` user.
* Setting the hostname to `eve-ng`.
* Setting the domain to `example.com`.
* Configuring the network according to our environment.
* Adding an NTP server, for example, if we work on a physical server.
* Selecting the appropriate option for how the system accesses the Internet.

The system reboots again. Once it is reachable, the EVE-NG web interface is available on port 80 via HTTP. By default, we can log in with the `admin` user and the password `eve`.

![[eveng-login-2.png]]

We log in as `admin` and change the password to a more secure one by clicking on `admin` at the top right:

![[eveng-change-password-2.png]]

The last step to get a functional installation is to copy some device images into the system. We start with the files for [IOL (IOS on Linux)](https://www.eve-ng.net/index.php/documentation/howtos/howto-add-cisco-iol-ios-on-linux/):

```bash
scp i86bi_LinuxL2-AdvEnterpriseK9-M_152_May_2018.bin root@172.25.82.167:/opt/unetlab/addons/iol/bin/
scp i86bi_linux_l2-adventerprisek9-ms.SSA.high_iron_20190423.bin root@172.25.82.167:/opt/unetlab/addons/iol/bin/
scp iourc root@172.25.82.167:/opt/unetlab/addons/iol/bin/
```

Then we SSH into the EVE-NG server as `root` and make sure the permissions are correct:

```bash
/opt/unetlab/wrappers/unl_wrapper -a fixpermissions
```

We also verify that hardware-assisted virtualization is available: the following command returns output only if it is enabled.

```bash
egrep "vmx|svm" /proc/cpuinfo
```

Finally, we verify that the image is usable by creating a small lab with a single **IOL** node. We start the node and wait a few seconds before connecting to its console.

![[eveng-iol-boot-2.png]]
