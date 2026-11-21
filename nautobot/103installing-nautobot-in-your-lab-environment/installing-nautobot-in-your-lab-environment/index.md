---
cover: nautobot
date: 2024-07-10
tags:
- beginner
- lab
- nautobot
---
In this post, we install Nautobot in a lab environment. For a production installation, refer to the [official documentation](https://docs.nautobot.com/projects/core/en/stable/user-guide/administration/installation/). Nautobot requires a Python version between 3.8 and 3.11, so we first check that we have the correct one:

```bash
$ python3 -V
Python 3.11.9
```

Next, we create a dedicated Python environment:

```bash
mkdir /opt/nautobot
python3.11 -m venv /opt/nautobot/venv
source /opt/nautobot/venv/bin/activate
pip install --upgrade pip wheel setuptools
pip install --no-binary=pyuwsgi nautobot
```

We use PostgreSQL as the database. After installing PostgreSQL, we create a dedicated database and user for Nautobot:

```bash
$ psql postgres
create user nautobot with password '<DB_PASSWORD>';
create database nautobot;
grant all privileges on database nautobot to nautobot;
```

We configure Nautobot with the following environment variables:

```bash
export NAUTOBOT_ROOT=/opt/nautobot
export NAUTOBOT_DB_HOST=localhost
export NAUTOBOT_DB_NAME=nautobot
export NAUTOBOT_DB_USER=nautobot
export NAUTOBOT_DB_PASSWORD=<DB_PASSWORD>
export NAUTOBOT_ALLOWED_HOSTS=*
export NAUTOBOT_DEBUG=True
```

We initialize the basic configuration, which is saved to `/opt/nautobot/nautobot_config.py`:

```bash
nautobot-server init
```

We update the database:

```bash
nautobot-server migrate
```

We create the first administrative user:

```bash
nautobot-server createsuperuser
```

Finally, we start the Nautobot server:

```bash
nautobot-server runserver
```

We can now access Nautobot at `http://localhost:8000/` with the credentials of the admin user created earlier.

## Installing a Development Version of Nautobot

As discussed, the feature we need (interface roles) is available in the **next** version of Nautobot. We follow the [official guide](https://docs.nautobot.com/projects/core/en/stable/development/core/getting-started/#post-upgrade-operations) to install it.

First, we activate the Python environment created before:

```bash
cd /opt/nautobot
source venv/bin/activate
```

We uninstall the current version of Nautobot:

```bash
pip uninstall -y nautobot
```

We download the **next** version from [GitHub](https://github.com/nautobot/nautobot/tree/next):

```bash
git clone --depth 1 --branch next https://github.com/nautobot/nautobot
```

We install the version we just downloaded:

```bash
cd nautobot
poetry install
```

We update the database:

```bash
nautobot-server migrate
```

We start Nautobot:

```bash
nautobot-server runserver
```
