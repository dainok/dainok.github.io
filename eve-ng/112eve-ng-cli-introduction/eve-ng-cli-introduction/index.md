---
cover: eve-ng
date: 2026-04-12
tags:
- advanced
- eve-ng
---
If you have used EVE-NG seriously, not just for a quick lab but for building complex topologies that you need to tear down and rebuild regularly, you have probably felt the friction. Every time you want to recreate a lab, you are back in the browser: create the lab, add nodes one by one, pick images from dropdowns, wire interfaces by hand, configure management access. It works, but it does not scale, it is not repeatable, and it is impossible to version-control.

I am a network engineer, and I am used to treating infrastructure as code. EVE-NG has a REST API, so I asked myself: how hard can it be to write a CLI that talks to it properly?

This project is the answer. It is still early (a proof of concept, really), but the core workflow is already useful enough that I am sharing it.

## What It Does

EVE-NG CLI is an interactive shell that connects to your EVE-NG server and lets you manage it from the terminal. It offers tab completion, command history and color-coded output. Under the hood it is all async Python, so operations that can run in parallel do.

The most powerful feature is lab import from a YAML file I call an **HLD** (High-Level Design). You describe your topology (nodes, images, interfaces, links) and the CLI does the rest: it creates the lab, provisions every network and node, wires the interfaces, attaches the management network to NAT and pushes the startup configurations for IOL devices. A 10-node lab goes from YAML to fully wired in about five seconds.

## The Full Framework

EVE-NG CLI is one piece of a broader framework designed to make EVE-NG labs fully repeatable and code-driven. The framework has three components:

* **IaC-ready images:** pre-configured node images that are accessible via SSH from the moment they boot, through a dedicated Out-of-Band management network. No console access and no manual first-boot configuration are required.
* **EVE-NG CLI:** an interactive terminal interface that builds complete labs from YAML files describing the topology (nodes, images, interfaces, links). One command, and the lab is fully wired.
* **Node configuration:** scripts that connect to each node over the OOB network and push the feature configuration described in the HLD. The topology comes up, and the configuration follows automatically. This component is optional, a work in progress and not public yet.

This post focuses on the first two components. Node configuration will get its own post when it is ready for public use.

## Why Share It Now, at POC Stage?

Because the direction of the project should come from people who actually use EVE-NG. I have my own workflow and my own pain points, but I am one person. If you are an EVE-NG power user and there is a workflow you wish you could script or automate, I want to hear about it before I spend weeks building the wrong thing.
