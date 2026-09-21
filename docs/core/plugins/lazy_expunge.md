---
layout: doc
title: lazy-expunge
dovecotlinks:
  lazy_expunge_storage:
    hash: storage-locations
    text: lazy-expunge storage locations
  lazy_expunge_hierarchy:
    hash: preserving-the-folder-hierarchy
    text: preserving the folder hierarchy with lazy-expunge
---

# Lazy Expunge Plugin (`lazy-expunge`)

The lazy expunge plugin provides a "second-chance" to recover messages that
would otherwise be deleted from a mailbox by user action.

It does this by moving the message to a defined location when a user deletes
the message from a mailbox.

This behavior is useful for a variety of reasons:

1. Protect against misconfigured clients (e.g. POP3 client that deletes all
   messages)
2. Protect against accidental deletion (user error)
3. Archiving

Generally, lazy-expunge is configured so that the expunged mails are not
counted in the user's quota.  Unless being used for archiving, autoexpunge
should be used to prune the mailbox to control storage usage.

## Settings

<SettingsComponent plugin="lazy-expunge" />

## Configuration

### Storage Location

Messages that are expunged are moved to a single mailbox. The destination can
also be varied per mailbox, see [Preserving the Folder
Hierarchy](#preserving-the-folder-hierarchy).

The mailbox is created automatically.

You probably also want to hide it with an [[link,acl]] from the user, if
recovery is only expected to be an action performed by an admin/operator.

To move to a mailbox, do NOT add a trailing delimiter to the
[[setting,lazy_expunge_mailbox]] setting.

#### Example Configuration

::: code-group

```doveconf[dovecot.conf]
mail_plugins {
  lazy_expunge = yes
  acl = yes
}
acl_driver = vfile

# Move messages to an .EXPUNGED mailbox
lazy_expunge_mailbox = .EXPUNGED

namespace inbox {
  mailbox .EXPUNGED {
    autoexpunge = 7days
    autoexpunge_max_mails = 100000

    # Expunged messages most likely don't want to be included in quota:
    quota_ignore = yes

    # Define ACL so that user cannot list the .EXPUNGED mailbox
    acl owner {
      rights = rwstipekxa
    }
  }
}
```

:::

You could also leave the permissions empty if you don't want to allow clients
to access it at all.

### Preserving the Folder Hierarchy

With a constant [[setting,lazy_expunge_mailbox]] every expunged mail ends up in
the same mailbox, regardless of where it was deleted from. The destination can
also be varied per source mailbox, which preserves the original folder
hierarchy under the expunge mailbox:

```doveconf
lazy_expunge_mailbox = .EXPUNGED/%{event:mailbox}
```

`%{event:mailbox}` expands to the name of the mailbox the mail is expunged
from, so a mail deleted from `Lists/dovecot` is moved to
`.EXPUNGED/Lists/dovecot`. The name uses the separator of the namespace the
mail is expunged from; the examples below assume `/`.

Note that most clients move mails to Trash instead of expunging them directly.
The plugin then triggers only when the mail is expunged from Trash, so the
hierarchy mostly reflects Trash rather than the original folders. This is one
reason why the namespace option was removed.

The expunge mailboxes must then be excluded from lazy-expunge themselves.
Dovecot only skips the move when the destination is the mailbox itself, which
never happens once the destination varies: expunging from `.EXPUNGED/Lists`
would otherwise move the mail to `.EXPUNGED/.EXPUNGED/Lists`. Excluding a
mailbox is done by setting [[setting,lazy_expunge_mailbox]] empty for it.

There are two ways to arrange this.

#### Expunge Mailboxes Under the INBOX Namespace

The exclusion is set on the expunge mailbox and on everything below it. Both
are needed - the `*` filter does not match the parent itself.

::: code-group

```doveconf[dovecot.conf]
mail_plugins {
  lazy_expunge = yes
}

lazy_expunge_mailbox = .EXPUNGED/%{event:mailbox}

namespace inbox {
  mailbox .EXPUNGED {
    autoexpunge = 7days
    autoexpunge_max_mails = 100000
    quota_ignore = yes
    lazy_expunge_mailbox =
  }
  mailbox .EXPUNGED/* {
    autoexpunge = 7days
    autoexpunge_max_mails = 100000
    quota_ignore = yes
    lazy_expunge_mailbox =
  }
}
```

:::

#### Expunge Mailboxes in Their Own Namespace

A separate namespace keeps the expunged mails out of the user's own mail
storage, and out of the mailbox list. Here both the exclusion and
[[setting,quota_ignore]] are set once at namespace level, where they apply to
every mailbox in the namespace:

::: code-group

```doveconf[dovecot.conf]
mail_plugins {
  lazy_expunge = yes
}

lazy_expunge_mailbox = .EXPUNGED/%{event:mailbox}

namespace expunged {
  prefix = .EXPUNGED/
  hidden = yes
  list = no
  subscriptions = no

  mail_driver = maildir
  mail_path = ~/Maildir.expunged

  quota_ignore = yes
  lazy_expunge_mailbox =

  mailbox * {
    autoexpunge = 7days
    autoexpunge_max_mails = 100000
  }
}
```

:::

::: info [[changed,lazy_expunge_virtual_changed]]
Mails expunged through a virtual mailbox are handled in the backend mailbox
they are stored in, so they are moved to that mailbox's destination and no
extra configuration is needed.

Earlier versions moved every mail of one expunge to a single destination - the
one of whichever backend mailbox came first, so a mail from `Lists/dovecot`
ended up in `.EXPUNGED/INBOX`.
:::

### Copy Only the Last Instance

If a mail has multiple copies within a user account, each copy is normally
moved to the lazy expunge storage when it's expunged.

Example: this may happen when moving a message to Trash, as clients can issue
IMAP COPY command to copy the message to Trash before expunging the message
from the original mailbox.  Deleting later from Trash would result in two
copies of the same message in the lazy expunge storage.

You can enable [[setting,lazy_expunge_only_last_instance]] to copy
only the last instance to the expunge storage. This ensures that only a single
copy of a message will appear in the expunge storage.

::: warning
This feature only works with certain storage setups. See
[[setting,lazy_expunge_only_last_instance]] for further information.
:::

### Quota

Generally, it is desired that messages in expunge storage are NOT
counted towards user quota, as the messages seen by the user will not
match-up with the size of the quota otherwise (especially if expunge storage
is hidden from users via ACL).

Example to exclude expunged storage from the quota:

```doveconf[dovecot.conf]
quota "User quota" {
  quota_storage_size = 1GB
}
mailbox .EXPUNGED {
  # Exclude .EXPUNGED mailbox from the quota
  quota_ignore = yes
}
```

See [[plugin,quota]].

## Cleaning Up

### Doveadm

Doveadm can be used to manually clean expunge storage.

Example to delete all messages in `.EXPUNGED` mailbox older than one day:

```sh
doveadm expunge mailbox '.EXPUNGED' savedsince 1d
```

### Autoexpunge

Set [[setting,mailbox_autoexpunge]] configuration to automatically clean
old messages.
