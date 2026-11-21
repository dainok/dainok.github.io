---
cover: self-defence
date: 2024-09-29
tags:
- advanced
- digital-self-defence
- phishing
- social-engineering
---
This post recounts an attempted fraud via SMS and a voice call with a fake voice, targeting an elderly person. This type of fraud is not new, but the way it was executed deserves a closer look. The article aims to be informative and understandable, to raise awareness among non-professionals.

I thank the friend who allowed me to experience and analyze this type of attack.

## The Facts

The mother (M) of a friend (her son, F) receives an SMS at 12:32 that looks like a simple scam:

![[sms.png]]

> Hi Mom, I lost my phone. This is my new number. +393791234567 Please send me a message on WhatsApp. I can be reached there! ([[sms.png|Attachment 1]])

We should be trained not to believe this type of SMS. Here, however, the sender provides the full name of F, a detail that makes the message more credible.

Anomalies:

* Why does the new phone number already appear in M's address book?
* Why does M have to use WhatsApp instead of a text message or a simpler and more convenient phone call?

Understandably, a few minutes later M replies to the SMS with a confirmation. Almost instantly, M receives a call from the attacker (A). The sender's number is still +393791234567, but the phone displays it with F's name. The voice on the phone is F's: it says that he lost his cellphone, dictates the new number and hangs up.

Anomaly:

* Why is the phone call just a monologue from F?

Fortunately, shortly afterwards F goes to M's house, understands the situation and calls me for advice. The attack is stopped, and the people involved are informed and secured.

## Analysis

The attack drew my attention to two facts that make it extremely credible and effective:

* The use of F's voice.
* The cellphone number displayed with F's full name.

By analyzing the evidence A left behind, I noticed that M's address book contained two entries for F: the correct one, saved on the cellphone, and a fake one, saved on Gmail. Since the cellphone is an Android, M's address book displays a combination of local and Google entries, and without specific checks the two look identical. Looking closer at the fake entry, I noticed that it was created moments before the first SMS.

Accessing Gmail lets us see the latest security events ([[gmail.png|Attachment 2]]):

![[gmail.png]]

We see that:

* The first two entries are my own logins.
* The one labeled "Mobile devices" was made near the time of the attack (unfortunately, the details did not let me understand exactly when).
* The next two (Authorized request) relate to applications requesting authorization (via OAuth2) to access part of the Google data. I assume these are applications, websites or apps installed on the phone, that need Google data. Examples are applications that manage contacts and calendars, but also WhatsApp itself, which wants to make a backup.

In the Google account management, we can check which sessions are active and, in particular, which devices are connected ([[security.png|Attachment 3]]):

![[security.png]]

We see that:

* The Firefox session on Mac is mine.
* The first cellphone (Oppo) is M's.
* The cellphone SM-G991B belongs to F's sister (S). In particular, S performed an activity on the Google account on the day of the attack, via Chrome Webview.

From there, unfortunately, the Google data was not helpful enough. I checked M's cellphone remotely and found nothing abnormal, while I find the activity on S's cellphone on the day of the attack a very interesting coincidence.

## Securing

The analysis tells us that:

* M's account was violated, since a fake entry was added to the address book. We can assume that all the data associated with Google has been compromised: in this case contacts, Google Drive and email.
* The attack probably originated from S's cellphone, so the same applies to her Google account.

Securing requires:

* Making sure that everyone involved (M, F, S) knows what happened and can recognize even more realistic attacks, which will be possible with the data stolen from the two Google accounts.
* Changing the passwords of the two Google accounts.
* Enabling multi-factor authentication (MFA).
* Deleting all active sessions.
* Removing all connected applications.
* Securing every account that shares a password with the Google accounts, is connected to them, or is used within potentially compromised devices.

In this case, the cellphones were mainly used as phones. I breathed a sigh of relief when I realized that there were no banking applications.

## The Attack

It is now clear how the attack was structured:

* Through a compromise of the Google account (via an application, a vulnerability or credential theft), the attacker creates a fake entry in the target's address book.
* The attacker creates an audio file impersonating the voice of a relative of the target.
* The attacker sends a series of bait SMS messages, trying to move the conversation to WhatsApp.
* When the target replies via SMS (and presumably via WhatsApp too), the attacker calls and plays the previously created audio.
* The attacker tries to convince the target that there is an emergency and that money is needed, to be sent via bank transfer.

This attack was thwarted, but a brief investigation showed me that it is currently widespread and that, unfortunately, some elderly parents have fallen into the trap, losing several thousand euros.

## Lessons Learned

Current deep learning technologies that can create audio files with other people's voices are extremely dangerous. Outdated phones and insecure applications give attackers the tools to create false identities very easily and effectively.

We should expect even more complex attacks, where phone calls are no longer simple monologues but real conversations.

We must be able to identify anomalies and run control tests to understand whether the person communicating with us digitally is who they claim to be, or someone impersonating them with information easily available on the Internet.

Digital life blends with physical life, so it requires the same level of attention. Driving on the road requires a license and attention, and "driving" a cellphone that gives access to a bank account requires the same awareness. Keeping and using outdated cellphones, not updating them, or installing anything that appears on the screen out of curiosity is **not** a good idea and can have serious consequences.

In this case it turned out well, but in others I have seen, the attack succeeded and the bank account was emptied.
