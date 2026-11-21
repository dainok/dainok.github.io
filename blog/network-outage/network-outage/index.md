---
cover: ad
date: 2024-07-31
tags:
- beginner
- blog
- design
- incident-management
---
In 2013, I [[20130918-festival-ict-designing-an-hybrid-data-center-infrastructure.pdf|presented]] a critical case that could cause the complete isolation of a datacenter. Eleven years later, the situation remains the same.

Let's reflect on a few points.

## Open Reflections

**Complexity:** complexity has increased, with many more software layers than before. This complexity leads to misunderstandings, design errors and unforeseen "blind spots" that can be particularly destructive. "Complexity" has become a mantra, but we brought it upon ourselves.

**Simplification:** paradoxically, this is the opposite of the previous mantra, and it has driven the introduction of various technologies that enable "things" previously deemed incorrect. For those who remember, STP was created this way. To simplify processes and make them more agile and faster, we introduced a series of software layers, which leads back to the previous point.

**Hybrid Devices:** thanks to the two previous mantras, devices that behave partly like hosts and partly like switches were born. In the slides, I refer specifically to the devices embedded in blade chassis. I described a corner case on HP in the slides, but the scenario is still valid for other vendors.

## The Scenario

Let's discuss the scenario at hand.

It involves a datacenter network that can be implemented in legacy mode or as a fabric. Blade chassis with the hybrid devices mentioned above are connected to this network. Virtualization systems generally run on the blades, but this is not strictly necessary. If, for any reason, a blade creates an L2 loop and there are no protections, the loop propagates through the fabric and all the connected devices and chassis.

In the three cases I have experienced from 2013 to today, the fabric generally handles the traffic, but the hybrid switches do not. If the hybrid switches transport FCoE, the damage is obviously greater.

Best practices generally require configuring protection mechanisms on the fabric, which introduces the problem.

As explained in the slides, if a blade or VM creates a real or apparent loop, it activates the protection mechanism of the fabric, which shuts down the port the loop originates from. The failover mechanism of the virtualizer or of the hybrid switches then moves the cause of the loop to a different interface, which is also shut down to protect the fabric. In a few minutes or seconds, the entire blade chassis is isolated along with its whole workload.

The problem is that, as network engineers, we tend to protect "the fabric" without realizing that the fabric actually extends to the hybrid switches and to the virtual switches of the virtualizer. Complexity leads us to segment the infrastructure into separate areas of responsibility: the fabric belongs to the network team, while blades and virtualization belong to the computing team. Following this logic, the network team protects its own perimeter from its own perspective, which is incomplete.

The solution is to implement loop protection mechanisms at the edge of the fabric, considering it as a whole, to isolate the single VM (or server) causing the loop instead of the entire blade chassis.

## Final Notes

Some final notes:

* The loop prevention mechanism should be handled by the access switch closest to the potential loop source (which can be a VM or a server).
* The loop prevention mechanism should include some sort of probe: not all loops can be identified via BPDU guard.
* The described scenario can also occur with virtualizers installed on rack servers, not only on blades.
* To date, I have only observed human errors and bugs, but if I were planning an effective DoS, I would consider this scenario.
* We cannot prevent 100% of problems. We can only improve our ability to identify and respond to them quickly.
