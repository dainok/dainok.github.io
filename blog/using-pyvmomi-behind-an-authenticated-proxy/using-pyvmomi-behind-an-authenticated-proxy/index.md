---
cover: vmware
date: 2026-11-20
tags:
- blog
- intermediate
- proxy
- pyvmomi
- vmware
---
Sometimes the only way to reach an ESXi host is through an HTTP proxy that requires authentication. The `pyVmomi` library supports this out of the box, but the parameters are easy to miss.

## Connecting through an authenticated proxy

`SmartConnect` accepts the proxy host and port directly, plus a `customHeaders` dictionary. We use the latter to send the `Proxy-Authorization` header with the proxy credentials, encoded with HTTP Basic authentication.

```python
from pyVim import connect
import ssl
import base64

# Create SSL context (certificate validation disabled, e.g. for lab hosts)
ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE

# Build the Proxy-Authorization header
credentials = (proxy_user + ":" + proxy_password).encode("utf-8")
auth_hash = base64.b64encode(credentials).decode("utf-8")
custom_headers = {"Proxy-Authorization": f"Basic {auth_hash}"}

# Connect to the ESXi server through the proxy
si = connect.SmartConnect(
    host=esxi_host,
    user=esxi_user,
    pwd=esxi_password,
    port=443,
    httpProxyHost=proxy_host,
    httpProxyPort=proxy_port,
    customHeaders=custom_headers,
    sslContext=ssl_context,
)
```

## Notes

* The `Proxy-Authorization` header authenticates you against the proxy, while `user` and `pwd` authenticate you against ESXi: they are two different sets of credentials.
* Disabling certificate verification is acceptable in a lab, but in production you should load the proper CA certificate into the SSL context instead.
* The proxy parameters (`httpProxyHost`, `httpProxyPort`) require a recent version of `pyVmomi`.
