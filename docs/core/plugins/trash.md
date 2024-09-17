---
layout: doc
title: trash
---

# Trash Plugin (`trash`)

Normally, a quota exceeded error is returned if saving/copying a message would
bring the user over quota.  With the trash plugin, the oldest messages are
instead expunged from the specified mailboxes until the message can be
saved.

If the new message is large enough that it wouldn't fit even if all messages
from configured mailboxes were expunged, then no messages are expunged and the
user receives a "Quota exceeded" error.

## Settings

<SettingsComponent plugin="trash" />

## Configuration

Requires [[plugin,quota]] to be loaded and configured to use non-FS quota.

Example:

::: code-group
```[dovecot.conf]
mail_plugins {
  quota = yes
  trash = yes
}

namespace inbox {
  # Spam mailbox is emptied before Trash
  mailbox Spam {
    priority = 1
  }

  # Trash mailbox is emptied before Sent
  mailbox Trash {
    priority = 2
  }

  # If both Sent and "Sent Messages" mailboxes exist, the next oldest message
  # to be deleted is looked up from both of the mailboxes.
  mailbox Sent {
    priority = 3
  }
  mailbox "Sent Messages" {
    priority = 3
  }
```
:::

