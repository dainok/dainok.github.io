---
cover: self-defence
date: 2026-06-07
tags:
- advanced
- cisco
- digital-self-defence
- docker
- fundamentals
---
For quite some time, I have been following with growing concern the evolution of the attacks that target open-source libraries, designed to compromise the software supply chain. The concept is straightforward: some libraries, developed and maintained by individuals or small teams, are distributed across millions of systems worldwide. Compromising one of these libraries means gaining control over an enormous network of machines.

The most notorious attack of this kind involved the **XZ Utils library (2024)**. Its specific characteristics strongly suggest that it was state-sponsored. Fortunately, it was intercepted in its early stages, because the potential impact would have been catastrophic.

Other notable attacks of the same nature targeted **PyTorch (2022)**, **Colors and Faker (2022)** and **Axios (2026)**.

The latest incident, the Axios compromise, finally convinced me to change my development workflow fundamentally. Today, there is no reliable way to know whether the libraries we use, directly or transitively, contain malicious code. By the time we find out, it will be too late.

In my work, I often develop software integrations for multiple clients in parallel. If I used a compromised library in any one project, my machine would be compromised, and with it every client integration I am working on.

Given the increasing frequency of these events, and what I believe lies ahead, I concluded that the risk was no longer acceptable. I needed to change my approach.

## Sandboxing (macOS)

Coming from the Linux world, I have a strong appreciation for [Firejail](https://en.wikipedia.org/wiki/Firejail): it is simple to configure, easy to use and a solid model to follow when looking for an equivalent on macOS, my current platform.

Few people know that macOS includes a native sandbox. It is poorly documented and its long-term support is uncertain, but it exists, and in my opinion it is here to stay. On first read, it reminded me a lot of Firejail, so it became my first candidate.

The appeal of a native sandbox was clear: it would let me stay on my existing operating system without introducing additional infrastructure layers (which we explore later).

To use the sandbox, we need to create a profile: a configuration file that defines what is and is not permitted. Here is a basic example:

```text
(version 1)
(allow default)

(deny network*)

(allow file-read-metadata
    (regex "^/Users/[^/]")
)

(deny file-read*
    (regex "^/Users/")
)
(allow file-read*
    (regex "^/dev")
    (regex "^/private")
    (regex "^/usr/bin")
    (regex "^/Users/[^/]+/.cache/pre-commit")
    (regex "^/Users/[^/]+/.ansible")
    (regex "^/Users/[^/]+/.gitconfig")
    (regex "^/Users/[^/]+/.ssh/known_hosts")
    (regex "^/Users/[^/]+/.terraform.d")
    (regex "^/Users/[^/]+/src/")
)
```

The profile starts by inheriting the sandbox defaults, then extends them as needed. In this example, I allow the sandbox to read the metadata of the entire `Users` directory, but I restrict access to the file contents to specific subdirectories.

One limitation becomes apparent immediately: to avoid creating a separate profile for every development environment, I would need a generalized profile, but that means broader permissions, which defeats the purpose.

We can configure the write permissions in a similar way:

```text
(deny file-write*)
(allow file-write*
    (regex "^/dev")
    (regex "^/private")
    (regex "^/Users/[^/]+/.cache/pre-commit")
    (regex "^/Users/[^/]+/.terraform.d")
    (regex "^/Users/[^/]+/src/")
)
```

All malware needs outbound network access to function. My profile therefore disables networking entirely.

This makes many essential tools unusable, including package managers like `pip` and `poetry`. To address this, I created a second profile, identical to the first with one addition:

```text
(allow network*)
```

With the profiles in place, we can execute a command inside the sandbox with:

```bash
sandbox-exec -f .profile.sb bash
```

```bash
$ sandbox-exec -f /Users/dainese/src/personal/template/.profile.sb bash

The default interactive shell is now zsh.
To update your account to use zsh, please run `chsh -s /bin/zsh`.
For more details, please visit https://support.apple.com/kb/HT208050.
localhost:~ dainese$ ls /Users/dainese/
ls: /Users/dainese/: Operation not permitted
```

The shell runs inside the sandbox and cannot execute operations that the host system would otherwise permit.

For convenience, I defined two shell aliases:

* `sb` launches a sandbox with the no-network profile.
* `sbn` launches a sandbox with the network-enabled profile.

```bash
alias sb='sandbox-exec -f /Users/dainese/src/personal/template/.profile.sb'
alias sbn='sandbox-exec -f /Users/dainese/src/personal/template/.profile-w-network.sb'
```

The final piece is **logging**. To understand what the sandbox blocks, and refine the profile accordingly, we can stream the sandbox events in real time with the `log` utility:

```bash
log stream --style compact --predicate 'sender=="Sandbox" && eventMessage CONTAINS[c] "python"'
```

```bash
$ log stream --style compact --predicate 'sender=="Sandbox" && eventMessage CONTAINS[c] "python"'
Filtering the log data using "sender == "Sandbox" AND composedMessage CONTAINS[c] "python""
Timestamp               Ty Process[PID:TID]
2026-06-06 09:39:19.294 E  kernel[0:59ffbf] (Sandbox) Sandbox: python3.12(49222) deny(1) file-read-data /Users/dainese
```

In this case, the sandbox reports that the running process is trying to access `/Users/dainese`.

After several weeks of use, I concluded that the sandbox was not the right approach. I had to add too many exceptions to avoid impacting project timelines, and every exception was a potential vulnerability. I needed a more flexible solution, better aligned with my actual workflow.

## From Sandbox to Containers

My IDE of choice is **Visual Studio Code**. VS Code has native Docker integration, which lets us run the entire development and testing lifecycle inside containers. I spent several days evaluating this feature, but I discarded it: the setup felt unnecessarily complex and, critically, it required per-project customization.

To be more precise: in my day-to-day work, the scope of what I develop varies enormously. It can range from complex integrations involving multiple heterogeneous environments (Python, [[Importing NaC objects from Cisco ACI into Terraform|Terraform]], external services) to simple throwaway scripts written in under an hour and never touched again.

Both scenarios require external libraries, and both must be handled without significant overhead. I cannot spend an hour configuring an environment for a task that takes thirty minutes.

So I returned to containers, via Docker. I had avoided this solution on macOS because execution is not native (due to the processor architecture) and it requires a virtual machine as the Docker host. As it turns out, this constraint is an advantage: compared to a native Linux environment, it adds an isolation layer between macOS and the container.

The question was how flexible Docker on macOS is in practice.

## Containers via Docker Desktop

The standard solution for running Docker on macOS is **Docker Desktop**: essentially a management interface for the virtual machine that acts as the Docker host, plus image and container management.

The first step is to define which local macOS directories the containers can see. We configure it under `Settings` → `Resources` → `File Sharing` → `Virtual File Shares`.

![[docker-desktop.png]]

In my setup, all the source code lives under a single root directory (`src`), organized into subdirectories: `personal`, `3rd-party` (external collaborative projects) and `nts` (company projects).

The next step is building a base image that includes everything needed for development. I wrote a simple Dockerfile that defines the build steps:

```dockerfile
FROM python:3.12-slim

ENV POETRY_HOME="/opt/poetry"
ENV POETRY_NO_INTERACTION=1
ENV POETRY_VERSION=2.3.4
ENV POETRY_VIRTUALENVS_IN_PROJECT=true
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PRE_COMMIT_HOME=/src/.cache/pre-commit

ENV PATH="$POETRY_HOME/bin:$PATH"

RUN apt-get update && apt-get install -y --no-install-recommends curl git libatomic1 make openssh-client tree && curl -sSL https://install.python-poetry.org | python3 - && rm -rf /var/lib/apt/lists/*

# Non-root user for security
RUN useradd -m dev
USER dev

# Add relaxed SSH client config
RUN mkdir -p /home/dev/.ssh && chmod 700 /home/dev/.ssh
COPY --chown=dev:dev ssh_config /home/dev/.ssh/config
RUN chmod 600 /home/dev/.ssh/config

WORKDIR /src
```

The key decisions in the image are:

* The base image is [Python](https://hub.docker.com/_/python) 3.12-slim.
* The environment variables are common to all my projects.
* It includes development utility packages.
* It has a non-root user with a relaxed SSH configuration.

Some of my integrations target legacy devices, so I occasionally need a weakened SSH configuration to keep compatibility:

```text
KexAlgorithms +diffie-hellman-group-exchange-sha1,diffie-hellman-group14-sha1
HostKeyAlgorithms +ssh-rsa
Ciphers +aes128-ctr,aes192-ctr,aes256-ctr
MACs hmac-sha1,hmac-sha1-96

Host *
  ServerAliveInterval 5
  ServerAliveCountMax 3
  ForwardAgent yes
```

We build the image with:

```bash
docker build --no-cache -t python-dev .
```

Once the build is complete, we start a container with:

```bash
docker run -ti --rm -u dev python-dev:latest bash
```

At this point, all the pieces are in place. Let's put them together.

## Practical Examples

My four core use cases are:

* Running a one-off command.
* Getting an interactive shell inside a container for multi-step operations, optionally chaining the output.
* Running a long-lived server process (e.g., Django) in the same way.
* Opening additional shells inside an already running container for cross-validation.

In all four cases, I need:

* Access to the macOS filesystem, where Visual Studio Code runs.
* A persistent environment (Python venv, Poetry, pre-commit) that does not need to be rebuilt from scratch each time.

We can launch a container with a mapped local directory as follows:

```bash
docker run -ti --rm -v .:/src -w /src -u dev python-dev:latest bash
```

The flags are:

* `--rm` removes the container immediately after exit, which guarantees a clean state every time.
* `-v .:/src` mounts the current macOS directory as `/src` inside the container, and `-w /src` sets it as the working directory.
* `-u dev` runs the container as the non-root `dev` user.
* `-t` and `-i` allocate a TTY and keep stdin open, so the container shell feels local.

To expose a TCP port, we use the `-p` flag to map a local port to the container.

### Use Case 1: One-Off Command

We navigate to the project directory and run:

```bash
docker run -ti --rm -v .:/src -w /src -u dev python-dev:latest poetry run ./build.py
```

The build script runs through Poetry inside the container. The container is destroyed immediately afterward.

### Use Case 2: Interactive Shell

We navigate to the project directory and run:

```bash
docker run -ti --rm -v .:/src -w /src -u dev python-dev:latest bash
```

From here, we can work continuously inside the container:

![[poetry-run.png]]

### Use Case 3: Server Process

We navigate to the project directory and run:

```bash
docker run -ti --rm -v .:/src -w /src -u dev -p 8000:8000 python-dev:latest bash
```

Port 8000 of the container is now reachable on port 8000 of macOS:

![[django-runserver.png]]

### Use Case 4: Additional Shell in an Existing Container

We retrieve the container ID from `docker ps` and run:

```bash
docker exec -ti 172d5701bbc6 bash
```

Any environment that requires persistence must write to `/src`, the only persistent directory. The code written there is saved on the macOS filesystem, but macOS never executes it directly. Python virtual environments, pip and Poetry are installed and run by the Linux container: they are not macOS-executable binaries. All dependencies and packages are scoped entirely to the container.

This approach covers 100% of my current use cases. It isolates the development environment of each project and keeps my macOS system clean of packages whose origin I cannot verify or control.

## Extensions, Libraries and Plugins

Some residual attack surface remains. In my case: **Visual Studio Code extensions**, **browser extensions** and a small number of **Homebrew packages**.

I have been operating under a **zero-trust** philosophy for some time. I install only the strictly necessary extensions, sourced exclusively from verified, reputable vendors. I keep browser extensions to an absolute minimum and install them only in a dedicated browser that has no access to credentials. I use a separate browser for security-sensitive tasks, and another for general browsing and anonymous research.

I use third-party software sparingly, only when essential and when containerization is not viable.

We cannot eliminate the risk of running malicious software inadvertently. With this setup, however, the attack surface is dramatically reduced.
