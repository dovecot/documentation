---
layout: doc
title: mail-log
---

# Mail Logger (mail-log) Plugin

This plugin can be used to log several actions done in a mail session:

* Setting and removing \Deleted flag
* Expunging (includes autoexpunge)
* Copying mails
* Saves
* Mailbox creations
* Mailbox deletions
* Mailbox renames
* Any flag changes

Messages' IMAP UID and Message-ID header is logged for each action.

Example:

```
imap(user): copy -> Trash: uid=908, msgid=<123.foo@bar>
imap(user): delete: uid=908, msgid=<123.foo@bar>
imap(user): expunged: uid=908, msgid=<123.foo@bar>
```

The [[plugin,notify]] is required the mail_log plugin's operation, so be
certain it's also enabled.

## Settings

<SettingsComponent plugin="mail-log" />

## Example Configuration

```[dovecot.conf]
# Enable the plugin globally for all services
mail_plugins = $mail_plugins notify mail_log

plugin {
  mail_log_events = delete undelete expunge mailbox_delete mailbox_rename
  mail_log_fields = uid box msgid size from
  mail_log_cached_only = yes
}
```
