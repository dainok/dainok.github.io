---
cover: ansible
date: 2024-08-05
tags:
- ansible
- beginner
---
Ansible typically works out of the box, without additional configuration. Advanced usage, however, may require some customization. Ansible can be configured through files or variables.

For example, the `DEFAULT_HOST_LIST` parameter defines the [[Ansible inventory|inventory]] file. The [official documentation](https://docs.ansible.com/ansible/latest/reference_appendices/config.html#default-host-list) specifies:

* `Default`: The default value when not specified otherwise (`/etc/ansible/hosts`).
* `INI`: How to specify the parameter in an INI configuration file (in this case, the section is `[defaults]` and the parameter is `inventory`).
* `Environment`: The environment variable used to specify the parameter (`ANSIBLE_INVENTORY`).

If you configure Ansible through INI files, there are four options:

* Use the file at `/etc/ansible/ansible.cfg`.
* Use the file `~/.ansible.cfg` in the home directory.
* Use the file `./ansible.cfg` in the current directory.
* Use the file defined by the `ANSIBLE_CONFIG` environment variable.

The `DEFAULT_HOST_LIST` parameter can also be specified on the command line with `-i`. Additionally, some parameters can be defined within a [[Ansible Playbooks and variables|playbook]].

Ansible applies a [precedence](https://docs.ansible.com/ansible/latest/reference_appendices/general_precedence.html#general-precedence-rules) to decide which value to use when a parameter is specified more than once. The order is:

* Configuration settings.
* Command-line options.
* Playbook keywords.
* Variables.

Lower items in the list override higher ones.

There are handy utilities to get general and specific information about your environment:

* `ansible-config list`: Lists all possible variables and how to configure them.
* `ansible-config dump`: Prints the current value of each variable.
* `ansible-config init > ansible.cfg`: Creates a sample configuration file (comprehensive but complex).
* `ansible-config view`: Verifies and prints the current configuration.

```yaml
DEFAULT_HOST_LIST:
  default: /etc/ansible/hosts
  description: Comma separated list of Ansible inventory sources
  env:
  - name: ANSIBLE_INVENTORY
  expand_relative_paths: true
  ini:
  - key: inventory
    section: defaults
  name: Inventory Source
  type: pathlist
  yaml:
    key: defaults.inventory
```

Let's check the current configuration of the `DEFAULT_HOST_LIST` variable:

```bash
$ ansible-config dump | grep DEFAULT_HOST_LIST
DEFAULT_HOST_LIST(default) = ['/etc/ansible/hosts']
```

Now let's change it with an environment variable and verify the result:

```bash
$ export ANSIBLE_INVENTORY=inventory.yml
$ ansible-config dump | grep DEFAULT_HOST_LIST
DEFAULT_HOST_LIST(env: ANSIBLE_INVENTORY) = ['/Users/dainese/inventory.yml']
```

As we will see later, `ansible-navigator` is a useful tool: it shows the configuration and highlights the variables that change the default behavior:

![[ansible-navigator.png]]

## Configuring SSH

One case needs careful handling: automating obsolete devices via SSH. Two parameters matter here:

* `ANSIBLE_HOST_KEY_CHECKING`: Set it to `False` to skip the host key checking performed by the underlying tools Ansible uses to connect to the host. In other words, it disables host verification. It can be configured in both the `[defaults]` and `[paramiko_connection]` sections.
* `PARAMIKO_LOOK_FOR_KEYS`: Set it to `False` to disable the search for private key files. In other words, it disables private key authentication. It can be configured in the `[paramiko_connection]` section.

Ansible can use either [Paramiko](https://docs.ansible.com/ansible/latest/collections/ansible/builtin/paramiko_ssh_connection.html) or [LibSSH](https://docs.ansible.com/ansible/latest/collections/ansible/netcommon/libssh_connection.html) to connect to remote devices via SSH. By default, LibSSH is used if available; otherwise Paramiko is used.

To force Paramiko, use the following configuration:

```ini
[persistent_connection]
ssh_type = paramiko

[paramiko_connection]
host_key_checking = true
look_for_keys = true
```

To increase [performance](https://www.ansible.com/blog/new-libssh-connection-plugin-for-ansible-network/) or to meet specific constraints, you can force LibSSH:

```ini
[persistent_connection]
ssh_type = libssh

[libssh_connection]
host_key_checking = False
look_for_keys = False
```

## SSH Access to Obsolete Devices

When accessing very old devices, such as those in a lab, you might encounter the following error:

```text
Unable to negotiate with 169.254.1.21 port 22: no matching key exchange method found. Their offer: diffie-hellman-group-exchange-sha1,diffie-hellman-group14-sha1
```

This occurs because the device supports only weak key exchange algorithms, which the system you are connecting from no longer accepts. Edit the `~/.ssh/config` file to re-enable them, knowing that this weakens the security of your environment:

```text
KexAlgorithms +diffie-hellman-group-exchange-sha1,diffie-hellman-group14-sha1
```

On macOS, the `+` symbol is not recognized, so you must specify the entire list of algorithms:

```text
KexAlgorithms diffie-hellman-group-exchange-sha1,diffie-hellman-group14-sha1,diffie-hellman-group1-sha1
```

## pylibssh on macOS

The `pylibssh` library is generally installed with the following command:

```bash
pip install ansible-pylibssh
```

On macOS, you might encounter the following error:

```text
Failed to import the required Python library (ansible-pylibssh)
```

This happens because `ansible-pylibssh`, although it appears to be installed correctly (`pip freeze | grep pylibssh`), does not work. You need to install it from source:

```bash
sudo xcode-select --install
brew install libssh libssh2
export CFLAGS="-I $(brew --prefix)/include -I ext -L $(brew --prefix)/lib -lssh"
git clone https://github.com/ansible/pylibssh.git ~/src/pylibssh
pip install ~/src/pylibssh/
```
