---
cover: hashicorp
date: 2026-11-21
tags:
- blog
- intermediate
- passwords
- security
- vault
---
Secrets in `.bashrc`, in Git, in a text file on the desktop: we all know where this ends. In this post, we will start a local **HashiCorp Vault** server from scratch, initialize it, and store the first secret.

This is a lab setup: a self-signed certificate, file storage and a single node. It is enough to understand how Vault works before using it for real.

## Certificate and configuration

Vault listens on TLS only, so we need a certificate first. A self-signed one is fine for a lab:

```bash
# Create the private key and the signing request
openssl req -new -newkey rsa:2048 -nodes -keyout cert.key -out cert.csr
# Sign the certificate with our own key (valid 10 years)
openssl x509 -req -days 3650 -in cert.csr -signkey cert.key -out cert.crt
```

Then the configuration file, `vault.json`:

```json
{
    "backend": {
      "file": {
        "path": "/vault/file"
      }
    },
    "listener": {
      "tcp":{
        "address": "127.0.0.1:8200",
        "tls_cert_file": "cert.crt",
        "tls_key_file": "cert.key"
      }
    },
    "ui": true
}
```

The data lives in `/vault/file`; the listener is bound to localhost only; the web UI is enabled. Start the server:

```bash
vault server -config vault.json
```

## Initialize and unseal

From another terminal, check the status. Since the certificate is self-signed, we need `-tls-skip-verify` on every command:

```bash
vault status -tls-skip-verify
```

The output says `Initialized false` and `Sealed true`. A new Vault is like a safe that has just been delivered: it exists, but nobody has set the combination yet.

We split the master key in 3 shares, and we require 2 of them to unseal:

```bash
vault operator init -tls-skip-verify -key-shares=3 -key-threshold=2
```

The output contains the **unseal keys** and the **initial root token**. This is the only time Vault shows them: copy them somewhere safe right now. Then unseal, running the command twice and pasting a different key each time:

```bash
vault operator unseal -tls-skip-verify
```

After the second key, `vault status` reports `Sealed false`.

## First secret

Authenticate with the root token and list the secrets engines:

```bash
export VAULT_TOKEN="<initial root token>"
vault secrets list -tls-skip-verify
```

Only the system engines (`cubbyhole/`, `identity/`, `sys/`) are there. Let's enable the Key-Value engine and write a secret:

```bash
vault secrets enable -tls-skip-verify kv
vault write -tls-skip-verify kv/infra value=mypassword
```

Mind the last command: the password ends up in the **shell history**. Put a space in front of the command (with `HISTCONTROL=ignorespace`), or use the file/stdin forms that Vault provides.

## Lesson learned

* **Unseal keys and root token**: shown once, never stored on the same server.
* **Root token**: for the first setup only; day-to-day work needs policies and dedicated tokens.
* **Self-signed certificate**: acceptable in a lab; in production use a certificate your clients trust, and drop `-tls-skip-verify`.

I believe a secrets manager is the first thing to put in place, before the automation that needs it.
