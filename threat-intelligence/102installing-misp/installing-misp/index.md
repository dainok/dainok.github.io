---
cover: misp
date: 2025-05-06
tags:
- beginner
- misp
- threat-intelligence
---
Installing MISP is relatively straightforward and well documented in the [user guide](https://misp.github.io/MISP/). The user guide does not yet mention Ubuntu 24.04, although the [installation script](https://github.com/MISP/MISP/blob/2.5/INSTALL/INSTALL.ubuntu2404.sh) is available in the repository.

```bash
apt-get update
apt-get upgrade -y
wget -O /tmp/INSTALL.sh https://raw.githubusercontent.com/MISP/MISP/refs/heads/2.5/INSTALL/INSTALL.ubuntu2404.sh
bash /tmp/INSTALL.sh
```

The installation starts and displays each step as it proceeds:

![[misp-setup.png]]

At the end, it shows the credentials to access the platform:

![[misp-credentials.png]]

By default, the platform is accessible at [https://misp.local](https://misp.local). If the system is reachable through a different FQDN, we update the `/var/www/MISP/app/Config/config.php` file:

```php
<?php
$config = array (
  'debug' => 0,
  'MISP' =>
  array (
    # 'baseurl' => 'https://misp.local',
    'baseurl' => 'https://172.24.1.18',
```

We also modify the `/etc/apache2/sites-available/misp-ssl.conf` file, which handles the HTTPS redirection:

```text
<VirtualHost _default_:80>
    ServerAdmin admin@misp.local
    ServerName misp.local

    # Redirect permanent / https://misp.local
    Redirect permanent / https://172.24.1.18

    LogLevel warn
    ErrorLog /var/log/apache2/misp.local_error.log
    CustomLog /var/log/apache2/misp.local_access.log combined
    ServerSignature Off
</VirtualHost>
```

We reload the configuration:

```bash
apachectl graceful
```

Then we log in with the credentials displayed during the installation.

## Enabling Feeds

We can now enable one or more default feeds in MISP. We go to `Sync Actions → Feeds`:

![[misp-feeds.png]]

We edit the feeds and enable them. When we return to the event list, we see the events imported from the feeds:

![[misp-event-list.png]]

## Creating an Event

Next, let's create an event. We navigate to `Event Actions → Add Event`, using a spam email as the base:

![[add-misp-event.png]]

When we create an event, the following parameters are required:

* **Distribution:** the sharing level of the event. Your organization only (0), This community only (1), Connected communities (2), All communities (3), Sharing group (4), Inherit Event (5).
* **Analysis:** the status of the threat analysis. Initial (0), Ongoing (1), Complete (2).
* **Threat level:** High (1), Medium (2), Low (3), Undefined (4).

Once the event is created, we associate the attributes that best describe the threat. Since we are analyzing an email, we include:

* The subject.
* The IP address of the sending server.
* The destination email address.
* The source email address.
* Any links contained in the email.
* Any attachments found in the email.

When we create an attribute, the following parameters are required:

* **Category:** the category of the attribute, which in this case is *Payload delivery*.
* **Type:** the type of the attribute, chosen from a predefined list based on the best match.
* **Distribution:** the sharing level of the attribute.

![[misp-attributes.png]]

The final step is to tag the event and its attributes properly. Best practice is to tag the event itself, and to tag individual attributes only when strictly necessary. If an appropriate cluster exists, we can also use [MISP Galaxy](https://www.misp-project.org/galaxy.html) ([GitHub](https://github.com/MISP/misp-galaxy/tree/main/galaxies)).

We can also assign the appropriate TLP level. The [TLP (Traffic Light Protocol)](https://www.first.org/tlp/) was created to support the proper sharing of sensitive information. TLP uses a series of labels that define who may share the information:

* `TLP:CLEAR`: the information can be shared freely without restriction, subject to copyright or proprietary considerations.
* `TLP:GREEN`: the information can be shared with peers and partner organizations, but not publicly.
* `TLP:AMBER`: the information carries potential privacy, reputational or operational risk, and can be shared only within the organization of the recipient and its clients.
* `TLP:AMBER+STRICT`: same as `TLP:AMBER`, but sharing is restricted to the organization of the recipient only.
* `TLP:RED`: the information is highly sensitive and must not be shared beyond the original recipients.

When we complete these steps, the event looks like this:

![[misp-event.png]]
