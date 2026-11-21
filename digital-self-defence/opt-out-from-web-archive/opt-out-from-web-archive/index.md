---
cover: self-defence
date: 2024-09-29
tags:
- digital-self-defence
- intermediate
---
[Web Archive](https://archive.org/) is a non-profit online service that has long been recording websites and archiving them in a virtually permanent manner, so that anyone can analyze the history and changes of a specific website.

I am an advocate of oblivion and, above all, of being in control of one's own data. I also use the Web Archive often for my work, so I know well the drawbacks of this type of service. The underlying idea is interesting, but I do not like that the service goes to great lengths to make opting out difficult.

A convenient system to instruct search engines (crawlers) on how to treat a specific website already exists: the `robots.txt` file lets each website define what may be recorded and what may not. Web Archive disregards it.

Let's see how, as of today, we can be partially ignored by Web Archive. I say partially because the engine seems to keep visiting pages that are not searchable.

First, we configure the `robots.txt` file to instruct Web Archive to ignore the website, even though this should not be necessary:

```text
User-agent: archive.org_bot
Disallow: /
```

Next, we add a `verify.txt` file to the root of the website with the following content:

```text
please remove from archive.org
```

Finally, we send an email to `info@archive.org` requesting the deletion of the domain and the associated data from the Web Archive:

```text
I am NAME SURNAME owner of EXAMPLE.COM. I'm officially requesting the immediate removal of my site from all archive.org products. The "User-agent: archive.org_bot Disallow: /" code present in our robots.txt file is not being honored. It can be seen at:

https://www.example.com/robots.txt

I am requesting removal of EXAMPLE.COM from all stored dates, including today, and all days going forward. I have been the sole owner of this domain since inception. I have sent this message from my private address, but you can reply to any address hosted at the domain which should be removed. I have also placed a confirmation message at the following link:

https://www.example.com/verify.txt

Thank you for your prompt attention.

DMCA Notice:

I am the site owner and sole copyright holder for each of the domains cited above. This letter is official notification under Section 512(c) of the Digital Millennium Copyright Act ("DMCA"), and I seek the removal of the aforementioned infringing material from your servers. Archive.org does not have any right or permission to reproduce, sell or display my websites in any way, shape or form. I am providing this notice in good faith and with the reasonable belief that rights I own are being infringed. Under penalty of perjury I certify that the information contained in the notification is both true and accurate, and I am the copyright owner and therefore have the authority to act on behalf of the owner of the copyright(s) involved. Thank you for your prompt assistance with this matter.

NAME SURNAME
EXAMPLE.COM
```

You should receive a confirmation of the deletion shortly.

To be clear, the world will not be better or safer after this action, but it remains an action to consider. More and more services today crawl any public data, even for commercial purposes. Generative AIs, search engines, surveillance services ([ClearView AI](https://www.clearview.ai/)) and cybercrime come to mind.
