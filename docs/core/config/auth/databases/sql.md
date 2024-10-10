---
layout: doc
title: SQL
dovecotlinks:
  auth_sql: SQL authentication database
---

# SQL Database (`sql`)

SQL can be used for both [[link,passdb]] and [[link,userdb]] lookups.

If all the SQL settings for the [[link,passdb]] and [[link,userdb]] are equal,
only one SQL connection is used for both [[link,passdb]] and [[link,userdb]]
lookups.

## Dovecot Configuration

```[dovecot.conf]
# sql driver-specific settings

passdb sql {
  sql_driver = # ...
  query = # ...
}
```

## passdb

[[setting,passdb_sql_query]] setting contains the SQL query to look up the
password. It must return a field named `password`. If you have it by any other
name in the database, you can use the SQL's `AS` keyword (`SELECT pw AS
password ..`).

You can use all the normal [[variable]] such as `%{user}` in the SQL query.

If all the passwords are in same format, you can use
[[setting,passdb_default_password_scheme]] to specify it. Otherwise each
password needs to be prefixed with `{password-scheme}`, for example
`{plain}cleartext-password`. See [[link,password_schemes]] for a list of
supported password schemes.

By default MySQL does case-insensitive string comparisons, so you may have a
problem if your users are logging with different as `user`, `User` and
`uSer`. To fix this, you can make the SQL database return a
[[link,userdb_extra_fields]] which makes Dovecot modify the username to
the returned value.

::: info
If you're using separate user and domain fields, a common problem is
that you're returning only the `user` field from the database.
**This drops out the domain from the username**. So make sure you're
returning a concatenated `user@domain` string or username/domain
fields separately. See the examples below.
:::

The query can also return other [[link,passdb_extra_fields]]
which have special meaning.

You can't use multiple statements in one query, but you could use a stored
procedure. If you want something like a last login update, use
[[link,post_login_scripting]] instead.

### Password Verification by SQL Server

If the passwords are in some special format in the SQL server that Dovecot
doesn't recognize, it's still possible to use them. Change the SQL query to
return NULL as the password and return the row only if the password matches.
You'll also need to return a non-NULL `nopassword` field. The password is in
`%{password}` variable. For example:

```[dovecot.conf]
passdb sql {
  query = SELECT NULL AS password, 'Y' as nopassword, userid AS user \
    FROM users \
    WHERE userid = '%{user}' AND mysql_pass = password('%{password}')
}
```

This of course makes the verbose logging a bit wrong, since password
mismatches are also logged as `unknown user`.

## userdb

Usually your SQL database contains also the userdb information. This means
user's UID, GID, and home directory. If you're using only static UID and GID,
and your home directory can be specified with a template, you could use
[[link,auth_staticdb]] instead. It is also a bit faster since it avoids
doing the userdb SQL query.

[[setting,userdb_sql_query]] setting contains the SQL query to look up the
userdb information. The commonly returned userdb fields are uid, gid, home, and
mail. See [[link,userdb_extra_fields]] for more information about these and
other fields that can be returned.

If you're using a single UID and GID for all users, you can set them in
dovecot.conf with:

```[dovecot.conf]
mail_uid = vmail
mail_gid = vmail
```

## User Iteration

Some commands, such as `doveadm -A` need to get a list of users. With SQL
userdb this is done with the [[setting,userdb_sql_iterate_query]] setting.

You can either return:

* `user` field containing either user or user@domain style usernames, or
* `username` and `domain` fields

Any other fields are ignored.

## Prefetching

If you want to avoid doing two SQL queries when logging in with IMAP/POP3, you
can make the [[setting,passdb_sql_query]] return all the necessary userdb
fields and use [[link,auth_prefetch]] to use those fields.

If you're using Dovecot's deliver you'll still need to have the
[[setting,userdb_sql_query]] working.

## High Availability

You can add multiple [[link,sql_mysql]] or [[link,sql_postgresql]] settings to
specify multiple hosts for MySQL and PostgreSQL. Dovecot will do round robin
load balancing between them. If one of them goes down, the others will handle
the traffic.

## Examples

::: info
`user` can have a special meaning in some SQL databases, so we're using
`userid` instead.
:::

SQL table creation command:

```sql
CREATE TABLE users (
    userid VARCHAR(128) NOT NULL,
    domain VARCHAR(128) NOT NULL,
    password VARCHAR(64) NOT NULL,
    home VARCHAR(255) NOT NULL,
    uid INTEGER NOT NULL,
    gid INTEGER NOT NULL
);
```

### MySQL

Add to your `dovecot.conf` file:

```
sql_driver = mysql

# The mysqld.sock socket may be in different locations in different systems.
mysql /var/run/mysqld/mysqld.sock {
  user = admin
  password = pass
  dbname = mails

  #ssl = yes
  #ssl_client_ca_dir = /etc/ssl/certs
}
# Alternatively you can connect to localhost as well:
#mysql localhost {
#}

passdb sql {
  query = SELECT userid AS username, domain, password \
    FROM users \
    WHERE userid = '%{user | username}' AND domain = '%{user | domain}'
}
userdb sql {
  query = SELECT home, uid, gid \
    FROM users \
    WHERE userid = '%{user | username}' AND domain = '%{user | domain}'
  # For using doveadm -A:
  iterate_query = SELECT userid AS username, domain FROM users
}
```

### PostgreSQL

Add to your `dovecot.conf` file:

```
sql_driver = pgsql

pgsql localhost {
  parameters {
    user = admin
    # You can also set up non-password authentication by modifying PostgreSQL's
    # pg_hba.conf
    password = pass
    dbname = mails
  }
}

passdb sql {
  query = SELECT userid AS username, domain, password \
    FROM users \
    WHERE userid = '%{user | username}' AND domain = '%{user | domain}'
}
userdb sql {
  query = SELECT home, uid, gid \
    FROM users \
    WHERE userid = '%{user | username}' AND domain = '%{user | domain}'
  # For using doveadm -A:
  iterate_query = SELECT userid AS username, domain FROM users
}
```

### SQLite

Add to your `dovecot.conf` file:

```
sql_driver = sqlite
sqlite_path = /path/to/sqlite.db

passdb sql {
  query = SELECT userid AS username, domain, password \
    FROM users \
    WHERE userid = '%{user | username}' AND domain = '%{user | domain}'
}
userdb sql {
  query = SELECT home, uid, gid \
    FROM users \
    WHERE userid = '%{user | username}' AND domain = '%{user | domain}'
  # For using doveadm -A:
  iterate_query = SELECT userid AS username, domain FROM users
}
```
