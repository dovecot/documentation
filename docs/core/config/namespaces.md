---
layout: doc
title: Namespaces
dovecotlinks:
  namespaces: Namespaces
  namespaces_hierarchy_separators:
    hash: hierarchy-separators
    text: "Namespaces: Hierarchy Separators"
---

# Namespaces

Dovecot supports fully configurable, hierarchical namespaces, which can use
different storage drivers.

Their original and primary purpose is to provide Namespace IMAP extension
([[rfc,2342]]) support, which allows giving IMAP clients hints about where
to locate mailboxes and whether they're private, shared or public.

Dovecot namespaces can be used for several other purposes too:

* Changing the [[link,namespaces_hierarchy_separators,Hierarchy Separators]]
* Providing backwards compatibility when switching from another IMAP server
* Provides support for [[link,shared_mailboxes_public]] and
  [[link,shared_mailboxes_user]] mailboxes
* Allows having mails in multiple different locations with possibly different
  formats

These different locations and drivers are presented to the client as a single
tree.

Each namespace has:

* prefix (usually empty or "INBOX.")
* namespace separator (usually '/' or '.')
* 0 or more folders

There must be one namespace where the case-insensitive folder named INBOX
exists.

All visible namespaces must have the same separator.

Inside each namespace there is a list of folders, which form a sub-hierarchy.

## Folder Names

Each folder has a name. In configuration files and log files Dovecot almost
always uses the "virtual name", which uses the configured namespace's hierarchy
separator as well as the namespace prefix. Depending on the used
[[setting,mailbox_list_layout]] setting the internal folder name may be
different. The internal name is stored in databases (e.g. mailbox
subscriptions), which allows changing the namespace prefix or separator without
having to change the databases.

The folder names use UTF-8 character set internally. All folder names must be
valid UTF-8. With [[setting,mailbox_list_layout,fs]] and
[[setting,mailbox_list_layout,Maildir++]] the folder names are stored in
filesystem paths as mUTF-7 (see IMAP [[rfc,3501]]) mainly for legacy reasons.
This can be changed with the [[setting,mailbox_list_utf8]] setting.

### Folder Name Lengths

Folder name length restrictions:

* Maximum length of an individual folder name within a hierarchy is 255 bytes.
  For example with "a/b/c" hierarchy each of the a, b and c can be a maximum
  of 255 bytes.
* The maximum folder path length is 4096 bytes.

The maximum folder name lengths work correctly when folder names aren't stored
in filesystem, i.e. [[setting,mailbox_list_layout,index]] is used. Otherwise
the OS adds its own limitations to path name lengths and the full 4096 bytes
can't be used. With [[setting,mailbox_list_layout,Maildir++]] the path must fit
to 254 bytes (due to OS limitations).

### Parent Folders

A folder can have one or more parent folders that do not physically exist.
These are presented with `\NoSelect` or `\Nonexistent` attribute.
It's possible to try to avoid creating these by using the
[[setting,mailbox_list_drop_noselect]] setting (enabled by default).

## Configuration

If the Dovecot configuration doesn't explicitly specify a namespace, the
inbox namespace is created automatically.

Namespace configuration is defined within a dovecot configuration block with
the format:

```
namespace <name> {
  [... namespace settings ...]
}
```

The namespace name is only used internally within configurations. It allows you
to update an existing namespace - by repeating the namespace block and adding
additional configuration settings - or allows userdb to override namespace
settings for specific users, e.g.:

```
namespace/name/prefix=foo/
```

Example configuration for default namespace:

```[dovecot.conf]
namespace inbox {
  separator = .
  prefix =
  inbox = yes
}
```

## Settings

<SettingsComponent tag="namespace" />

## Hierarchy Separators

[[setting,namespace_separator]] specifies the character that is used to
separate the parent mailbox from its child mailbox.

For example if you have a mailbox "foo" with child mailbox "bar", the full
path to the child mailbox would be "foo/bar" with `/` as the separator, and
"foo.bar" with `.` as the separator.

IMAP clients, Sieve scripts, and many parts of Dovecot configuration use the
configured separator when referring to mailboxes. This means that if you change
the separator, you may break things.

However, changing the separator doesn't change the on-disk "layout separator".

Example:

| `mailbox_list_layout` | Layout Separator | Namespace Separator | Mailbox Name | Directory |
| --- | --- | --- | --- | --- |
| `Maildir++` (default) | `.` | `.` | `foo.bar` | `~/Maildir/.foo.bar/` |
| `Maildir++` (default) | `.` | `/` | `foo/bar` | `~/Maildir/.foo.bar/` |
| `fs` | `/` | `.` | `foo.bar` | `~/Maildir/foo/bar/` |
| `fs` | `/` | `/` | `foo/bar` | `~/Maildir/foo/bar/` |

::: tip
The "namespace separator" changes only the "mailbox name", but doesn't
change the directory where the mails are stored. The "layout separator" can
only be changed by changing [[setting,mailbox_list_layout]], which also affects
the entire directory structure.
:::

The layout separator also restricts the mailbox names. For example if the
layout separator is `.`, you can't just set separator to `/` and create a
mailbox named `foo.bar`.

A commonly used separator is `/`. It probably causes the least amount of
trouble with different IMAP clients. The `^` separator is troublesome with
Thunderbird. If `\` has to be used, it needs to be escaped in configuration:

```[dovecot.conf]
namespace {
  separator = "\\"
}
```

You should use the same hierarchy separator for all namespaces. All
`list=yes` namespaces must use the same separator, but if you find it
necessary (e.g. for backwards compatibility namespaces) you may use different
separators for `list=no` namespaces.

## Values From userdb

To change namespace settings from userdb, you need to return
`namespace/<name>/setting=value`.

To create a namespace, make sure you first return
`namespace=<name>[,<name>,...]` and settings after this.

Note that the `namespace` setting must list all the namespaces that are
used - there's currently no way to simply add a namespace.

```[dovecot.conf]
userdb {
  driver = static
  args = namespace=inbox,special namespace/special/mail_path=/var/special/%u namespace/special/prefix=special/
}
```

## Shared Mailboxes

See [[link,shared_mailboxes]].

## Examples

### Mixed mbox and Maildir

If you have your INBOX as mbox in `/var/mail/username` and the rest of the
mailboxes in Maildir format under `~/Maildir`, you can do this by creating two
namespaces:

```[dovecot.conf]
namespace {
  separator = /
  prefix = "#mbox/"
  mail_driver = mbox
  mail_path = ~/mail
  mail_index_path = /var/mail/%u
  inbox = yes
  hidden = yes
  list = no
}

namespace {
  separator = /
  prefix =
  mail_driver = maildir
  mail_path = ~/Maildir
}
```

Without the `list = no` setting in the first namespace, clients would see the
"#mbox" namespace as a non-selectable mailbox named "#mbox" but with child
mailboxes (the mbox files in the "~/mail" directory), i.e. like a directory.
So specifically with `inbox = yes`, having `list = no` is often desirable.

### Backwards Compatibility: UW-IMAP

When switching from UW-IMAP and you don't want to give users full access to
filesystem, you can create hidden namespaces which allow users to access their
mails using their existing namespace settings in clients.

```[dovecot.conf]
# default namespace
namespace inbox {
  separator = /
  prefix =
  inbox = yes
}

# for backwards compatibility:
namespace compat1 {
  separator = /
  prefix = mail/
  hidden = yes
  list = no
  alias_for = inbox
}
namespace compat2 {
  separator = /
  prefix = ~/mail/
  hidden = yes
  list = no
  alias_for = inbox
}
namespace compat3 {
 separator = /
 prefix = ~%u/mail/
 hidden = yes
 list = no
 alias_for = inbox
}
```

### Backwards Compatibility: Courier IMAP

**Recommended:** You can continue using the same `INBOX.` namespace as Courier:

```[dovecot.conf]
namespace inbox {
  separator = .
  prefix = INBOX.
  inbox = yes
}
```

**Alternatively:** Create the `INBOX.` as a compatibility name, so old clients
can continue using it while new clients will use the empty prefix namespace:

```[dovecot.conf]
namespace inbox {
  separator = /
  prefix =
  inbox = yes
}

namespace compat {
  separator = .
  prefix = INBOX.
  inbox = no
  hidden = yes
  list = no
  alias_for = inbox
}
```

The `separator=/` allows the INBOX to have child mailboxes. Otherwise with
`separator=.` it wouldn't be possible to know if "INBOX.foo" means INBOX's
"foo" child or the root "foo" mailbox in "INBOX." compatibility namespace. With
`separator=/` the difference is clear with "INBOX/foo" vs. "INBOX.foo".

The alternative configuration is not recommended, as it may introduce issues:

* Although clients may do `LIST INBOX.*`, they may still do `LSUB *`,
  resulting in mixed results.
* If clients used empty namespace with Courier, they now see the mailboxes with
  different names, resulting in redownloading of all mails (except INBOX).
* Some clients may have random errors auto-detecting the proper default folders
  (Sent, Drafts etc) if the client settings refer to old paths while the server
  lists new paths.

See also [[link,migrating_mailboxes]]

### Per-user Namespace Location From SQL

You need to give the namespace a name, for example "docs" below:

```[dovecot.conf]
namespace docs {
  type = public
  separator = /
  prefix = Public/
}
```

Then you have an SQL table like:

```sql
CREATE TABLE Namespaces (
  [...]
  Location varchar(255) NOT NULL,
  [...]
)
```

Now if you want to set the namespace location from the Namespaces table, use
something like:

```
user_query = SELECT Location as 'namespace/docs/mail_path' FROM Namespaces WHERE ..
```

If you follow some advice to separate your "INBOX", "shared/" and "public/"
namespaces by choosing "INBOX/" as your prefix for the inboxes you will see,
that you run into troubles with subscriptions. Thats, because there is no
parent namespace for "shared/" and "public/" if you set `subscriptions = no`
for those namespaces.

If you set `subscriptions = yes` for "shared/" and
"public/" you will see yourself in the situation, that all users share the same
subscription files under the location of those mailboxes.

One good solution is, to create a so called "hidden subscription namespace"
with subscriptions turned on and setting `subscriptions = no` for the
other namespaces:

```[dovecot.conf]
namespace subscriptions {
  subscriptions = yes
  prefix = ""
  list = no
  hidden = yes
}

namespace inbox {
  inbox = yes
  subscriptions = no

  prefix = INBOX/
  separator = /

  mailbox Drafts {
    auto = subscribe
    special_use = \Drafts
  }

  mailbox Sent {
    auto = subscribe
    special_use = \Sent
  }

  mailbox "Sent Messages" {
    special_use = \Sent
  }

  mailbox Spam {
    auto = subscribe
    special_use = \Junk
  }

  mailbox Trash {
    auto = subscribe
    special_use = \Trash
  }
}

namespace {
  type = shared
  prefix = shared/%%u/
  mail_driver = mdbox
  mail_path = %%h/mdbox
  mail_index_private_path = %{owner_home}/mdbox/shared
  list = children
  subscriptions = no
}

namespace {
  type = public
  separator = /
  prefix = public/
  mail_driver = mdbox
  mail_path = /usr/local/mail/public/mdbox
  mail_index_private_path = ~/mdbox/public
  subscriptions = no
  list = children
}
```

## Mailbox Settings

Mailbox configuration is typically defined inside a [[setting,namespace]] block
so it only applies to the specific namespace.

### Settings

<SettingsComponent tag="mailbox" level="3" />

### Example

```[dovecot.conf]
namespace inbox {
  # the namespace prefix isn't added again to the mailbox names.
  #prefix = INBOX.
  inbox = yes
  # ...

  mailbox Trash {
    auto = no
    special_use = \Trash
  }

  mailbox Drafts {
    auto = no
    special_use = \Drafts
  }

  mailbox Sent {
    auto = subscribe # autocreate and autosubscribe the Sent mailbox
    special_use = \Sent
  }

  mailbox "Sent Messages" {
    auto = no
    special_use = \Sent
  }

  mailbox Spam {
    auto = create # autocreate Spam, but don't autosubscribe
    special_use = \Junk
  }

  mailbox virtual/All { # if you have a virtual "All messages" mailbox
    auto = no
    special_use = \All
  }
}
```
