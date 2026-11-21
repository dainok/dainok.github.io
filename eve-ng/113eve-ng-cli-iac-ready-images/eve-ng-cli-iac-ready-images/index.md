---
cover: eve-ng
date: 2026-04-12
tags:
- advanced
- eve-ng
- iac
---
In the first post, I described the three components of this framework. The EVE-NG CLI handles lab creation, and node configuration (coming later) handles feature deployment. Both depend on one thing being true: every node in the lab must be reachable via SSH from the moment it boots, before any topology-specific configuration has been applied.

That is what IaC-ready images are for.

## What Makes an Image IaC-Ready

An IaC-ready image is a standard EVE-NG node image pre-configured with three things:

* **A known administrative user** with SSH access enabled.
* **A dedicated management VRF**, which keeps the OOB traffic entirely separate from the lab topology.
* **A management interface** bound to that VRF and configured to get an IPv4 address via DHCP.

When the CLI imports a lab, it attaches the OOB management network to `nat0` on the EVE-NG host automatically. Every node gets a DHCP address over that network at boot, regardless of what happens on the data-plane interfaces. From that point on, the node is reachable over SSH and ready for automated configuration.

The design is intentionally minimal. The image makes no assumptions about the lab topology: it only guarantees reachability. Everything else is handled at the node configuration layer.

**IOL images are a special case.** IOL loads its startup configuration from an external file (not baked into the image), so the CLI can push the minimal OOB configuration at lab creation time without any pre-configuration step. For QEMU-based images, the configuration must be embedded in the image itself, which is what the build process below handles.

**IaC-ready images cannot be shared publicly** because of copyright. The person running the framework must build each image from a legally obtained source.

## Getting Started

We clone the repository on the EVE-NG server and install the dependencies:

```bash
ssh user@your-eveng-server
git clone https://github.com/dainok/eveng-cli
cd eveng-cli
pip install poetry
poetry install
```

Then we install the [[Introduction to Ansible Automation|Ansible]] collections required by the build playbooks:

```bash
cd playbooks
poetry run ansible-galaxy collection install -r requirements.yml
```

## Building IaC-Ready Images

The `playbooks` directory contains one playbook per supported image type:

* `playbook-c8000v.yml`.
* `playbook-csr1000vng.yml`.
* `playbook-iol.yml`.
* `playbook-nxosv9k.yml`.
* `playbook-viosl2.yml`.
* `playbook-vios.yml`.
* `playbook-vyos.yml`.

Each playbook follows the same three-step process:

* It searches a source directory for matching image files and copies them into `/opt/unetlab/addons`.
* It boots a temporary node with the copied image and applies the OOB configuration.
* It boots the configured image again and verifies that it can reach both `pnet0` (the EVE-NG host interface) and the Internet.

For Cisco images, we need the source files from a legally obtained distribution. In my case, I downloaded `refplat-20241223-fcs-iso.zip` from the [Cisco software portal (CML)](https://software.cisco.com/download/home/286193282/type/286326381/release) and extracted the contents into `/opt/unetlab-downloads`. Then:

```bash
cd playbooks
poetry run ./playbook-vios.yml -e search_dir=/opt/unetlab-downloads
```

![[iac-build.png]]

When it completes, the configured images appear in `/opt/unetlab/addons/qemu`, each with the `-iac` suffix in its name, for example `vios-adventerprisek9-m.spa.159-3.m9-iac`. That suffix lets the CLI (and you) tell at a glance which images support IaC and which do not.

To build all the supported images at once, a convenience script used in CI before each release is available:

```bash
./rebuild_all_templates.sh
```

This wipes all the existing `-iac` images and rebuilds them from scratch, which is useful both for testing and for an initial full setup.

## Troubleshooting

If a playbook fails, we can run the three steps manually to isolate the problem.

**Step 1, copy the image only** (skip the configuration):

```bash
poetry run ./playbook-vios.yml -e search_dir=/opt/unetlab-downloads -e template_config=false
```

![[iac-build-copy-only.png]]

**Step 2, apply the OOB configuration** to an already copied image:

```bash
poetry run config_scripts/vios_config.py vios-adventerprisek9-m.spa.159-3.m9-iac
```

![[iac-build-config-only.png]]

**Step 3, verify the reachability** of the configured image:

```bash
poetry run config_scripts/vios_test.py vios-adventerprisek9-m.spa.159-3.m9-iac
```

![[iac-build-verify-only.png]]

Running these steps in sequence lets us pinpoint whether the failure is in image discovery, in the configuration step or in the connectivity verification.

Once the IaC-ready images are in place, we can reference them through the `-iac` suffix in our HLD YAML files, and the EVE-NG CLI picks them automatically when importing a lab. The next post covers the HLD format in detail.
