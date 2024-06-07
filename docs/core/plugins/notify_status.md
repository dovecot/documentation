---
layout: doc
title: notify-status
---

# Notify Status (notify-status) Plugin

This plugin updates a [[link,dict]] with mailbox status information
every time a mailbox changes.

## Settings

::: warning Note
This plugin requires that the [[plugin,notify]] is loaded.
:::

<SettingsComponent plugin="notify-status" />

## Configuration

### Dictionary Configuration

See [[link,dict]] for how to configure dictionaries.

This plugin updates the `priv/status/<mailbox name>` key.

### Example

```[dovecot.conf]
mail_plugins = $mail_plugins notify notify_status

plugin {
  notify_status_dict = proxy:dict-async:notify_status

  # By default all mailboxes are added to dict. This can be limited with:
  #notify_status_mailbox = INBOX
  #notify_status_mailbox2 = pattern2/*
  #...
}
```
### SQL dict Example

::: code-group

```[Dictionary Map]
map {
  pattern = priv/status/$box
  table = mailbox_status
  value_field = status
  username_field = username

  fields {
    mailbox = $box
  }
}
```

```sql[SQL Schema]
CREATE TABLE mailbox_status (
  username VARCHAR(255) NOT NULL,
  mailbox VARCHAR(255) NOT NULL,
  status VARCHAR(255),
  PRIMARY KEY (username, mailbox)
);
```

:::
