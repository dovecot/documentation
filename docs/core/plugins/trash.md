---
layout: doc
title: trash
---

# Trash Plugin (`trash`)

Normally, a quota exceeded error is returned if saving/copying a message would
bring the user over quota.  With the trash plug-in, the oldest messages are
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

plugin {
  trash = /etc/dovecot/dovecot-trash.conf.ext
}
```

```[dovecot-trash.conf.ext]
# Spam mailbox is emptied before Trash
1 Spam
# Trash mailbox is emptied before Sent
2 Trash
# If both Sent and "Sent Messages" mailboxes exist, the next oldest message
# to be deleted is looked up from both of the mailboxes.
3 Sent
3 Sent Messages
```
:::

