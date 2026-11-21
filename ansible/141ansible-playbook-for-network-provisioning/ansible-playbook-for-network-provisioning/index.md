---
cover: servicenow
date: 2026-05-03
tags:
- advanced
- ansible
- servicenow
---
On the infrastructure side, we can configure the network devices in three ways: a custom script, Ansible or [[Importing NaC objects from Cisco ACI into Terraform|Terraform]].

The tasks here are atomic and there is no infrastructure state to maintain, so Ansible is the most appropriate tool for this type of operation.

The [[Ansible Playbooks and variables|playbook]] is intentionally minimal: it configures the VLAN and brings up an SVI only if a gateway IP address has been specified.

```yaml
- name: ServiceNow Network Provisioning
  tasks:
    - name: VLAN Provisioning
      cisco.ios.ios_vlans:
        config:
          - name: "{{ network_name }}"
            vlan_id: "{{ network_vlan }}"
            state: active
            shutdown: disabled
        state: merged
    - name: SVI Provisioning
      cisco.ios.ios_l3_interfaces:
        config:
          - name: "Vlan{{ network_vlan }}"
            ipv4:
              - address: "{{ network_ip_address }}"
        state: merged
      when: network_ip_address is defined and network_ip_address != ""
    - name: Interface Provisioning
      cisco.ios.ios_interfaces:
        config:
          - name: "Vlan{{ network_vlan }}"
            description: "{{ network_vlan }}"
            enabled: true
        state: merged
      when: network_ip_address is defined and network_ip_address != ""
  post_tasks:
    - name: SAVING CONFIG
      tags: always
      cisco.ios.ios_config:
        save_when: modified
```

We can test the playbook manually to validate its behavior:

```bash
./playbook-snow_network.yml -e network_name="Network-97" -e network_vlan="97" -e network_ip_address="10.0.97.1/24"
```

```text
PLAY [ServiceNow Network Provisioning] *****************************************

TASK [VLAN Provisioning] *******************************************************
[WARNING]: Collection ansible.netcommon does not support Ansible version 2.15.13
[WARNING]: Collection ansible.utils does not support Ansible version 2.15.13
changed: [sw1.example.com]

TASK [SVI Provisioning] ********************************************************
[WARNING]: Collection ansible.netcommon does not support Ansible version 2.15.13
[WARNING]: Collection ansible.utils does not support Ansible version 2.15.13
changed: [sw1.example.com]

TASK [Interface Provisioning] **************************************************
[WARNING]: Collection ansible.netcommon does not support Ansible version 2.15.13
[WARNING]: Collection ansible.utils does not support Ansible version 2.15.13
changed: [sw1.example.com]

TASK [SAVING CONFIG] ***********************************************************
[WARNING]: Collection ansible.netcommon does not support Ansible version 2.15.13
[WARNING]: Collection ansible.utils does not support Ansible version 2.15.13
changed: [sw1.example.com]

PLAY RECAP *********************************************************************
sw1.example.com            : ok=4    changed=4    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
```

The full playbook is available in the [GitHub repository](https://github.com/dainok/courses/tree/master/Various/ServiceNow).
