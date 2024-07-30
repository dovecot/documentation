---
layout: doc
title: quota-clone
dovecotlinks:
  quota_clone: Quota Clone
---

# Quota Clone (quota-clone) Plugin

Quota clone plugin is useful when you want to store everybody's current quota
usage to a database, but you don't want to use the database as the
authoritative quota database.

For example you might want to access everybody's quota via Redis (or SQL)
but you don't store the Redis database permanently so it could become empty
once in a while.

Additionally, it is expensive to directly scan quota information from each
individual user account, so quota-clone allows access to quota information
that is less resource intensive.

In these example use-cases, you can use [[link,quota_backend_count]] as the
authoritative quota database and make a copy of the quota usage to Redis.
From Redis you could then once in a while gather everybody's current quota
usage and send it to yet another place (e.g. for statistics handling).

Every time quota is updated, the value is updated to the cloned dict. There are
race conditions with it so the quota may not always be 100% correct. The old
value is always replaced with the new one though (not just
incremented/decremented) so the cloned quota is never too much wrong.

## Settings

<SettingsComponent plugin="quota-clone" />

## Updated Keys

The keys that are written:

| Key | Value |
| `priv/quota/messages` | Count of messages |
| `priv/quota/storage` | Storage usage (in bytes) |

## Example Configuration

```[dovecot.conf]
mail_plugins = $mail_plugins quota quota_clone
plugin {
  quota_clone_dict = redis:host=127.0.0.1:port=6379
}
```

More complex example using SQL:

```[dovecot.conf]
dict {
  mysql = mysql:/etc/dovecot/dovecot-dict-sql.conf.ext
}

plugin {
  quota_clone_dict = proxy::mysql
}
```
