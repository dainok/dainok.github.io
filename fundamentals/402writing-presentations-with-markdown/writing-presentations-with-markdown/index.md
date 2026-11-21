---
cover: ad
date: 2025-05-03
tags:
- advanced
- ci-cd
- documentation
- fundamentals
- jinja2
- markdown
---
Previously, we discussed how to improve documentation management by focusing on content rather than tools. Specifically, we explored how to generate high-quality documents with [Markdown](https://python-markdown.github.io/), CSS and [WeasyPrint](https://weasyprint.org/).

For documents, optimization is not only about streamlining the writing of content, but also about automating parts of the process. Many business reports, for instance, can be generated automatically, and analysts only need to provide the commentary on the data.

For my personal productivity, I faced a similar challenge: improving the creation of slides in the same way.

## Microsoft PowerPoint

My experience with PowerPoint has been largely negative, and I know that many share this sentiment. In theory it supports master templates and offers a wide range of features, but in practice it has significant issues. Transferring content between presentations with different formats is error-prone, and it is difficult to maintain a consistent style.

In enterprise environments, it is common to find presentations with mismatched and outdated styles. Centralizing templates at the organizational level is virtually impossible.

## Google Slides

Google Slides impressed me with its simplicity. Its essential feature set is enough for my needs and allows clean presentations with consistent styles. Moving content between different presentations is also relatively easy.

From a strategic perspective, however, I am moving towards a **cloud exit** approach. Google uses a proprietary format that is fully functional only within its ecosystem. I can export presentations to other formats, but this reintroduces the very issues I wanted to avoid.

## Slides as Code

Several tools let us create slides in Markdown, including:

* [Slidev](https://sli.dev/).
* [Marp](https://marp.app/).
* [Reveal.js](https://revealjs.com/).

Many of them are built on Node.js, which I am not familiar with, and some lack features essential to my workflow. I also wanted to avoid relying on a framework that I cannot fully control.

I therefore went back to the approach I had already developed for document generation: [Markdown](https://python-markdown.github.io/), CSS and [WeasyPrint](https://weasyprint.org/).

## Styling Considerations

Documents typically follow a structured format (unless we design highly customized brochures). CSS, especially as implemented in WeasyPrint, offers a high degree of customization, though it is not a perfect solution: laying out a webpage on a screen differs significantly from typesetting a PDF document.

The compromises required for document formatting were largely acceptable. Designing a presentation is an entirely different challenge, because slides are inherently more artistic.

My presentations, however, are usually technical, with a simple layout of text and images. For my use case, **efficiency in structuring slides outweighs the need for pixel-perfect positioning of the elements.**

## Defining the Presentation Structure

As in my document generation workflow, I use YAML to define the core parameters of each presentation:

```yaml
title: Sample Presentation
subtitle: Recipes and real world examples by the creator of UNetLab
version: 1
language: en
logo: main
logos:
  main: ../templates/slides/images/logo-ad.png
  small: ../templates/slides/images/logo-ad-small.png
footer: © Andrea Dainese - No AI were harmed during the making of these slides.
```

This structure lets me associate different logos with different layouts. A dictionary stores the logo options, with a primary logo set as the default.

Each slide includes metadata that specifies the layout and the associated logo:

```yaml
---
layout: title
logo: main
---
# Sample Presentation

## Recipes and real world examples by the creator of UNetLab
```

The content of the slide is written in Markdown.

Markdown has limitations (many of which are actually its strengths), but I needed flexibility. To address this, I added HTML support:

```yaml
---
layout: main
logo: small
---
# #WhoAmI

## Andrea Dainese

- Senior Network & Security Architect with 20+ years’ experience in securing complex IT and OT infrastructures
- Focused on cyber security strategies, GDPR/ISO 27001 compliance and Automation
- Cisco (CCIE), VMware, Red Hat... certified
- Father of [Unified Networking Lab (UNetLab)](https://www.adainese.it/blog/2019/01/01/unified-networking-lab-unetlab-the-story/)
- Privacy and digital security evangelist

[https://adainese.it](https://adainese.it)
{: .right}
```

In this example, I use the `attr_list` extension to assign a `.right` class, which aligns the link to my website to the right. I also display the key links with [FontAwesome](https://fontawesome.com/) icons embedded directly in HTML.

This approach fully met my requirements: I store presentations as Markdown in a [[Git fundamentals for developers and IT professionals|Git]] repository and render them to PDF with a simple script that I completely control.

Any style update is reflected instantly in all the presentations.

## Template Processing

The script reads the individual slides (one per file) and compiles them into a single HTML file using a [Jinja](https://jinja.palletsprojects.com/) template:

```html
<body>
    {% for slide in slides %}
    <section id="{{ slide.id }}" class="slide {{ slide.meta.layout }}-slide">
        <div class="content">
            {% if slide.logo %}<div class="logo"><img src="{{ slide.logo }}" /></div>{% endif %}
            {{ slide.content | safe }}
        </div>
        {% if footer %}<div class="footer">{{ footer }}</div>{% endif %}
        <div class="page_counter">{{ loop.index }} / {{ slides | length }}</div>
    </section>
    {% endfor %}
</body>
</html>
```

Each slide is wrapped in a `<section>` element, with an optional footer and the slide number.

The [CSS styles](https://github.com/dainok/courses/tree/master/Various/Presentations/templates) are linked based on the metadata defined in each slide file.

## Generating the PDF

To compile the final presentation, we combine the Markdown content, the Jinja template, the style sheets and the fonts into a single PDF.

We read each Markdown file and store the content:

```python
md = markdown.Markdown(
    extensions=[
        "markdown.extensions.meta",
        "markdown.extensions.fenced_code",
        "markdown.extensions.codehilite",
        "markdown.extensions.footnotes",
        "markdown.extensions.tables",
        "markdown.extensions.attr_list",
        "markdown.extensions.md_in_html",
        "markdown_captions",
        "pymdownx.tilde",
        "pymdownx.caret",
    ]
)
slide_body = md.convert(md_document)
slide_meta = md.Meta
```

We use Jinja to generate the HTML presentation:

```python
html_document = template.render(
    language=language,
    title=title,
    subtitle=subtitle,
    slides=slides,
    stylesheets=stylesheets,
    footer=footer,
)
with open("presentation.html", "w") as fh:
    fh.write(html_document)
```

We render the final PDF with WeasyPrint:

```python
weasyprint.HTML("presentation.html").write_pdf(
    "../Sample Presentation.pdf",
    stylesheets=stylesheets,
    font_config=font_config,
    presentational_hints=True,
)
```

The output is visually comparable to a PDF generated by PowerPoint, with the advantages of version control, automation and full control over the style. A simple, scriptable workflow has significantly streamlined my slide creation while keeping flexibility and consistency.

![[sample-presentation.png]]

## CI/CD

Once the publishing process is automated, we can integrate it into a CI/CD pipeline where every change or commit triggers a series of checks, followed by the publication.

In a business context, the pipeline could, for example:

* Require confirmation or validation from a third party.
* Notify the stakeholders of a new version of a document.
* Highlight the differences compared to the previous version automatically.

For my personal content, my pipeline includes:

* Checking the structure, integrity and compliance of the YAML files I use to describe each book.
* Checking the structure, integrity and compliance of the style sheets (CSS).
* Checking the structure, integrity and compliance of each Markdown file.
* Checking the spelling in each Markdown file.

These four steps are checked before every commit with [pre-commit](https://pre-commit.com/), and they are also verified server-side after the push, through the CI pipeline.

The script is available in the [GitHub repository](https://github.com/dainok/courses/tree/master/Various/Presentations).
