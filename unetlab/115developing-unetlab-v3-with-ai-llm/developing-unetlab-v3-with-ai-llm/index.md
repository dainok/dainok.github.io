---
cover: unetlab
date: 2025-07-27
tags:
- ai
- beginner
- unetlab
---
UNetLab v3 is built on Django along with various other frameworks. I am not a professional developer, nor do I consider myself one, yet I am often told that my prototypes are extremely useful, especially because I can build them in very short timeframes.

Since software development is not my main job, however, my coding activity is irregular, and long breaks between projects make me lose familiarity with the syntax. In the past, [Google](https://www.google.com/) was my primary tool: I constantly searched for code snippets and constructs just to recall the correct syntax. Using the official documentation, Googling for suggestions and searching for examples to solve specific problems was very time-consuming.

With the advent of "artificial intelligence", I experimented with different approaches until I found a more efficient workflow that I now use successfully.

## ChatGPT for Code Generation

A couple of years ago, I started using [ChatGPT](http://chatgpt.com/) to generate the code I needed directly. My prompts were along these lines:

> Create a Python function using Netmiko to connect to a Cisco device, elevate privileges, retrieve the MAC address table, parse it with TextFSM, and return a dictionary where the keys are interface names and the values are lists of MAC addresses.

At the time, the results were almost always subpar: the generated code often included fictional functions and generally did not work.

Adapting the generated code took longer than writing it from scratch.

Moreover, describing in detail what I want takes significant time for my needs: converting my ideas into descriptive text always leads to incomplete or oversimplified instructions.

## Copilot in Visual Studio Code

About a year ago, I tried a second approach. Following a colleague's suggestion, I enabled GitHub [Copilot](https://visualstudio.microsoft.com/github-copilot/) in Visual Studio Code and started using it as a coding assistant. The experience was insightful because it made me reflect on my own workflow.

At first there was a "WOW" effect: Copilot seemed to understand what I needed and proactively suggested code snippets. I no longer had to write prompts, and the interaction felt more natural.

I soon realized, however, that the constant suggestions of Copilot were disrupting my mental flow.

When I code, I enter a focused mental state where I translate my ideas into code, following a "red thread" of logic as I go. The suggestions of Copilot interrupted this state and triggered my critical-thinking mode, since each suggestion needs to be evaluated in context.

Switching back and forth between these two mental modes was exhausting. At some point, I began to trust the suggestions of Copilot subconsciously, losing control over my own code.

There was a specific incident where I had to debug a faulty function. Copilot suggested a fix that looked perfect, and I trusted it. I adapted the rest of the code to that function, only to discover an hour later that the suggestion contained a structural flaw, which invalidated all the subsequent modifications.

I lost an hour and had to spend another hour dismantling and rewriting everything correctly.

That was when I understood what was happening. I disabled Copilot and returned to my usual workflow.

I wrote a [LinkedIn post](https://www.linkedin.com/posts/adainese_visualstudiocode-e-copilot-incuriosito-da-activity-7283739426076119040-cj8C/) about it, expecting a flame war, but I received valuable feedback instead, mostly about the way I approach coding.

Still, as mentioned, programming is only a side activity for me, needed to build prototypes that others will industrialize later. It does not make sense for me to formalize a "proper" development workflow: others will always do it better than I can.

## Building Complete Apps with Replit

More recently, new generative tools have emerged that promise to build entire applications. Many testimonials claim they created fully functional prototypes in just a few hours. Curious but skeptical, I decided to try [Replit](https://replit.com/).

I asked it to generate a Django app for managing firewall rules. As I said, describing a software project fully is challenging, especially during the prototyping phase, when requirements are incomplete and feasibility is still uncertain.

I was not looking for a finished product, but for a starting structure: a skeleton with models, views and templates already set up.

Initially, Replit generated a [Flask](https://flask.palletsprojects.com/) app. I appreciate Flask, but I prefer [Django](https://www.djangoproject.com/) for larger, more complex projects. I asked Replit to convert the app to Django. It replaced some code and showed me a preview of the requested app, suggesting that it was working correctly in the Replit backend.

The reality was different: the code was a hybrid of Flask, Django and non-existent functions, completely non-functional.

There is also the infamous case of a similar service, [Builder.ai](https://www.theregister.com/2025/05/21/builderai_insolvency/), which turned out to be powered by a team of human developers behind the scenes: essentially a scam to attract millions in funding.

## ChatGPT as a Tutor

Recently, I received an important piece of advice: use LLMs as mentors, asking for guidance, not code. I greatly respect the person who suggested this, so I gave it a try.

Using an LLM as a tutor means asking **how** to do something, not **to do** it. Specifically, I started asking:

* How to achieve a specific feature in Django.
* Where a specific function is used in Django.
* Which approaches exist to solve a particular problem.

This approach has proven effective because:

* I stay focused until I hit a specific issue that requires further analysis.
* I can ask targeted questions without worrying about edge cases (I handle them myself).
* I can take only what I need, adapt the code and style, and integrate it coherently.
* Most importantly, I get a single interface for documentation, examples and community knowledge.

Over the last two months, this method let me resume work on UNetLab v3, stalled for over a year, and make significant progress. I implemented WebSockets, replaced RQ with Celery, and built robust APIs with comprehensive error handling.

## How LLMs Work

It is important to understand how an LLM works. I am not the best person to provide a full technical explanation, but I can share my perspective.

In simple terms, LLMs are statistical models that generate outputs based on input patterns and probabilistic associations. They do not think or understand. The concept of "thinking" is arguably philosophical, and I believe computers will never truly possess it, as thought is not purely mechanical.

LLMs also do not "hallucinate": they simply produce text without any concept of reality. Reality cannot be derived from statistical affinity.

Using LLMs (even as tutors) requires keeping this in mind:

* The output must always be verified.
* The output style can vary (lack of consistency).

I noticed that LLM-generated code may alternate between single and double quotes, may or may not include comments, may mix `snake_case` with `camelCase`, and sometimes uses outdated or imaginary functions.

## Reverse Engineering

On rare occasions, I had to read the source code of a framework to understand its behavior or fix specific bugs. Reverse engineering is extremely time-consuming, especially when the code is highly optimized.

Sometimes I used LLMs to explain the purpose of a particular function. Occasionally I found useful insights, but often I did not.
