---
cover: eve-ng
date: 2026-04-12
tags:
- advanced
- eve-ng
---
EVE-NG CLI is still in its early stages. The core workflow, building a lab from an HLD file, is fully functional. For everything else (starting and stopping nodes, connecting to consoles, advanced lab management), the EVE-NG web interface remains the right tool for now. This post covers what the CLI supports today and how to use it.

## Starting the CLI

The CLI needs to reach an EVE-NG server. You can provide the credentials interactively at startup, but the cleanest approach is to set them as environment variables before launching:

```bash
export EVENG_ADDRESS='10.0.0.1'
export EVENG_USERNAME='admin'
export EVENG_PASSWORD='eve'
```

Then we launch the CLI with:

```bash
poetry run eveng_cli/main.py
```

![[eveng-cli.png]]

Once connected, we see the CLI prompt. At any point, we can type `help` to get the full list of available commands with their arguments and descriptions.

![[eveng-cli-help.png]]

## Images

The `image ls` command lists every node image available on the EVE-NG server: the template name, the image type and whether it was built as an IaC-ready image (indicated by the `-iac` suffix):

![[eveng-cli-images.png]]

This is useful to check which images are available before writing an HLD file, and to confirm that the IaC-ready builds completed successfully.

## Folders

The `folder` command lets us browse and manage the folder tree on the EVE-NG server.

![[eveng-cli-folders.png]]

The last folder we navigated to is saved in the session cache as the current path, so subsequent commands that need a path can use it as a default. Both absolute and relative paths are supported.

## Labs

The `lab` command covers lab creation, inspection and deletion.

Importing a lab from an HLD file is the primary workflow. We start by navigating to the folder where we want to create the lab:

```text
folder ls /Users/Andrea
```

Then we import the lab by pointing to a local HLD file:

```text
lab add eveng_cli/tests/hld/hld-1-linear-vios.yml
```

![[eveng-cli-lab-add.png]]

The lab name is taken directly from the filename (without the `.yml` extension). The CLI then runs through the full import pipeline (creating networks, provisioning nodes, wiring interfaces, attaching the OOB network to `nat0` and pushing the startup configurations for IOL nodes), printing a progress line for each step.

Once the lab is created, we can inspect it to verify its metadata and the node status:

![[eveng-cli-lab-ls.png]]

This shows the lab name, ID, filename, version and author, followed by a table of all the nodes with their current status, type, image and resource allocation.

## What Is Missing

A few commands are present in the shell but not implemented yet, most notably `lab rm`. They will be added in upcoming releases. For operations the CLI does not cover yet, the EVE-NG web interface remains fully usable alongside it: the CLI and the browser use the same API and the same data, so we can mix both freely.
