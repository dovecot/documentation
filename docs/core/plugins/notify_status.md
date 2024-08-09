---
layout: doc
title: notify-status
---

# Notify Status Plugin (`notify-status`)

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

notify_status {
  dict_driver = proxy
  dict_proxy_name = notify_status
  dict_proxy_socket_path = dict-async
}

# By default no mailbox is added to dict. To enable all notify_status for
# all mailboxes add:
#mailbox_notify_status = yes

# If you keep the default mailbox_notify_status = no you can enable it per
# mailbox like this:
mailbox inbox {
  notify_status = yes
}
mailbox TestBox {
  notify_status = yes
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
