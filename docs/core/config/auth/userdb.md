---
layout: doc
title: userdb
dovecotlinks:
  userdb: userdb
  userdb_extra_fields:
    hash: extra-fields
    text: userdb extra fields
---

# User Databases (userdb)

Dovecot uses [[link,passdb]] and userdb as part of the authentication process.

passdb authenticated the user. userdb lookup then retrieves post-login
information specific to the authenticated user. This may include:

* Mailbox location information
* Quota limit
* Overriding settings for the user (almost any setting can be overridden)


| Userdb Lookups | Dovecot Proxy | Dovecot Backend |
| -------------- | ------------- | --------------- |
| IMAP & POP3 logins | No | YES |
| LMTP mail delivery | No | YES |
| doveadm commands | No | YES |

The userdb and passdb may be the same or they may be different depending on
your needs. You can also have [[link,auth_multiple_dbs]].

## Fields

The user database lookup can return these fields:

### `uid`
User's UID (UNIX user ID), overrides the global [[setting,mail_uid]] setting.

### `gid`
User's GID (UNIX group ID), overrides the global [[setting,mail_gid]] setting.

### `home`
User's home directory, overrides the global [[setting,mail_home]] setting.

Although not required, it's highly recommended even for virtual users.

### Optional Extra Fields

The extra fields are also passed to post-login scripts. See
[[link,post_login_scripting]].

#### `user`

Changes the username (can also be done by the passdb lookup).

#### Overwriting Mail-Related Settings

For example:

* `mail`
:   Mail location, overrides the global [[setting,mail_location]]
    setting. See: [[link,mail_location]].

* `quota_rule`
:   Specify per-user quota limit.

## Supported Databases

| Database | Description |
| -------- | ----------- |
| [[link,auth_passwd,Passwd]] | System users (NSS, `/etc/passwd`, or similar). |
| [[link,auth_passwd_file,Passwd-file]] | `/etc/passwd`-like file. |
| [[link,auth_nss,NSS]] | Name Service Switch. |
| [[link,auth_ldap,LDAP]] | Lightweight Directory Access Protocol. |
| [[link,auth_sql,SQL]] | SQL database (PostgreSQL, MySQL, SQLite, Cassandra). |
| [[link,auth_staticdb,Static]] | Userdb information generated from a given template. |
| [[link,auth_prefetch,Prefetch]] | Prefetch database. This assumes that the passdb already returned also all the required user database information. |
| [[link,auth_lua,Lua]] | Lua script for authentication. |

## Settings

An example userdb entry might look like this:

```
userdb {
  driver = passwd-file
  args = username_format=%n /etc/dovecot/users

  default_fields = uid=vmail gid=vmail
  override_fields =

  skip = never
  result_failure = continue
  result_internalfail = continue
  result_success = return-ok

  auth_verbose = default
}
```

### Content Settings

Settings that provide content for the userdb lookup:

#### `driver`

The userdb backend name.

#### `args`

Arguments for the userdb backend.

The format of this value depends on the userdb driver. Each one uses
different args.

#### `default_fields`

Userdb fields (and [extra fields](#extra-fields)) that are used, unless
overwritten by the userdb backend. They are in format:
`key=value key2=value2 ....`

The values can contain [[variable]]. All `%variables` used here reflect the
state BEFORE the userdb lookup.

#### `override_fields`

Same as `default_fields`, but instead of providing the default values,
these values override what the userdb backend returned.

All `%variables` used here reflect the state AFTER the userdb lookup.

For example, this is useful with userdb passwd for overriding home directory
or `uid` or `gid`. See [[link,auth_passwd]].

#### `auth_verbose`

If this is explicitly set to `yes` or `no`, it overrides the global
[[setting,auth_verbose]] setting. However, [[setting,auth_debug,yes]]
overrides the `auth_verbose` setting.

### Applicability Settings

Settings which specify when the specific userdb is used:

#### `skip`

Do we sometimes want to skip over this userdb? Options:

* `never`
* `found`: Skip if an earlier userdb already found the user
* `notfound`: Skip if previous userdbs haven't yet found the user

### Success Settings

Settings that control what happens when finished with this userdb:

#### `result_success`

What to do if the user was found from the userdb

Default: `return-ok`

#### `result_failure`

What to do if the user wasn't found from the userdb

Default: `continue`

#### `result_internalfail`

What to do if the userdb lookup had an internal failure

Default: `continue`

If any of the userdbs had an internal failure, and the final userdb also
returns `continue`, the lookup will fail with `internal error`.

::: warning
If multiple userdbs are required (results are merged), it's
important to set `result_internalfail=return-fail` to them,
otherwise the userdb lookup could still succeed but not all the
intended extra fields are set.
:::

### Success Values

The success result values:

#### `return-ok`

Return success, don't continue to the next userdb.

#### `return-fail`

Return "user doesn't exist", don't continue to the next userdb.

#### `return`

Return earlier userdb's success or failure, don't continue to the
next userdb. If this was the first userdb, return "user doesn't exist".

#### `continue-ok`

Set the current user existence state to "found", and continue to the next
userdb.

#### `continue-fail`

Set the current user existence state to "not found", and continue to the
next userdb.

#### `continue`

Continue to the next userdb without changing the user existence state.
The initial state is "not found".

## Extra Fields

A user database lookup typically returns `uid`, `gid`, and `home` fields,
as per traditional `/etc/passwd` lookups.

Other fields may also be stored in the userdb, and these are called 'extra
fields'.

These fields can be returned the exact same way as `uid`, `gid`, and `home`
fields.

It's possible to override settings from `dovecot.conf`. This is commonly
done for [[setting,quota_rule]] to set per-user quota limits, although it
can be done for any plugin settings.

The extra fields are also passed to [[link,post_login_scripting]].

::: info [[changed,extra_fields_empty]]
Extra fields can now also be set to empty string, while previously they were
changed to `yes`.

Extra fields without value (without `=`) will default to `yes`.
:::

### Suffixes

The following suffixes added to a field name are handled specially:

#### `:protected`

Set this field only if it hasn't been set before.

#### `:remove`

Remove this field entirely.

For example you can return `mail_plugins:remove` to the `mail_plugins`
field. This differs from `mail_plugins=` in that the field is removed
entirely (and default is used) instead of just being set to an empty value.

### Fields

#### `mail`

[[link,mail_location]], overrides the global [[setting,mail_location]] setting.

#### `nice`

Set the mail process's priority to be the given value.

#### `chroot`

Chroot to given directory. Overrides [[setting,mail_chroot]].

#### `system_groups_user`

Specifies the username whose groups are read from `/etc/group` (or
wherever NSS is configured to taken them from).

The logged in user has access to those groups.

This may be useful for shared mailboxes.

#### `userdb_import`

This allows returning multiple extra fields in one TAB-separated field.
It's useful for userdbs which are a bit less flexible for returning a
variable number of fields (e.g. SQL).

#### `uidgid_file`

Get `uid` and `gid` for user based on the given filename.

#### `user`

User can be overridden (normally set in [[link,passdb]]).

#### `event_<name>`

Import `name=value` to mail user event.

### Overriding Settings

Most commonly settings are overridden from plugin section.

For example if your plugin section has `quota_rule=*:storage=100M` value
and the userdb lookup returns `quota_rule=*:storage=200M`, the original
quota setting gets overridden. In fact, if the lookup always returns a
`quota_rule` field, there's no point in having [[setting,quota_rule]] in
the `dovecot.conf` plugin section at all, because it always gets overridden
anyway.

To understand how imap and pop3 processes see their settings, it may be
helpful to know how Dovecot internally passes them:

1. First all actual settings are first read into memory.
2. Next all the extra fields returned by userdb lookup are used to override
   the settings. Any unknown setting is placed into the plugin {} section
   (e.g. `foo=bar` will be parsed as if it were `plugin { foo=bar }`).
3. Last, if [[link,post_login_scripting]] is used, it may modify the
   settings.

If you want to override settings inside sections, you can separate the
section name and key with `/`. For example:

```[dovecot.conf]
namespace default {
  inbox = yes
  separator = .
  location = maildir:~/Maildir
}
```

The separator setting can be overridden by returning
[[setting,namespace_separator,namespace/default/separator]] extra field.

### Examples

#### SQL

::: code-group
```[dovecot-sql.conf]
user_query = SELECT home, uid, gid, \
    CONCAT('*:bytes=', quota_bytes) AS quota_rule, \
    separator AS "namespace/default/separator" \
    FROM users WHERE username = '%n' and domain = '%d'
```
:::

#### LDAP

::: code-group
```[dovecot-ldap.conf]
user_attrs = \
    =home=%{ldap:homeDirectory}, \
    =uid=%{ldap:uidNumber},
    =gid=%{ldap:gidNumber},
    =quota_rule=*:bytes=%{ldap:quotaBytes},
    =namespace/default/separator=%{ldap:mailSeparator}
```
:::

#### passwd-file

Example that shows how to give two userdb extra fields (`mail` and
`quota`).

Note that all userdb extra fields must be prefixed with `userdb_`,
otherwise they're treated as passdb extra fields.

:::code-group
```[passwd-file]
user:{plain}pass:1000:1000::/home/user::userdb_mail=mbox:~/mail userdb_quota_rule=*:storage=100M userdb_namespace/default/separator=/
user2:{plain}pass2:1001:1001::/home/user2::userdb_mail=maildir:~/Maildir userdb_quota_rule=*:storage=200M
```
:::

## See Also

- [[link,auth_caching]]
