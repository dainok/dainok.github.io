---
cover: ansible
date: 2025-03-16
tags:
- ansible
- intermediate
---
Ansible provides Galaxy, which manages packages containing roles and collections. Roles and collections can be referenced directly by Ansible [[Ansible Playbooks and variables|playbooks]]. Galaxy allows you to use packages published on the [public portal](https://galaxy.ansible.com/), but it also lets you manage private repositories.

In this post, we focus on the [official Galaxy portal](https://galaxy.ansible.com/). The portal is fully integrated with GitHub, where the repositories available as collections in Galaxy are stored.

The structure of a collection is quite rigid, so to create one it is best to rely on `ansible-creator`, which we can install with `pip`:

```bash
pip install ansible-creator
```

We then create a collection using the format `github_nickname.collection_name`. In my case, I used [dainok.courses](https://github.com/dainok/ansible-collection-courses/):

```bash
ansible-creator init collection dainok.courses
```

This command creates a complete but rather complex structure:

![[ansible-new-collection.png]]

Let's examine the essential parts.

## galaxy.yml

The `galaxy.yml` file contains the metadata of the collection and the instructions to build it. For further details, refer to the [official documentation](https://docs.ansible.com/ansible/latest/dev_guide/collections_galaxy_meta.html) and the [example repository](https://github.com/dainok/ansible-collection-courses/).

```yaml
namespace: "dainok"
name: "common"
version: 1.0.0
readme: README.md
authors:
  - your name <example@domain.com>
description: your collection description
license_file: LICENSE
tags: ["linux", "tools"]
dependencies:
  "ansible.utils": "*"
repository: http://example.com/repository
documentation: http://docs.example.com
homepage: http://example.com
issues: http://example.com/issue/tracker
build_ignore:
  - .gitignore
  - changelogs/.plugin-cache.yaml
```

## Extensions, Plugins, Roles, and Playbooks

Extensions, plugins, roles and playbooks must be stored in their respective directories. Each role must be described by a `README.md` file and the `meta/main.yml` file.

```yaml
galaxy_info:
  author: foo
  description: Dainok.Common Run Role
  company: Dainok
  license: GPL-2.0-or-later
  min_ansible_version: "2.14"
  galaxy_tags:
    []
dependencies:
  []
```

Note that some information is duplicated: for example, the description is present in both the meta file and the README, and dependencies exist at both the role level and the collection level.

[[Ansible parsers and filters|Filters]] are stored in the plugins directory and are described in Python files:

```python
DOCUMENTATION = """
    name: hello_world
    author: Your Name
    version_added: "1.0.0"
    short_description: A custom filter plugin for Ansible.
    description:
      - This is a demo filter plugin designed to return Hello message.
    options:
      name:
        description: Value specified here is appended to the Hello message.
        type: str
"""

EXAMPLES = """
# hello_world filter example

- name: Display a hello message
  ansible.builtin.debug:
    msg: "{{ 'ansible-creator' | hello_world }}"
"""
```

## Ansible Galaxy Token

Before proceeding, we need to register on the [Galaxy portal](https://galaxy.ansible.com/) and obtain a token. Since Galaxy is integrated with GitHub, we need a valid GitHub account and we must authenticate on Galaxy via GitHub:

![[ansible-galaxy-login.png]]

A token can be obtained by navigating to `Collections` → `API token`.

## Building and Publishing

Once the repository is ready, we can create the package and publish it as a collection:

```bash
ansible-galaxy collection build
ansible-galaxy collection publish --token <token> dainok-courses-0.0.17.tar.gz
```

The courses collection is available under the `dainok` namespace. We can manage our collections on the Galaxy portal by navigating to `Collections` → `Namespaces` → `My namespaces`.

We can also view the [logs related to the publication of the collection](https://galaxy.ansible.com/ui/repo/published/dainok/courses/import-log/):

![[ansible-collection-status.png]]

## Using a Collection

The simplest way to install a collection is via the command line:

```bash
ansible-galaxy collection install --force dainok.courses
```

It is more practical, however, as we do with Python, to define a `collections/requirements.yml` file that describes the dependencies:

```yaml
collections:
  - name: cisco.ios
    version: 8.0.0
    source: https://galaxy.ansible.com
  - name: paloaltonetworks.panos
    version: 2.20.0
    source: https://galaxy.ansible.com
  - name: networktocode.nautobot
    version: 5.2.1
    source: https://galaxy.ansible.com
  - name: dainok.courses
    version: 0.0.17
    source: https://galaxy.ansible.com
```

We can install the collections defined as dependencies:

```bash
ansible-galaxy collection install -r collections/requirements.yml
```

Finally, we can list the installed collections:

```bash
ansible-galaxy collection list
```

The sample collection is available in the [GitHub repository](https://github.com/dainok/ansible-collection-courses/).
