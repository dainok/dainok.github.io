---
cover: cisco
date: 2013-03-26
tags:
- advanced
- blog
- cisco
title: "CCIE #38620 - My story"
---
On March 19th I passed the R&S CCIE lab and became CCIE #38620. While I was studying for the exam, I loved reading the success stories of other CCIEs, so here is the story of my journey, with my tips.

![[ccie-logo.png]]

In 2012 I had to renew a lot of Cisco Specialist certifications, and I chose to pass a single CCIE written exam rather than many Specialist exams. So I bought the [CCIE Routing and Switching Certification Guide](http://www.amazon.co.uk/CCIE-Routing-Switching-Certification-Guide/dp/1587059800/ref=sr_1_1?ie=UTF8&qid=1364328576&sr=8-1 "CCIE Routing and Switching Certification Guide") and I really loved it. It was better than the CCNP books: everything was explained clearly. During my journey I realized that the book was just a very small part of the entire [CCIE &reg; Routing and Switching Written Exam Topics (Blueprint) v4.0](https://learningnetwork.cisco.com/docs/DOC-4374 "CCIE &reg; Routing and Switching Written Exam Topics (Blueprint) v4.0").

After the written exam, I asked myself whether I would be able to prepare for the lab exam. I could not afford a bootcamp, so I had to prepare by myself. I found a mate, a good guy who was preparing for the same exam. I knew that a good mate could make the difference, and it did.

[ifconfig.it](http://www.ifconfig.it/ "ifconfig.it") is the best CCIE mate I could have found: similar skills, but a different approach. When he booked the lab, I realized I could pass it too. I booked as well, paying myself, and spending 1500 € turned out to be the best incentive ever.

Every weekend and two or three nights each week were dedicated to the CCIE. My job helped a lot: I work every day on networks, QoS, routing and switching.

In the meantime I met Paolo, who helped me prepare my mind for the exam. Time after time I stopped being scared and, in the end, I was sure about my success. And I succeeded, as did my friend Gian Paolo.

## Location

My exam location was the [Brussels Cisco Office](http://www.cisco.com/web/learning/le3/ccie/exam/brussels.html "Brussels Cisco Office"). You can find a lot of good hotels near the location (NH Hotel, Holiday Inn...), but I needed the cheapest one, so I chose the [Hotel ibis budget Brussels Airport](http://www.ibis.com/gb/hotel-5247-ibis-budget-brussels-airport-voorheen-etap-hotel/index.shtml "Hotel ibis budget Brussels Airport").

<iframe src="https://maps.google.com/maps?f=d&source=s_d&saddr=50.882243,+4.436567&daddr=50.88659,+4.449002&hl=it&geocode=FcNmCAMdV7JDAA%3BFb53CAMd6uJDAA&aq=&sll=50.886487,4.449157&sspn=0.002558,0.004823&mra=ls&ie=UTF8&t=m&ll=50.884688,4.442769&spn=0.004898,0.012457&output=embed" height="350" width="425" frameborder="0" marginwidth="0" marginheight="0" scrolling="no"></iframe>

## Tips

What you need, in order:

* Enjoy your path, or you will never pass.
* Find a mate who shares your path: it makes everything easier.
* Learn to breathe and not to panic.
* Buy an American layout keyboard: do not think you can pass without it.
* Tell yourself you can do it, and believe it.
* Plan your time, and during the lab reserve time to check your entire work.
* Buy at least four switches: you can emulate routers, but you need real switches for L2 topics.
* Prepare for the written exam at your best, and the lab will be easier.
* Discuss each single blueprint topic and command you encounter in your preparation: you must understand the underlying technologies.
* Learn and use the [Product/Technology Support](http://www.cisco.com/cisco/web/psa/default.html?mode=prod "Product/Technology Support") pages, and remember how to reach the [Master Index](http://www.cisco.com/en/US/partner/products/ps6441/products_product_indices_list.html "Master Index") (`Products` → `Cisco IOS and NX-OS Software` → `Cisco IOS` → `Cisco IOS Software Release 12.4 Family` → `Cisco IOS Software Releases 12.4 T` → `Master Index`).
* Know the lab environment.

## Tricks

IOS can help you during the exam. The most time-consuming task is testing IP address reachability from routers and switches. Open a PuTTY terminal, connect to a router and type:

```text
#show ip alias
Address Type             IP Address      Port
Interface                192.168.10.254
Interface                192.168.11.1
```

Now press and hold the right Alt key and draw a square to select the IP addresses only. Paste the selected IP addresses into a file (Notepad) and repeat for each device. At the end, create a Tcl script:

```text
foreach i {
192.168.10.254
192.168.11.1
} { ping $i repeat 3 source Lo0 }
```

We can use this script to test IP address reachability from all routers with a `tclsh` shell.

For switches we need a different method: we create a macro and execute it:

```text
conf t
Enter configuration commands, one per line.  End with CNTL/Z.
switch(config)#macro name ping
Enter macro commands one per line. End with the character '@'.
do ping 192.168.10.254 repeat 3 source Lo0
do ping 192.168.11.1 repeat 3 source Lo0
@
```

We can run the macro by typing:

```text
switch(config)#macro global apply ping
```

Remember to delete it before the end of the lab.

A way to display the TCP/UDP port mapping is:

```text
#show ip port-map
Default mapping:  snmp                 udp port 161                        system defined
Default mapping:  echo                 tcp port 7                          system defined
[...]
```

Sometimes you need to decrypt a Cisco Type-7 password:

```text
key chain decrypt
 key 1
   key-string 7 060506324F41
```

```text
#show key chain decrypt
Key-chain decrypt:
    key 1 -- text "cisco"
        accept lifetime (always valid) - (always valid) [valid now]
        send lifetime (always valid) - (always valid) [valid now]
```

Again, remember to delete the key chain before the end of the lab.

## References

* [Using TCL and Macro Ping Scripts for CCIE Lab Reachability Testing](http://blog.ine.com/2008/02/22/using-tcl-and-macro-ping-scripts-for-ccie-lab-reachability-testing/ "Using TCL and Macro Ping Scripts for CCIE Lab Reachability Testing")
* [Becoming a CCIE &ndash; the path and cost associated to my number](http://lostintransit.se/2012/11/02/becoming-a-ccie-the-path-and-cost-associated-to-my-number/ "Becoming a CCIE &ndash; the path and cost associated to my number")
* [CCIE lab numbers, preallocation myth, certification value](http://www.ifconfig.it/wordpress/2013/03/ccie-lab-numbers/ "CCIE lab numbers, preallocation myth, certification value")
* [Arden Packeer](http://ardenpackeer.com/blog/blog-my-ccie-story/ "Arden Packeer")
* [Daniel Dib](http://lostintransit.se/2012/10/24/ccie-37149-my-passing-lab-experience/ "Daniel Dib")
* [David Rothera](http://networkbroadcast.co.uk/2013/02/who-said-re-reads-are-useless/ "David Rothera")
