---
layout: doc
title: Dictionary
dovecotlinks:
  dict: dictionary
  dict_idle_timeout:
    hash: proxy-parameters
    text: dictionary idle timeout setting
  dict_proxy:
    hash: dictionary-proxy-process
    text: dict proxy
  dict_redis:
    hash: redis
    text: Redis
  dict_slow_warn:
    hash: proxy-parameters
    text: dictionary slow warning setting
---

# Dovecot Dictionary (dict)

Dovecot's lib-dict can be used to access simple key-value databases. This is
used by, for example, [[plugin,last-login]] and [[setting,imap_metadata]].

The dictionaries can be accessed either directly by the mail processes or
they can be accessed via [proxy processes](#dictionary-proxy-process).

Currently supported backends are:

| Name | Description |
| ---- | ----------- |
| [`file`](#flat-files) | Flat Files |
| [`fs`](#filesystem-lib-fs-wrapper) | FS (lib-fs wrapper) |
| [`ldap`](#ldap) | LDAP (read only) |
| [`proxy`](#proxy) | Proxy |
| [`redis`](#redis) | Redis |
| [`sql`](#sql) | SQL |

## Connection Pooling

The [`sql`](#sql) driver keeps a maximum of 10 unused SQL connections open
(infinitely) and reuses them for SQL dict lookup requests.

The dict server process keeps the last 10 idle dict
backends cached for maximum of 30 seconds. Practically this acts as a
connection pool for [`redis`](#redis) and [`ldap`](#ldap). Note that this
doesn't affect `sql`, because it already had its own internal cache.

## Backends

### Flat Files

`file:<path>`

The file will simply contain all the keys that are used. Not very efficient
for large databases, but good for small ones such as a single user's quota.

### Filesystem (lib-fs-wrapper)

`fs:<driver>:<driver args>`

This is a wrapper for lib-fs, which most importantly has the `posix`
backend. So using:

```
fs:posix:prefix=/var/lib/dovecot/dict/
```

Would create a separate file under `/var/lib/dovecot/dict` for each key.

### LDAP

LDAP support is very similar to [`sql`](#sql) support, but there is no write
support.

Note that the LDAP backend must be used via [`proxy`](#proxy).

See [[link,auth_ldap]].

#### Configuration

::: code-group
```[dovecot.conf]
dict {
  somedict = ldap:/path/to/dovecot-ldap-dict.conf.ext
}
```
:::

#### LDAP Parameters

| Parameter | Required | Description |
| --------- | -------- | ----------- |
| `uri` | **YES**  | LDAP connection URI as expected by OpenLDAP. |
| `bind_dn` | NO | DN or upn to use for binding. (default: none) |
| `debug` | NO | Enable debug. `0` = off (default), `1` = on. |
| `password` | NO | Password to use, only SIMPLE auth is supported at the moment. (default: none) |
| `timeout` | NO | How long to wait for reply, in seconds. (default:30 seconds) |
| `tls` | NO | Use TLS?<br/>`yes`: Require either ldaps or successful start TLS<br/> `try`: Send start TLS if necessary (default)<br/> `no`:  Do not send start TLS. |

#### Examples

To map a key to a search:

```
map {
  pattern = priv/test/mail
  filter = (mail=*)  # the () is required
  base_dn = ou=container,dc=domain
  username_attribute = uid # default is cn
  value_attribute = mail
}
```

To do a more complex search:

```
map {
  pattern = priv/test/mail/$location
  filter = (&(mail=*)(location=%{location}) # the () is required
  base_dn = ou=container,dc=domain
  username_attribute = uid # default is cn
  value_attribute = mail

  fields {
    location=$location
  }
}
```

### Proxy

`proxy:[param=value:...][<dict path>]:<destination dict>`

Proxying is used to perform all dictionary accessing via the dict processes.
(The dict processes exist only if dict proxying is used.) This is especially
useful with backends where their initialization is relatively expensive, such
as SQL. The dict processes will perform connection pooling.

If `<dict path>` is specified, it points to the socket where the dict server
is answering. The default is to use `$base_dir/dict`. Usually this is
changed to `dict-async` if the dict backend support asynchronous lookups
(e.g. ldap, pgsql, cassandra). The dict-async service allows more than one
client, so this configuration prevents creating unnecessarily many dict
processes.

The `<destination dict>` contains the dict name in the `dict { .. }`
settings. For example: `proxy:dict-async:quota`.

See [proxy processes](#dictionary-proxy-process) for more information about
the dict server.

#### Proxy Parameters

| Parameter | Required | Description |
| --------- | -------- | ----------- |
| `idle_timeout=<time_msecs>` | NO | How long to idle before disconnecting. (default: 0; which means immediate disconnect after finishing the operation) |
| `slow_warn=<time_msecs>` | NO | Log a warning about lookups that take longer than this interval. (default: 5s) |

### Redis

`redis:param=value:param2=value2:...`

Note that Redis backend is recommended to be used via [`proxy`](#proxy) to
support [connection pooling](#connection-pooling).

::: warning
Currently using Redis without proxying may cause crashes.
:::

#### Redis Parameters

| Parameter | Required | Description |
| --------- | -------- | ----------- |
| `db` | NO | Database number (default: `0`) |
| `expire_secs` | NO | Expiration value for all keys (in seconds) (default: no expiration) |
| `host` | NO | Redis server host (default: `127.0.0.1`) |
| `port` | NO | Redis server port (default: `11211`) |
| `password` | NO | Redis Password (default: none) |
| `prefix` | NO | Prefix to add to all keys (default: none) |
| `timeout_msecs` | NO | Abort lookups after specified number of milliseconds (default: `30000`) |

### SQL

`<sql driver>:<path to dict-sql config>`

The `<sql driver>` component contains the SQL driver name, such as
`mysql`, `pgsql`, `sqlite`, or `cassandra`.

::: warning
Note that the SQL backend must be used with [`proxy`](#proxy).
:::

The dict-sql config file consists of SQL server configuration and mapping of
keys to SQL tables/fields.

See [[link,auth_sql]].

#### SQL Connect String

`connect = host=localhost dbname=mails user=sqluser password=sqlpass`

The connect setting is exactly the same as used for [[link,auth_sql]].

#### SQL Mapping

SQL mapping is done with a dict key pattern and fields. When a dict lookup or
update is done, Dovecot goes through all the maps and uses the first one whose
pattern matches the dict key.

For example when using dict for a per-user quota value the map looks like:

```
map {
  pattern = priv/quota/storage
  table = quota
  username_field = username
  value_field = quota_bytes
}
```

* The dict key must match exactly `priv/quota/storage`. The dict keys are
  hardcoded in the Dovecot code, so depending on what functionality you're
  configuring you need to know the available dict keys used it.
* This is a private dict key (`priv/` prefix), which means that there must
  be a username_field. The `username_field` is assumed to be (at least part
  of) the primary key. In this example we don't have any other primary keys.
* With MySQL the above map translates to SQL queries:

  * `SELECT quota_bytes FROM quota WHERE username = '$username_field'`
  * `INSERT INTO quota (username, quota_bytes) VALUES ('$username_field',
    '$value') ON DUPLICATE KEY UPDATE quota_bytes='$value'`

You can also access multiple SQL fields. For example
[[setting,acl_shared_dict]] can contain:

```
map {
  pattern = shared/shared-boxes/user/$to/$from
  table = user_shares
  value_field = dummy

  fields {
    from_user = $from
    to_user = $to
  }
}
```

* The `acl_shared_dict` always uses `1` as the value, so here the
  `value_field` is called `dummy`.
* The SQL `from_user` and `to_user` fields are the interesting ones.
  Typically the extra fields would be part of the primary key.
* With MySQL the above map translates to SQL queries:

  * `SELECT dummy FROM user_shares WHERE from_user = '$from' AND to_user =
    '$to'`
  * `INSERT INTO user_shares (from_user, to_user, dummy) VALUES ('$from',
    '$to', '$value') ON DUPLICATE KEY UPDATE dummy='$value'`

#### SQL dict with `mail_attribute_dict`

It's possible to implement [[setting,mail_attribute_dict]] also with
SQL dict.

::: warning
Using shared attributes in `mail_attribute_dict` requires the
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
#   value TEXT,
#   PRIMARY KEY (username, mailbox_guid, attr_key)
# )
map {
  pattern = priv/$mailbox_guid/$key
  table = mailbox_private_attributes
  username_field = user
  value_field = value

  fields {
    attr_key = $key
    mailbox_guid = $mailbox_guid
  }
}

# CREATE TABLE mailbox_shared_attributes (
#   mailbox_guid VARCHAR(32),
#   attr_key VARCHAR(255),
#   value TEXT,
#   PRIMARY KEY (mailbox_guid, attr_key)
# );
map {
  pattern = shared/$mailbox_guid/$key
  table = mailbox_shared_attributes
  value_field = value

  fields {
    attr_key = $key
    mailbox_guid = $mailbox_guid
  }
}
```

## Dictionary Proxy Process

Dict server is used for providing dictionary access via server
processes instead of doing it directly from whichever process wants to access
the dictionary. This is useful for some backends with relatively high
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
