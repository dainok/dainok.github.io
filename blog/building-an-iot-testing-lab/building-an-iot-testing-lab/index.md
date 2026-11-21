---
cover: ad
date: 2022-07-22
tags:
- advanced
- blog
- digital-self-defence
- iot
- lab
- security
---
As private individuals, we use many consumer IoT devices: almost any standard piece of home equipment can now be controlled remotely with a specific application installed on a smartphone.

The question is: how much can we trust those IoT devices? How do they affect our digital security and privacy?

To answer these questions, we build a small and cheap IoT testing lab.

## Design

The design is simple: we want a flexible device (Linux-based) that intercepts any Ethernet/IP traffic emitted by the IoT device.

![[iot-testing-lab.png]]

The Linux device provides an Internet connection to the IoT device, dumps all the traffic data and metadata, and also intercepts the encrypted traffic.

### Bill of Materials (BOM)

For our testing lab, we use:

* [Raspberry Pi 4 8 GB RAM](https://www.amazon.it/gp/product/B0899VXM8F/ "Raspberry Pi 4 8 GB RAM on Amazon").
* [Raspberry Pi 4 case and accessories](https://www.amazon.it/gp/product/B07WN3CHGH/ "Raspberry Pi 4 Model B kit on Amazon").
* [microSD Samsung Evo plus 128 GB](https://www.amazon.it/gp/product/B09R4HNX4J/ "microSD Samsung Evo plus 128 GB on Amazon").
* [Ethernet 10/100/1000 USB 3.0 adapter](https://www.amazon.it/gp/product/B00M77HMU0/ "Ethernet 10/100/1000 USB 3.0 adapter on Amazon").
* [D-Link DWL-G730AP](https://www.amazon.it/D-Link-DWL-G730AP-AirPlus-802-11g-Wireless/dp/B0002Z45DQ "D-Link DWL-G730AP on Amazon").
* [Logitech K360 Wireless keyboard](https://www.amazon.it/gp/product/B005KSYPGW/ "Logitech K360 Wireless keyboard on Amazon").
* [Kali Linux for ARM](https://www.kali.org/get-kali/#kali-arm "Get Kali Linux for ARM").
* [NextDNS account](https://nextdns.io/ "NextDNS").

We can write the Kali Linux ARM image to the microSD with the [Raspberry Pi Imager](https://www.raspberrypi.com/software/ "Install Raspberry Pi OS using Raspberry Pi Imager").

I use an [old portable wireless access point](https://www.amazon.it/D-Link-DWL-G730AP-AirPlus-802-11g-Wireless/dp/B0002Z45DQ "D-Link DWL-G730AP on Amazon") that I bought years ago. [This one](https://www.amazon.it/TP-Link-TL-WR802N-Portatile-Modalit%C3%A0-Operative/dp/B00TQEX8BO/ "TP-Link TL-WR802N on Amazon") should work too in "Access Point" mode.

## First Boot

After the first boot, we can start configuring the Raspberry Pi. SSH is enabled by default on Kali Linux:

```bash
sudo systemctl start ssh
sudo systemctl enable ssh
```

We install some packages required by the next steps:

```bash
sudo apt-get update
sudo apt-get dist-upgrade
sudo apt-get autoremove
sudo apt-get install iptables-persistent dnsmasq
sudo mkdir -p /var/log/analysis/zeek/
```

If needed, we adjust the keyboard and the timezone:

```bash
sudo dpkg-reconfigure keyboard-configuration
sudo timedatectl set-timezone Europe/Rome
```

We disable the embedded Bluetooth and wireless adapters:

```bash
sudo echo "dtoverlay=disable-bt" >> /boot/config.txt
sudo echo "dtoverlay=disable-wifi" >> /boot/config.txt
```

We reboot to apply all the configurations above.

## Network Configuration

The Pi acts as a router, so we need to configure two network interfaces. The first one is configured with DHCP by default, and we must configure the second one:

```bash
sudo cat << EOF > /etc/network/interfaces.d/eth0
auto eth0
    allow-hotplug eth0
    iface eth0 inet dhcp
EOF
```

```bash
sudo cat << EOF > /etc/network/interfaces.d/eth1
auto eth1
allow-hotplug eth1
iface eth1 inet static
    address 192.168.0.1
    netmask 255.255.255.0
EOF
```

To let the Pi act as a router, we enable IPv4 forwarding. We edit `/etc/sysctl.conf` and set:

```text
net.ipv4.ip_forward=1
```

At the end, we reload the `sysctl` settings:

```bash
sysctl -p
```

To make the Internet reachable from the devices attached to `eth1`, we need to enable NAT. We also add some tricks to force DNS traffic and log the requests that come from `eth1`:

```bash
sudo cat << EOF > /etc/iptables/rules.v4
*nat
:PREROUTING ACCEPT [0:0]
:INPUT ACCEPT [0:0]
:OUTPUT ACCEPT [0:0]
:POSTROUTING ACCEPT [0:0]
-A PREROUTING ! -d 192.168.0.1/32 -p udp -m udp --dport 53 -j MARK --set-xmark 0x1/0xffffffff
-A PREROUTING -m mark --mark 0x1 -j LOG --log-prefix "iptables: direct_dns "
-A PREROUTING -m mark --mark 0x1 -j DNAT --to-destination 192.168.0.1
-A POSTROUTING -o eth0 -j MASQUERADE
COMMIT
*filter
:INPUT DROP [0:0]
:FORWARD ACCEPT [0:0]
:OUTPUT ACCEPT [0:0]
:Services - [0:0]
-A INPUT -i lo -j ACCEPT
-A INPUT -i eth1 -j ACCEPT
-A INPUT -m state --state RELATED,ESTABLISHED -j ACCEPT
-A INPUT -m state --state NEW -j Services
-A FORWARD -i eth1 -m state --state NEW -j MARK --set-xmark 0x2/0xffffffff
-A FORWARD -m mark --mark 0x2 -j LOG --log-prefix "iptables: new_conn "
-A Services -p tcp -m tcp --dport 22 -j ACCEPT
-A Services -p tcp -m tcp --dport 9090 -j ACCEPT
COMMIT
EOF
```

We can reload the firewall with:

```bash
sudo iptables-restore /etc/iptables/rules.v4
```

Finally, we make `iptables` log to a dedicated file:

```bash
sudo cat << EOF > /etc/rsyslog.d/iptables.conf
:msg, regex, "iptables: " -/var/log/analysis/iptables.log
EOF
```

We restart `rsyslog`:

```bash
sudo systemctl restart rsyslog
```

## DNS and DHCP Server

To intercept and track the DNS requests, we use DNSMasq, which can act as a DNS and DHCP server. We make sure that DNSMasq loads the external configuration files by editing `/etc/dnsmasq.conf`:

```text
conf-dir=/etc/dnsmasq.d/,*.conf
```

We configure DHCP as follows:

```bash
sudo cat << EOF > /etc/dnsmasq.d/network.conf
interface=eth1
dhcp-range=192.168.0.50,192.168.0.150,24h
EOF
```

We forward the DNS requests to NextDNS. We must use our CPE ID, otherwise we do not see the DNS requests on the NextDNS dashboard:

```bash
sudo cat << EOF > /etc/dnsmasq.d/nextdns.conf
port=53
no-resolv
no-hosts
bogus-priv
strict-order
server=45.90.30.0
server=45.90.28.0
add-cpe-id=aaaaaa
EOF
```

We want DNSMasq to log all the requests to a specific file:

```bash
sudo cat << EOF > /etc/dnsmasq.d/logging.conf
# Log each DNS query
log-queries

# Log lots of extra information about DHCP
log-dhcp

# Log into a dedicated files
log-facility=/var/log/analysis/dnsmasq.log
EOF
```

Finally, we restart DNSMasq:

```bash
sudo systemctl enable dnsmasq
sudo systemctl restart dnsmasq
```

## Full Traffic Capture

The captured packets are not easy to analyze, but it is still useful to have them, so that we can analyze specific conversations. We configure a small service that captures all the packets entering from `eth1`:

```bash
sudo cat << EOF > /etc/systemd/system/tcpdump.service
[Unit]
After=network.target

[Service]
Restart=always
RestartSec=30
Environment="TCPDUMP_FORMAT=%%Y%%m%%d-%%H:%%M:%%S"
ExecStartPre=/bin/mkdir -p /var/log/analysis
ExecStart=/usr/bin/tcpdump -G 3600 -i eth1 -w "/var/log/analysis/tcpdump-eth1-${TCPDUMP_FORMAT}.pcap"
ExecStop=/bin/kill -s SIGINT $MAINPID

[Install]
WantedBy=multi-user.target
EOF
```

We enable and start the new service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable tcpdump
sudo systemctl start tcpdump
```

## Light Traffic Capture (Metadata)

We need a faster way to understand what the device under test is doing.

Zeek captures traffic metadata in a human-readable format. Zeek is not available on Kali Linux for Raspberry Pi, so we need to compile it. The process takes a few hours:

```bash
sudo apt-get install cmake flex bison libpcap-dev libssl-dev python3 python3-dev swig zlib1g-dev
sudo apt-get install python3-git python3-semantic-version exim4
git clone --recursive https://github.com/zeek/zeek
cd zeek
./configure
make
sudo make install
```

We also install the auxiliary programs of Zeek:

```bash
cd auxil/zeek-aux
./configure
make
sudo make install
```

We can include the Zeek binary directory in the path:

```bash
export PATH=/usr/local/zeek/bin:${PATH}
```

To configure Zeek, we edit `/usr/local/zeek/etc/node.cfg`:

```ini
[zeek]
type=standalone
host=localhost
interface=eth1
```

We also want Zeek to log in the same directory we used before. We edit `/usr/local/zeek/etc/zeekctl.cfg` and set:

```text
LogDir = /var/log/analysis/zeek
```

Finally, we update the Zeek installation and configuration:

```bash
sudo zeekctl install
```

We can start Zeek manually or configure a systemd service:

```bash
sudo cat << EOF > /etc/systemd/system/zeek.service
[Unit]
Description=zeek network analysis engine

[Service]
Type=forking
PIDFIle=/var/run/zeek.pid
ExecStart=/usr/local/zeek/bin/zeekctl start
ExecStop=/usr/local/zeek/bin/zeekctl stop

[Install]
WantedBy=multi-user.target
EOF
```

And we enable it at boot:

```bash
sudo systemctl daemon-reload
sudo systemctl enable zeek
sudo systemctl start zeek
```

## MITM Proxy

We use MITM Proxy to analyze the encrypted HTTP connections. We install it with:

```bash
sudo apt-get install mitmproxy
```

We configure MITM Proxy as a system service:

```bash
sudo cat << EOF > /etc/systemd/system/mitmproxy.service
[Unit]
Description=MITMProxy

[Service]
Type=simple
ExecStart=/usr/bin/mitmweb --mode transparent --web-port 9090 --web-host 0.0.0.0 --no-web-open-browser
StandardOutput=file:/var/log/analysis/mitmproxy.log
StandardError=file:/var/log/analysis/mitmproxy.log

[Install]
WantedBy=multi-user.target
EOF
```

And we start it at boot:

```bash
sudo systemctl daemon-reload
sudo systemctl start mitmproxy
sudo systemctl enable mitmproxy
```

To intercept the traffic, we NAT (REDIRECT) the HTTP and HTTPS connections to the port used by MITM Proxy (the default is 8080):

```bash
sudo iptables -t nat -A PREROUTING -i eth1 -p tcp --dport 80 -m comment --comment "mitmproxy" -j REDIRECT --to-port 8080
sudo iptables -t nat -A PREROUTING -i eth1 -p tcp --dport 443 -m comment --comment "mitmproxy" -j REDIRECT --to-port 8080
```

Because we need to activate and deactivate the MITM Proxy traffic inspection, we can use a simple script:

```bash
#!/bin/bash

function disable() {
    iptables -t nat -S | grep mitmproxy | cut -d" " -f2- | xargs -rL1 iptables -t nat -D
}

function  enable() {
    disable
    iptables -t nat -A PREROUTING -p tcp --dport 80 -m comment --comment "mitmproxy" -j REDIRECT --to-port 8080
    iptables -t nat -A PREROUTING -p tcp --dport 443 -m comment --comment "mitmproxy" -j REDIRECT --to-port 8080
}

case $1 in
    enable)
        enable
        ;;
    disable)
        disable
        ;;
    *)
        echo "Use $0 enable|disable"
        exit 1
        ;;
esac
```

We activate and deactivate the traffic interception with:

```bash
sudo /root/mitmproxy.sh enable
sudo /root/mitmproxy.sh disable
```

The MITM Proxy web interface is available on port `9090` by default.

![[mitm-proxy-webui.png]]

### Traffic Interception

Once the traffic interception is activated, the HTTPS connections are split into two parts:

![[traffic-interception.png]]

The first diagram shows non-intercepted HTTPS connections: in this case, the client gets a valid signed certificate.

The second diagram shows HTTPS connections intercepted by MITM Proxy: the client gets an invalid certificate, self-signed by the MITM Proxy server.

We have three different scenarios:

1. The application does not validate certificates, and MITM Proxy can intercept the traffic.
2. The application validates certificates, and certificate pinning is not configured in the application.
3. The application validates certificates, and certificate pinning is configured in the application.

In the second scenario, we can enable the traffic interception by installing the MITM Proxy certificate in the device and trusting it. From the device, we open `http://mitm.it` and install the self-signed certificate.

![[mitm-it-website.png]]

![[certificate-installer.png]]

In the third scenario, the application validates a specific certificate, so even if the MITM Proxy certificate is trusted, the application recognizes a MITM attack:

```text
192.168.0.126:34170: Client TLS handshake failed. The client may not trust the proxy's certificate for www.google.com (OpenSSL Error([('SSL routines', 'ssl3_read_bytes', 'sslv3 alert certificate unknown')]))
```

To bypass certificate pinning, see the post about [[Disable Android Certificate Pinning with Frida|Frida]].

## Log Rotation

To keep the system clean, we rotate the logs:

```bash
sudo cat << EOF > /etc/logrotate.d/analysis
/var/log/analysis/iptables.log {
    daily
    rotate 7
    nocompress
    missingok
    notifempty
    dateext
}
/var/log/analysis/dnsmasq.log {
    daily
    rotate 7
    nocompress
    missingok
    notifempty
    dateext
}
/var/log/analysis/tcpdump {
    daily
    rotate 0
    ifempty
    lastaction
        /usr/bin/find /var/log/analysis/ -name "tcpdump-*" -mtime +7 -delete
    endscript
}
EOF
```

The next `logrotate` executions clean the obsolete files.

## Clean Logs

Before and after testing an IoT device and its related apps, we probably want to purge the old log files. A short script automates this task:

```bash
sudo cat << EOF > /root/clean.sh
#!/bin/bash

NEXT_DNS_PROFILE=aaaaaa
NEXT_DNS_APIKEY=<NEXTDNS_API_KEY>

find /var/log/analysis -type f -exec rm -f {} \;
rm -rf /var/log/analysis/zeek/2*
systemctl restart tcpdump
systemctl restart dnsmasq
systemctl restart rsyslog
systemctl restart mitmproxy

curl -X "DELETE" --header "X-Api-Key: ${NEXT_DNS_APIKEY}" https://api.nextdns.io/profiles/${NEXT_DNS_PROFILE}/logs
EOF
```

We replace the two parameters with our own data and run the script:

```bash
sudo chmod 755 /root/clean.sh
sudo /root/clean.sh
```

## Conclusions

We built a small and cheap lab to test consumer IoT devices. The same tools can be used in a threat hunting scenario or during network analysis (performance, troubleshooting, etc.). Learning Linux means having an invaluable toolkit ready for complex analysis.

We learn how to use this setup in dedicated posts.
