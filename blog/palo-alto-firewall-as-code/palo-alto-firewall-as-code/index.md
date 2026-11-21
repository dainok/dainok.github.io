---
cover: paloalto-strata
date: 2024-06-22
tags:
- advanced
- blog
- firewall
- iac
- palo-alto-networks
---
About 6 years have passed since the Automate IT event organized by [Gabriele Gerbino](https://www.linkedin.com/in/gabrielegerbino/) and me. During the event, [Xavier Homs](https://www.linkedin.com/in/xhoms/) presented a case that fascinated me. Today we might call it Firewall as Code.

My interest was not only in the elegance of the solution but also in its practical implications for operations and security.

I managed firewalls for several years and now, as a consultant, I see many implementations at clients. All the installations I encounter have the same problems:

* Hundreds of rules.
* Each rule is built on the perception of the operator who creates it.
* No clear understanding of the origin and evolution of a rule, except for a brief description.
* Likely obsolete rules remain configured because no one can confirm whether they are necessary.
* Rules refer to decommissioned or reused systems, which introduces undefined risks.
* Rules are grouped and simplified only to make operations easier, without any security assessment.
* Constant requests to add new rules without a full understanding of what an application should or should not do.
* Reviews are impossible, for the reasons above and because the rules change continuously.
* An enormous amount of operational time is spent managing the firewalls.
* No one can say whether the policies comply with the security directives the company should follow.

Some software is intended to solve these problems, but these solutions are often:

* Another patch for poorly designed processes.
* Complicated to use.
* So expensive that most companies cannot sustain them.

Let's start from scratch. We design a process that addresses the problems above and, from the process (not the other way around), we derive a technology to manage our firewalls.

In the example, I used Palo Alto Networks firewalls for these reasons:

* I know them quite well.
* Their configuration can be exported entirely in text format (XML in particular).
* I can manipulate the configuration file and apply it entirely at a later stage (commit).

The approach should be applicable to all the firewalls that have these three properties.

## The Process

The process I want to design is very simple:

1. Application managers define the operating rules of their applications in terms of the necessary traffic flows.
2. Security managers define high-level traffic policies between the different security zones, based on a risk assessment.
3. Security architects design, implement and oversee the firewall solutions.
4. Automation takes the requirements from (1), applies the constraints defined in (2), generates the rule base and applies it to the firewalls. The operational activities of the security architects are limited to what is defined in (3).

Application managers must define the network requirements in files and make them available together with the code or the documentation of the application ([[Git fundamentals for developers and IT professionals|Git]] is a good tool, but not the only one). The automation updates the policies daily or on request.

## The Model

As always, the modeling phase takes the most time. In the example, I assumed that:

* The definition of the services in terms of protocol, port and application is centralized and managed by the security architects, because choosing the application associated with a specific port requires specific knowledge of the firewall solution.
* The definition of the security zones and their relationship with the networks is centralized and managed by the security architects, because the concept of a security zone is linked to the network design.
* Settings such as logging and security profiles are managed by the security architects.
* Each application is defined by two files, `networks.yml` and `rules.yml`. The application manager maintains both files.

Here is an example:

```yaml
# networks.yml
networks:
  WWW:
    - 10.20.1.7/32
  APP:
    - 10.20.2.15/32
  DB:
    - 10.20.2.23/32
```

The file above defines three objects: `WWW`, `APP` and `DB`.

```yaml
rules:
  - destination-address: WWW
    service: HTTP
    description: |
      Allow HTTP external traffic to exposed web server.
  - destination-address: WWW
    service: HTTPS
    description: |
      Allow HTTPS external traffic to exposed web server.
  - source-address: WWW
    destination-address: APP
    service: HTTPS_8443
    description: |
      Allow traffic from exposed web server to application server.
  - source-address: APP
    destination-address: DB
    service: MYSQL
    description: |
      Allow traffic from application server to database server.
```

The file above defines the rules for a specific application. The services are defined in the centralized `services.yml` file:

```yaml
services:
  HTTP:
    applications: web-browsing
  HTTPS:
    applications: ssl
  HTTPS_8443:
    protocol: tcp
    port: 8443
    applications: ssl
  MYSQL:
    applications: mysql
```

The security zones are mapped according to the rules defined in the `network-zone_mapping.yml` file:

```yaml
zones:
  servers:
    type: internal
    networks:
      - 10.20.2.0/24
  dmz:
    type: internal
    networks:
      - 10.20.1.0/24
  # Internet (catch all)
  internet:
    type: external
    networks:
      - 0.0.0.0/0
```

## Implementation Approach

To summarize the key points of the approach:

* Security architects need to configure the firewalls in detail, and replicating an interface with all the necessary settings is unthinkable.
* Application managers need to define the traffic rules in an abstract way.

The most practical approach is therefore:

1. Read the updated configuration from the firewall.
2. Delete all the traffic rules and the associated objects.
3. Regenerate the rules and objects from the files described above and add them to the cleaned configuration.
4. Validate the configuration.
5. Apply the configuration.

The advantage of this approach is clear: we never have to check whether an object exists, whether it is correct or whether it is in the right position. This simplifies the implementation greatly.

There are, of course, disadvantages and constraints:

* Rules must be written so that their order does not matter.
* All the rules must be defined by the files described above.

We can make exceptions, but each special case complicates the implementation.

## Tools

Once the model is defined, we must choose a tool to translate it into an actual configuration. In my evaluation, I focused on:

* [Aerleon](https://github.com/aerleon/aerleon) (formerly [Google Capirca](https://github.com/google/capirca)).
* [pan-os-python](https://github.com/PaloAltoNetworks/pan-os-python): the official library developed by Palo Alto Networks.
* [pan-python](https://github.com/kevinsteves/pan-python): the library developed privately on which `pan-os-python` is based (interesting, isn't it?).
* [PAN-OS XML API](https://docs.paloaltonetworks.com/pan-os/11-1/pan-os-panorama-api/get-started-with-the-pan-os-xml-api).
* [PAN-OS CLI](https://docs.paloaltonetworks.com/pan-os/11-1/pan-os-cli-quick-start).

After some attempts with the official `pan-os-python` library, I took a different path: the library configures the firewall object by object, whereas my approach required manipulating the entire configuration file.

I then explored `pan-python`, which seemed to do everything I needed. The documentation is poor, however, so I had to proceed by trial and error, and I was almost at the point of writing my own library that invoked the native APIs directly.

Aerleon is a very interesting solution, but it did not reach the level of detail I needed. Using the CLI was unnecessary, because Palo Alto Networks firewalls are fully manageable via the native APIs.

## Implementation

Currently, the automation is implemented in a single Python file that:

1. Reads the configuration from the firewall in XML format.
2. Reads the UUID and the hit count of each rule.
3. Deletes the objects and the rules.
4. Generates the new objects and rules, retains the UUIDs and adds them to the XML.
5. Performs some compliance checks.
6. Sorts the rules from most used to least used.
7. Uploads the configuration to the firewall.
8. Applies the configuration.

We can add the integration to a CI/CD pipeline and customize it as needed.

There are still some things to manage:

* Rules that must have a specific order.
* Security profiles.
* Support for user groups.
* Specific customizations that someone will surely need.

![[firewall-policies.png]]

## Conclusions

Developing this automation took me about three days. The result is not production-ready, but it is a good starting point.

The benefits of this approach are objective:

* A greatly reduced operational cost.
* Responsibility for the rules transferred to the people who know the application.
* A clean configuration.
* The possibility of continuous checks on the formal correctness of the policy.
* Better performance, thanks to the ability to order the rules by usage.

If you think this approach is futuristic, I must reveal that the talk of Xavier was based on a real installation at a fairly large international client.

The full example code is available in the [GitHub repository](https://github.com/dainok/courses/tree/master/Palo%20Alto%20Networks/Strata/FWaC).
