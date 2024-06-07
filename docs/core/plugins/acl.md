---
layout: doc
title: acl
dovecotlinks:
  acl: ACL
  acl_global_file:
    hash: global-acl-file
    text: global ACL file
  acl_inheritance:
    hash: acl-inheritance-and-default-acls
    text: ACL Inheritance
---

# ACL: Access Control List (acl) Plugin

This page talks mainly about how ACLs work, for more general description of how
shared mailboxes work, see [[link,shared_mailboxes]].

Dovecot supports both administrator-configured ACL files and the IMAP ACL
extension (see [[plugin,imap-acl]], which allows users to change ACLs
themselves.

The ACL code was written to allow multiple ACL backends, but currently Dovecot
supports only virtual ACL files.

Note that using ACLs doesn't grant mail processes any extra filesystem
permissions that they already don't have.
[[link,shared_mailboxes_permissions,You must make sure that the processes have enough permissions]]
to be able to access the mailboxes. When testing you could first try
accessing shared/public mailboxes without ACL plugin even enabled.

## Settings (dovecot.conf)

<SettingsComponent plugin="acl" />

## Configuration

### Groups

The [[setting,acl_groups]] setting can be dynamically set via
[[link,userdb_extra_fields]].

### IMAP ACLs

To enable the IMAP ACL commands, you must load the [[plugin,imap_acl]]. This
plugin should only be loaded inside a `protocol imap {}` block.

### Sample Configuration

```[dovecot.conf]
# Enable internal ACL support
mail_plugins = acl

# Enable the IMAP ACL commands
protocol imap {
  mail_plugins = $mail_plugins imap_acl
}

plugin {
  acl = vfile

  # If enabled, don't try to find dovecot-acl files from mailbox directories.
  # This reduces unnecessary disk I/O when only global ACLs are used.
  #acl_globals_only = yes

  # Namespace prefix to ignore. Use counter to ignore multiple, e.g.
  #   acl_ignore_namespace2
  #acl_ignore_namespace =

  # Dict for mapping which users have shared mailboxes to each other.
  #acl_shared_dict =
}
```

## Master Users

Master users have their own ACLs. They're not the mailbox owners, so by
default they have no permissions to any of the mailboxes. See
[[link,acl_master_users]] for more information.

## ACL vfile Backend

`vfile` backend supports per-mailbox ACLs and global ACLs.

Per-mailbox ACLs are stored in `dovecot-acl` named file, which exists in:

* Maildir:: The Maildir's mail directory (e.g., `~/Maildir`,
  `~/Maildir/.folder/`).
* mbox: Control directory. You should explicitly specify `:CONTROL=<path>`
  [[setting,mail_location]].
* dbox: dbox's mail directory (e.g., `~/dbox/INBOX/dbox-Mails/`).

## ACL File Format

The ACL files are in format:

```
<identifier> <ACLs> [:<named ACLs>]
```

Where **identifier** is one of:

* `group-override=<group name>`
* `user=<user name>`
* `owner`
* `group=<group name>`
* `authenticated`
* `anyone` (or `anonymous`)
* Negative rights can be given by prepending the identifier with `-`

The ACLS are processed in the precedence given above, so for example if you
have given read-access to a group, you can still remove that from specific
users inside the group.

Group-override identifier allows you to override users' ACLs. Probably the most
useful reason to do this is to temporarily disable access for some users. For
example:

```[dovecot-acl]
user=foo rw
group-override=tempdisabled
```

Now if foo is in tempdisabled group, he has no access to the mailbox. This
wouldn't be possible with a normal group identifier, because the `user=foo`
would override it.

Negative rights can be used to remove rights. For example a user may be given
full rights to all mailboxes, except some of the rights removed from some
specific mailboxes.

### Supported ACLs

| ID  | Type | Description |
| --- | ---- | ----------- |
| `l` | lookup | Mailbox is visible in mailbox list. Mailbox can be subscribed to. |
| `r` | read  | Mailbox can be opened for reading. |
| `w` | write | Message flags and keywords can be changed, except \Seen and \Deleted |
| `s` | write-seen | \Seen flag can be changed |
| `t` | write-deleted | \Deleted flag can be changed |
| `i` | insert | Messages can be written or copied to the mailbox |
| `p` | post | Messages can be posted to the mailbox by [[link,lda]], e.g. from Sieve |
| `e` | expunge | Messages can be expunged |
| `k` | create | Mailboxes can be created (or renamed) directly under this mailbox (but not necessarily under its children, see [ACL Inheritance](#acl-inheritance-and-default-acls)) (renaming also requires delete rights) |
| `x` | delete | Mailbox can be deleted |
| `a` | admin  | Administration rights to the mailbox (currently: ability to change ACLs for mailbox) |

The ACLs are compatible with [[rfc,4314]] (IMAP ACL extension).

Unknown ACL letters are complained about, but unknown named ACLs are ignored.
Named ACLs are mostly intended for future extensions.

::: tip Note
The file is rather picky about formatting; using a tab (or multiple spaces)
instead of a space character between fields may not work. If you are having
problems, make sure to check for tabs, extra spaces and other unwanted
characters.
:::

### Examples

Mailbox owner has all privileges, `foo` has list-read privileges:

```[dovecot-acl]
owner lrwstipekxa
user=foo lr
```

Allow everyone to list and read a public mailbox (public namespace has no
owner):

```[dovecot-acl]
anyone lr
```

Prevent all users from deleting their Spam folder (notice no x flag):

```[dovecot-acl]
INBOX.Spam owner lrwstipeka
```

Allow a masteruser full access to all mailboxes, except no access to INBOX:

```[dovecot-acl]
* user=masteruser lrwstipekxa
INBOX -user=masteruser lrwstipekxa
```

## ACL Inheritance and Default ACLs

Every time you create a new mailbox, it gets its ACLs from the parent mailbox.
If you're creating a root-level mailbox, it uses the namespace's default ACLs.
There is no actual inheritance, however: If you modify parent's ACLs, the
child's ACLs stay the same. There is currently no support for ACL inheritance.

There are default ACLs though:

* In private namespace, the owner has all ACL rights for mailboxes in the
  namespace.
* In shared and public namespaces, there are no ACL rights by default.
* However, optionally the default ACLs can be taken from the INBOX for private
  and shared namespaces. See [[setting,acl_defaults_from_inbox]].

::: warning NOTE
Currently the default ACLs are merged with the mailbox-specific ACLs. So if a
default ACL gives access to `user1` and a per-mailbox ACL gives access to
`user2`, the `user1` still has access to that mailbox.
:::

## Global ACLs

Global ACLs can be used to apply ACLs globally to all user's specific
mailboxes. They are used mainly for two purposes:

1. Removing some permissions from users' personal mailboxes. For example each
   user might have an `Invoices` mailbox which will be read-only.
2. Giving permissions to master user logins. See [[link,acl_master_users]]
   for more information.

If a mailbox has both global ACLs and the per-mailbox ACL file, both of them
are read and the ACLs are merged. If there are any conflicts, the global ACL
file overrides per-mailbox ACL file. This is because users can modify their own
per-mailbox ACL files via IMAP ACL extension. Global ACLs can only be modified
by administrator, so users shouldn't be able to override them.

### Global ACL File

Global ACL file path is specified as a parameter to vfile backend in
[[setting,acl]], `/etc/dovecot/dovecot-acl` in the above example.

The file contains otherwise the same data as regular per-mailbox `dovecot-acl`
files, except each line is prefixed by the mailbox name pattern.

The pattern may contain `*` and `?` wildcards that do the shell-string
matching, not stopping at any boundaries.

Example:

```[dovecot-acl]
* user=foo lrw
Public user=bar lrwstipekxa
Public/* user=bar lrwstipekxa
```

The first line shares every mailbox of every user to the user `foo` with a
limited set of rights, and the last line shares every folder below `Public`
of every user to the user `bar`.

## List Cache

`dovecot-acl-list` file lists all mailboxes that have `l` rights assigned.
If you manually add/edit `dovecot-acl` files, you may need to delete the
`dovecot-acl-list` to get the mailboxes visible.

## Dictionaries

In order for an ACL to be fully useful, it has to be communicated to IMAP
clients. For example, if you use ACL to share a mailbox to another user, the
client has to be explicitly told to check out the other user's mailbox too, as
that one is shared.

Placing the ACL file makes the ACL effective, but Dovecot doesn't take care of
the user to shared mailboxes mapping out of the box, and as a result, it won't
publish shared mailboxes to clients if this is not set up. You have to
configure this manually by defining an appropriate [[link,dict]] to
store the map using [[setting,acl_shared_dict setting]].

```[dovecot.conf]
plugin {
  acl_shared_dict = file:/var/lib/dovecot/dovecot-acl.db
}
```
