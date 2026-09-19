---
layout: doc
title: lazy-expunge
dovecotlinks:
  lazy_expunge_storage:
    hash: storage-locations
    text: lazy-expunge storage locations
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

Messages that are expunged are moved to a single mailbox. The mailbox can
also be selected per folder, see
[below](#separate-mailbox-for-each-folder).

The mailbox is created automatically.

You probably also want to hide it with an [[link,acl]] from the user, if
recovery is only expected to be an action performed by an admin/operator.

To move to a mailbox, do NOT add a trailing delimiter to the
[[setting,lazy_expunge_mailbox]] setting.

#### Example Configuration

::: code-group

```doveconf[dovecot.conf]
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

mail_plugins {
  lazy_expunge = yes
  acl = yes
}
acl_driver = vfile

# Move messages to an .EXPUNGED mailbox
lazy_expunge_mailbox = .EXPUNGED
```

:::

You could also leave the permissions empty if you don't want to allow clients
to access it at all.

### Separate Mailbox for Each Folder

[[setting,lazy_expunge_mailbox]] is looked up separately for each folder that
mails are expunged from, and it supports [[link,settings_variables]]. The
`%{event:mailbox}` variable expands to the name of that folder, so the
expunged mails can be kept in a separate mailbox for each folder:

::: code-group

```doveconf[dovecot.conf]
lazy_expunge_mailbox = .EXPUNGED/%{event:mailbox}

namespace inbox {
  # Mails expunged from the lazy-expunge mailboxes must not be moved again,
  # or they would end up in .EXPUNGED/.EXPUNGED/...
  mailbox .EXPUNGED {
    lazy_expunge_mailbox =
  }
  mailbox ".EXPUNGED/*" {
    lazy_expunge_mailbox =
    autoexpunge = 7days
    quota_ignore = yes
  }
}
```

:::

With this configuration a mail expunged from the `Archive/2024` folder is
moved to `.EXPUNGED/Archive/2024`, which is created automatically. The
variable expands to the folder name as the user sees it, including the
namespace prefix and using the namespace's
[[setting,namespace_separator]].

::: warning
The mails are moved to the destination mailbox that exists when the mail is
expunged. Renaming a folder does not rename its lazy-expunge mailbox, so the
expunged mails of a renamed folder stay in the old mailbox.
:::

[[changed,lazy_expunge_mailbox_virtual_changed]] Expunging mails via a
[[plugin,virtual]] mailbox uses the setting of the folder the mail is
physically in. Older versions stored all the mails of such an expunge in the
same mailbox, and could store them twice.

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
