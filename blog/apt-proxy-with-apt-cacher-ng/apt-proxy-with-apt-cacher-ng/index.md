---
cover: linux
date: 2020-08-13
tags:
- blog
- intermediate
- linux
- proxy
---
On large Debian installations, I usually configure an APT proxy to optimize upgrades. I configure APT-Cacher NG in the following way, in the `/etc/apt-cacher-ng/acng.conf` file:

```text
CacheDir: /proxydata/cache/apt-cacher-ng
LogDir: /var/log/apt-cacher-ng
SupportDir: /usr/lib/apt-cacher-ng
Port:3142
Remap-debrep: file:deb_mirror*.gz /debian ; file:backends_debian # Debian Archives
Remap-uburep: file:ubuntu_mirrors /ubuntu ; file:backends_ubuntu # Ubuntu Archives
Remap-secdeb: security.debian.org ; security.debian.org deb.debian.org/debian-security
Remap-elastic: http://artifacts.elastic.co ; https://artifacts.elastic.co
Remap-docker: http://download.docker.com ; https://download.docker.com
ReportPage: acng-report.html
ExThreshold: 4
LocalDirs: acng-doc /usr/share/doc/apt-cacher-ng
VfileUseRangeOps: -1
```

Clients access the repositories via HTTP, and the APT-Cacher NG daemon maps them to HTTPS when necessary.
