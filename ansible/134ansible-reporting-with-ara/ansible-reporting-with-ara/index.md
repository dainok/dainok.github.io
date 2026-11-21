---
cover: ara
date: 2025-03-09
tags:
- ansible
- intermediate
---
[ARA Records Ansible](https://ara.recordsansible.org/) provides a simple dashboard to visualize the execution of Ansible [[Ansible Playbooks and variables|playbooks]]. It is not an orchestration tool but a reporting tool that makes visualization and troubleshooting easier.

ARA works with any Ansible playbook, regardless of how it is executed, so it can be integrated with other tools. However, the information stored by ARA can be enriched by integrating specific parameters into the playbooks.

To better understand ARA, we can explore the [demo](https://demo.recordsansible.org/).

When ARA is configured as a callback, the results of the playbook executions are stored in a database:

![[ara-callback.png]]

## Installing and Configuring ARA

ARA is installed as a Python module:

```bash
pip install ara[server]
```

We then need to configure ARA as a callback. To do this, we run the following command:

```bash
python -m ara.setup.ansible
```

We add the output of the command above to the `ansible.cfg` file:

```ini
[defaults]
inventory = inventory.ini
stdout_callback = ansible.builtin.default
callback_plugins = ../../venv/lib/python3.13/site-packages/ara/plugins/callback
action_plugins = ../../venv/lib/python3.13/site-packages/ara/plugins/action
lookup_plugins = ../../venv/lib/python3.13/site-packages/ara/plugins/lookup
strategy = free
forks = 8
```

ARA can be customized with [specific parameters](https://ara.readthedocs.io/en/stable-0.x/configuration.html#ara) configured in the `ansible.cfg` file. Initially, the default parameters are fine.

We start the ARA server with the following command:

```bash
ara-manage runserver
```

## Executing a Playbook

ARA does not require any change to the way Ansible playbooks are executed. For example, we can run a playbook we created earlier to configure a small sample fabric.

On the first execution, ARA creates default settings and an SQLite database:

```text
[ara] No setting found for SECRET_KEY. Generating a random key...
[ara] Creating data & configuration directory: /Users/dainese/.ara/server
[ara] Writing default settings to /Users/dainese/.ara/server/settings.yaml
Operations to perform:
  Apply all migrations: admin, api, auth, contenttypes, db, sessions
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying auth.0001_initial... OK
  Applying admin.0001_initial... OK
  Applying admin.0002_logentry_remove_auto_add... OK
  Applying admin.0003_logentry_add_action_flag_choices... OK
  Applying api.0001_initial... OK
  Applying api.0002_remove_host_alias... OK
  Applying api.0003_add_missing_result_properties... OK
  Applying api.0004_duration_in_database... OK
```

## Visualization

After the first execution, we can connect to the ARA server and verify that the playbook execution has been recorded correctly:

![[ara-dashboard.png]]

In the hosts tab, we can analyze the duration of the playbook on each host:

![[ara-playbook-hosts.png]]

We can view the details of the tasks executed on a specific host:

![[ara-playbook-tasks.png]]

Finally, we can review the execution details of each task:

![[ara-task-details.png]]

## Recording Additional Values

ARA can be configured to record additional parameters. This requires adding specific tasks:

```yaml
- name: "ARA: INTERFACE CONFIG"
  delegate_to: localhost
  throttle: 1
  ara_record:
    key: interface_config
    value: "{{ interface_config_list }}"
```

There are some important caveats:

* Adding `ara_record` tasks breaks compatibility with normal execution.
* Running ARA with `ara_record` tasks often results in errors:

```text
An exception occurred during task execution. To see the full traceback, use -vvv. The error was: requests.exceptions.ConnectionError: HTTPConnectionPool(host='localhost', port=60417): Read timed out.
An exception occurred during task execution. To see the full traceback, use -vvv. The error was: requests.exceptions.ConnectionError: ('Connection aborted.', BadStatusLine('Date: Sun, 09 Mar 2025 10:18:10 GMT\r\n'))
```

These errors can be mitigated with the `delegate_to` and `throttle` parameters; however, my tests showed that ARA becomes unusable.

When it works, the output is similar to the following:

![[ara-record.png]]

The playbook is available in the [GitHub repository](https://github.com/dainok/courses/tree/master/Ansible/A4.%20ARA).
