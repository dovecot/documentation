---
layout: doc
title: Contributing
order: 60
---

# Contributing to the Documentation

There are several ways you can contribute to improving the Dovecot
documentation.

## Submitting Fixes and Improvements

If you are familiar with Git and [GitHub](https://github.com/), you can
submit your changes directly to the documentation repository.

1. **Fork the repository:** Start by creating a fork of the official
   [Dovecot documentation repository](https://github.com/dovecot/documentation/)
   on GitHub.
2. **Clone your fork:** Clone your newly created fork to your local machine:
   ```shell
   git clone https://github.com/YOUR_USERNAME/documentation.git
   cd documentation
   ```
3. **Create a new branch:** Create a new branch for your changes. Choose a
   descriptive name for your branch.
   ```shell
   git checkout -b my-awesome-fix
   ```
4. **Make your changes:** Edit the documentation files as needed.
5. **Commit your changes:** Once you are happy with your changes, commit
   them with a descriptive commit message. The commit message should be in
   the format `docs: A brief summary of the change`.

   The commit message should use imperative language ("Fix", "Change", "Add"),
   not past-tense ("Fixed", "Changed", "Added"). Use a single prefix term
   that describes the area of the documentation the commit affects (e.g.,
   "settings", "fts").
   ```shell
   git commit -am "installation: Fix a typo in the installation guide"
   ```
6. **Push your changes:** Push your changes to your fork on GitHub.
   ```shell
   git push origin my-awesome-fix
   ```
7. **Create a Merge Request:** After pushing your commit, you should see a
   GitHub link to create a merge request in the Git output contents. Click
   on this link and complete the form to submit the merge request to the
   official Dovecot repository. (If you don't see the link, go to your
   personal fork of the documentation project on GitHub to find the
   submission link.)

## I Don't Know How to Code!

Even if you're not comfortable with Git and GitHub, you can still contribute to the documentation. If you find a typo, a factual error, or have a suggestion for improvement, you can submit an issue to the [GitHub issue tracker](https://github.com/dovecot/documentation/issues).

When submitting an issue, please include the following information:

*   **The URL of the page** where you found the issue.
*   **A description of the issue.** Be as specific as possible. For example, instead of saying "the documentation is confusing", say "in the section on XYZ, the first paragraph is unclear because...".
*   **A suggestion for how to fix the issue.** If you have an idea for how to improve the documentation, please share it!

The core developers will review your suggestion and incorporate it into the documentation if they agree that it's a good idea.
