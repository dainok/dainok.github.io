---
cover: paloalto-strata
date: 2022-02-02
tags:
- advanced
- ansible
- firewall
- palo-alto-networks
---
I spent a few Twitch sessions talking about the automation of Palo Alto Networks firewalls. We used approaches different from the ones we used with Cisco devices. At first, we developed a few simple Ansible [[Ansible Playbooks and variables|playbooks]]. In the last sessions, we developed a very small Django web application to enable and disable network flows programmatically.

## Ansible with Palo Alto Networks Firewalls

The Palo Alto Networks module for Ansible has some prerequisites:

```bash
pip install pan-os-python pan-python pandevice xmltodict requests requests_toolbelt
```

Then we install the PAN-OS Ansible [[Ansible Galaxy|collection]]:

```bash
ansible-galaxy collection install paloaltonetworks.panos
```

The `interpreter_python` option in the `ansible.cfg` file must point to the interpreter that has the PAN-OS libraries installed. This is important when we use a virtual environment.

![[ansible-with-panw.png]]

The firewall credentials are not passed in the standard way: we must pass a specific dictionary to each task. We [populated](https://github.com/dainok/twitch-sessions/blob/main/S01E05-ansible-with-panw/playbook-1-facts.yml "playbook-1-facts.yml") the dictionary from the Ansible parameters as follows:

```yaml
- set_fact:
    provider:
        ip_address: "{{ ansible_host }}"
        password: "{{ ansible_password }}"
        username: "{{ ansible_user }}"
```

### Getting Facts

The Palo Alto Networks module does not use the `gather_facts` parameter. It defines a [custom task](https://github.com/dainok/twitch-sessions/blob/main/S01E05-ansible-with-panw/playbook-1-facts.yml "playbook-1-facts.yml") to retrieve the facts:

```yaml
- paloaltonetworks.panos.panos_facts:
    provider: "{{ provider }}"
```

### Sending Operational Commands

The `panos_op` module sends commands to the firewall. The module translates the given command into XML and uses the [[Automating Palo Alto Firewall via XML API|XML API]]. Some commands can fail, so the best way is to specify the commands with the XML syntax. The following command fails:

```yaml
cmd: 'show arp management' # Fails with "show -> arp has unexpected text."
```

The following command works:

```yaml
cmd: "<show><arp><entry name='management'/></arp></show>"
cmd_is_xml: true
```

The API browser, available on the firewall at the `/api` URL, helps to find the right request. The API above is available at `/php/rest/browse.php/op::show::arp`.

We used `panos_op` to get the [system info](https://github.com/dainok/twitch-sessions/blob/main/S01E05-ansible-with-panw/playbook-2-get-system-info.yml "playbook-2-get-system-info.yml") and the [ARP table](https://github.com/dainok/twitch-sessions/blob/main/S01E05-ansible-with-panw/playbook-3-get-arp-table.yml "playbook-3-get-arp-table.yml").

Because the operational commands are sent in XML format, the Ansible module converts the output to JSON automatically. Remember that XML can be converted to JSON/YAML and back, but XML attributes are usually lost in the process.

### Sending Configuration Commands

We wrote the [fourth playbook](https://github.com/dainok/twitch-sessions/blob/main/S01E05-ansible-with-panw/playbook-4-provisioning.yml "playbook-4-provisioning.yml") to test the configuration commands. The Ansible module offers many configuration commands, but we limited ourselves to configuring some parameters of the management interface.

We also discussed how to "zero-touch provision" a Palo Alto Networks firewall. We did not test the scenario, but we agreed that we could write a working playbook.

### Configuration Templating

Configuration commands can manage many features of a firewall, but we tested a different approach: configuration templating. Because Palo Alto Networks firewalls have the commit feature, in my opinion this is the best approach.

The idea is:

* Prepare a configuration template (Jinja2).
* Build the firewall configuration from the template, using an external configuration file (the model).
* Upload the firewall configuration file and enable it.

The [fifth playbook](https://github.com/dainok/twitch-sessions/blob/main/S01E05-ansible-with-panw/playbook-5-provisioning-from-file.yml "playbook-5-provisioning-from-file.yml") implements this approach.

Pros and cons of this approach:

* The entire firewall configuration can be stored in a [[A CMDB for IT infrastructures|CMDB]] file (pro).
* The firewall configuration is always consistent (pro).
* We can configure almost everything (pro).
* We do not need to run checks before inserting a specific configuration in a running firewall (pro).
* We need to spend a lot of time designing the firewall model (con).

## Programming the Firewall Using External Feeds

Many firewalls can read external feeds: we can use their content as a source or destination in access lists. This approach is perfect to allow temporary access. In the [last session](https://github.com/dainok/twitch-sessions/tree/main/S01E06-automating-dynamic-lists-for-panw-firewalls "edlprovider") we created a small web application with Django.

The application provides feeds that contain IP addresses. Each IP address has an expiration date, and once it expires it is removed from the feed.

![[django-with-panw.png]]

### Installing Django

We install Django in a Python environment (see S01E01):

```bash
pip install Django==4.0.1
```

### Creating the Django Application

We create the first Django project and an application within it:

```bash
django-admin startproject feedapp
cd feedapp
django-admin startapp edlprovider
./manage.py migrate
```

By default, the database is an SQLite file stored under the Django root folder. We must load the app in the `settings.py` file stored in the `feedapp` folder:

```text
INSTALLED_APPS = [
    ...
    "edlprovider",
]
```

We create the admin user:

```bash
./manage.py createsuperuser
```

### Modeling

In the simplest version of our application, we expect that:

* An admin user adds one or more EDL objects (lists of IP addresses).
* An admin user adds one or more IP addresses to an EDL object.
* An expiration time can optionally be set on each IP address.
* Unexpired IP addresses are available in a text list under a specific, non-guessable URL.

In other words, we have two objects:

* EDL with ID, name and URL.
* IP with name, expiration date (optional) and associated EDL.

When the model is complete, we update the migration scripts and upgrade the database schema:

```bash
./manage.py makemigrations
./manage.py migrate
```

### Admin Page

By default, Django provides an admin page for each model. We enable it by adding the following lines to the `admin.py` file:

```text
admin.site.register(models.EDL)
admin.site.register(models.IPAddress)
```

We open the Django application at the `/admin` URL and add one EDL with at least one IP address.

### Printing EDLs

The `view.py` file serves custom HTTP requests. We need to print the content of each EDL when a GET request asks for the EDL ID (slug). The URL is defined in the `rrapp/urls.py` file.

All the IP addresses linked to a specific EDL are printed in text format if their expiration date is in the future.

### Starting the Server

In the `settings.py` file, we can configure Django to serve any client. This is an insecure configuration. We add `*` to `ALLOWED_HOSTS`:

```text
ALLOWED_HOSTS = ['*']
```

We start the application:

```bash
./manage.py runserver 0.0.0.0:8000
```

The Django application is now reachable. We use the `/admin` URL and log in with the superuser credentials created before.

### Using the EDL from a PANW Firewall

Once an EDL is populated, we can use it as a source or destination in ACLs.

We can debug an EDL with the following commands:

```text
admin@fw> request system external-list stats type ip name EDL1
admin@fw> request system external-list show type ip name EDL1
admin@fw> request system external-list refresh type ip name EDL1
```

One last note: when an IP address is removed from an EDL, the session is not cleared. In other words, the established sessions are maintained and the new sessions are dropped.

A script should clear the sessions related to the expired IP addresses:

```text
admin@fw> clear session all filter rule TestEDL1 destination 192.168.28.152
```

Also note that the firewall usually probes the URLs every 5 minutes, so the clear command should run 5 minutes after the expiration date. We should extend the web application to track the requests and whether the sessions have been cleared.

## References

* [Ansible with PANW](https://github.com/dainok/twitch-sessions/tree/main/S01E05-ansible-with-panw "Ansible with PANW")
* [Automating Dynamic Lists for PANW firewalls](https://github.com/dainok/twitch-sessions/tree/main/S01E06-automating-dynamic-lists-for-panw-firewalls "Automating Dynamic Lists for PANW firewalls")
* [PAN-OS Ansible Collection](https://galaxy.ansible.com/paloaltonetworks/panos "PAN-OS Ansible Collection")
* [PAN-OS Ansible Collection Documentation](https://paloaltonetworks.github.io/pan-os-ansible/ "PAN-OS Ansible Collection Documentation")
* [PAN-OS XML API Labs with pan-python](http://api-lab.paloaltonetworks.com/ "PAN-OS XML API Labs with pan-python")
* [External Dynamic List](https://docs.paloaltonetworks.com/pan-os/10-1/pan-os-admin/policy/use-an-external-dynamic-list-in-policy/external-dynamic-list.html "External Dynamic List")
