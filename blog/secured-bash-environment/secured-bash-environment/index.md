---
cover: linux
date: 2022-08-14
tags:
- blog
- digital-self-defence
- intermediate
- linux
- security
---
I often need to set critical environment variables in Bash (API tokens), and storing them in `.bashrc` is a very bad idea. I found a simple way to keep them in an encrypted file and load it only when necessary:

1. Store the critical variables in `.bash_secure` (each variable must be exported with `export`).
2. Encrypt the file with `gpg -c .bash_secure`.
3. Securely delete the clear text file with `shred -u .bash_secure`.
4. Load the secured environment only when needed with `source <(gpg -q -d ~/.bash_secure.gpg)`.

Do not put the load command in `.bashrc`: commands included there must not produce output.
