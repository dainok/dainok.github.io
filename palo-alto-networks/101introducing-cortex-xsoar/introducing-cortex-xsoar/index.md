---
cover: paloalto-strata
date: 2024-08-12
tags:
- beginner
- cortex-xsoar
- palo-alto-networks
---
Cortex XSOAR is an orchestration and automation system that unifies the components of a security infrastructure. It integrates with third-party security and incident management vendors, so that the events they raise automatically become incidents within Cortex XSOAR.

Once the incidents are created, Cortex XSOAR runs playbooks that enrich them with information from other connected products. The enriched data helps us build a complete picture of the situation, so that nothing is overlooked.

We can apply automation and rules to these incidents to decide whether they require further investigation or can be closed safely. This filtering lets security analysts focus on the minority of incidents that genuinely need attention, which improves the efficiency of security operations.

This learning path follows the [Cortex XSOAR Customer Success Engineering Training](https://www.youtube.com/playlist?list=PLD6FJ8WNiIqUVEA2e5LZhmqNnwFcFhDTZ) course and provides details on how to create a lab and tackle each lesson.

## Incident Lifecycle

This learning path follows the [incident lifecycle](https://xsoar.pan.dev/docs/incidents/incident-xsoar-incident-lifecycle):

![[pan-incident%20lifecycle.png]]

The lifecycle begins with strategic planning. During this phase, we assess the security needs of the organization, define the objectives and determine the integrations and workflows that Cortex XSOAR must manage.

This phase lets us design the workflow for incident management. The planning phase typically comes first, but my perspective is different: before designing a workflow, we need to understand the capabilities of the product. The lesson dedicated to planning is therefore postponed to the end. First we learn how the product works and what its features are, and then we approach the design phase with that knowledge.
