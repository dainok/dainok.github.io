---
cover: cisco
date: 2025-09-03
tags:
- aci
- cisco
- intermediate
---
Before we proceed, we need one more piece of information: how Cisco ACI handles authentication.

The [documentation](https://www.cisco.com/c/en/us/td/docs/switches/datacenter/aci/apic/sw/1-x/api/rest/b_APIC_RESTful_API_User_Guide/performing_common_tasks.html#reference_07235E7E5C624CA2A514D9E0EEEE065F) says that we can authenticate to the APIC with a POST request to `/api/aaaLogin.json`. The body of the request must contain the username and password inside a JSON object:

```text
POST https://192.0.20.123/api/aaaLogin.json

{
  "aaaUser":{
    "attributes":{
      "name":"georgewa",
      "pwd":"paSSword1"
    }
  }
}
```

The response contains, among other things, the session token and its duration:

```text
{
  "imdata":[{
      "aaaLogin":{
        "attributes":{
          "token":"GkZl5NLRZJl5+jqChouaZ9CYjgE58W/pMccR+LeXmdO0obG9NBIwo1VBo7+YC1oiJL9mS6I9qh62BkX+Xddhe0JYrTmSG4JcKZ4t3bcP2Mxy3VBmgoJjwZ76ZOuf9V9AD6Xl83lyoR4bLBzqbSSU1R2NIgUotCGWjZt5JX6CJF0=",
          "refreshTimeoutSeconds":"300",
          "lastName":"Washington",
          "firstName":"George"
        },
```

There are two additional important functions:

* `aaaLogout`: closes the session.
* `aaaRefresh`: extends the duration of the session.

Let's see a first example of login:

```python
url = f"https://{apic_address}/api/aaaLogin.json"
payload = {
    "aaaUser": {
        "attributes": {
            "name": apic_username,
            "pwd": apic_password,
        }
    }
}

session = requests.Session()
res = session.post(url, json=payload, verify=False)
res.raise_for_status()

print("Timeout:", res.json()["imdata"][0]["aaaLogin"]["attributes"]["refreshTimeoutSeconds"])
print("Token:", res.json()["imdata"][0]["aaaLogin"]["attributes"]["token"])
print("Cookies", res.cookies)
```

Subsequent requests must include the token and the session cookies. The `session` object manages the session cookie automatically, while the token must be included in the GET parameter `challenge`:

```python
timeout = res.json()["imdata"][0]["aaaLogin"]["attributes"]["refreshTimeoutSeconds"]
token = res.json()["imdata"][0]["aaaLogin"]["attributes"]["token"]
url = f"https://{apic_address}/api/node/class/fvTenant.json?challenge={token}"
res.raise_for_status()
```

The token must be renewed before it expires, with a POST to `/api/aaaRefresh.json`.

If we use an expired token, the APIC returns an HTTP 403 (Forbidden) error:

```text
{'totalCount': '1', 'imdata': [{'error': {'attributes': {'code': '403', 'text': 'Token was invalid (Error: Token timeout)'}}}]}
```

Ideally, our workflow is the following:

* Authenticate to the APIC.
* Before each API request, check the expiration of the token and renew it if necessary.
* If a request fails, authenticate again and retry the request.

## A Specialized Class

As we did previously, we can write an `APIClient` class that handles authentication, the token, its expiration and each API request automatically.

We already discussed the structure of the class in the article [Optimizing Strata Cloud Manager API usage](Optimizing%20Strata%20Cloud%20Manager%20API%20usage.md).

The full example code is available in the [GitHub repository](https://github.com/dainok/courses/tree/master/Cisco/ACI).
