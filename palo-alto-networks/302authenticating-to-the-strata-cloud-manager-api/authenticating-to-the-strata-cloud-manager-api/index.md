---
cover: paloalto-strata
date: 2025-09-07
tags:
- api
- beginner
- palo-alto-networks
- scm
---
According to the [official documentation](https://pan.dev/scm/docs/access-tokens/), before making any API call we must obtain an access token with our `username`, `password` and `tenant service group`.

We can then use the token to authorize the subsequent API requests.

```python
http_username = f"{username}@{tenant_id}.iam.panserviceaccount.com"
basic_auth = HTTPBasicAuth(http_username, password)
data = {
    "grant_type": "client_credentials",
    "scope": f"tsg_id:{tenant_id}",
}
url = "https://auth.apps.paloaltonetworks.com/oauth2/access_token"
req = requests.post(url, auth=basic_auth, headers=headers, data=data)
req.raise_for_status()
token = req.json()["access_token"]
```

Together with the token, the API returns its validity period, **900 seconds** (15 minutes), which we must take into account when designing automations.

The token is a **JSON Web Token (JWT)**, a standardized, encoded JSON object. By [decoding](https://www.jwt.io/) it, we can inspect the claims and the metadata it contains:

![[jwt-decoder.png]]

## Example: Retrieving the List of Registered Devices

As a first example, let's retrieve the list of the devices registered in SCM.

From the [API documentation homepage](https://pan.dev/), we use the search bar to locate the relevant endpoint:

![[scm-api-documentation.png]]

As shown earlier, the first step is to authenticate and generate a token valid for 15 minutes:

```python
# Get token
headers = {
    "Content-Type": "application/x-www-form-urlencoded",
}
http_username = f"{username}@{tenant_id}.iam.panserviceaccount.com"
basic_auth = HTTPBasicAuth(http_username, password)
data = {
    "grant_type": "client_credentials",
    "scope": f"tsg_id:{tenant_id}",
}
url = "https://auth.apps.paloaltonetworks.com/oauth2/access_token"
req = requests.post(url, auth=basic_auth, headers=headers, data=data)
req.raise_for_status()
token = req.json()["access_token"]
```

Next, we use the [list-devices API endpoint](https://pan.dev/scm/api/config/ngfw/setup/list-devices/) to retrieve the inventory:

```python
# Get devices
headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    "Authorization": f"Bearer {token}"
}
req = requests.get("https://api.strata.paloaltonetworks.com/config/setup/v1/devices", headers=headers)
req.raise_for_status()
pprint(req.json())
```

The response contains the list of devices in JSON format:

![[get-device-output.png]]

The full example code is available in the [GitHub repository](https://github.com/dainok/courses/tree/master/Palo%20Alto%20Networks/Strata%20Cloud%20Manager).
