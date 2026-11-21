---
cover: git
date: 2024-09-25
tags:
- advanced
- fundamentals
- git
- ntc-templates
---
Let's finally see how to contribute to an open-source project. We use the NTC Templates project as a practical example: I have already developed [46 patches](https://github.com/networktocode/ntc-templates/pulls?q=is%3Apr+author%3Adainok+is%3Amerged) for it.

Let's assume we have already made the necessary changes and we now want to propose them for official inclusion in the [NTC Templates](https://github.com/networktocode/ntc-templates) repository.

## Configure Git

We configure the mandatory Git options:

```bash
git config --global user.email "andrea.dainese@pm.me"
git config --global user.name "Andrea Dainese"
```

## Fork, Clone, Update and Merge the Latest Changes

We fork the [NTC Templates GitHub repository](https://github.com/networktocode/ntc-templates) via the web and clone the fork locally:

```bash
git clone https://github.com/dainok/ntc-templates
```

We add the original upstream:

```bash
git remote add upstream https://github.com/networktocode/ntc-templates
```

If the repository is already present, we can either update it or recreate it. We covered both options in the previous posts.

## Make Changes

Our changes must be contained in a specific branch:

```bash
git checkout -b fix_for_old_hp_procurve
```

The NTC Templates project requires each template to be accompanied by a series of validation tests, which prevent regression errors. A regression error is caused by a patch that breaks something that previously worked. To avoid this, each template must include the input files and the expected output.

Our patch therefore includes:

* The template: `ntc_templates/templates/hp_procurve_show_mac-address.textfsm`.
* The raw output: `tests/hp_procurve/show_mac-address/hp_procurve_show_mac-address2.raw`.
* The parsed output: `tests/hp_procurve/show_mac-address/hp_procurve_show_mac-address2.yml`.

## Testing

I always prefer to run a series of tests locally: it is faster and avoids using unnecessary external resources.

We prepare a Python virtual environment:

```bash
sudo apt-get install python3-venv python3-pip
python3 -m venv .venv
source .venv/bin/activate
pip install tox textfsm ntc_templates pyyaml
```

When I develop or modify a template, I always create a small script that performs a quick functionality test. The script takes the input file and returns the result after processing it with the [[Parsing text with TextFSM|TextFSM]] engine:

```python
#!/usr/bin/env python3

import textfsm
import pprint

template_file = "ntc_templates/templates/hp_procurve_show_mac-address.textfsm"
raw_output_file = "tests/hp_procurve/show_mac-address/hp_procurve_show_mac-address2.raw"

with open(template_file) as fd_t, open(raw_output_file) as fd_o:
    re_table = textfsm.TextFSM(fd_t)
    parsed_header = re_table.header
    parsed_output = re_table.ParseText(fd_o.read())

pprint.pprint(parsed_header)
pprint.pprint(parsed_output)
```

Or we can use the NTC Templates libraries:

```python
#!/usr/bin/env python3

import pprint
from ntc_templates.parse import parse_output

platform = "hp_procurve"
command = "show mac-address"
raw_output_file = "tests/hp_procurve/show_mac-address/hp_procurve_show_mac-address2.raw"

data = open(raw_output_file, "r").read()
parsed_output = parse_output(platform=platform, command=command, data=data)

pprint.pprint(parsed_output)
```

Both scripts are available in the [GitHub repository](https://github.com/dainok/courses/tree/master/Git).

NTC Templates currently uses `poetry` to run the tests in the CI/CD pipeline. To run the same tests, we install `poetry` and run them:

```bash
curl -sSL https://install.python-poetry.org | python3 -
poetry install
poetry run pytest
```

All the tests must pass before we proceed.

![[ntc-templates-tests.png]]

## Commit and Pull Request

We add the files, commit and create the pull request to the original repository.

The CI/CD pipeline runs and, if all the tests complete successfully, the patch is soon included in the official repository.

You can see one of the [PRs](https://github.com/networktocode/ntc-templates/pull/1049) that have already been approved.
