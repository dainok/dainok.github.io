---
cover: ad
date: 2024-08-24
tags:
- api
- fundamentals
- intermediate
- oauth
---
In the [[Diving into OAuth 2.0|previous post]], we introduced the OAuth 2.0 Framework. Now let's look at a practical example of the Authorization Code flow (3-legged).

The term "authorization code" refers to the fact that, in this process, we exchange a temporary token (the authorization code) for an access token, which grants us access to the protected resources.

## Patreon Integration

Our example focuses on [Patreon](https://www.patreon.com/), where we want to automate certain tasks using the Patreon API. According to the [documentation](https://docs.patreon.com/#api-endpoints), authentication must be done via OAuth, and the full [procedure](https://docs.patreon.com/#oauth) is described there.

## Registering a New Application

First, we register a new application on Patreon. We go to [Clients & API Keys](https://www.patreon.com/portal/registration/register-clients) → Create Client:

* **Name:** `Test API`.
* **Description:** `Testing API via OAuth`.
* **App Category:** `Member Benefits`.
* **Redirect URIs:** `http://localhost:5000/callback`.
* **Client API Version:** `2`.

After we confirm, the client application looks like this:

![[oauth-app.png]]

## Developing the WebApp

Next, we create a simple WebApp that implements the workflow we discussed:

![[oauth-workflow-1.png]]

In this scenario:

* We act as the **Resource Owner**.
* The WebApp we develop is the **OAuth Client**.
* Patreon is both the **Authorization Server** and the **Resource Server**.

The flow is as follows:

* (1) The user (resource owner) accesses the WebApp (OAuth Client) via a browser.
* (2) The WebApp redirects the user to Patreon (Authorization Server) via a pop-up.
* (3, 4, 5) The user authenticates on Patreon and authorizes the WebApp to access their Patreon data.
* (6) Patreon sends an authorization code to the WebApp through the user.
* (7) The WebApp uses the authorization code to request an access token from Patreon.
* (8) Patreon verifies the authorization code and sends an access token to the WebApp.
* (9, 10) The WebApp uses the access token to access the resources of Patreon.

## Setting Up the WebApp with Flask

We build the WebApp with Flask. It saves all the necessary access data in a `secrets.yml` file. The functions that save and read the configuration look like this:

```python
def save_config():
    config = {
        "client_id": app.config.get("client_id"),
        "client_secret": app.config.get("client_secret"),
        "access_token": app.config.get("access_token"),
    }
    with open("secrets.yml", "w") as fh:
        yaml.dump(config, fh, default_flow_style=False)


def read_config():
    try:
        with open("secrets.yml", "r") as fh:
            config = yaml.safe_load(fh)
    except FileNotFoundError as err:
        config = {}
    app.config.update(
        client_id=config.get("client_id"),
        client_secret=config.get("client_secret"),
        access_token=config.get("access_token"),
    )
```

To start the WebApp, we run:

```bash
flask run
```

We open the browser and go to `http://localhost:5000` to configure the WebApp with the **Client ID** and the **Client Secret** obtained earlier. In a real application, these credentials are stored within the application and are not accessible to the user:

![[webapp-configuration.png]]

After the configuration, we see a link to access Patreon and authorize the WebApp. The [documentation](https://docs.patreon.com/#oauth) specifies that this link must include three parameters, plus two optional ones:

* `response_type`: `code` (the application is starting the authorization code flow).
* `client_id`: the Client ID obtained during the Patreon setup.
* `redirect_uri`: the URL where Patreon sends the authorization code after the user authorizes our WebApp.
* `scope` (optional): the permissions the application requests.
* `state` (optional): a value used as protection against CSRF.

![[oauth-test-webapp.png]]

Once the application is authorized, Patreon redirects the user to the callback URL, passing the authorization code and the state (see above). Since Patreon does not interact directly with the WebApp, we can create internal applications that are not externally accessible.

When the WebApp receives the authorization code from the user, it sends the code to Patreon. Patreon verifies the code and returns an access token to the WebApp. The WebApp sends the following to the Authorization Server:

* `code`: the authorization code received through the redirection of the user.
* `grant_type`: `authorization_code`.
* `client_id`: the Client ID obtained during the Patreon setup.
* `client_secret`: the Client Secret obtained during the Patreon setup.

The WebApp uses the access token it received to access the data of Patreon:

```python
headers = {"Authorization": f"Bearer {app.config['access_token']}"}
uri = "https://www.patreon.com/api/oauth2/api/current_user"
req = requests.get(uri, headers=headers)
```

The source code of the WebApp is available in this [GitHub repository](https://github.com/dainok/courses/tree/master/Various/OAuth/3-legged).
