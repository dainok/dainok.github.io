---
cover: governance
date: 2017-10-09
tags:
- beginner
- governance
title: The Darwin's Law of Evolution for computers
---
We are living in the "hype" era, where everything is sold as the Holy Grail for a non-existent problem. Let's analyze things with a critical eye.

Prompted by a friend, who is writing a couple of very good posts that I recommend, I am sharing my thoughts about automation, the future of network engineers, AI and so on. This is my own point of view, the result of 20 years in the IT world, at work and at home.

It seems to me that vendors push more and more cool words, at a higher rate than in the past. A few years ago the "IT outsourcing" mantra lasted for a while, and everyone had to "outsource" something to become a good manager. Then came the "cloud" era, but it was too early, so it was a false start. In the last two years, many "mantras" have arrived together: big data, cloud (again, but with a different awareness), cybersecurity, automation and machine learning. They are too many! Not so many years ago, the idea of the cloud could be compared to a startup selling something that was not ready for the enterprise market. In the last few years, thanks to Amazon, Google, Microsoft, Salesforce and others, enterprises and IT managers can approach a valid cloud strategy with more awareness.

> Lesson learned: it is better to wait for the second generation to get a mature technology.

I would add another one:

> Lesson learned: a successful startup aims to be bought by a big company. Buying cloud services from small companies can lead to unexpected changes in services and licenses.

Now let's apply the thesis above to the current mantras, especially automation, machine learning and cybersecurity.

I think I can say that networking vendors include automation in every product. We have REST APIs to program every device, and UIs (user interfaces) that should help us manage the whole infrastructure with a few clicks and without knowing what is below. The real world is different from what marketing tells us, though: there are a lot of bugs that make the software unusable or dangerous.

Moreover, asking vendors for support gives fewer results than a walk to Santiago de Compostela or Lourdes.

## Vendor Software and Support

It seems to me that vendors are not interested in selling good software: everything must be developed and sold "agile" (no matter that the agile methodology is a completely different thing). The most critical aspect is that the quality of the support teams is terrible: a lot of FTE time is spent debugging what the vendor should analyze, there are a lot of embarrassing "it's by design" limits and, really, too many untrained people unable to support anything or anyone.

> Lesson learned: vendors cannot write good software, and apparently they do not care much about it. They are only interested in selling ideas, not real and working features.

Let's move on to machine learning, the "hype" that will make humans useless. Computers can learn and detect things better than humans, and they can analyze a lot of data in a relatively short time, so big data is not a problem anymore. But, because there is always a "but", the real world is a little different. If someone uses Facebook to guess sexual orientation, we should ask ourselves how much of that research is "marketing" and how much is "real". The answer is that machine learning, used to detect whether a photographed man is gay, is slightly more efficient than an untrained human. So current machine learning algorithms perform better than thousands of untrained people. That is still a good thing, but we should remember that machine learning algorithms do not (currently) perform like experts.

> Lesson learned: (current) machine learning algorithms perform slightly better than untrained humans, but they can manage a lot of data much faster than humans.

But machine learning applied to automation and cybersecurity will save the world! (Maybe.)

The security of our infrastructures, software, [[Building an IoT testing lab|IoT]] and electronic devices is embarrassing. We have a lot of non-upgradeable devices (mobile phones, IoT devices, set-top boxes...) and a lot of devices with a vulnerable design. We also have infrastructures managed by untrained (cheap) people all around the world, and critical services exposed to the Internet with default or blank passwords. Meanwhile, a lot of vendors sell the Holy Grail of security.

The Holy Grail is apparently not enough, because thousands of computers are still infected by the WannaCry ransomware, and sooner or later someone will pay the price.

> Lesson learned: cybersecurity is the current mantra, but it will not help much.

So we have mature cloud services, but automation, machine learning and security are still too young. The last year showed that connecting everything to the Internet is not always a good idea, especially if we connect hospitals, 911 emergency numbers, pacemakers, airplanes or IoT devices.

Should we live like the Amish? That is indeed a possibility, and when I retire I will certainly think about it.

## What Will the Future Look Like?

To conclude my train of thought:

* Will the cloud kill IT experts? No, because infrastructures must be managed, platforms must be well deployed, and services must be well designed and well implemented.
* Will automation kill network experts? No, because network experts started to automate things 10 years ago, and the current "hype" is not changing things much. You have to know what is below if you want to implement a good and effective solution.

## Is Cybersecurity Only a New "Hype"?

The network has always been asked to fix poorly designed software. I could write a lot about why the "stretched data center" is a bad choice, but this is not the right post. I see more and more good tools used to fix the wrong thing (containers used as VMs, snapshots used as backups...). The network layer cannot fix every single mistake of the layers above, and sooner or later those layers will pay a price.

I think that Darwin's Law of Evolution by Natural Selection is valid for computers and electronic devices too. It could also have a dramatic impact on human life.

## References

* [Let's Drop Some Random Commands, Shall We?](https://blog.ipspace.net/2017/04/lets-drop-some-random-commands-shall-we.html "Let's Drop Some Random Commands, Shall We?")
* [New AI can guess whether you're gay or straight from a photograph](https://www.theguardian.com/technology/2017/sep/07/new-artificial-intelligence-can-tell-whether-youre-gay-or-straight-from-a-photograph "New AI can guess whether you're gay or straight from a photograph")
* [You're Looking Gay, Today](https://www.spreaker.com/user/runtime/dataknightmare-eng-1x01-youre-looking-ga "You're Looking Gay, Today")
* [115 batshit stupid things you can put on the internet in as fast as I can go by Dan Tentler](https://www.youtube.com/watch?v=hMtu7vV_HmY&amp;t=531s "115 batshit stupid things you can put on the internet in as fast as I can go by Dan Tentler")
* [UK hospitals hit with massive ransomware attack](https://www.theverge.com/2017/5/12/15630354/nhs-hospitals-ransomware-hack-wannacry-bitcoin "UK hospitals hit with massive ransomware attack")
* [The Coming Software Apocalypse](https://www.theatlantic.com/technology/archive/2017/09/saving-the-world-from-code/540393/ "The Coming Software Apocalypse")
* [FDA Recalls Nearly Half a Million Pacemakers Over Hacking Fears](https://thehackernews.com/2017/08/pacemakers-hacking.html "FDA Recalls Nearly Half a Million Pacemakers Over Hacking Fears")
* [Germanwings Crash Prompts Debate About Remote-Controlled Planes](https://www.nbcnews.com/storyline/german-plane-crash/germanwings-tragedy-prompts-discussion-about-remote-controlled-planes-n343446 "Germanwings Crash Prompts Debate About Remote-Controlled Planes")
* [650Gbps DDoS Attack from the Leet Botnet](https://www.incapsula.com/blog/650gbps-ddos-attack-leet-botnet.html "650Gbps DDoS Attack from the Leet Botnet")
* [Microsoft and Mozilla ban Dutch government root certificate](https://www.theinquirer.net/inquirer/news/2107413/microsoft-mozilla-ban-dutch-government-root-certificate "Microsoft and Mozilla ban Dutch government root certificate")
* [Blackout](https://www.amazon.it/Blackout-Marc-Elsberg-ebook/dp/B00CLVHG3U/ref=sr_1_11?keywords=blackout+libro+stef+e+phere&qid=1641832833&sprefix=blackout%2Caps%2C142&sr=8-11 "Blackout")
