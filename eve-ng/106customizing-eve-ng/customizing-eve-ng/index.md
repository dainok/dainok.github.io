---
cover: eve-ng
date: 2024-07-27
tags:
- advanced
- eve-ng
---
Let's delve into the most important part: customizing EVE-NG for DevNetOps. In particular, we will:

* Configure an internal network dedicated to device management.
* Import the labs from the [GitHub repository](https://github.com/dainok/courses) dedicated to DevNetOps courses.
* Compile and install [Python](https://www.python.org/) 3.10 (not required in EVE-NG 6).
* Create a user dedicated to development, with a dedicated Python environment.
* Use [Visual Studio Code](https://code.visualstudio.com/) for remote development on the EVE-NG server.

## Configure an Internal Management Network

In automation, each lab we create requires a seemingly trivial yet essential characteristic: the IP addresses of the devices must be reachable from the automation system. The [EVE-NG PRO](https://www.eve-ng.net/index.php/features-compare/) version has a native feature (NAT Cloud) that simplifies this. In EVE-NG CE, we need a strategy to achieve the same result.

The goal is to configure an additional network on EVE-NG that lets us connect the management interfaces of the devices we use in our labs, whether they are virtual (internal to EVE-NG) or physical (PLCs and other external physical devices). The diagram below summarizes the idea:

![[eveng-topology-with-internal-management-network.png]]

First, let's clarify the networking of EVE-NG and introduce some Linux concepts.

A Linux system represents its network interfaces with names that have a prefix (`eth`, `ens`...) followed by an identifier number. A network interface can represent either a physical or a virtual network card. In our environment, the physical network card is `eth0`, but there are other network cards named `pnet`.

We can view the network interfaces of the system with one of the following commands:

```bash
ifconfig -a
ip link
```

The `pnet` interfaces are actually virtual switches (bridges) configured by default during installation:

```bash
$ brctl show
bridge name     bridge id               STP enabled     interfaces
pnet0           8000.2ac1c946eac3       no              eth0
pnet1           8000.000000000000       no
pnet2           8000.000000000000       no
pnet3           8000.000000000000       no
pnet4           8000.000000000000       no
pnet5           8000.000000000000       no
pnet6           8000.000000000000       no
pnet7           8000.000000000000       no
pnet8           8000.000000000000       no
pnet9           8000.000000000000       no
```

In particular, the bridge `pnet0` is associated with the physical interface `eth0`. In other words, anything associated with the bridge `pnet0` is also transmitted on the `eth0` network. As we will see in the web interface, we can add Cloud networks, which are simply the `pnet` bridges. The `pnet0` network is also used for web access: the management IP address is associated with the bridge `pnet0`, as we can see with one of the following commands:

```bash
ifconfig pnet0
ip address show pnet0
```

We can then configure an IP address on the `pnet9` network and connect the management interfaces of the devices to the `Cloud9` network.

EVE-NG is based on Ubuntu Linux Server 20.04 LTS and configures the network through the `/etc/network/interfaces` file. We configure the part related to the `pnet9` bridge as follows:

```text
# Cloud devices
auto pnet9
iface pnet9 inet static
    address 169.254.1.1
    netmask 255.255.255.0
    bridge_ports none
    bridge_stp off
```

We use the [APIPA](https://en.wikipedia.org/wiki/Link-local_address) network, which is defined to be local. In an enterprise context, this gives us reasonable certainty of not overlapping with other networks. We can delete the remaining `pnet2` to `pnet9` interfaces.

We can now reload the modified network configuration:

```bash
/etc/init.d/networking restart
```

If we ever want to associate a physical interface with this bridge, we add the following line:

```text
bridge_ports eth1
```

For convenience, we assign IP addresses automatically to the network interfaces connected to the `Cloud9` network. To do so, we use DHCP via [Dnsmasq](https://thekelleys.org.uk/dnsmasq/doc.html).

We configure Dnsmasq in `/etc/dnsmasq.conf`. We want only the DHCP service active, and only for the network managed by the `pnet9` interface. The configuration is:

```text
port=0
interface=pnet9
bind-interfaces
dhcp-range=169.254.1.2,169.254.1.254,3650d
log-dhcp
```

When done, restart the service:

```bash
systemctl restart dnsmasq
```

As we will see later for the automation part, we need a stable association between the IP addresses and the devices. We cannot rely on the dynamic mapping provided by Dnsmasq, so we define it statically. We map the hostname that the device presents during the DHCP request to a fixed address in Dnsmasq:

```text
dhcp-host=SW1,169.254.1.101
dhcp-host=SW2,169.254.1.102
dhcp-host=SW3,169.254.1.103
dhcp-host=SW4,169.254.1.104
```

The list must be completed with all the names we use in this and future labs.

To complete our environment, the `Cloud9` network must have access to the Internet. In other words, outbound traffic must be masqueraded (via NAT) using the IP address configured on the `pnet0` interface.

First, we enable routing by editing `/etc/sysctl.conf`:

```text
net.ipv4.ip_forward=1
```

We activate the setting with:

```bash
sysctl -p
```

We configure NAT with iptables to masquerade outbound traffic with the address of `pnet0`:

```bash
iptables -t nat -A POSTROUTING -o pnet0 -j MASQUERADE
```

To save the changes, we use:

```bash
iptables-save > /etc/iptables/rules.v4
```

Although not strictly necessary, I recommend rebooting the system to make sure everything is configured correctly.

## Import Labs

Now we download the labs and make them available directly on the EVE-NG server:

```bash
git clone https://github.com/dainok/courses /opt/courses
ln -s "/opt/courses/EVE-NG labs" "/opt/unetlab/labs/DevNetOps labs"
```

By accessing the web interface of EVE-NG, we should now see the available labs. For example, let's open `Simple Network Lab.unl`, power on `R1`, and verify the IP address and the connectivity to the Internet:

![[r1-boot.png]]

Now let's verify that we can access the node from the EVE-NG server (user `dev`) with the username `admin` and the password `cisco`:

```bash
$ ssh admin@169.254.1.21
Unable to negotiate with 169.254.1.21 port 22: no matching key exchange method found. Their offer: diffie-hellman-group-exchange-sha1,diffie-hellman-group14-sha1
```

When we access very old devices, outdated ciphers can cause access problems. We can re-enable them in the `~/.ssh/config` file:

```text
Ciphers +aes128-cbc
HostKeyAlgorithms +ssh-rsa
KexAlgorithms +diffie-hellman-group-exchange-sha1,diffie-hellman-group14-sha1

Host *
  ServerAliveInterval 5
  ServerAliveCountMax 3
```

At this point, we should be able to SSH into **R1**.

For completeness, the repository contains the complete `dnsmasq.conf` file with all the reserved DHCP records used in future labs. If we have made no customizations, we can update the configuration of the system:

```bash
cp -a "/opt/courses/EVE-NG setup/files/dnsmasq.conf" /etc/dnsmasq.conf
systemctl restart dnsmasq
```

## Compile and Install Python 3.10

This step is not required on EVE-NG 6, because Python 3.11 is available on Ubuntu Linux Server 22.04.

Ubuntu Linux Server 20.04 LTS, on which EVE-NG is based, comes with Python 3.8, which is too old for recent versions of the frameworks typically used for automation. The latest versions of [Ansible](https://www.ansible.com/), for example, require a newer version.

Let's download [Python](https://www.python.org/) 3.10:

```bash
cd /usr/src
wget -q https://www.python.org/ftp/python/3.10.14/Python-3.10.14.tgz
```

We unpack the file, compile the sources and install the new version:

```bash
tar xzf Python-3.10.14.tgz
cd Python-3.10.14
./configure --enable-optimizations
make
make install
```

When done, the new Python interpreter is available at `/usr/local/bin/python3.10`.

## Create a Development Environment

Now we can create a user dedicated to development:

```bash
useradd -m dev -s /bin/bash
passwd dev
```

We can also create a dedicated Python environment using the interpreter installed earlier:

```bash
su - dev
python3.10 -m venv venv
```

For convenience, we configure the shell to load the Python environment at every new login. We add the following line to the `.profile` file:

```bash
source ~/venv/bin/activate
```

Finally, we configure SSH authentication with keys. From our desktop, we copy our public key to the `~/.ssh/authorized_keys` file:

```bash
ssh-copy-id -i ~/.ssh/id_rsa.pub dev@172.25.82.167
```

Now we can connect to the EVE-NG server as `dev` without entering the password. While we are at it, we create a directory for development:

```bash
mkdir src
```

## Use Visual Studio Code for Remote Development

To complete the configuration, we set up [Visual Studio Code](https://code.visualstudio.com/) to develop remotely on the EVE-NG server with the `dev` user created earlier.

We start Visual Studio Code on our desktop, go to `Extensions` and install the [Remote - SSH](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-ssh) plugin.

We add a new host by going to `Remote Explorer` → `Remotes` → `SSH` → ➕:

* Specify the command to connect to the host: `ssh dev@172.25.82.167 -A`.
* Specify where to save the new host, typically `.ssh/config`.

At this point, we should be able to connect to the EVE-NG server:

![[vscode-remote-ssh.png]]

We can now enrich our development environment by installing the following plugins for remote use:

* [Ansible by Red Hat](https://marketplace.visualstudio.com/items?itemName=redhat.ansible).
* [GitHub Actions by GitHub](https://marketplace.visualstudio.com/items?itemName=GitHub.vscode-github-actions).
* [HashiCorp Terraform by HashiCorp](https://marketplace.visualstudio.com/items?itemName=HashiCorp.terraform).
* [Jinja by wholroyd](https://marketplace.visualstudio.com/items?itemName=wholroyd.jinja).
* [Pylance by Microsoft](https://marketplace.visualstudio.com/items?itemName=ms-python.vscode-pylance).
* [Python by Microsoft](https://marketplace.visualstudio.com/items?itemName=ms-python.python).
* [Terraform by Anton Kulikov](https://marketplace.visualstudio.com/items?itemName=4ops.terraform).
* [TextFSM Template Syntax by andytruett](https://marketplace.visualstudio.com/items?itemName=andytruett.TextFSM-Syntax).
* [YAML by Red Hat](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml).

![[vscode-plugins.png]]
