---
layout: doc
title: quota-clone
dovecotlinks:
  quota_clone: Quota Clone
---

# Quota Clone Plugin (`quota-clone`)

Quota clone plugin is useful when you want to store everybody's current quota
usage to a database, but you don't want to use the database as the
authoritative quota database.

For example you might want to access everybody's quota via Redis (or SQL)
but you don't store the Redis database permanently so it could become empty
once in a while.

Additionally, it is expensive to directly scan quota information from each
individual user account, so quota-clone allows access to quota information
that is less resource intensive.

In these example use-cases, you can use [[link,quota_driver_count]] as the
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
| --- | ----- |
| `priv/quota/messages` | Count of messages |
| `priv/quota/storage` | Storage usage (in bytes) |

## Example Configuration

```[dovecot.conf]
mail_plugins {
  quota = yes
  quota_clone = yes
}

redis_host = 127.0.0.1
redis_port = 6379
quota_clone {
  dict redis {
  }
}
```

More complex example using SQL:

```[dovecot.conf]
dict_server {
  dict mysql {
    driver = sql
    sql_driver = mysql

    dict_map priv/quota/messages {
      sql_table = quota
      username_field = username
      value_field messages {
      }
    }

    dict_map priv/quota/storage {
      sql_table = quota
      username_field = username
      value_field bytes {
      }
    }
  }
}

quota_clone {
  dict proxy {
    name = mysql
  }
}
```
