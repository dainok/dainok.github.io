---
cover: git
date: 2024-09-10
tags:
- fundamentals
- git
- intermediate
---
In the [[Git fundamentals for developers and IT professionals|previous post]], we covered the basics of using Git locally. Now let's move to real-world scenarios and see how to collaborate with Git through remote repositories.

Working with remote repositories gives us some new functionalities:

* `clone`: creates a local copy of a remote repository.
* `pull`: updates our local branch with the changes from the remote.
* `push`: updates the remote branch with our local changes.

Typically, `pull` and `push` are not allowed directly on the main branch. This forces us to always create a new branch for our changes, which we then merge into the main branch.

Moreover, we often do not have permission to create branches on repositories we do not own. In this case, we create a **fork**, which is a copy of the entire repository we want to work on. We can then create a branch on the new repository, make our changes and ask the original repository, through a Pull Request (PR), to merge them.

Let's take it step by step.

## Origin

First, let's clone a repository of our choice:

```bash
$ git clone https://github.com/networktocode/ntc-templates
Cloning into 'ntc-templates'...
remote: Enumerating objects: 20633, done.
remote: Counting objects: 100% (3872/3872), done.
remote: Compressing objects: 100% (1262/1262), done.
remote: Total 20633 (delta 3069), reused 2953 (delta 2607), pack-reused 16761 (from 1)
Receiving objects: 100% (20633/20633), 5.68 MiB | 11.11 MiB/s, done.
Resolving deltas: 100% (11629/11629), done.
```

Once inside the directory, we can check which remote repositories our local repository is linked to:

```bash
$ git remote -v
origin  https://github.com/networktocode/ntc-templates (fetch)
origin  https://github.com/networktocode/ntc-templates (push)
```

`origin` is the default name used when we clone a remote repository. We can specify a different name with the `-o` flag.

## Fork

In network automation, we often need to fix or improve the code of publicly available frameworks, which is the essence of open source. The repository I chose to guide you through Git includes [46 contributions of mine](https://github.com/networktocode/ntc-templates/pulls?q=is%3Apr+author%3Adainok+is%3Amerged) so far, and I am sure many of you will find opportunities to contribute to this project as well.

The [NTC Templates](https://github.com/networktocode/ntc-templates/) repository is not mine, and I cannot write to it directly. What we can do is create a fork of the repository. On GitHub, we visit the repository in a web browser, expand the Fork menu and create a new fork:

![[github-fork.png]]

This creates a copy of the repository under our user account. The copy is independent of the original repository, so any change we make stays separate.

Next, let's clone the repository associated with our user account:

```bash
$ git clone https://github.com/dainok/ntc-templates
Cloning into 'ntc-templates'...
remote: Enumerating objects: 16045, done.
remote: Counting objects: 100% (3368/3368), done.
remote: Compressing objects: 100% (322/322), done.
remote: Total 16045 (delta 3210), reused 3046 (delta 3046), pack-reused 12677 (from 1)
Receiving objects: 100% (16045/16045), 3.95 MiB | 9.51 MiB/s, done.
Resolving deltas: 100% (9387/9387), done.
```

In this repository, we can create a branch and make all the changes we discussed in the previous post. To update our remote repository, we push the changes and, at least the first time, we specify which remote our branch (`test`) is associated with:

```bash
$ git push --set-upstream origin test
Enumerating objects: 4, done.
Counting objects: 100% (4/4), done.
Delta compression using up to 12 threads
Compressing objects: 100% (2/2), done.
Writing objects: 100% (3/3), 273 bytes | 273.00 KiB/s, done.
Total 3 (delta 1), reused 1 (delta 0), pack-reused 0
remote: Resolving deltas: 100% (1/1), completed with 1 local object.
remote:
remote: Create a pull request for 'test' on GitHub by visiting:
remote:      https://github.com/dainok/ntc-templates/pull/new/test
remote:
To https://github.com/dainok/ntc-templates
 * [new branch]      test -> test
branch 'test' set up to track 'origin/test'.
```

We can check which remotes are associated with each branch:

```bash
$ git branch -vv
  master d0f4bff [origin/master] cisco_ios_show_interfaces_switchport: Edge case (#1665)
* test   7c5e49f [origin/test] Just a test
```

Finally, let's add a new remote that also links our local repository to the original repository:

```bash
$ git remote add upstream https://github.com/networktocode/ntc-templates
$ git remote -v
origin  https://github.com/dainok/ntc-templates (fetch)
origin  https://github.com/dainok/ntc-templates (push)
upstream        https://github.com/networktocode/ntc-templates (fetch)
upstream        https://github.com/networktocode/ntc-templates (push)
```

## Fetch

The **fetch** command synchronizes our local repository with the metadata of a remote repository. It does not transfer files, but it lets us check whether there are any changes available.

For example, we can use `fetch` to sync our local repository with the original one (`upstream`):

```bash
$ git fetch upstream
remote: Enumerating objects: 5207, done.
remote: Counting objects: 100% (2208/2208), done.
remote: Compressing objects: 100% (1037/1037), done.
remote: Total 5207 (delta 1490), reused 1514 (delta 1168), pack-reused 2999 (from 1)
Receiving objects: 100% (5207/5207), 1.90 MiB | 8.76 MiB/s, done.
Resolving deltas: 100% (2651/2651), completed with 176 local objects.
From https://github.com/networktocode/ntc-templates
 * [new branch]      asa-show-acl-brief         -> upstream/asa-show-acl-brief
 * [new branch]      asa_show_run_object_network -> upstream/asa_show_run_object_network
 * [new branch]      feature/cisco_xr_l2vpn_mac -> upstream/feature/cisco_xr_l2vpn_mac
```

The branches created in the original repository after the fork are now available locally.

## Branch

As we have seen, our local repository is connected to two remote repositories, and a branch can exist in one or more of them. After the `fetch` command, we can view the branches:

```bash
$ git branch -a
  all
  master
* test
  upstream
  remotes/origin/HEAD -> origin/master
  remotes/origin/add_allied_telesis
  remotes/origin/allied_telesis_show_arp
  remotes/origin/allied_telesis_show_etherchannel_summary
  remotes/origin/allied_telesis_show_interface
```

Remote branches are prefixed with `remotes`. As mentioned in the previous post, we can use `checkout` to switch to a specific remote branch, but this puts us in a detached state, because the branch is not available locally.

If we need to modify a remote branch, we associate it with a local branch (by convention, with the same name):

```bash
localhost:ntc-templates dainese$ git branch add_allied_telesis remotes/origin/add_allied_telesis
branch 'add_allied_telesis' set up to track 'origin/add_allied_telesis'.
```
