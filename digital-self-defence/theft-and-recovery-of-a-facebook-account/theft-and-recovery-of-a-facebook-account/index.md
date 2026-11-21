---
cover: self-defence
date: 2023-09-26
tags:
- advanced
- digital-self-defence
- passwords
---
This is the story of Vittoria (a pseudonym, hereafter referred to as V). A few days ago, V called me urgently: her Facebook account had been stolen by Nhang (a pseudonym, hereafter referred to as N). Identity theft is a criminal offense, punishable under Article 494 of the Italian Penal Code. This will be useful later on.

![[evidence-4.png]]

For those who use Facebook for work, such an event is extremely traumatic and must be handled with care.

## The Facts

* On Wednesday, V received notifications on Facebook warning her of unusual activity on her account. She followed the instructions and reported the suspicious activity, but since she was on a mobile device, she could not change the password or enable multi-factor authentication.
* Thursday, 7:37 PM: Verify your payment method to resume posting ads ([[evidence-1.png|Attachment 1]]).
* Thursday, 7:39 PM: Have you just added an email address? ([[evidence-2.png|Attachment 2]]).
* Friday, 12:38 AM: Have you just removed your phone number? ([[evidence-3.png|Attachment 3]]).
* Friday, 12:39 AM: Have you just removed your email address? ([[evidence-4.png|Attachment 4]]).

From this point on, V could no longer access her account from either her computer or her phone. She also noticed that the account now displayed N's first and last name.

We can reconstruct what probably happened:

* V's password was stolen. This can be done in several ways, from simple phishing portals to data breaches (more or less public) to so-called infostealers.
* V's account was not protected by multi-factor authentication (MFA).
* N accessed V's account and locked her out by changing the password, the email address and the phone number.

## Facebook's First Failure: No Detection

For those who work in cybersecurity, these events are a series of indicators that, given V's usual behavior, point to a compromise (commonly called Behavioral Indicators of Compromise, or BIoC). To describe the mechanism simply: each event receives a score, and the events are evaluated together, based on the total score, not individually.

Specifically:

* If an Italian profile, accessed only from Italy until now, is accessed from Vietnam, the event is highly suspicious and we assign it a score of 9/10.
* If a user changes their account password and has never done so before, the event may be suspicious and we assign it a score of 1/10.
* If a user changes the email address, the event may be suspicious and we assign it a score of 6/10.
* If a user removes or changes their phone number, the event may be suspicious and we assign it a score of 6/10.
* If a user changes the name on their profile to a radically different one, the event is highly suspicious and we assign it a score of 9/10.

It doesn't take a security expert to see that these five events, taken together, conclusively indicate a compromised account.

## Facebook's Second Failure: The "Not Me" Link

For each event described in The Facts, Facebook sent V an email. Clicking the "Not me" link starts a procedure that should have let V undo the changes and regain control of her account.

But it didn't go that way.

V had to send Facebook a live webcam recording of her identity document, but Facebook's automatic system judged the information insufficient to recognize V and to restore her access, leaving the account with N.

Again, it doesn't take a security expert to understand that when a user reports fraud through an official Facebook email, the changes were very likely fraudulent and should be reversed.

## Account Recovery

V still had two more Facebook emails with recovery links. The second attempt failed too, but with some difficulty she managed to start the third recovery procedure. This time she used her passport instead of the identity card, which always came out blurred: she took the time to photograph it properly with her phone, and Facebook recognized her and sent two recovery emails:

* New email address added to Facebook ([[evidence-5.png|Attachment 5]]).
* You can now access your account again ([[evidence-6.png|Attachment 6]]).

These two emails must be used in the order shown above: first, the email address must be confirmed with the corresponding confirmation code, then access to the account can be regained with the temporary password and PIN provided in the email.

But it was not over yet.

V got into the account, but the email change procedure failed. She found herself with an account:

* whose password she did not know (the one in the email was a temporary, single-use password);
* associated with N's email address;
* associated with N's phone number.

V soon realized that any attempt to change the password, the email address or the phone number required a password, but not the one she had: Facebook wanted the password N had used to lock her out.

There is a procedure that works without the password, but it requires a confirmation PIN, sent to N's email address or phone.

![[missing-account.png]]

In a moment of desperation and inspiration, V tried once more to open the Facebook app on her phone. This time the app logged in automatically but asked for confirmation from an already open session. V could now authorize the phone from the session she had left open on her computer, and within minutes she changed the email address and the phone number and set up multi-factor authentication.

But V cannot change her name for two months: it is a Facebook security policy. For two months, her friends will see her as Nhang.

## Other Facebook Failures

In retrospect, V reacted well, despite saying she is not good with technology: she was autonomous, had excellent intuitions and did not get discouraged. And yes, given how poorly Facebook's security systems work, she was also very lucky.

These are the other failures of Facebook:

* Facebook has an official [procedure for recovering stolen accounts](https://www.facebook.com/hacked/), but it requires the email address or phone number associated with the stolen account. N had changed both, so V did not know them.
* The document is captured through Facebook's own interface, and for some reason the image of the identity card came out blurred, even though V has a latest-generation phone. Photographing the passport, which is much larger than the electronic identity card, was a brilliant idea by V.

## Criminal Offense

Identity theft is a criminal offense that should be reported. Not so much because the Italian authorities can realistically act against Facebook, but because the stolen profile could be used to commit crimes. One must be able to demonstrate that, from a specific date, the account was no longer under one's control.

V went to the authorities to report the incident, but she could not assert her rights.

## Lesson Learned

Lately, I have often dealt with what I call the technofascism of social platforms, where poorly written automated systems and a strong interest in surveillance erase people's rights arbitrarily or at random.

I understand, however, that some people choose to use these platforms for specific reasons. To them I make an appeal: take precautions against scams.

In my approach to digital security, there are two types of accounts:

* accounts linked to my identity, which I protect with strong, unique passwords and, where possible, multi-factor authentication;
* disposable accounts, not linked to my personal identity, which I protect with fictitious data, strong passwords and, where possible, multi-factor authentication.

They say prevention is better than cure, and here it is truer than ever: as this story shows, recovering a stolen account takes a mix of stubbornness and luck. To be completely transparent: few accounts are ever recovered.

In summary, if your account is stolen:

* [seek help](https://www.zanshintech.it/);
* do not act in a panic; take the time to act correctly (for us, it was essential to work from a computer, keeping the phone as support);
* use the recovery emails sent by the platform;
* once you regain access, lock out the attacker ([ask for advice](https://www.zanshintech.it/));
* if possible, use the official procedure, and repeat it daily, if necessary for months.

## An Open Question

One question stayed open at first: what is the point of stealing a Facebook account and changing its name, without asking for a ransom? In other words, where is the economic benefit of this kind of operation?

The answer came a few days later: N had used the Facebook account to add a credit card, unknown to V and probably stolen, and to create and pay for advertising campaigns.
