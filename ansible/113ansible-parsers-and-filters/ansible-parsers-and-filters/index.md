---
cover: ansible
date: 2024-11-06
tags:
- advanced
- ansible
- ntc-templates
- textfsm
---
The method we are using with Ansible is called "screen scraping": the interaction with the device does not go through APIs but through the CLI, emulating human activity. Typing the commands may be straightforward, but reading the output can be particularly challenging.

Consider the following output:

```text
R1#show ip int brie
Interface                  IP-Address      OK? Method Status                Protocol
Ethernet0/0                169.254.1.118   YES DHCP   up                    up
Ethernet0/1                unassigned      YES unset  administratively down down
Ethernet0/2                unassigned      YES unset  administratively down down
Ethernet0/3                unassigned      YES unset  administratively down down
```

The output above is readable by humans but requires some work to be usable in a program. For instance, to read the IP address of the `Ethernet0/0` interface, we would need to find the line where the interface name appears and then move a certain number of characters until we reach the IP address. Moreover, this is the format used by the Cisco IOS device in this example: if we change vendor or, in some cases, version, the format of the table might change.

Parsers in Ansible handle this task: they read a text and convert it into a data structure. Parsers, which are essential unless you work with APIs, are [available for various types of text](https://docs.ansible.com/ansible/latest/network/user_guide/cli_parsing.html).

Here we look at four of them:

* TextFSM.
* NTC Templates.
* pyATS / Genie.
* TTP.

For our tests, we use the `Simple Network Lab` environment, with R1 already running and reachable.

## TextFSM

[TextFSM](https://github.com/google/textfsm), explored in a module of the basic course, is a module that reads a text and transforms it into a list of dictionaries. For example, the following text:

```text
R1#show ip int brie
Interface                  IP-Address      OK? Method Status                Protocol
Ethernet0/0                169.254.1.118   YES DHCP   up                    up
Ethernet0/1                unassigned      YES unset  administratively down down
Ethernet0/2                unassigned      YES unset  administratively down down
Ethernet0/3                unassigned      YES unset  administratively down down
```

Can be transformed into:

```json
[
    {
        "interface": "Ethernet0/0",
        "ip_address": "169.254.1.118",
        "proto": "up",
        "status": "up"
    },
    {
        "interface": "Ethernet0/1",
        "ip_address": "unassigned",
        "proto": "down",
        "status": "administratively down"
    }
]
```

Writing a TextFSM template may not look simple at first glance, but once you understand it, it is not that complex. In this course, we limit ourselves to using existing templates, and in particular we refer to the [NTC Templates](https://github.com/networktocode/ntc-templates) repository. Let's retrieve the [template](https://github.com/networktocode/ntc-templates/blob/master/ntc_templates/templates/cisco_ios_show_ip_interface_brief.textfsm) for the `show ip interface brief` command on Cisco IOS devices.

Now we write a short [[Ansible Playbooks and variables|playbook]] that connects to the device, issues the `show ip interface brief` command and saves the output in a variable. The task is as follows:

```yaml
- cisco.ios.ios_command:
    commands: show ip interface brief
  register: output
```

We now transform the output with the [TextFSM](https://github.com/google/textfsm) parser and its corresponding template:

```yaml
- ansible.utils.cli_parse:
    text: "{{ output['stdout'][0] }}"
    parser:
      name: ansible.utils.textfsm
      template_path: templates/cisco_ios_show_ip_interface_brief.textfsm
    set_fact: output_parsed
```

If we print the content of `output_parsed` with `debug`, we see that it is structured in JSON format.

## NTC Templates

NTC Templates, as mentioned, is a public repository maintained by [network.toCode()](https://networktocode.com/), containing TextFSM templates for various vendors and devices. Anyone can [contribute](Contributing%20to%20NTC%20Templates%20with%20Git%20and%20GitHub.md) to the repository by publishing their own templates.

NTC Templates is also available as a Python module, which is simpler than the previous method but offers less flexibility. The Python module is not released frequently, so if you need updated templates, the previous method is preferable.

Once the `ntc_templates` module is installed, we can use the repository in our playbook:

```yaml
- ansible.utils.cli_parse:
    command: "show ip interface brief"
    parser:
      name: ansible.netcommon.ntc_templates
      os: "cisco_ios"
    set_fact: output_parsed
```

This parser requires the device type (`cisco_ios`) and the command. If we print the content of `output_parsed` with `debug`, we see that it is structured in JSON format and differs slightly from the previous one, although the template is the same.

In the task above, the module executes the command directly on the device, retrieves the output and applies the parser. For performance reasons, which we will see later, it is possible to use the output stored in a variable. In this case, the syntax is slightly different:

```yaml
- ansible.utils.cli_parse:
    text: "{{ output['stdout'][0] }}"
    parser:
      name: ansible.netcommon.ntc_templates
      os: "cisco_ios"
      command: "show ip interface brief"
    set_fact: output_parsed
```

## TTP

TTP, or Template Text Parser, is more elaborate than TextFSM but, on the flip side, the [ttp_templates](https://github.com/dmulyalin/ttp_templates) repository has [very few templates](https://github.com/dmulyalin/ttp_templates/tree/master/ttp_templates/platform), and the effort to create new ones is often not worth it. TTP, however, can be used to parse entire configurations, and this is its main strength compared to TextFSM. Like TextFSM, TTP is also covered in the basic module.

Once the `ttp_templates` module is installed, let's download, for example, the [template](https://github.com/dmulyalin/ttp_templates/blob/master/ttp_templates/platform/cisco_ios_show_ip_arp.txt) for the `show ip arp` command on Cisco IOS devices into the `templates` directory, with a `.ttp` extension.

We can now use the repository in our playbook:

```yaml
- ansible.utils.cli_parse:
    command: show ip arp
    parser:
      name: ansible.utils.ttp
      os: "cisco_ios"
    set_fact: output_parsed
```

Here too, the output can be passed as a variable:

```yaml
- ansible.utils.cli_parse:
    text: "{{ output['stdout'][0] }}"
    parser:
      name: ansible.utils.ttp
      os: "cisco_ios"
      command: "show ip arp"
    set_fact: output_parsed
```

## pyATS / Genie

Alongside TextFSM and TTP, there is the [pyATS / Genie](https://developer.cisco.com/docs/pyats/) suite developed by Cisco. It is an open solution, but clearly designed for Cisco devices and therefore generally limited to them.

The [list of parsers](https://pubhub.devnetcloud.com/media/genie-feature-browser/docs/#/parsers) confirms that there is a parser for `show ip interface brief`.

Once the `pyats` and `genie` modules are installed, we can write a task that uses this parser in our playbook:

```yaml
- ansible.utils.cli_parse:
    command: "show ip interface brief"
    parser:
      name: ansible.netcommon.pyats
    set_fact: output_parsed
```

Note a few things:

* Unlike the previous parsers, we did not have to specify the type of device. The parser reads this information automatically from the `ansible_network_os` variable.
* The output is not a list but a dictionary, with the interface name as the key. This can be very useful to select the desired line more easily.

Here too, the output can be passed as a variable:

```yaml
- ansible.utils.cli_parse:
    text: "{{ output['stdout'][0] }}"
    parser:
      name: ansible.netcommon.pyats
      command: show ip interface brief
    set_fact: output_parsed
```

## Custom Filters

Ansible provides several filters that alter the content of a variable. For example:

* `var | int` converts the variable to an integer;
* `var | to_nice_json` formats JSON in a human-readable way;
* `var | upper` converts a string to uppercase.

If the parsers we have seen are insufficient, or if no filter meets our needs, we can easily add a custom filter by writing Python code.

We can divide filters into two groups: those that do not accept additional parameters, meaning that their only input is the variable they are applied to, and those that do. Let's see two examples.

In the first example (without additional parameters), the filter:

* takes as input the output of `show ip interface brief`, processed with the NTC Templates parser;
* removes inactive interfaces.

The first consideration concerns typing. Python is dynamically typed, and Ansible is even murkier. Later, we will look at the `type_debug` filter, which can help us when in doubt.

Custom filters must be saved in the same file, `filter_plugins/filters.py`. Filters are, in fact, functions of the `FilterModule` class. The reserved function **filters** maps the names used to call the filters to the functions that define them.

Let's see an example:

```python
class FilterModule(object):
    """Ansible filter."""

    def drop_down_interfaces(self, interfaces: list) -> list:
        """Return a list of active interfaces."""
        result = []
        for interface in interfaces:
            if interface["status"] == "up":
                result.append(interface)
        return result

    def filters(self):
        """Invoked function. Keys define how filters are called."""
        return {
            "drop_down_interfaces": self.drop_down_interfaces,
        }
```

In the example class:

* The `drop_down_interfaces` function takes a list of interfaces as input and returns a list of interfaces. The output includes only the interfaces in the `up` state.
* The `filters` function associates the name `drop_down_interfaces` with the corresponding function.

In a playbook, the filter can be used as follows:

```yaml
- ansible.builtin.debug:
    msg: "{{ output_parsed | drop_down_interfaces }}"
```

Now let's add a second filter to our class, which transforms a list of dictionaries into a dictionary of dictionaries. The key to use is read as an additional parameter. Let's add this function to the class we saw earlier:

```python
class FilterModule(object):
    """Ansible filter."""

    def get_to_dict(self, items: list, key: str = None) -> dict:
        """Convert a list of dict into a dict of dict."""
        return {item[key]: item for item in items}

    def filters(self):
        """Invoked function. Keys define how filters are called."""
        return {
            "to_dict": self.get_to_dict,
        }
```

The `to_dict` function transforms the list of dictionaries `items` into a dictionary of dictionaries, using the value of the specified `key` as the key.

We can use this second filter as follows:

```yaml
- ansible.builtin.debug:
    msg: "{{ output_parsed | to_dict(key='interface') }}"
```

All the scripts and playbooks described in this post are available in the [GitHub repository](https://github.com/dainok/courses/tree/master/Ansible/13.%20Parsers%20and%20Filters).
