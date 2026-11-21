---
cover: governance
date: 2022-05-20
tags:
- advanced
- governance
- log-management
---
Many companies (hopefully) collect logs in a central system, for compliance and sometimes for root cause analysis. In this post, I want to recap that log management is not just about log collection, and why and how the process should be designed.

## Why Do We Collect Logs?

In short, log management is about collecting logs and storing them for analysis. By design, any system logs locally, so we need to clarify why we want a formal process for log management.

Let's start with the compliance part: ISO 27001 mentions log management in Annex A 12.4.

> Event logs should be produced, retained, and regularly reviewed to record user activities, exceptions, defects, and information security events.

The GDPR does not mention log collection specifically, but Art. 5 refers to the ability to demonstrate compliance:

> The controller shall be responsible for, and be able to demonstrate compliance with, paragraph 1 ('accountability').

In Italy, we also have a specific mention of logging (Amministratori di Sistema or AdS, and the AGID minimal requirements):

> Caratteristiche di mantenimento dell´integrità dei dati raccolti dai sistemi di log sono in genere disponibili nei più diffusi sistemi operativi, o possono esservi agevolmente integrate con apposito software. Il requisito può essere ragionevolmente soddisfatto con la strumentazione software in dotazione, nei casi più semplici, e con l´eventuale esportazione periodica dei dati di log su supporti di memorizzazione non riscrivibili. In casi più complessi i titolari potranno ritenere di adottare sistemi più sofisticati, quali i log server centralizzati e "certificati".
> Tuttavia il provvedimento del Garante non affronta questi aspetti, prevedendo soltanto, come forma minima di documentazione dell´uso di un sistema informativo, la generazione del log degli "accessi" (login) e la loro archiviazione per almeno sei mesi in condizioni di ragionevole sicurezza e con strumenti adatti, in base al contesto in cui avviene il trattamento, senza alcuna pretesa di instaurare in modo generalizzato, e solo con le prescrizioni del provvedimento, un regime rigoroso di registrazione degli usage data dei sistemi informativi.
> Le misure minime sono un importante supporto metodologico, oltre che un mezzo attraverso il quale le Amministrazioni, soprattutto quelle più piccole e che hanno meno possibilità di avvalersi di professionalità specifiche, possono verificare autonomamente la propria situazione e avviare un percorso di monitoraggio e miglioramento.

The mention is specific to Italian companies, but it makes sense: we should all be able to review the activity of systems and users regularly, or during an incident analysis. Being able to demonstrate what happened in an incident means that we have our infrastructures (and data) under control. That is the GDPR accountability principle.

## How Do We Collect Logs?

Any well-designed system and application implements local logging by default. With dozens, hundreds or thousands of log sources, we must collect logs in a central location. Otherwise, we spend days just correlating events between different systems. Moreover, if a system is compromised, its logs are probably compromised too.

So we need to:

* Collect logs from multiple sources in a central storage.
* Keep timestamps coherent.
* Categorize logs based on their content (debug logs, administrative events, errors...).
* Set the retention based on the log category (we probably want to discard debug logs after a few days, whereas we want to keep administrative logs for months).
* Preserve the CIA attributes (Confidentiality, Integrity, Availability).
* Normalize and correlate logs based on usernames, IP addresses, timestamps, sources...

We probably want to collect logs from:

* Security appliances and applications (firewall, EDR, WAF, [[Managing a brownfield Cisco ACI fabric with NaC and Terraform|NAC]], IDS/IPS...).
* Ingress and egress web gateways (load balancer, web proxy...).
* Authentication systems (LDAP, Active Directory, remote access, servers, endpoints, appliances...).
* Network services (DHCP, DNS...).
* Applications.
* ...

## What Do We Do with Logs?

We collect logs not for compliance, but because they have value. We can use them to:

* Analyze application errors (new bugs after a software release).
* Highlight anomalies (potential attacks, data exfiltration).
* Review activities (verify administrator logs for permission abuse).
* Analyze root causes (problem management).
* Hunt threats (find ongoing attacks).
* Activate automatic alerting and reporting.

We may realize that we do not need a simple log collector but a [[SIEM ready applications|SIEM]], because most of the tasks we expect are about security management (threat hunting, finding users who abuse permissions...). The answer is yes: we analyze logs for security purposes. We also collect application logs for debugging, but they serve security too.

We should still evaluate log collectors because:

* We have to review user activities (a GDPR requirement).
* We want to debug application and network issues (they are security incidents too, but rarely managed by the SOC).
* SIEM solutions are usually more expensive, and many companies have to decide which logs to discard.

Ideally, the log management process should be almost fully automated:

![[Website/Diagrams/log-management.png]]

## Conclusions

I am convinced that there is no distinction between incidents and security incidents. Because of the GDPR, any event impacting the CIA attributes of personal data is a data violation (or data breach). Based on that, most events are potentially security events (we can discard debug and maybe informational events). With this idea, any SOC should be able to identify cyber threats as well as network and application issues.

The real world works differently, and I know I am an idealist.

Besides that, we need to collect logs and improve alerting and reporting to obtain a resilient infrastructure. This is part of the log management process.

## References

* [Art. 5 GDPR Principles relating to processing of personal data](https://gdpr-info.eu/art-5-gdpr/ "Art. 5 GDPR Principles relating to processing of personal data")
* [System Administrator FAQ (Italian)](https://www.garanteprivacy.it/web/guest/home/docweb/-/docweb-display/docweb/1577499#FAQ "System Administrator FAQ (Italian)")
* [Log Management Workflow (draw.io format)](https://app.diagrams.net/#Uhttps%3A%2F%2Fwww.adainese.it%2Ffiles%diagrams%log-management.drawio "Log Management Workflow")
* [Guide to Computer Security Log Management (NIST 800-92)](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-92.pdf "Guide to Computer Security Log Management (NIST 800-92)")
* [Minimal security requirements for public administrations (Italian)](https://www.agid.gov.it/it/sicurezza/misure-minime-sicurezza-ict "Minimal security requirements for public administrations (Italian)")
