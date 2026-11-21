---
cover: ansible
date: 2022-07-15
tags:
- ansible
- cis
- compliance
- intermediate
---
Security assessments are part of my daily job, and automation is part of my mindset. The CIS Controls are a set of standard controls that should be checked on... anything. CIS also provides benchmarks (a sort of step-by-step guide) for many environments. Moreover, Lockdown Enterprise delivers a set of Ansible [[Ansible Playbooks and variables|playbooks]] ready to be used.

In this post, we see how to check the CIS controls on Ubuntu 20.04 servers and remediate them.

## Audit Phase

Ansible playbooks are good at remediation, but their reporting is often poor. Lockdown Enterprise uses `goss` to provide good audit reports.

Let's install `goss` and clone the [[Git fundamentals for developers and IT professionals|Git]] repository on an Ubuntu Linux 20.04 system:

```bash
sudo curl -fsSL https://goss.rocks/install | sh
git clone https://github.com/ansible-lockdown/UBUNTU20-CIS-Audit /var/tmp/UBUNTU20-CIS-Audit
cd /var/tmp/UBUNTU20-CIS-Audit
```

We can audit the entire system using the provided script:

```bash
$ sudo ./run_audit.sh

## Pre-Checks Start

OK Audit binary /usr/local/bin/goss is available
OK /var/tmp/UBUNTU20-CIS-Audit/goss.yml is available

## Pre-checks Successful

#############
Audit Started
#############


    "summary": {
        "failed-count": 154,
        "summary-line": "Count: 372, Failed: 154, Duration: 91.345s",
        "test-count": 372,
        "total-duration": 91344507858
    }
}

Completed file can be found at /var/tmp/audit_linux-station_1657459563.json
###############
Audit Completed
###############
```

We can also run `goss` manually on a subset of controls:

```bash
sudo goss --vars /var/tmp/UBUNTU20-CIS-Audit/vars/CIS.yml -g /var/tmp/UBUNTU20-CIS-Audit/section_1/cis_1.1/cis_1.1.1.1_7.yml validate
sudo goss --vars /var/tmp/UBUNTU20-CIS-Audit/vars/CIS.yml -g /var/tmp/UBUNTU20-CIS-Audit/section_1/cis_1.1/cis_1.1.1.1_7.yml validate -f documentation
```

By default, the server profile is used. To audit with the workstation profile, we use:

```bash
sudo ./run_audit.sh -w
```

## Remediation Phase

Once the audit is complete, we can analyze the non-compliant items, evaluate the risk and decide whether to remediate them.

From our Ansible server, we clone the Ansible repository:

```bash
git clone https://github.com/ansible-lockdown/UBUNTU20-CIS
cd UBUNTU20-CIS
```

The following Ansible commands may vary depending on your Ansible infrastructure. We can remediate all the controls with:

```bash
ansible-playbook -i inventory.ini -u andrea -b -k -K site.yml
```

Remediating all the controls makes sense just after the OS installation. For production environments, we probably want to remediate single controls with:

```bash
ansible-playbook -i inventory.ini -u andrea -b -k -K --tags rule_1.1.1.1 site.yml
```

Always use the `-C` flag (check mode) on the first run, to see what would change before changing it.

## References

* [CIS Critical Security Controls](https://www.cisecurity.org/controls "CIS Critical Security Controls")
* [CIS Ubuntu Linux Benchmarks](https://www.cisecurity.org/benchmark/ubuntu_linux "CIS Ubuntu Linux Benchmarks")
* [Lockdown Enterprise](https://www.lockdownenterprise.com/ "Lockdown Enterprise")
* [Ansible Lockdown](https://github.com/ansible-lockdown/ "Ansible Lockdown")
* [CIS Ansible playbook for Ubuntu by Lockdown Enterprise](https://github.com/ansible-lockdown/UBUNTU20-CIS "CIS Ansible playbook for Ubuntu by Lockdown Enterprise")
* [Audit script for Ubuntu by Lockdown Enterprise](https://github.com/ansible-lockdown/UBUNTU20-CIS-Audit "Audit script for Ubuntu by Lockdown Enterprise")
* [Goss - Quick and Easy server validation](https://github.com/aelsabbahy/goss "Goss - Quick and Easy server validation")
