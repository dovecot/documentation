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

It does this by moving the message to a defined location (either a mailbox, or
a namespace -- see below for further details) when a user deletes the message
from a mailbox.

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

### Storage Locations

#### Mailbox

Messages that are expunged are moved to a single mailbox.

This is the simplest configuration. The mailbox is created automatically.

You probably also want to hide it with an [[link,acl]] from the user, if
recovery is only expected to be an action performed by an admin/operator.

To move to a mailbox, do NOT add a trailing delimiter to the
[[setting,lazy_expunge_mailbox]] setting.

##### Example Configuration

::: code-group

```[dovecot.conf]
namespace inbox {
  mailbox .EXPUNGED {
    autoexpunge = 7days
    autoexpunge_max_mails = 100000
  }
}

mail_plugins = $mail_plugins lazy_expunge acl

# Move messages to an .EXPUNGED mailbox
lazy_expunge_mailbox = .EXPUNGED

plugin {
  # Define ACL so that user cannot list the .EXPUNGED mailbox
  acl = vfile:/etc/dovecot/dovecot.acl

  # Expunged messages most likely don't want to be included in quota:
  quota_rule = .EXPUNGED:ignore
}
```

```[/etc/dovecot/dovecot.acl]
.EXPUNGED owner rwstipekxa
```

:::

You could also leave the permissions empty if you don't want to allow clients
to access it at all.

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

::: warning Note
This feature only works with certain storage setups. See
[[setting,lazy_expunge_only_last_instance]] for further information.
:::

### Quota

Generally, it is desired that messages in expunge storage are NOT
counted towards user quota, as the messages seen by the user will not
match-up with the size of the quota otherwise (especially if expunge storage
is hidden from users via ACL).

Example to exclude expunged storage from the quota:

```[dovecot.conf]
plugin {
   quota = count:User quota
   quota_rule = *:storage=1GB
   # Exclude .EXPUNGED mailbox from the quota
   quota_rule2 = .EXPUNGED:ignore
}
```

See [[plugin,quota]].

## Cleaning Up

### Doveadm

Doveadm can be used to manually clean expunge storage.

Example to delete all messages in `.EXPUNGED` namespace older than one day:

```sh
doveadm expunge mailbox '.EXPUNGED/*' savedsince 1d
```

### Autoexpunge

Set autoexpunge configuration for expunge storage to automatically clean
old messages.

See [[link,namespaces]].
