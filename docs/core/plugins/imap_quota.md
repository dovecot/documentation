---
layout: doc
title: imap-quota
---

# IMAP Quota (imap-quota) Plugin

This plugin implements the IMAP command for requesting current quota
information.

It requires that the [[plugin,quota]] be activated and configured in Dovecot.

It implements the IMAP commands defined in [[rfc,2087]]

## Settings

There are no `dovecot.conf` settings for this plugin.

## Quota Admin Commands

This plugin implements the IMAP `SETQUOTA` command, which allows changing the
logged in user's quota limit if the user is admin.

Normally this means that a master user must log in with
`userdb_admin = y` set in the master passdb.

The changing is done via `dict_set()` command, so you must configure the
[[setting,quota_set]] setting to point to some dictionary where your quota
limit exists.

Example, for SQL:

::: code-group
```[dovecot.conf]
plugin {
  quota_set = dict:proxy::sqlquota
}

dict {
  sqlquota = mysql:/etc/dovecot/dovecot-dict-sql.conf.ext
}
```

```[dovecot-dict-sql.conf.ext]
# Use "host= ... pass=foo#bar" with double-quotes if your password has '#'
# character.
connect = host=/var/run/mysqld/mysqld.sock dbname=mails user=admin \
  password=pass

# Alternatively you can connect to localhost as well:
#connect = host=localhost dbname=mails user=admin password=pass # port=3306

map {
  pattern = priv/quota/limit/storage
  table = quota
  username_field = username
  value_field = bytes
}

map {
  pattern = priv/quota/limit/messages
  table = quota
  username_field = username
  value_field = messages
}
```
:::

Afterwards the quota can be changed with the IMAP command:

```
a SETQUOTA "User quota" (STORAGE 12345 MESSAGES 123)
```

