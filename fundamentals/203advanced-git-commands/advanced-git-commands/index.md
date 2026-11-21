---
cover: git
date: 2024-09-19
tags:
- advanced
- fundamentals
- git
---
In the last two posts, we covered most of the essential Git features. Let's now look at some additional functionalities that may come in handy.

## .gitignore

The `.gitignore` file specifies which files or directories must never be included in a Git repository. It is tailored to each repository and typically excludes:

* Cache files.
* Compiled files.
* Temporary files.
* Password files.

We can start from [GitHub's suggested templates](https://github.com/github/gitignore) or create our own using the [correct format](https://git-scm.com/docs/gitignore).

## Stashing Your Work

Sometimes we need to put aside our current work to focus on something more urgent. If we made changes but we are not ready to commit, switching branches does not work, because Git does not know how to handle the uncommitted changes:

```bash
$ git checkout master
error: Your local changes to the following files would be overwritten by checkout:
        file1.py
        file2.py
```

This is where `stash` comes in. It saves all our changes, including those staged for commit, and lets us retrieve them later:

```bash
$ git stash
Saved working directory and index state WIP on test4: 47f10c2 update
```

Now we can switch branches safely. To retrieve the stashed changes later:

```bash
$ git stash pop
On branch test4
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
        new file:   file5.py

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   file1.py
        modified:   file2.py

Dropped refs/stash@{0} (add5e575a2620fee2141b1c97ab4ba8bc5d245f9)
```

We can also list all the stashed changes:

```bash
$ git stash list
stash@{0}: WIP on test4: 47f10c2 update
stash@{1}: WIP on master: 25372f7 merge
```

## Deleting Remote Branches

We can delete local branches with the `branch` command, but deleting a remote branch requires a `push`:

```bash
$ git push origin --delete allied_telesis_show_arp
To https://github.com/dainok/ntc-templates
 - [deleted]         allied_telesis_show_arp
```

## Rebase

**Rebase** integrates changes in a way similar to `merge`, but it reapplies a series of commits starting from a different base, effectively rewriting the history of the repository. Be careful: it can cause inconsistencies, especially in public repositories where multiple people collaborate.

For example, take a repository with `main` and the branches `fix3` and `fix4` waiting to be merged:

![[git-log-1.png]]

If we merge the `fix3` branch, the commit IDs are preserved:

![[git-log-2.png]]

The `rebase` operation, instead, modifies the history of the repository by reapplying the commits of the `fix3` branch:

![[git-log-3.png]]

The commit ID of "add readme" has changed, which creates inconsistencies for the users who have not performed the `rebase` operation.

## Squashing Commits

When we merge, all the commits of a branch are normally preserved. Over time, this can create unnecessary overhead. We can instead consolidate multiple commits into one:

```bash
$ git merge --squash fix3
Squash commit -- not updating HEAD
Automatic merge went well; stopped before committing as requested
```

This prepares the commit without applying it, so we can review it before finalizing. After the squash, the entire history of the branch is condensed into a single commit.

In the repository of the previous example, we can see that the `fix3` branch is not connected to the main branch:

![[git-log-4.png]]

At the end of the merge, we can delete the `fix3` branch, because we no longer need it.

## Reinitializing a Repository

Sometimes we want to reset a repository and wipe out its history, for example when we make a private repository public. Here is how:

```bash
mv .git/config config.git
rm -rf .git
git init -b master
mv config.git .git/config
git add .
git commit -m "Initial commit"
git push -u --force origin master
```

The steps are:

* Save the configuration of the repository.
* Delete the repository structure.
* Reinitialize the repository.
* Add all the content to the staging area.
* Make the first commit.
* Push the changes, overwriting the remote state.

Note that, on services like GitHub, commits can still be recovered if their ID is known. To erase the history of a repository completely on GitHub, we must delete the repository and recreate it.

## Undoing the Last Commit

We can undo the last commit without losing our changes:

```bash
git reset --soft HEAD~1
```

This works only if we have not pushed the commit yet. Once pushed, the commit remains recoverable through its ID.

## Recovering a Deleted File

Git tracks everything, so even if we commit a file that should not have been added and then delete it, we can still retrieve it. To list the deleted files:

```bash
localhost:test dainese$ git log --diff-filter D --pretty="format:" --name-only
password.txt
```

Then we find the commit ID:

```bash
localhost:test dainese$ git rev-list HEAD -n 1 -- password.txt
a73306c8511fbedad06a687cc342c1d50c9035f3
```

And we recover the file:

```bash
$ git checkout a73306c8511fbedad06a687cc342c1d50c9035f3^ password.txt
Updated 1 path from 652f7ba
```

I created a simple script that automates this process, available in my [GitHub repository](https://github.com/dainok/courses/blob/master/Git/recover_deleted_files.sh).

## Permanently Removing Deleted Files

A Git repository always keeps references to deleted files. A [handy tool](https://rtyley.github.io/bfg-repo-cleaner/) removes the deleted files from the history:

![[git-log-5.png]]

If we use `bfg` on the repository, the files are also removed from the history:

```bash
bfg --delete-files password.txt
```

The commit IDs have changed:

![[git-log-6.png]]

The old commit ID still exists, however, and if we know it, we can still recover the file:

```bash
$ git checkout 2fb4ce83b0015c4a44b45be2f5339613ddabe71f
localhost:test dainese$ ls password.txt
password.txt
```

To fix this, we must clean the cache:

```bash
$ git reflog expire --expire=now --all && git gc --prune=now --aggressive
Enumerating objects: 5, done.
Counting objects: 100% (5/5), done.
Delta compression using up to 12 threads
Compressing objects: 100% (3/3), done.
Writing objects: 100% (5/5), done.
Total 5 (delta 2), reused 0 (delta 0), pack-reused 0
```

We cannot perform this last operation on remote repositories like GitHub.

## Updating a Fork

As we have seen, once we fork a repository, it is no longer updated. If we need to submit a patch after a long time, we must start from an updated repository. We can either delete the fork and fork it again, or update it. Here is how to update it:

```bash
git fetch upstream
git merge upstream/master master
git rebase upstream/master
git push origin
```

We are updating the `master` branch from the `upstream` remote. All the other branches, local or on other remotes (like `origin`), remain unchanged.

## Updating a Branch

When we work on a branch for a long time, it may diverge significantly from the main branch, whether local or remote:

```bash
git fetch origin
git merge origin/main
```

## Selective Merge

In some cases, we need a selective merge that picks specific commits. Let's take an example we have already seen:

![[git-log-7.png]]

Now we want to merge only one commit of the `fix3` branch:

```bash
$ git cherry-pick d09ad27123063a6414de0b3de5c3d7a0c2afb2cb
[main 2c57f06] add file4
 Date: Fri Sep 13 14:47:10 2024 +0200
 1 file changed, 0 insertions(+), 0 deletions(-)
 create mode 100644 file4.py
```

After the merge, the situation looks like this:

![[git-log-8.png]]

## Tag

We can use tags to mark a commit, which is then associated with a release. Here is how to create a tag:

```bash
git tag 0.1
git tag
git push origin --tags
```
