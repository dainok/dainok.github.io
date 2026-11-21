---
cover: ansible
date: 2024-11-13
tags:
- advanced
- ansible
- troubleshooting
---
Ansible is an ideal choice in terms of accessibility, but it is certainly not the best choice for those seeking performance.

Let's look at a few configurations that improve performance in a simple way.

## Parallelism (fork)

The first setting is the number of **forks**, the parallel processes that interact with the devices. In general, it should be proportional to the number of processors, but note that much of the [[Ansible Playbooks and variables|playbook]] time is spent waiting for the device to execute a command. The optimal number of **forks** could therefore be double the number of available processors, or even more. Obviously, **forks** improve performance only if the playbook runs in parallel on multiple nodes; otherwise they have no effect.

```ini
[defaults]
forks = 8
```

## Dependency (strategy)

The second setting is the execution strategy (`strategy`). There are two types of strategies: `linear` and `free`.

![[ansible-strategy.png]]

With the **linear** strategy, a task starts only when the previous one has completed on all nodes: in the output, the results of a task appear grouped together. With the **free** strategy, each node runs its own tasks without waiting for the others. The **free** strategy can, and should, be used if each task depends only on the previous tasks of the same node. In other words, **free** can be used if the execution of a **play** on R2 never depends in any way on the execution of the same **play** on R1. Again, the strategy improves performance only if the playbook runs in parallel on multiple nodes; otherwise it has no effect.

```ini
[defaults]
strategy = free
```

## Profiling

The next step to improve the performance of a playbook is to profile it, that is, to understand where time is spent: globally, by role and by task.

Three `callbacks` add time-related information to the standard output.

```ini
[defaults]
stdout_callback = ansible.builtin.default
callbacks_enabled = ansible.posix.profile_roles,ansible.posix.profile_tasks,ansible.posix.timer
```

These three plugins are essential to understand which tasks take more time and, following the [Pareto Principle](https://en.wikipedia.org/wiki/Pareto_principle), where to focus.

## Reduce "show running-config"

In screen-scraping mode, the `show running-config` command is used a lot. When specific modules cannot be optimized, `ios_config` can read the configuration from a variable populated earlier:

```yaml
- cisco.ios.ios_command:
    command: show running-config
  register: output
- cisco.ios.ios_config:
    running_config: output.stdout_lines[0]
```

## Disable "gather_facts"

As we have seen, Ansible can read some information from the nodes (facts) before running tasks. If this information is not needed, disabling `gather_facts` can significantly improve performance.

```yaml
#!/usr/bin/env ansible-playbook
- hosts: all
  gather_facts: false
```

## Save the Configuration Only Once

We have already chosen to save the configuration only once, at the end of the **play**, with `post_tasks`. Saving the configuration can take a long time, depending on the platform, so doing it only once significantly reduces the execution time.

We therefore confirm the choice we have already made:

```yaml
post_tasks:
  - cisco.ios.ios_config:
      save_when: modified
```

## Eliminate Loops

Loops significantly impact the performance of Ansible. Where possible, avoid them or convert them. Let's see an example.

Suppose we have a list of NTP peers:

```yaml
ntp_servers:
  - 194.239.208.213
  - 130.60.204.10
```

We can create a list to use with the `ios_ntp_global` module:

```yaml
- ansible.builtin.set_fact:
    ntp_peers_config_list: "{{ ntp_peers_config_list|default([]) + [{'peer': item}] }}"
  with_items: "{{ ntp_servers }}"
```

This approach, however, is rather slow. We can move the loop into a Jinja template:

```yaml
- ansible.builtin.set_fact:
    ntp_peers_config_list: >-
      [
        {% for host in ntp_servers %}
          {"peer": "{{ host }}"},
        {% endfor %}
      ]
```

Since Ansible is not strongly typed, the result is the same, but much faster.
