---
cover: self-defence
date: 2022-07-13
tags:
- advanced
- digital-self-defence
- firewall
---
I have a "landline" VoIP number that my parents use to reach me when my phone is turned off. Landline numbers are apparently preferred by spammers, so I wrote a simple zero-trust firewall configuration for my FRITZ!Box.

The firewall permits all the numbers included in the address book.

Let's see how to configure it:

1. Add all the trusted numbers to the phone book (`Telephony` → `Telephone Book`).
2. Optionally, configure an answering machine (`Telephony` → `Answering Machine`).
3. Configure the firewall (`Telephony` → `Call Handling` → `Call Diversion`) as follows:

![[call-diversion.png]]

In my case:

* All trusted incoming calls are routed to a telephone connected to port FON1.
* The answering machine on the FRITZ!Box is disabled.
* I use the answering machine provided by the VoIP provider.
