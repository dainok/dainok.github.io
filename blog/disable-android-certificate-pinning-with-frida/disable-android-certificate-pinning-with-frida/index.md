---
cover: frida
date: 2022-07-23
tags:
- advanced
- android
- blog
- digital-self-defence
- frida
---
During security assessments of smart home applications, I usually need to analyze encrypted HTTPS communications. Applications usually check for valid certificates, but they also check that the certificates are signed by a specific issuer. This is called "Certificate Pinning". It is not recommended, but it is widely used:

> Caution: Certificate Pinning is not recommended for Android applications due to the high risk of future server configuration changes, such as changing to another Certificate Authority, rendering the application unable to connect to the server without receiving a client software update.

To decrypt an HTTPS connection protected with Certificate Pinning, we need a different approach: Frida, a dynamic instrumentation toolkit for developers, reverse engineers and security researchers.

## Installing Frida on Kali Linux

Let's prepare our Kali Linux:

```bash
sudo apt install android-tools-adb android-tools-fastboot
```

We install an old Python version from sources:

```bash
sudo apt install libssl-dev libsqlite3-dev liblzma-dev libffi-dev zlib1g-dev
wget https://www.python.org/ftp/python/3.7.12/Python-3.7.12.tgz
tar xzvf Python-3.7.12.tgz -o -C /opt
cd /opt/Python-3.7.12
./configure --enable-optimizations
make
```

Finally, we build a virtual environment:

```bash
./python -m venv ~/.venv-frida
```

With the Python interpreter and the virtual environment above, we can install Frida:

```bash
source ~/.venv-frida/bin/activate
pip install frida-tools objection
```

## Installing Frida Server on the Android Device

On a rooted Android device, we enable USB Debugging. We go to `Settings` → `About Phone` → `Software Information` and click 7 times on `Build Number`, then we go to `Settings` → `Developer Options` → `Enable` → `USB Debugging` and enable it.

We connect the phone to the computer with a USB cable and restart ADB:

```bash
adb kill-server
adb devices
- daemon not running; starting now at tcp:5037
- daemon started successfully
List of devices attached
520011a1a0123143        device
```

We download the proper [Frida version](https://github.com/frida/frida/releases) and [frida-android-unpinning](https://github.com/httptoolkit/frida-android-unpinning):

```bash
wget https://github.com/frida/frida/releases/download/15.2.2/frida-server-15.2.2-android-arm64.xz
wget https://raw.githubusercontent.com/httptoolkit/frida-android-unpinning/main/frida-script.js
```

We upload Frida Server to the Android device:

```bash
unxz frida-server-15.1.12-android-arm.xz
mv frida-server-15.1.12-android-arm frida-server
adb push frida-server /data/local/tmp/
```

Finally, we start Frida Server on the Android device:

```bash
adb shell
su
/data/local/tmp/frida-server
```

We open another shell on Kali Linux, using the Python virtual environment built for Frida, and check the network connection between the client (Kali Linux) and the server (Android):

```bash
frida-ps -U
```

The last command should return the list of the processes running on the Android device.

## Running an Application Without Certificate Pinning

We are now ready to run an application with certificate pinning disabled. All the following commands run on Kali Linux.

We identify the package name of the application we want to run:

```bash
adb shell pm list packages --user 0 -u | grep -i appname
```

We make sure that the application is not running on the Android device:

```bash
frida-ps -U | grep -i AppName
```

We start the application:

```bash
frida --no-pause -U -l ./frida-script.js -f com.appname.start
```

The app starts on the smartphone and pops up on the screen. All HTTPS connections have certificate pinning disabled and can be intercepted by MITM Proxy.
