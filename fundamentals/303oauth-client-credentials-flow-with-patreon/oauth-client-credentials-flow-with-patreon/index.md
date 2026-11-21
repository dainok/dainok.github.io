---
cover: ad
date: 2024-08-26
tags:
- api
- beginner
- fundamentals
- oauth
---
In the [[OAuth Authorization Code flow with Patreon|previous post]], we covered how to implement the Authorization Code flow (3-legged) with the OAuth 2.0 Framework. Now let's look at a practical example of the Client Credentials flow (2-legged).

## Patreon

We keep using Patreon as our platform, building on what we discussed earlier.

First, we register a new application on Patreon. We go to [Clients & API Keys](https://www.patreon.com/portal/registration/register-clients) → Create Client:

* **Name:** `Test API`.
* **Description:** `Testing API via OAuth`.
* **App Category:** `Member Benefits`.
* **Redirect URIs:** `http://localhost:5000/callback`.
* **Client API Version:** `2`.

After we confirm, the client application looks like this:

![[oauth-app-name.png]]

According to the [official documentation](https://docs.patreon.com/#oauth), when we work with the API we can use the **Creator's Access Token**.

Next, we create a simple script that implements the workflow described above:

![[oauth-workflow-2.png]]

In this scenario:

* The script we develop is the **OAuth Client**.
* Patreon is both the **Authorization Server** and the **Resource Server**.

The flow is as follows:

* (1) The server (authorization server) authenticates the script (OAuth client).
* (2) The script can then access the resources (Resource Server).

Authentication in this case is straightforward and relies entirely on a token (the **Creator's Access Token**) obtained during the initial setup. In a real application, these credentials are stored within the application and are not accessible to the user.

In real-world scenarios, the resource server and the authorization server are typically a single entity. If that were not the case, the script would need to send the Client ID and the Client Secret to the authorization server (as discussed in the previous post) to obtain the access token required to access the resources.

As in the previous example, we must include the access token in the HTTP header of every API request:

```python
headers = { "Authorization": f"Bearer {config['access_token']}"}
uri = "https://www.patreon.com/api/oauth2/api/current_user"
req = requests.get(uri, headers=headers)
```

The source code of the script is available in this [GitHub repository](https://github.com/dainok/courses/tree/master/Various/OAuth/2-legged).
