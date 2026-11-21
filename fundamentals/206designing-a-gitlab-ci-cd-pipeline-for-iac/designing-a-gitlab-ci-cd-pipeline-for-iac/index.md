---
cover: gitlab
date: 2026-02-01
tags:
- aci
- advanced
- ci-cd
- cisco
- fundamentals
- git
- gitlab
- iac
title: Designing a GitLab CI/CD pipeline for IaC
---
Our CI/CD process is defined in GitLab by the `.gitlab-ci.yml` file, located in the root of our repository.

As mentioned earlier, a pipeline is triggered on every commit to validate the code. Specifically, it performs the following checks:

* Formatting of all the files (linting).
* Syntax and consistency of our infrastructure files (CSV files).
* Creation of the infrastructure change plan (build and [[Importing NaC objects from Cisco ACI into Terraform|Terraform]] plan).

At this point, the user can create a Merge Request (MR), which is approved after a manual review.

After the approval, a second pipeline is triggered to apply the changes to the infrastructure.

## Check Stage

In the check stage, we build the Python and Poetry environment required for the execution. Then we run the validation tests and build the infrastructure files:

```yaml
validate-data:
  stage: check
  image: python:3.11
  before_script:
    - pip install --no-cache-dir poetry
    - poetry --version
    - poetry config virtualenvs.in-project true
    - poetry install --no-interaction --no-ansi --with dev
    - poetry env info --path
  script:
    - poetry run pre-commit run -a
    - poetry run ./build-nac-data.py
  artifacts:
    paths:
      - nac-data/
      - site-mi/
    expire_in: 1 hour
  rules:
    - if: $CI_COMMIT_BRANCH
```

I usually use pre-commit to run the validation tests. This way, any developer can check the results before committing the code and waiting for the pipeline outcome.

The build phase generates files in the `nac-data` and `site-mi` directories. These two directories are treated as artifacts and made available to the subsequent stages.

## Plan Stage

In the plan stage, the pipeline uses the artifacts created previously and runs Terraform to show the changes that would be applied in production.

```yaml
mi-apic-plan:
  stage: plan
  image:
    name: hashicorp/terraform:1.14.3
    entrypoint: [""]
  variables:
    TF_HTTP_USERNAME: "gitlab-ci-token"
    TF_HTTP_PASSWORD: $CI_JOB_TOKEN
  dependencies:
    - validate-data
  script:
    - cd site-mi
    - terraform init
    - terraform plan -out=tfplan
    - terraform show -no-color tfplan > plan.txt
  artifacts:
    paths:
      - site-mi/.terraform.lock.hcl
      - site-mi/.terraform/
      - site-mi/plan.txt
      - site-mi/tfplan
    expire_in: 1 hour
  rules:
    - if: $CI_COMMIT_BRANCH
```

The Terraform state file is stored in GitLab through the HTTP backend. Access is managed with a user and a token that are always available within the GitLab pipeline. We can see the result under `Operate` → `Terraform states`:

![[gitlab-terraform-states.png]]

## Apply Stage

The final stage runs only on a merge request (a commit on the `main` branch). In this stage, Terraform applies the plan produced in the previous stage.

```yaml
mi-apic-apply:
  stage: apply
  image:
    name: hashicorp/terraform:1.14.3
    entrypoint: [""]
  variables:
    TF_HTTP_USERNAME: "gitlab-ci-token"
    TF_HTTP_PASSWORD: $CI_JOB_TOKEN
  dependencies:
    - mi-apic-plan
    - validate-data
  script:
    - cd site-mi
    - terraform apply -auto-approve tfplan
  # when: manual
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
```

We cannot link the validation pipelines (executed on every commit) with the deployment pipelines (executed on every merge request). The two pipelines are therefore independent and, unfortunately, redundant:

* On every commit, the CI pipeline runs (check and plan stages), so that the code can be integrated into the `main` branch via a merge request.
* On every merge request, the CD pipeline runs (check, plan and apply stages) and applies the configuration to the infrastructure.

In this example, we use the merge as the boundary between validation and application. Other variations are possible, for example by using the `when` option to define additional control points.

## Multiple Infrastructures

In my case, the infrastructure consists of Cisco [[From Single-Site to Multi-Site with NDO|NDO]], Cisco ACI, Cisco Intersight (UCS) and VMware vSphere. The complete pipeline defines plan and apply jobs for each site and for each environment:

```yaml
stages:
  - check
  - plan
  - apply
validate-data:
  stage: check
mi-apic-plan:
  stage: plan
mi-apic-apply:
  stage: apply
mi-vcenter-plan:
  stage: plan
mi-vcenter-apply:
  stage: apply
intersight-plan:
  stage: plan
intersight-apply:
  stage: apply
```

Each commit and merge request executes all eight jobs. Here too, we can optimize by running only the jobs affected by the changes to the infrastructure files.
