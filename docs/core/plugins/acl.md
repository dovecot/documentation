---
layout: doc
title: acl
dovecotlinks:
  acl: ACL
  acl_global_file:
    hash: global-acls
    text: global ACLs
  acl_file_format:
    hash: acl-file-format
    text: ACL File Format
  acl_imap_acls:
    hash: imap-acls
    text: IMAP ACLs
  acl_inheritance:
    hash: acl-inheritance-and-default-acls
    text: ACL Inheritance
---

# ACL: Access Control List Plugin (`acl`)

This page talks mainly about how ACLs work, for more general description of how
shared mailboxes work, see [[link,shared_mailboxes]].

Dovecot supports both administrator-configured ACLs and the IMAP ACL
extension (see [[plugin,imap-acl]], which allows users to change ACLs
themselves). Administrator ACLs are configured in `dovecot.conf`; users' own
ACLs are stored in per-mailbox `dovecot-acl` files.

The ACL code was written to allow multiple ACL drivers, but currently Dovecot
supports only virtual ACL files.

::: warning
Using ACLs doesn't grant mail processes any extra filesystem
permissions that they already don't have.

[[link,shared_mailboxes_permissions,You must make sure that the processes have enough permissions]]
to be able to access the mailboxes.

To test, you can first try accessing shared/public mailboxes without
ACL plugin enabled.
:::

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

```doveconf[dovecot.conf]
# Enable internal ACL support
mail_plugins {
  acl = yes
}

# Enable the IMAP ACL commands
protocol imap {
  mail_plugins {
    imap_acl = yes
  }
}

acl_driver = vfile
# If enabled, don't try to find dovecot-acl files from mailbox directories.
# This reduces unnecessary disk I/O when only global ACLs are used.
acl_globals_only = yes

namespace inbox {
  inbox = yes
  mailbox Foo {
    acl owner {
      rights = lr
    }
  }

  acl user=admin {
    rights = lwristepai
 }
 ## Set this to yes to ignore ACLS for this namespace
 #acl_ignore = yes
}

## setting ACLs here will affect all shared mailboxes
namespace shared {
  mailbox Public {
    acl anyone {
      rights = lr
    }
  }
}

# Dict for mapping which users have shared mailboxes to each other.
#acl_sharing_map {
#  dict file {
#    path = /var/lib/dovecot/dovecot-acl.db
#  }
#}

# ACL username
# defaults to master_user, but if it expands to empty, will use current user.
#acl_user = %{master_user}
```

### Creating rule sets with group

You can also simplify ACL rule set management by defining rule sets.
Group settings expand as configuration where they are used,
so they can include values from other filters too.

```[dovecot.conf]
# define rule sets

group @acl_rule_set set1 {
   acl user=user1 {
     rights = lri
   }
}

group @acl_rule_set set2 {
   acl user=user2 {
     rights = lri
   }
}

group @acl_rule_set set3 {
   acl user=user3 {
     rights = lri
   }
}

group @acl_rule_set default {
  acl user=admin {
     rights = lwristepai
  }
}

namespace public {
   @acl_rule_set = default
   mailbox "Secret" {
     @acl_rule_set = set1
   }
   mailbox "TopSecret" {
     @acl_rule_set = set2
   }
   mailbox "Foo*" {
     @acl_rule_set = set3
   }
   mailbox "FooBar" {
     @acl_rule_set = set1
   }
}
```

With this configuration user `admin` will have full rights to all folders under public unless negated.
Folders `Secret` and `FooBar` will have `user1` with rights, while folders `TopSecret` has `user2` with rights.
This includes user `admin` from namespace level.

User `user3` will have rights on anything that starts with `Foo`, including `FooBar`.

## Master Users

Master users have their own ACLs. They're not the mailbox owners, so by
default they have no permissions to any of the mailboxes. See
[[link,acl_master_users]] for more information.

## ACL vfile Driver

`vfile` driver stores per-mailbox ACLs in a `dovecot-acl` file. Global ACLs
are not read from a file; they are defined in `dovecot.conf` with the
[[setting,acl]] filter, see [Global ACLs](#global-acls).

The `dovecot-acl` file exists in:

* Maildir:: The Maildir's mail directory (e.g., `~/Maildir`,
  `~/Maildir/.folder/`).
* mbox: Control directory. You should explicitly specify
  [[setting,mail_control_path]].
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

::: tip
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

Prevent users from deleting the Spam folder (notice no x flag), in the
`dovecot-acl` file of that folder:

```[dovecot-acl]
owner lrwstipeka
```

Note that `dovecot-acl` files apply only to the mailbox they live in. Rules
that apply to more than one mailbox belong in `dovecot.conf`, see
[Global ACLs](#global-acls). The same example as configuration:

```doveconf[dovecot.conf]
namespace inbox {
  mailbox Spam {
    acl owner {
      rights = lrwstipeka
    }
  }
}
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

::: warning
Currently the default ACLs are merged with the mailbox-specific ACLs. So if a
default ACL gives access to `user1` and a per-mailbox ACL gives access to
`user2`, the `user1` still has access to that mailbox.
:::

## Global ACLs

Global ACLs are set by the administrator and apply to all users. Unlike
per-mailbox `dovecot-acl` files, users cannot change them with the IMAP ACL
extension. They are used mainly for two purposes:

1. Removing some permissions from users' personal mailboxes. For example each
   user might have an `Invoices` mailbox which will be read-only.
2. Giving permissions to master user logins. See [[link,acl_master_users]]
   for more information.

[[removed,settings_acl_global_path_removed]] Global ACLs used to be read from a
separate global ACL file, configured with the [[setting,acl_global_path]]
setting. Both the setting and the file format are gone; there is no ACL file
that takes a mailbox name prefix. See [[link,upgrading_2_4_acls]] for how to
convert an existing global ACL file or global ACL directory.

Global ACLs are defined in `dovecot.conf` with the [[setting,acl]] filter.
The filter can be used at global, [[setting,namespace]] or [[setting,mailbox]]
level, and the level it is used at is what limits which mailboxes it applies
to:

```doveconf[dovecot.conf]
# applies to every mailbox of every namespace
acl user=foo {
  rights = lrw
}

namespace inbox {
  # applies to every mailbox of this namespace
  acl user=admin {
    rights = lrwstipekxa
  }

  mailbox Public {
    acl user=bar {
      rights = lrwstipekxa
    }
  }
  mailbox "Public/*" {
    acl user=bar {
      rights = lrwstipekxa
    }
  }
}
```

[[setting,mailbox]] filter names may contain `*` and `?` wildcards that do
shell-string matching, not stopping at any boundaries. The pattern is matched
against the mailbox name without the namespace prefix. All matching
[[setting,mailbox]] filters apply, not just the first one.

To deny rights, prefix [[setting,acl_rights]] with `-`:

```doveconf[dovecot.conf]
namespace inbox {
  mailbox INBOX {
    acl user=masteruser {
      rights = -lrwstipekxa
    }
  }
}
```

If a mailbox has both configured ACLs and a per-mailbox `dovecot-acl` file,
both are read and the rules are merged.

Set [[setting,acl_globals_only,yes]] if `dovecot-acl` files are not used at
all. This skips looking for them and saves disk I/O.

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
store the map using [[setting,acl_sharing_map]].

```doveconf[dovecot.conf]
acl_sharing_map {
  dict file {
    path = /var/lib/dovecot/dovecot-acl.db
  }
}
```
