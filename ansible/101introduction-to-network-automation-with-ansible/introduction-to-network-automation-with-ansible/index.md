---
cover: ansible
date: 2024-07-28
tags:
- ansible
- beginner
---
This series is about network automation with Ansible. It is designed to help you streamline operations, standardize workflows and manage multiple devices in significantly less time. Network automation is no longer just the domain of network engineers: it is expanding to include Governance, Risk, and Compliance (GRC) teams.

Among the many automation frameworks, [Ansible](https://www.ansible.com/) is an excellent choice: it does not require programming skills and has a relatively easy learning curve.

The [[Ansible|Ansible Workbook for DevNetOps]] is the guide for the students of my network automation courses. It provides practical "recipes" to help you develop your own automations with Ansible. By the end of this series, you will be able to design and write Ansible [[Ansible Playbooks and variables|playbooks]] that automate tasks across many network devices.

## Objectives

* Become familiar with Ansible terminology.
* Learn how to approach an automation project with Ansible.
* Understand the pros and cons of Ansible.
* Develop the skills to write Ansible playbooks and roles.

## Prerequisites

Some prerequisites are covered in other courses:

* **Automation fundamentals:** Approaching automation projects.
* **DevOps fundamentals:** Understanding the DevOps methodology and tools.
* **Infrastructure as Code:** Managing infrastructure with coding practices.
* **Automation frameworks:** We will focus on Ansible, but also discuss its pros and cons compared to other frameworks. The choice of framework should result from the needs of the project, not be a prerequisite.
* **Modeling:** Abstracting infrastructure into data structures for automation.
* **Golden configurations:** Approaches, pros and cons.
* **Templating:** Tools for writing parameterized templates.
* **Text scraping:** Converting human-readable text into data structures.
* **Parsers:** Writing and modifying parsers for text scraping.

## Required Tools

You will need the following tools, described in a [specific course](Prerequisites%20for%20EVE-NG.md):

* A development server (Ubuntu Linux 22.04).
* A programming language (Python 3.10).
* A distributed version control system ([[Git fundamentals for developers and IT professionals|Git]]).
* A testing environment ([[Introduction to EVE-NG platform|EVE-NG]]).
* An IDE (Visual Studio Code).

## Required Skill Sets

* **Linux:** Ability to install and configure.
* **Python:** Ability to read and write simple scripts.
* **Git:** Ability to manage repositories.
* **Vi/Vim:** Ability to edit and exit.
* **RegEx:** Ability to read and write simple regular expressions.
* **Jinja2:** Ability to write simple templates.
* **Parsers:** Ability to write and modify templates.

## Important Notes

Keep these essential points in mind:

* Network automation engineers must often find documentation through research (e.g., searching the web or reverse engineering).
* Network automation engineers need to write code and prototypes (sometimes called "spaghetti code").
* Developers can turn prototypes into robust software, but that is not the job of network automation engineers.
* Developers are better at writing code, but they often lack the networking skills and vendor knowledge needed to write network automation software.
