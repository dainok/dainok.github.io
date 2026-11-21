---
cover: self-defence
date: 2022-07-13
tags:
- advanced
- android
- digital-self-defence
---
Following an idea of [Michael Bazzell](https://inteltechniques.com/blog/2022/01/14/the-privacy-security-osint-show-episode-246/ "EPISODE 246-Android Sanitization"), I decided to write a short procedure to remove unwanted software from Android smartphones. It is not only about cleaning the phone, it is about privacy. My old approach required a rootable phone. This one does not, and it does not affect the warranty.

The uninstalled packages stay in the ROM, but they are removed from the running OS.

Be aware that we should not remove software just because we suspect it: we can easily make the phone unusable, and only a hard reset fixes it.

## Connect the Phone

We install the Android Debug Bridge (ADB) on our platform. The following command works on Raspberry Pi OS:

```bash
sudo apt install android-tools-adb
```

Now we enable USB debugging. We go to `Settings` → `About Phone` → `Software Information` and tap `Build Number` 7 times. Then we go to `Settings` → `Developer Options` and enable `USB Debugging`.

We connect the phone to the computer with a USB cable and restart ADB:

```bash
$ adb kill-server
$ adb devices
- daemon not running; starting now at tcp:5037
- daemon started successfully
List of devices attached
520011a1a0123143        device
```

Let's get the ID of the current user (usually `0`):

```bash
$ adb shell pm list users
Users:
        UserInfo{0:+39 333 000 1234:13} running
```

Now we can:

* List the installed and uninstalled packages (`list packages`).
* Uninstall a package (`uninstall`).
* Disable a package (`pm disable-user`).
* Reinstall a package (`install-existing`).
* Enable a package (`enable`).

## Android Sanitization

Let's find some unwanted packages. For example, let's assume we want to remove some social network apps:

```bash
$ adb shell pm list packages --user 0 | egrep -i "linkedin|microsoft" | cut -d ":" -f2 | sort
com.facebook.appmanager
com.facebook.katana
com.facebook.services
com.facebook.system
com.linkedin.android
```

Then we uninstall them one by one:

```bash
adb shell pm uninstall -k --user 0 com.linkedin.android
```

Or we can script the task:

```bash
PKGS_TO_UNINSTALL=$(adb shell pm list packages --user 0 | egrep -i "linkedin|microsoft" | cut -d ":" -f2)
for P in $PKGS_TO_UNINSTALL; do adb shell pm uninstall -k --user 0 $P; done
```

Disabling an app marks it as unavailable (which we can easily revert), while uninstalling physically removes the app and all its data from the device. The `-k` flag keeps the data and cache directories after the package removal.

## Restoring a Critical App

In my tests, I removed some critical apps. We can restore them without issues:

```bash
adb shell cmd package install-existing com.linkedin.android
adb shell pm enable com.linkedin.android
```

## Finding App Information

For some well-known apps, we know what a package is. For most of them, we have to find additional information. I automated this long task with a simple Python script:

```bash
#!/usr/bin/env python3

import requests
from lxml.html import fromstring

with open('package_list.txt') as f:
    lines = f.readlines()

print("Package,Name,Author,Category")
for line in lines:
    package_name = line.strip()
    package_title = 'N/A'
    package_author = 'N/A'
    package_category = 'N/A'
    url = f'https://apkcombo.com/en/visionprovider/{package_name}/'

    r = requests.get(url)
    if r.status_code == 200:
        tree = fromstring(r.content)
        information_table = tree.xpath("//div[@class='information-table']").pop()
        package_title = tree.findtext('.//title').split(' APK ')[0]
        try:
            package_author = information_table.xpath("//a[contains(@href,'developer')]")[0].text
        except:
            pass
        try:
            package_category = information_table.xpath("//a[contains(@href,'category')]")[3].text
        except:
            pass

    print(f'{package_name},{package_title},{package_author},{package_category}')
```

We can now look up the details of each installed app:

```bash
sudo apt install python3-pip
pip3 install lxml -U
adb shell pm list packages -u | cut -d":" -f2 > package_list.txt
./app_resolver.py > package_list.csv
```

## Finding the Uninstalled Apps

Finally, we want to save the list of the uninstalled apps. If we used the commands and flags above, we can list the installed packages, list the installed and uninstalled packages, and compare them:

```bash
adb shell pm list packages > a
adb shell pm list packages -u > b
diff a b | grep "^>" | cut -d":" -f2 | sort
```

From my test devices, I removed:

| Package                                       | Name                   | Author                        | Category                |
| --------------------------------------------- | ---------------------- | ----------------------------- | ----------------------- |
| com.android.email                             | HUAWEI Email           | HUAWEI                        | Tools                   |
| com.android.mediacenter                       | Huawei Music           | Huawei Internet Services      | Tools                   |
| com.example.android.notepad                   | NotePad                | Xiaomi Inc.                   | Tools                   |
| com.facebook.appmanager                       | N/A                    | N/A                           | N/A                     |
| com.facebook.katana                           | Facebook               | Meta Platforms, Inc.          | Social                  |
| com.facebook.services                         | Facebook Services      | Samsung Electronics Co., Ltd. | Tools                   |
| com.facebook.system                           | Facebook App Installer | Samsung Electronics Co., Ltd. | Tools                   |
| com.google.android.apps.docs                  | Google Drive           | Google LLC                    | Productivity            |
| com.google.android.apps.photos                | Google Photos          | Google LLC                    | Photography             |
| com.google.android.apps.tachyon               | Google Duo             | Google LLC                    | Communication           |
| com.google.android.music                      | Google Play Music      | Google LLC                    | Music & Audio           |
| com.google.android.videos                     | Google TV              | Google LLC                    | Video Players & Editors |
| com.google.android.youtube                    | YouTube                | Google LLC                    | Video Players & Editors |
| com.huawei.android.mirrorshare                | Wireless projection    | HUAWEI                        | Tools                   |
| com.huawei.android.totemweather               | HUAWEI Weather         | Huawei                        | Tools                   |
| com.huawei.appmarket                          | Huawei AppGallery      | Huawei                        | Tools                   |
| com.huawei.compass                            | Huawei Compass         | Uploader                      | Tools                   |
| com.huawei.hidisk                             | Huawei File Manager    | Huawei Internet Services      | Tools                   |
| com.huawei.hwdetectrepair                     | Smart diagnosis        | Huawei Internet Service       | Tools                   |
| com.huawei.hwid                               | Huawei Mobile Services | Huawei Internet Services      | Tools                   |
| com.huawei.mirror                             | N/A                    | N/A                           | N/A                     |
| com.huawei.phoneservice                       | HiCare                 | Huawei Internet Services      | Tools                   |
| com.huawei.search                             | HUAWEI HiSearch        | HUAWEI                        | Tools                   |
| com.huawei.systemmanager                      | HUAWEI Optimizer       | HUAWEI                        | Tools                   |
| com.huawei.vassistant                         | HiVoice                | HUAWEI                        | Tools                   |
| com.linkedin.android                          | LinkedIn               | LinkedIn                      | Business                |
| com.microsoft.office.excel                    | Microsoft Excel        | Microsoft Corporation         | Productivity            |
| com.microsoft.office.powerpoint               | Microsoft PowerPoint   | Microsoft Corporation         | Productivity            |
| com.microsoft.office.word                     | Microsoft Word         | Microsoft Corporation         | Productivity            |
| com.microsoft.skydrive                        | Microsoft OneDrive     | Microsoft Corporation         | Productivity            |
| com.microsoft.translator                      | Microsoft Translator   | Microsoft Corporation         | Productivity            |
| com.nuance.swype.emui                         | Swype for Huawei       | Nuance Communications, Inc    | Tools                   |
| com.samsung.android.app.spage                 | Bixby Home             | Samsung Electronics Co., Ltd. | Tools                   |
| com.samsung.android.bbc.fileprovider          | KnoxBBCProvider        | Samsung Electronics Co., Ltd. | Tools                   |
| com.samsung.android.lool                      | Samsung Device Care    | Samsung Electronics Co., Ltd. | Tools                   |
| com.samsung.knox.securefolder                 | Secure Folder          | Samsung Electronics Co., Ltd. | Business                |
| com.samsung.android.scloud                    | Samsung Cloud          | Samsung Electronics Co., Ltd. | Tools                   |
| com.samsung.android.securitylogagent          | SecurityLogAgent       | Samsung Electronics Co., Ltd. | Tools                   |
| com.samsung.android.visionintelligence        | Bixby Vision           | Samsung Electronics Co., Ltd. | Tools                   |
| com.sec.android.app.samsungapps               | Samsung Galaxy Store   | Samsung Electronics Co. Ltd   | Entertainment           |
| com.sec.enterprise.knox.shareddevice.keyguard | SharedDeviceKeyguard   | Samsung Electronics Co., Ltd. | Tools                   |
| com.sec.spp.push                              | Samsung Push Service   | Samsung Electronics Co., Ltd. | Communication           |
| com.topjohnwu.magisk                          | Magisk                 | topjohnwu                     | Tools                   |
| de.axelspringer.yana.zeropage                 | upday                  | upday GmbH & Co. KG           | News & Magazines        |
| me.twrp.twrpapp                               | Official TWRP App      | Team Win LLC                  | Tools                   |

## Conclusions

I honestly hate bloatware: it affects my privacy by tracking users and collecting their data. I think this is a good method to disable unwanted software. It is not perfect, because we never know exactly what is installed on our phones, but it is easy and affordable for many people.

There are other methods, but they are for advanced users.

## References

* [Android Sanitization](https://inteltechniques.com/blog/2022/01/14/the-privacy-security-osint-show-episode-246/ "EPISODE 246-Android Sanitization")
* [How to Remove Samsung Bloatware without Root (ADB)](https://technastic.com/remove-samsung-bloatware-safe-to-remove-apps/ "How to Remove Samsung Bloatware without Root (ADB)")
* [Uninstall System Apps on Huawei and Honor Devices](https://technastic.com/huawei-honor-bloatware-list-emui/ "Uninstall System Apps on Huawei and Honor Devices")
