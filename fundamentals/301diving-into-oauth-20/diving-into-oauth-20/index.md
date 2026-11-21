---
cover: ad
date: 2024-08-21
tags:
- api
- fundamentals
- intermediate
- oauth
---
In this post, we explore some key concepts of the [OAuth 2.0 Authorization Framework](https://datatracker.ietf.org/doc/html/rfc6749). Understanding OAuth 2.0 is crucial to work with APIs protected by this mechanism. OAuth 2.0 defines four main roles:

* **Resource Owner:** the entity (often a person) that grants access to a protected resource.
* **Resource Server:** the server that hosts the protected resource.
* **Client:** the application that needs to access a protected resource and is authorized by the resource owner.
* **Authorization Server:** the server that issues an access token to the client after the resource owner has authenticated and authorized the access of the client to the protected resource.

From our perspective, the resource server and the authorization server can be a single entity and typically exist within the same security perimeter.

OAuth 2.0 supports various workflows, known as grant types. Four types are defined, but two are the most commonly used:

* **Authorization Code (3-legged):** preferred when the client is a web application running on a server and the resource server is owned by a third party.
* **Client Credentials (2-legged):** necessary for machine-to-machine interactions. In this scenario, the client is also the resource owner, so no user authorization is needed.

## Authorization Code (3-legged)

This is the most common scenario for web applications that need to access third-party data and ask us to authorize that access. Let's consider a practical example: logging into LinkedIn with a Google account.

We start by opening a clean browser and logging into [Google](https://www.google.com/), then we access [LinkedIn](https://www.linkedin.com/) via Google. Google asks us to authorize LinkedIn to access our Google data (name, email, profile picture):

![[oauth-linkedin-confirmation.png]]

This [diagram](https://www.ibm.com/docs/en/datapower-gateway/10.6.0?topic=flows-three-legged-oauth-flow) shows what happens behind the scenes:

![[3-legged-oauth.png]]

* (1) The user (resource owner) wants to access LinkedIn (OAuth Client) via the browser.
* (2) LinkedIn redirects the user to Google (Authorization Server) via the pop-up, passing the `client_id` parameter that identifies LinkedIn as an application registered with Google.
* (3, 4, 5) The user opens the Google pop-up, authenticates and authorizes LinkedIn to access their Google data.
* (6) Through the user, Google sends an authorization code to LinkedIn.
* (7) LinkedIn uses the authorization code to request an access token from Google.
* (8) Google verifies the authorization code and sends an access token to LinkedIn.
* (9, 10) LinkedIn uses the access token to access the resources of Google.

Remember that, in real-world scenarios, the resource server and the authorization server are usually a single entity.

## Client Credentials (2-legged)

This approach is used for machine-to-machine communication via APIs. In this case, there is no resource owner: the client can act as the resource owner, or it can be considered trustworthy based on the credentials it uses. No user authorization is required.

This [diagram](https://www.ibm.com/docs/en/datapower-gateway/10.6.0?topic=flows-two-legged-oauth-flow) shows how it works:

![[2-legged-oauth.png]]

* (1) The application (client) requests an access token from the authorization server.
* (1) The server (authorization server) verifies the credentials of the application and issues an access token.
* (2) The application uses the access token to access the resources.

Again, in real-world scenarios, the resource server and the authorization server are typically a single entity.

## Further Reading

For more technical details on the OAuth 2.0 Framework, see the following links:

* [The OAuth 2.0 Authorization Framework](https://datatracker.ietf.org/doc/html/rfc6749): the official specification of the OAuth 2.0 Framework (RFC 6749).
* [Diagrams And Movies Of All The OAuth 2.0 Flows](https://darutk.medium.com/diagrams-and-movies-of-all-the-oauth-2-0-flows-194f3c3ade85): Takahiko Kawasaki created excellent diagrams for all four workflows.
* [OAuth Flows](https://www.ibm.com/docs/en/datapower-gateway/10.6.0?topic=support-oauth-flows): the documentation of IBM DataPower Gateway gives a great overview of the OAuth 2.0 Framework. It includes the two diagrams used above, which are very well done.
