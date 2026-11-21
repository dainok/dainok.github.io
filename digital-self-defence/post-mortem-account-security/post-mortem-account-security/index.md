---
cover: governance
date: 2022-05-11
tags:
- advanced
- digital-self-defence
---
In the last few years, I started working (pro bono) on a different topic: personal digital security. In this post, I want to discuss post-mortem security: how to minimize the threats to the family after death.

My concern is email security. What can a malicious actor do if they gain access to my mailbox? Through password recovery, they could access multiple attached accounts (social networks, e-commerce, utilities...), and many of those accounts could affect the security of my family.

The obvious solution is to plan for death: give instructions and passwords to relatives, so they can manage the accounts properly. It is not that simple, though:

* Relatives may not have the skills to handle the accounts properly.
* Accounts could be closed without notice.

This post summarizes some thoughts I had while listening to [The Privacy, Security, and OSINT Show Podcast by Michael Bazzell](https://inteltechniques.com/podcast.html "The Privacy, Security, and OSINT Show"), especially [episode 259](https://inteltechniques.com/blog/2022/04/29/the-privacy-security-osint-show-episode-259/ "EPISODE 259-Leaving Kindle").

## Post-Mortem Risks

When an email account is dismissed, a malicious actor can impersonate the original owner.

![[impersonating.png]]

The post above is a good example of what a malicious actor can do, and no particular skill is required. Just find [interesting domains](https://www.expireddomains.net/expired-domains/ "Expired Domains") and pick some. Reactivate the domain, register a catch-all address and impersonate the original owner. Try to recover the associated accounts, and present yourself as the original owner...

This is scary, at least to me.

## Domain, Service and Account Retirement

Death is not the only event we should care about. A service can be retired, and an account can be suspended, closed or migrated to other users:

> CTemplar is closing and the last day of operation for this email service will be on May 26 of 2022.

In some cases, we could also lose an Internet domain:

> (EU) Domain names that are not reinstated will remain suspended until 30 June 2021. They will then be withdrawn as from 1 July 2021. On 1 January 2022, all the withdrawn domain names will be revoked. They will then start to be made available for registration by other entities.

## Solutions

I have not found a good solution yet. I am currently evaluating two scenarios.

### Robust Third-Party Email Account

In this scenario, I use an account from a large email provider (e.g., Google). I assume that:

* The domain (e.g., gmail.com) will not be closed for years.
* The account will not be reused (it may be closed or suspended, but not reused).

In this scenario, after my death, nobody can access my email account for years, except the people who have specific instructions to do so (username, password, token).

This solution does not cover unexpected account suspension or closure. In that case, I need to migrate all the associated accounts to another email address. It is doable, even if boring.

### Personal Domain with Email Sub-Addressing

In this scenario, I use an account on a personal domain (e.g., adainese.it). I assume that:

* I register a domain with the TLD of the country I live in (let's avoid another .EU-style scenario).
* I use sub-addressing (see below).

We know that sooner or (hopefully) later the domain will not be renewed and will become available to anyone. We also know that sooner or later our domain will be part of a data breach and associated with our physical identity.

We can use sub-addressing to minimize the risk associated with password recovery. Sub-addressing lets us use the `+` symbol to create multiple aliases, so we can use `yourname+randomstring@example.com` as the email address.

Is this enough? Not really, because sooner or later a service provider will send an unsolicited email that reveals the email address used to log in.

## Conclusions

In my view, there is no final solution yet. Both solutions can be used: each minimizes different risks and leaves others open.

## References

* [Sieve Email Filtering: Subaddress Extension](https://datatracker.ietf.org/doc/html/rfc5233 "Sieve Email Filtering: Subaddress Extension").
* [Registering and renewing .eu domain names in the UK](https://www.gov.uk/guidance/registering-and-renewing-eu-domain-names-in-the-uk "Registering and renewing .eu domain names in the UK").
* [CTemplar is shutting down](https://ctemplar.com/ctemplar-is-shutting-down/ "CTemplar is shutting down").
* [Expired domain threat scenario](https://mastodon.social/interact/108274062191145538?type=reblog "Expired domain threat scenario").
* [The Privacy, Security, and OSINT Show](https://inteltechniques.com/podcast.html "The Privacy, Security, and OSINT Show").
