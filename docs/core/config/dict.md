---
layout: doc
title: Dictionary
dovecotlinks:
  dict: dictionary
  dict_proxy:
    hash: dictionary-proxy-process
    text: Dictionary Proxy Process
  dict_redis:
    hash: redis
    text: Redis
---

# Dovecot Dictionary (dict)

Dovecot's lib-dict can be used to access simple key-value databases. This is
used by, for example, [[plugin,last-login]] and [[setting,imap_metadata]].

The dictionaries can be accessed either directly by the mail processes or
they can be accessed via [proxy processes](#dictionary-proxy-process).

Currently supported drivers are:

| Name | Description |
| ---- | ----------- |
| [`file`](#flat-files) | Flat Files |
| [`fs`](#filesystem-lib-fs-wrapper) | FS (lib-fs wrapper) |
| [`ldap`](#ldap) | LDAP (read only) |
| [`proxy`](#proxy) | Proxy |
| [`redis`](#redis) | Redis |
| [`sql`](#sql) | SQL |

## Connection Pooling

The SQL drivers keep a persistent connection open to the database after it's
been accessed once. The connection is reused for other SQL lookups as long as
their SQL settings are exactly the same. Opened SQL connections are currently
never closed.

## Drivers

### Flat Files

The file will contain all the keys that are used. Not very efficient for large
databases, but good for small ones such as a single user's quota.

<SettingsComponent tag="dict-file" level="3" />

### Filesystem (lib-fs-wrapper)

This is a wrapper for lib-fs, which most importantly has the `posix`
driver. Use the [[setting,fs]] setting to configure the filesystem.
For example:

```
dict fs {
  fs posix {
    prefix = /var/lib/dovecot/dict/
  }
}
```

This create a separate file under `/var/lib/dovecot/dict` for each key.

### LDAP

LDAP support is very similar to [`sql`](#sql) support, but there is no write
support.

Note that the LDAP driver must be used via [`proxy`](#proxy).

See [[link,auth_ldap]].

#### Configuration

::: code-group
```[dovecot.conf]
dict_server {
  dict ldap {
    driver = ldap
    ldap_uris = ldap://{{LDAPHOST}}
    ldap_auth_dn = uid=testadmin,cn=users,dc=dovecot,dc=net
    ldap_auth_dn_password = testadmin
    ldap_timeout_secs = 5
    ldap_base = dc=dovecot,dc=net
    ldap_starttls = no
    ssl_client_require_valid_cert = no

    dict_map priv/test/home {
      ldap_filter = (&(homeDirectory=*)(uid=%{user}))
      value = %{ldap:homeDirectory}
    }
  }
}
```
:::

#### LDAP Settings

<SettingsComponent tag="dict-ldap" level="2" />
<SettingsComponent tag="ssl-ldap" level="2" />

#### Examples

To map a key to a search:
```
dict_map priv/test/mail {
  ldap_filter = (&(uid=%{user})(mail=*))
  ldap_base = ou=container,dc=domain
  value = %{ldap:mail}
}
```

To do a more complex search:
```
dict_map priv/test/mail/$location {
  ldap_filter = (&(uid=%{user})(mail=*)(uid=%{pattern:location}))
  ldap_base = ou=container,dc=domain
  value = %{ldap:mail}
}
```

### Proxy

The proxy driver performs dictionary accessing via the [[link,dict_proxy]].
(The dict processes exist only if dict proxying is used.) This is especially
useful with drivers where their initialization is relatively expensive, such
as SQL. The dict processes will perform connection pooling.

<SettingsComponent tag="dict-proxy" level="3" />

### Redis

The Redis driver is recommended to be used via [`proxy`](#proxy) to support
[connection pooling](#connection-pooling).

::: warning
Currently using Redis without proxying may cause crashes.
:::

<SettingsComponent tag="dict-redis" level="3" />

### SQL

::: warning
Note that the SQL driver must be used with [`proxy`](#proxy).
:::

<SettingsComponent tag="dict-sql" level="3" />

#### SQL Mapping

The SQL database fields are mapped into dict keys using the
[[setting,dict_map]] setting. When a dict lookup or update is done, Dovecot
goes through all the maps and uses the first one whose pattern matches the dict
key.

For example when using dict for a per-user quota value the map looks like:

```[dovecot.conf]
dict_map priv/quota/storage {
  sql_table = quota
  username_field = username
  value_field quota_bytes {
  }
}
```

* The dict key must match exactly `priv/quota/storage`. The dict keys are
  hardcoded in the Dovecot code, so depending on what functionality you're
  configuring you need to know the available dict keys used it.
* This is a private dict key (`priv/` prefix), which means that there must
  be a `username_field`. The `username_field` is assumed to be (at least part
  of) the primary key. In this example we don't have any other primary keys.
* With MySQL the above map translates to SQL queries:

  * `SELECT quota_bytes FROM quota WHERE username = '$username_field'`
  * `INSERT INTO quota (username, quota_bytes) VALUES ('$username_field',
    '$value') ON DUPLICATE KEY UPDATE quota_bytes='$value'`

You can also access multiple SQL fields. For example
[[setting,acl_sharing_map]] can contain:

```[dovecot.conf]
dict_map shared/shared-boxes/user/$to/$from {
  sql_table = user_shares
  value_field dummy {
  }

  key_field from_user {
    pattern = $from
  }
  key_field to_user {
    pattern = $to
  }
}
```

* The [[setting,acl_sharing_map]] always uses `1` as the value, so here the
  `value` is called `dummy`.
* The SQL `from_user` and `to_user` fields are the interesting ones.
  Typically the extra fields would be part of the primary key.
* With MySQL the above map translates to SQL queries:

  * `SELECT dummy FROM user_shares WHERE from_user = '$from' AND to_user =
    '$to'`
  * `INSERT INTO user_shares (from_user, to_user, dummy) VALUES ('$from',
    '$to', '$value') ON DUPLICATE KEY UPDATE dummy='$value'`

#### SQL dict with `mail_attribute`

It's possible to implement [[setting,mail_attribute]] also with SQL dict.

::: warning
Using shared attributes in [[setting,mail_attribute]] requires the
mailbox GUID to be unique between users. This is not the case when
mails were migrated via imapc, because it uses a hash of the
mailbox name as the GUID. So every migrated user would have
exactly the same INBOX GUID, preventing the use of dict-sql. It is
currently not possible to add a username as an additional unique
identifier.
:::

```
# CREATE TABLE mailbox_private_attributes (
#   username VARCHAR(255),
#   mailbox_guid VARCHAR(32),
#   attr_key VARCHAR(255),
#   attr_value TEXT,
#   PRIMARY KEY (username, mailbox_guid, attr_key)
# )
dict_map priv/$mailbox_guid/$key {
  sql_table = mailbox_private_attributes
  username_field = user
  value_field attr_value {
  }

  key_field attr_key {
    pattern = $key
  }
  key_field mailbox_guid {
    pattern = $mailbox_guid
  }
}

# CREATE TABLE mailbox_shared_attributes (
#   mailbox_guid VARCHAR(32),
#   attr_key VARCHAR(255),
#   attr_value TEXT,
#   PRIMARY KEY (mailbox_guid, attr_key)
# );
dict_map shared/$mailbox_guid/$key {
  sql_table = mailbox_shared_attributes
  value_field attr_value {
  }

  key_field attr_key {
    pattern = $key
  }
  key_field mailbox_guid {
    pattern = $mailbox_guid
  }
}
```

## Dictionary Proxy Process

Dict server is used for providing dictionary access via server
processes instead of doing it directly from whichever process wants to access
the dictionary. This is useful for some drivers with relatively high
connection cost (e.g. [`sql`](#sql)), but not necessarily for others (e.g.,
[`redis`](#redis).

When a mail process uses the dict proxy, it needs to have access the dict
UNIX socket. By default only the `dovecot` user has access to the dict
socket, which doesn't typically work in any installation. However, giving too
wide permissions by default might allow untrusted users to access the dict and
cause problems.

If all users share a single UNIX UID (e.g. `vmail`), you could make the dict
socket accessible only to it:

```
service dict {
  unix_listener dict {
    mode = 0600
    user = vmail
  }
}
```

If you use multiple UNIX UIDs, you can add an extra group for all Dovecot mail
processes. This works even if you have untrusted system users who have shell
access to the server:

```
mail_access_groups = dovecot

service dict {
  unix_listener dict {
    mode = 0660
    group = dovecot
  }
}
```

However, it works with [[link,lda]] only if it's started as root. If this
isn't possible, use [[link,lmtp]] instead.

### Settings

<SettingsComponent tag="dict-server" level="3" />
