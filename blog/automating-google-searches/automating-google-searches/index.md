---
cover: ad
date: 2022-07-17
tags:
- beginner
- blog
- osint
---
I usually do not write about OSINT techniques, because I think we should talk about ethics and respect before approaching OSINT. Some OSINT automation techniques are harmless, though: if you do not know what to search for, you will not get anything, whether you automate or not.

## Google Dorks

We probably know Google Dorks already: in short, they are parameters that reduce the results. There are a lot of them, but I usually use:

* `intitle`: limits the search to pages that contain a specific pattern in the title (HTML tag).
* `inurl`: limits the search to URLs that contain a specific pattern.
* `site`: limits the search to a specific domain or TLD.
* `filetype`: limits the search to a specific file type.

For example, `site:adainese.it filetype:pdf` displays all the PDF files included in my website.

Be aware that you should also check my [robots.txt](https://www.adainese.it/robots.txt "robots.txt").

## Manual Google Searches

If you run many Google searches in a short timeframe, you will see that Google tries to interrupt you, especially if you are not authenticated.

During an OSINT analysis, however, you probably have a set of requests that you want to run on each target.

Finally, the standard Google output is probably not the most usable data format in the world.

## SerpApi

We use SerpApi, which executes each request, solving CAPTCHAs when possible, and parses (web scraping) the Google result into JSON. SerpApi supports Google Search, Maps, Jobs, Product, PlayStore, YouTube... and also DuckDuckGo, Yandex, eBay, Yahoo...

We need to create an account, which includes 100 free requests per month.

## Automating Google Searches

Let's try to automate the search mentioned before: `site:adainese.it filetype:pdf`.

We can approach the problem with the REST API directly or with the Python module. Let's see both:

```bash
wget -q -O- "https://serpapi.com/search.json?engine=google&q=site%3Aadainese.it+filetype%3Apdf&api_key=<SERPAPI_API_KEY>" | jq
{
  "search_metadata": {
    "id": "62cc1d3fe93ff4ebb8b22f80",
    "status": "Success",
    "json_endpoint": "https://serpapi.com/searches/c6980a3075b990cb/62cc1d3fe93ff4ebb8b22f80.json",
    "created_at": "2022-07-11 12:53:19 UTC",
    "processed_at": "2022-07-11 12:53:19 UTC",
    "google_url": "https://www.google.com/search?q=site%3Aadainese.it+filetype%3Apdf&oq=site%3Aadainese.it+filetype%3Apdf&sourceid=chrome&ie=UTF-8",
    "raw_html_file": "https://serpapi.com/searches/c6980a3075b990cb/62cc1d3fe93ff4ebb8b22f80.html",
    "total_time_taken": 4.62
  },
  "search_parameters": {
    "engine": "google",
    "q": "site:adainese.it filetype:pdf",
    "google_domain": "google.com",
    "device": "desktop"
  },
  "search_information": {
    "organic_results_state": "Results for exact spelling",
    "query_displayed": "site:adainese.it filetype:pdf",
    "total_results": 8,
    "time_taken_displayed": 0.22
  },
  "organic_results": [
    {
      "position": 1,
      "title": "PoC Cyber Range Platform - Andrea Dainese",
      "link": "https://www.adainese.it/files/slides/20200922-cyberrange.pdf",
      "displayed_link": "https://www.adainese.it › 20200922-cyberrange",
      "date": "Sep 22, 2020",
      "snippet": "Rosario is a Cybersecurity professional with around 20 years of experience. Rosario is the. South Europe Cyberbit Sales Engineer and.",
      "about_this_result": {
        "source": {
          "description": "adainese.it was first indexed by Google in January 2021"
        },
        "languages": [
          "English"
        ],
        "regions": [
          "the United States"
        ]
      },
      "about_page_link": "https://www.google.com/search?q=About+https://www.adainese.it/files/slides/20200922-cyberrange.pdf&tbm=ilp&ilps=ADNMCi11pvVrwLJY0LqGhLcTwhibCc9pIw",
      "cached_page_link": "https://webcache.googleusercontent.com/search?q=cache:EhJFMGqqonQJ:https://www.adainese.it/files/slides/20200922-cyberrange.pdf+&cd=1&hl=en&ct=clnk&gl=us"
    },
[...]
```

That is good, but we can do better with a script. Maybe we want to download all the PDF files included in the result. First, we install the Python module:

```bash
pip3 install google-search-results
```

Finally, we customize the following script:

```python
#!/usr/bin/env python3
import os
import json
import requests
from serpapi import GoogleSearch

params = {
    'engine': 'google',
    'q': 'site:adainese.it filetype:pdf',
    'api_key': '<SERPAPI_API_KEY>'
}

search = GoogleSearch(params)
result = search.get_json()

with open('search_result.json', 'w') as outfile:
    json.dump(result, outfile)

for organic_result in result['organic_results']:
    link = organic_result['link']
    filename = os.path.basename(link)
    r = requests.get(link, allow_redirects=True)
    open(filename, 'wb').write(r.content)
```

We get the JSON (for future reference) and all the PDF files downloaded in the current directory.

You probably know that acting this way is pretty noisy. You should evaluate countermeasures to stay hidden.
