---
cover: gitlab
date: 2026-01-25
tags:
- aci
- advanced
- ci-cd
- cisco
- fundamentals
- git
- gitlab
- iac
---
GitLab has become the de facto standard for managing the software lifecycle within enterprises. It offers a huge number of features and adapts to almost any requirement, which makes it a broad and complex piece of software. For automation, we use GitLab as the foundation to provision our infrastructure as code (IaC).

In the series of posts about Cisco [[From Single-Site to Multi-Site with NDO|NDO]] and Cisco ACI, we saw how [[Managing a brownfield Cisco ACI fabric with NaC and Terraform|NaC]] (Network as Code) lets us configure our fabric in an IaC model. We also saw how an additional parser implements input data validation and defines configurations starting from simplified data structures designed for our infrastructure.

The next step is to move the validation, build and configuration process into a CI/CD pipeline, where:

* Continuous Integration (CI): change requests are validated before they become part of the infrastructure configuration.
* Continuous Deployment (CD): after approval by an authorized operator, the configurations are pushed to the production devices.

The entire system is not limited to Cisco NDO and ACI environments. It can be extended to any ecosystem that can be configured programmatically, in particular with [[Importing NaC objects from Cisco ACI into Terraform|Terraform]]. In this specific case, I implemented a pipeline that configures Cisco NDO, Cisco ACI, Cisco Intersight and VMware vSphere environments.

## Installing GitLab

I installed [GitLab](https://about.gitlab.com/) Community Edition on an Ubuntu Linux 24.04 VM:

```bash
curl -s https://packages.gitlab.com/install/repositories/gitlab/gitlab-ce/script.deb.sh | bash
```

At the end of the installation, we can log in as the `root` user with the password contained in the file `/etc/gitlab/initial_root_password`.

Before using GitLab, we may need to set the URL in the `/etc/gitlab/gitlab.rb` file:

```text
external_url 'http://172.24.9.183:8060/'
```

At this point, we can validate and apply the configuration:

```bash
gitlab-ctl check-config
gitlab-ctl deploy-page
gitlab-ctl reconfigure
```

## Creating a Repository

We now need a repository that contains the source code and manages the CI/CD process. We can create a new repository through the Web UI and upload the code we have already developed via the CLI:

![[gitlab-repository.png]]

The CI/CD process we designed works only if a Merge Request (MR) is created for every change. In other words, users work on a copy of the code, which is integrated into the main branch (`main`) only after all the tests have completed successfully. It sounds more complicated than it actually is.

We must protect the repository so that direct changes to the `main` branch are not allowed. To do this, we go to `Settings` → `Repository` → `Branch rules` and protect the `main` branch:

![[gitlab-branch-rules.png]]

We also need to make sure that only working code is merged into the `main` branch. In `Settings` → `Merge requests`, we require the related pipeline to complete successfully before a merge is allowed:

![[gitlab-merge-requests-settings.png]]

## Credential Management

The process we created earlier was designed to use a local directory, so we need to adapt it to run within a CI/CD pipeline.

In particular, credentials can no longer be stored in clear text: they must be loaded as environment variables.

In `Settings` → `CI/CD` → `Variables`, we can insert all the required variables. In this case, we have six credentials (Intersight, APIC, vCenter):

![[gitlab-credentials.png]]

The variables are not marked as protected, because we want to use them even in the pipelines triggered by each commit. Assuming that only authorized users have access to this repository, the risk is acceptable.

The environment variables can then be read as follows:

```hcl
provider "aci" {
  url      = var.url
  username = var.MI_USERNAME
  password = var.MI_PASSWORD
  insecure = var.insecure
}
```

## Terraform State File

The second important change to our build process concerns the Terraform state file. The `tfstate` files can no longer be stored inside the same repository: they must be stored independently, and only one pipeline at a time can run.

GitLab can store the `tfstate` files itself. We only need to configure Terraform to use the HTTP backend:

```hcl
terraform {
  backend "http" {
    address        = "http://172.24.9.183:8060/api/v4/projects/1/terraform/state/site-mi"
    lock_address   = "http://172.24.9.183:8060/api/v4/projects/1/terraform/state/site-mi/lock"
    unlock_address = "http://172.24.9.183:8060/api/v4/projects/1/terraform/state/site-mi/lock"
    lock_method    = "POST"
    unlock_method  = "DELETE"
  }
}
```

By default, Terraform would use the `LOCK` method, which GitLab does not support. This configuration instructs Terraform to use the `POST` method on a specific lock file.

To configure the backend correctly, we need the project ID. We go to `Settings` → `General` → `Naming, description, topics` and read the ID associated with our repository:

![[gitlab-naming-description-topics.png]]

Once the backend is configured, we instruct Terraform to upload the local `tfstate` to the backend:

```bash
terraform init -reconfigure
```

## GitLab Runner

The final step is to add one or more runners. A GitLab runner lets GitLab execute the operations described in a CI/CD pipeline.

We go to `Settings` → `CI/CD` → `Runners` → `Project runners` → `Show runner installation and registration instructions`:

![[gitlab-runners.png]]

We copy the command used to register a runner.

Then we connect to the GitLab VM via SSH, install Docker and install the runner:

```bash
curl -L "https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh" | sudo bash
sudo apt install gitlab-runner -y
```

Finally, we register the runner with the command we copied earlier:

```bash
sudo gitlab-runner register --url http://172.24.9.183:8060/ --registration-token <REGISTRATION_TOKEN>
```

When prompted, we enter the executor (`docker`) and the default Docker image (`alpine:latest`).
