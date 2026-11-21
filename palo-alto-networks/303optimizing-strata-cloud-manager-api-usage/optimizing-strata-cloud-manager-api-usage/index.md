---
cover: paloalto-strata
date: 2025-09-14
tags:
- advanced
- api
- palo-alto-networks
- scm
---
Before moving forward, let's review our current approach to invoking the API:

* We use the `requests` library.
* We must first generate an authentication token.
* Many parameters are passed repeatedly in multiple calls.
* We must verify whether the token has expired.

We can improve this workflow by creating a lightweight extension of the `requests` library.

The extension should handle the token management automatically, including the renewal when needed.

It is also useful to centralize the handling of headers and URLs, to keep the code clean and concise.

## Implementing a Custom API Client

To achieve this, we create a new class called `APIClient`:

```python
class APIClient(requests.Session):
    """APIClient is a specialized HTTP client for interacting with the Palo Alto Networks API."""

    def __init__(self, tenant_id: int, username: str, password: str) -> None:
        """Initialize the APIClient and perform the first authentication."""

        # Initialize the parent requests.Session
        super().__init__()

        # Authentication endpoint for Palo Alto Networks
        self.auth_url = "https://auth.apps.paloaltonetworks.com/oauth2/access_token"

        # Store credentials and tenant information
        self.tenant_id = tenant_id
        self.username = username
        self.__password = password

        # Will hold the Bearer token once authenticated
        self.__token = None

        # Perform the initial authentication right away
        self.__authenticate()
```

The class must handle the following:

* **TSG ID** (also called *tenant ID*).
* **Username.**
* **Password.**
* **Token**, including the generation and renewal logic.

The authentication URL is always the same, so we can define it directly in the code.

When an `APIClient` object is initialized, the authentication process starts:

```python
    def __authenticate(self) -> None:
        """Authenticate with the Palo Alto endpoint and store the Bearer token."""

        # Build HTTP Basic Auth
        basic_auth = HTTPBasicAuth(
            f"{self.username}@{self.tenant_id}.iam.panserviceaccount.com",
            self.__password,
        )

        # Headers for the token request
        headers = {
            "Content-Type": "application/x-www-form-urlencoded",
        }

        # Body parameters for client credentials grant
        data = {
            "grant_type": "client_credentials",
            "scope": f"tsg_id:{self.tenant_id}",
        }

        # Send the POST request to the auth server
        req = requests.post(self.auth_url, auth=basic_auth, headers=headers, data=data)
        req.raise_for_status()

        # Save the access token for later requests
        self.__token = req.json()["access_token"]
```

As seen earlier, the authentication method calls a specific API to obtain a token and stores it for later use.

## Overriding Requests for SCM

To integrate with SCM, we override the `request` method of our client and add the required logic:

```python
    def request(self, method: str, url: str, **kwargs) -> Response:
        """Send an HTTP request with automatic Bearer token handling."""

        # Ensure the headers dictionary exists
        if "headers" not in kwargs:
            kwargs["headers"] = {}

        # Add Authorization header with the current Bearer token
        kwargs["headers"]["Authorization"] = f"Bearer {self.__token}"

        # Accept JSON responses by default
        kwargs["headers"]["Accept"] = "application/json"

        # For POST/PUT requests, set Content-Type to application/json
        if method.lower() in ["post", "put"]:
            kwargs["headers"]["Content-Type"] = "application/json"

        # If the given URL is just a path, prefix it with the API base URL
        if url.startswith("/"):
            url = f"https://api.strata.paloaltonetworks.com{url}"

        # Execute the request
        req = super().request(method, url, **kwargs)

        # Retry once if token expired
        if req.status_code == 401 and req.json()["message"] == "Invalid Request Token.":
            # Token expired
            self.__authenticate()
            # Retry once
            kwargs["headers"]["Authorization"] = f"Bearer {self.__token}"
            req = super().request(method, url, **kwargs)

        return req
```

The key logic is at the end:

* The request is executed.
* If the token has expired, the client authenticates again and retries the request.

## Additional Optimizations

This approach streamlines our work because it:

* Injects the token into every request automatically.
* Generates the headers dynamically and adapts them when we send payload data.
* Builds the request URL with the FQDN if it is not already included.

With this improvement, we can rewrite the previous device-listing example with the new client:

```python
client = APIClient(
    tenant_id=tenant_id,
    username=username,
    password=password,
)
req = client.get("/config/setup/v1/devices")
req.raise_for_status()
pprint(req.json())
```

The result: we cut the code roughly in half, which makes it cleaner and easier to maintain.

The full example code is available in the [GitHub repository](https://github.com/dainok/courses/tree/master/Palo%20Alto%20Networks/Strata%20Cloud%20Manager).
