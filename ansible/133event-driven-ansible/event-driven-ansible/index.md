---
cover: ansible
date: 2025-04-19
tags:
- advanced
- ansible
---
Event-Driven Ansible (EDA) triggers the execution of an Ansible [[Ansible Playbooks and variables|playbook]] when a specific event occurs.

![[ansible-eda.png]]

This capability greatly expands the potential of Ansible, turning it into a tool that automates processes based on events: troubleshooting, threat intelligence, IoCs, data [[Ansible Galaxy|collection]] and general analysis. These activities can be partially or fully automated.

Many security vendors have released specific modules. For instance, [Palo Alto Networks](https://www.linkedin.com/company/palo-alto-networks/) has developed a plugin that analyzes firewall logs and triggers [initial automated diagnostics](https://github.com/PaloAltoNetworks/pan-os-ansible/tree/develop/extensions/eda/plugins/event_source) in case of SSL decryption errors.

## Rulebook

An Ansible [Rulebook](https://ansible.readthedocs.io/projects/rulebook/en/stable/rulebooks.html) is a set of rules that EDA uses to execute specific actions. A rulebook can:

* Monitor one or more [sources](https://ansible.readthedocs.io/projects/rulebook/en/stable/sources.html).
* Contain one or more [rules](https://ansible.readthedocs.io/projects/rulebook/en/stable/rules.html).
* Trigger one or more [actions](https://ansible.readthedocs.io/projects/rulebook/en/stable/actions.html).

The first part of a rulebook defines one or more **event sources** to monitor. EDA uses Event Source Plugins to monitor these sources.

## Event Source Plugins

Event Source Plugins fall into three types:

* **Event Bus Plugins**: listen to a stream of events from a source, where the connection is established by the plugin itself (e.g., the Kafka and AWS SQS Queue plugins).
* **Scraper Plugins**: connect to a source and scrape data from it, usually at predefined intervals (e.g., the URL Check and Watchdog plugins).
* **[[Enhancing Ansible output|Callback Plugins]]**: provide a callback endpoint that the event source calls when data is available (e.g., the Webhook and Alertmanager plugins). Callback plugins are the least reliable, because they depend on the event source calling the endpoint and are highly susceptible to data loss.

When an Event Source Plugin detects an event, EDA uses **rules** to decide which action to take. If an event matches a rule, EDA executes the specified actions. Actions can include:

* `run_playbook`: executes an existing Ansible playbook.
* `run_job_template`: runs a job template through the Ansible Automation Platform.
* `run_module`: runs a specific Ansible module, without running an entire playbook.
* `post_event`: posts an event to a running ruleset, so that the results of actions feed back into EDA.
* `set_fact`: stores specific event data to be reused within EDA.
* `debug`: outputs debug information, similar to the debug module in Ansible playbooks.

## Installing Event-Driven Ansible

First, we need a [JRE](https://jdk.java.net/21/). We use OpenJDK 21.0.1:

```bash
tar xzvf openjdk-21.0.1_linux-x64_bin.tar.gz
export PATH=~/jdk-21.0.1/bin:$PATH
which java
```

Then we install EDA:

```bash
pip install ansible ansible-rulebook ansible-runner
ansible-galaxy collection install ansible.eda
```

## Example: Monitoring Router Configuration Changes

In this example, we configure a Cisco router to send syslog messages and set up EDA to read those logs and trigger a playbook when the router configuration is modified. The playbook exports the router configuration to a local directory.

## Action Playbook

First, we create a simple playbook to handle the backup action:

```yaml
- hosts: all
  gather_facts: false
  tasks:
    - name: "BACKUP RUNNING CONFIG"
      cisco.ios.ios_config:
        backup: true
        backup_options:
          filename: "/tmp/{{ ansible_host }}-backup.cfg"
          dir_path: backup
```

The playbook uses the `cisco.ios.ios_config` module to back up the configuration to a local directory, using the `ansible_host` variable as the base for the file name.

## Rulebook Example

Now we define a rulebook that triggers the playbook when a relevant syslog message is received:

```yaml
- name: "LISTEN FOR EVENTS VIA SYSLOG"
  hosts: all
  sources:
    - dainok.courses.syslog:
        host: 0.0.0.0
        port: 1514
  rules:
    - name: "RUN PLAYBOOK WHEN ROUTER IS CONFIGURED"
      condition: event.message is match("Configured from.*", ignorecase=true)
      actions:
        - run_playbook:
            name: playbook-backup.yml
        - print_event:
            pretty: true
```

The rulebook monitors all hosts and uses the `dainok.courses.syslog` plugin as the event source. It contains a single rule: if `event.message` contains `Configured from`, it runs the backup playbook and logs the event.

## Syslog Callback Plugin

The most complex part is handled by the `dainok.courses.syslog` plugin. It receives the syslog messages from the devices, formats them and makes them available to the rulebook.

```python
async def main(queue: asyncio.Queue, args: dict[str, Any]) -> None:
    """Receive events via syslog."""
    # Load or set default variables
    host = args.get("host") or "0.0.0.0"
    port = args.get("port") or 1514

    # Listening
    transport, protocol = await asyncio.get_running_loop().create_datagram_endpoint(
        lambda: SyslogUDPProtocol(queue), local_addr=((host, port))
    )

    # Listening
    logging.info(f"Starting daemon on {host}:{port}")
    try:
        while True:
            await asyncio.sleep(300)
    finally:
        transport.close()
```

The main function starts the syslog server on the specified host and port. The `SyslogUDPProtocol` class receives the messages, formats them and returns them to the rulebook:

```python
output = {
    "prival": prival,
    "version": version,
    "host": host,
    "seq": seq,
    "timestamp": timestamp,
    "facility": facility,
    "severity": severity,
    "mnemonic": mnemonic,
    "message": message,
    "raw": raw,
}
if host:
    # Limit the inventory for the action
    output["meta"] = {"hosts": host}

# Send data to Ansible
logging.info(f"Sending to EDA {output}")
queue = self.edaQueue
await queue.put(output)
```

The `hosts` key must be present to restrict the execution of the playbook to the host that generated the event. The router sends this information via syslog.

## Testing

We can now activate our rulebook:

```bash
ansible-rulebook -r playbook-rulebook.yml -i inventory.ini -v
```

The output tells us that the rulebook has started and that the syslog server is ready to receive events.

```text
2025-03-09 17:28:38,987 - ansible_rulebook.engine - INFO - Waiting for all ruleset tasks to end
2025-03-09 17:28:38,987 - ansible_rulebook.rule_set_runner - INFO - Waiting for actions on events from LISTEN FOR EVENTS VIA SYSLOG
2025-03-09 17:28:38,987 - ansible_rulebook.rule_set_runner - INFO - Waiting for events, ruleset: LISTEN FOR EVENTS VIA SYSLOG
2025-03-09 17:28:38 987 [drools-async-evaluator-thread] INFO org.drools.ansible.rulebook.integration.api.io.RuleExecutorChannel - Async channel connected
```

To make sure that the syslog parser formats the events correctly, we configure the devices with the following commands:

```text
service timestamps debug datetime msec localtime year
service timestamps log datetime msec localtime year
service sequence-numbers
logging host 169.254.1.1 transport udp port 1514
logging origin-id hostname
```

If we configure a router, as soon as we return to exec mode the router sends a message to the syslog server, which processes it:

```text
2025-03-09 17:32:18,965 - root - INFO - Received Syslog message: <189>85: SW1: 000097: Mar 9 2025 17:32:17.933: %SYS-5-CONFIG_I: Configured from console by admin on vty0 (169.254.1.1)
2025-03-09 17:32:18,967 - root - INFO - Sending to EDA {'prival': 189, 'version': 85, 'host': 'sw1.example.com', 'seq': 97, 'timestamp': 'Mar 9 2025 17:32:17.933', 'facility': 'SYS', 'severity': '5', 'mnemonic': 'CONFIG_I', 'message': 'Configured from console by admin on vty0 (169.254.1.1)', 'raw': '<189>85: SW1: 000097: Mar 9 2025 17:32:17.933: %SYS-5-CONFIG_I: Configured from console by admin on vty0 (169.254.1.1)', 'meta': {'hosts': 'sw1.example.com'}}
2025-03-09 17:32:19 006 [main] INFO org.drools.ansible.rulebook.integration.api.rulesengine.RegisterOnlyAgendaFilter - Activation of effective rule "RUN PLAYBOOK WHEN ROUTER IS CONFIGURED" with facts: {m={prival=189, version=85, host=sw1.example.com, seq=97, timestamp=Mar 9 2025 17:32:17.933, facility=SYS, severity=5, mnemonic=CONFIG_I, message=Configured from console by admin on vty0 (169.254.1.1), raw=<189>85: SW1: 000097: Mar 9 2025 17:32:17.933: %SYS-5-CONFIG_I: Configured from console by admin on vty0 (169.254.1.1), meta={hosts=sw1.example.com, source={name=dainok.courses.syslog, type=dainok.courses.syslog}, received_at=2025-03-09T16:32:18.967429Z, uuid=978910b9-6589-47e5-bdf1-b6784eb39b39}}}
```

The playbook is then executed only on the host that generated the event:

```text
2025-03-09 17:32:19,015 - ansible_rulebook.rule_set_runner - INFO - call_action run_playbook
2025-03-09 17:32:19,015 - ansible_rulebook.rule_set_runner - INFO - substitute_variables [{'name': 'playbook-backup.yml'}] [{'event': {'prival': 189, 'version': 85, 'host': 'sw1.example.com', 'seq': 97, 'timestamp': 'Mar 9 2025 17:32:17.933', 'facility': 'SYS', 'severity': '5', 'mnemonic': 'CONFIG_I', 'message': 'Configured from console by admin on vty0 (169.254.1.1)', 'raw': '<189>85: SW1: 000097: Mar 9 2025 17:32:17.933: %SYS-5-CONFIG_I: Configured from console by admin on vty0 (169.254.1.1)', 'meta': {'hosts': 'sw1.example.com', 'source': {'name': 'dainok.courses.syslog', 'type': 'dainok.courses.syslog'}, 'received_at': '2025-03-09T16:32:18.967429Z', 'uuid': '978910b9-6589-47e5-bdf1-b6784eb39b39'}}}]
2025-03-09 17:32:19,015 - ansible_rulebook.rule_set_runner - INFO - action args: {'name': 'playbook-backup.yml'}
```

If needed, EDA passes the event data to the playbook through the `ansible_eda` variable.

```text
TASK [debug] *******************************************************************
ok: [sw1.example.com] => {
    "msg": {
        "event": {
            "facility": "SYS",
            "host": "sw1.example.com",
            "message": "Configured from console by admin on vty0 (169.254.1.1)",
            "meta": {
                "hosts": "sw1.example.com",
                "received_at": "2025-03-09T16:35:14.521860Z",
                "source": {
                    "name": "dainok.courses.syslog",
                    "type": "dainok.courses.syslog"
                },
                "uuid": "4a1a9a8c-e386-4f48-b666-0c80be4cc558"
            },
            "mnemonic": "CONFIG_I",
            "prival": 189,
            "raw": "<189>86: SW1: 000098: Mar  9 2025 17:35:13.514: %SYS-5-CONFIG_I: Configured from console by admin on vty0 (169.254.1.1)",
            "seq": 98,
            "severity": "5",
            "timestamp": "Mar  9 2025 17:35:13.514",
            "version": 86
        },
        "rule": "RUN PLAYBOOK WHEN ROUTER IS CONFIGURED",
        "ruleset": "LISTEN FOR EVENTS VIA SYSLOG"
    }
}
```

Using EDA:

* Requires authentication to be automatic (non-interactive).
* Requires the use of collections. In theory, local plugins can be used, but I could not find the correct syntax in practice.

The collection that contains the plugin is available in the [Ansible GitHub repository](https://github.com/dainok/ansible-collection-courses/tree/master/plugins/event_source) and can be installed via Galaxy. The playbook is available in the [GitHub repository](https://github.com/dainok/courses/tree/master/Ansible/A4.%20ARA) of the course.
