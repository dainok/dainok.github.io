---
cover: paloalto-cortex
date: 2024-08-12
tags:
- beginner
- cortex-xsoar
- lab
- palo-alto-networks
---
In this post, we set up a lab environment to experiment with Cortex XSOAR by Palo Alto Networks. This tutorial follows the content of the video [XSOAR Engineer Training - Part 2: Incident Types & Fields](https://www.youtube.com/watch?v=o92rG4FPc-k&list=PLD6FJ8WNiIqUVEA2e5LZhmqNnwFcFhDTZ&index=2).

## Download and Install Cortex XSOAR

We start by [downloading](https://start.paloaltonetworks.com/sign-up-for-community-edition.html) the trial version of XSOAR. We receive a file of approximately 1 GB, named something like `demistoserver-6.12-857430.sh`, and we copy it to a Linux system. I am using Ubuntu Linux 22.04 for this setup.

We run the installation as the `root` user:

```bash
bash /tmp/demistoserver-6.12-857430.sh
```

The installation process is straightforward and prompts us to set the credentials to access XSOAR via the web interface.

When the installation is complete, we can access XSOAR via the web with the credentials we set. A pop-up notifies us that the license is missing:

![[missing-license-warning.png]]

The Community Edition provides a 30-day full-featured license, which gives us a complete experience of the capabilities of Cortex XSOAR. We simply press `Cancel` and continue with the setup.

## Update Installed Content Packs

We navigate to `Marketplace` → `Installed Content Packs`, select all the content packs that need updating and click `Update`. We may receive a warning that the updates could introduce breaking changes. Since this is a new installation, we proceed with the updates.

## Install the Sample Event Generator Plugin

We need a plugin to generate some sample events. Normally the events are collected from a [[SIEM ready applications|SIEM]], but for our lab we use a simpler alternative.

We go to `Marketplace` → `Browse` and search for `JSON Sample Incident Generator`. We install the `JSON Sample Incident Generator` package, which includes an [integration](https://xsoar.pan.dev/docs/reference/integrations/json-sample-incident-generator) that generates custom events within XSOAR.

Next, we navigate to `Settings` → `Integrations` → `Sample Incident Generator` → `Add Instance` and configure the instance as follows:

* **Name:** `JSONSampleIncidentGenerator_url_events`.
* **Do not fetch.**
* **The raw JSON string to use as the sample data:** paste the content from this [GitHub repository](https://raw.githubusercontent.com/dainok/courses/master/Palo%20Alto%20Networks/XSOAR/02.%20Preparing%20your%20XSOAR%20environment/url-events.json).

We click `Test`, then `Save & Exit`.

If we do not see the integration, we refresh the browser.
