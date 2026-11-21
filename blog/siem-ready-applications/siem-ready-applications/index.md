---
cover: owasp
date: 2022-04-15
tags:
- advanced
- blog
- design
- security
- siem
---
A few months ago, a customer, an insurance company, asked me how to integrate custom applications with a SIEM. The customer had developed a Java application running in a Tomcat container.

## Custom Applications

Any service-oriented enterprise I know develops its business applications in-house. I would say that most of them still use Java EE with Tomcat and/or JBoss. All the applications I reviewed used logging for diagnostics: application events and errors are used to troubleshoot transactions and user behavior. In other words, logging is used to find issues and bugs.

Hardly anyone takes care of writing security events. That is a cultural problem: in the history of ICT, cyber threats are a recent phenomenon that most stakeholders are unaware of.

## Identifying Threats

For the sake of this post, the question is not how to modify the application, but which events we should log. This is not a new topic, and when we talk about application security, we should mention OWASP.

[OWASP AppSensor](http://appsensor.org/ "OWASP AppSensor") is a framework to develop Java-based "self-defending applications". The [project](https://github.com/jtmelton/appsensor "AppSensor on GitHub") is outdated and unmaintained, but its guidelines are a good starting point to identify the events we should log. The [[owasp-appsensor-guide-v2.pdf|OWASP AppSensor Guide]] describes 8 case studies that identify useful events to log.

![[appsensor.png]]

On page 35, for example, the guide describes a B2C e-commerce application and finds three objectives:

1. Identify attacks as soon as possible and track how they evolve.
2. Identify attacks against the application logic (catalog, cart, payments).
3. Identify attacks against the database logic (SQL injection).

The guide goes on to suggest how to improve the visibility of the application: each event type must have a threshold beyond which a security exception is raised.

## Where to Start

Changing the core applications of an enterprise is a critical topic: adding or changing functions could add unsustainable latency and badly impact the user experience. Moreover, most enterprise applications cannot log everything, because the amount of logging soon becomes unmanageable.

A risk-based approach, once again, helps to identify which events to account for: a financial application has different requirements than a CMS.

Chapter 14 helps us develop a self-defending application. On page 51, we find some events we should consider:

* Failed authentication (I failed to log in).
* Failed authorization (I am trying to access content I have no privilege for).
* Invalid user input (I am typing something I should not).
* Code injection (e.g., SQL injection).
* High usage (I am exceeding the expected page or function rate within 5 minutes).

In my opinion, we should log these 5 events in any application.

Finally, logs are useless if we cannot correlate them: logging must use a format the SIEM supports. Otherwise, nobody will read the logs line by line.

## RASP Solutions

RASP (Runtime Application Self-Protection) is a ready-to-use framework that adds security and visibility features: we add a custom library to the application to enable self-defense capabilities automatically. OWASP AppSensor was a good open-source example.

RASP is not a WAF (Web Application Firewall): a WAF analyzes the interaction between the user and the application, while RASP also verifies the impact on the application itself. In other words, RASP can see how the application behaves.

A [SANS paper](https://www.sans.org/reading-room/whitepapers/application/paper/35917 "Protection from the Inside: Application Security Methodologies Compared") compares WAFs with the HP RASP product AppDefend.

I place WAFs and RASPs in two different security layers: they use different logic and require a different approach. RASP has pros and cons:

* Pros: quick to implement and wide SIEM compatibility.
* Cons: expensive and (small) latency.

## Serverless and PaaS Applications

There is an interesting emerging topic: applications based on PaaS or serverless functions. I see that cloud providers embed many security features by default. Starting with logging, AWS and Google Cloud include many logging functionalities out of the box. The problem is not logging in a SIEM-compatible format, because the cloud platform takes care of it.

The open problem is log monitoring (threat detection): some SIEM platforms are starting to integrate cloud platforms, but I expect cloud providers to soon offer ready-to-use SIEMs with actionable insights (e.g., [Google Chronicle](https://chronicle.security/ "Google Chronicle")).

## Conclusions

In my daily work, I see cybersecurity awareness increasing. Months ago, cybersecurity was a topic confined to CISOs and cyber specialists. Nowadays, many non-tech organizational units ask me about it: OT managers and developers ask how to make the world more secure. Not only because security is necessary, but also because it is a competitive value.

## References

* [[owasp-appsensor-guide-v2.pdf|OWASP AppSensor Guide]]
