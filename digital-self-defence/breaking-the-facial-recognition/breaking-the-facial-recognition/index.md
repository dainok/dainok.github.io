---
cover: self-defence
date: 2021-02-04
tags:
- digital-self-defence
- intermediate
- privacy
---
I drafted this article about a year ago, but I never published it. Revisiting it now has allowed me to follow up and confirm my initial concerns.

We know that nearly every photo we take likely passes through facial recognition software. Apple includes one in its Photos app, and both Google and Facebook have their own versions. Images are associated with people and objects, and can later be retrieved with text-based searches. If you have never tried it, take a picture of a car license plate with an iPhone and then search for the word "plate".

For corporations (Google, Apple, etc.), associating descriptive attributes with each photo, including the names of the people involved and the geolocation, provides immense value for behavioral analysis.

For government agencies, as [[Monetizing personal data the new form of prostitution|we have seen]], being able to link a photo (perhaps from a surveillance camera) with a name and surname is extremely valuable.

It is no surprise, therefore, that facial recognition is a subject of significant interest.

## Defeating Facial Recognition

Facial recognition relies on algorithms that learn, from a set of images, how to identify a person across different contexts. The more photos are available, the better the algorithm becomes.

About a year ago, [Face Shield](https://web.archive.org/web/20200417151230/http://faceshield.ai/ "Face Shield") publicized an application designed to alter photos so that current facial recognition algorithms would fail to detect the people depicted.

These algorithms continuously improve, however, so such a strategy is effective only temporarily: the more popular the app becomes, the faster the countermeasures are developed to adapt the recognition systems.

## The Spread of Personal Photos

We have already discussed the [[The dangers of unwitting sharing|risks of sharing personal data]]. Many services have a business model based on collecting massive datasets of personal, profiled information and reselling them. [ClearView AI](https://www.clearview.ai/) is a prime example.

The safest recommendation remains: publish online only content that you consciously decide to share, always considering the worst-case scenario if it ends up in the wrong hands.

## Face Shield

Face Shield provided a cloud-based app that altered photos to prevent facial recognition algorithms from identifying the people depicted. The tool offered three levels of obfuscation.

**Original image:**

![[faceshield-before.png]]

**Subtle effect:** nearly identical to the original but able to deceive some recognition software (source: Face Shield website).

![[faceshield-subtle.png]]

**Medium effect:** visually different from the original, and able to fool several recognition systems.

![[faceshield-medium.png]]

**Intense effect:** unrecognizable to both humans and recognition software.

![[faceshield-intense.png]]

## Key Questions

Before using any service, we should start asking the right questions. Face Shield is a perfect example.

**Where is the company based?**

It was headquartered in Canada, outside the EU and therefore beyond the reach of the GDPR.

**Is there a privacy policy?**

No. A privacy policy does not guarantee compliance (as [[Privacy policy and non existent free will|discussed here]]), but its absence suggests a lack of consideration for the rights of users.

**What is the business model?**

Every company needs a sustainable business model. In this case, the application was free and had no revenue stream. The only plausible model was data collection and the eventual sale of the company.

**Is the service useful?**

Does it make sense to render the people in photos unrecognizable, which degrades the images, only to share those altered photos on social media?

**Is the service effective?**

In an ongoing arms race, will adding noise to photos plausibly keep them unrecognizable to facial recognition algorithms? In the short term, maybe. In the long term, certainly not.

![[recovering-obfuscated-password.png]]

If tools such as [Depix](https://github.com/beurtschipper/Depix "Depix") can recover censored (pixelated) passwords, it is not difficult to imagine similar countermeasures being developed against Face Shield.

## What Happened Next

As mentioned, I wrote this article in April 2020 but never published it. Revisiting it now, I found that **Face Shield no longer exists.**

Its author announced on [Twitter](https://twitter.com/bose_joey "Joey Bose"):

> PhD Candidate @rllabmcgill/@Mila_Quebec Deep Learning SwissArmy Knife: CV, NLP, Graphs, Gen. Models. http://FaceShield.ai(acquired), Ex-@UberAILabs,@BorealisAI,@UofT

We do not know who acquired Face Shield, but it is safe to assume that the buyer obtained its software, its algorithms and potentially personal data. Under European law, such data belongs to the users. Under U.S. law, it typically belongs to the company that collected it, which is largely free to use it as it pleases.

## Conclusions

Face Shield is a perfect case study to reflect on the lifecycle of many startups, their business models and the degree of caution we should exercise before entrusting them with our personal data.

The key takeaway: before joining any service, we should always ask ourselves:

* Who operates it, where are they based and what is their business model (*follow the money*)?
* Does it truly solve a problem, or does it create one?
* Is the proposed solution effective?
* What alternatives exist once the service disappears?
