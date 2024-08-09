---
layout: doc
title: passdb
dovecotlinks:
  passdb: passdb
  passdb_auth_nologin:
    hash: nologin
    text: "passdb: Authentication `nologin` Extra Field"
  passdb_extra_fields:
    hash: extra-fields
    text: "passdb: Extra Fields"
  passdb_user_extra_fields:
    hash: user-extra-fields
    text: "passdb: User Extra Fields"
  passdb_result_values:
    hash: result-values
    text: "passdb: Result Values"
---

# Password Databases (`passdb`)

Dovecot uses `passdb` and [[link,userdb]] as part of the authentication process.

`passdb` authenticates the user. It also provides any other pre-login
information needed for users, such as:

* Which server user is proxied to.
* If user should be allowed to log in at all (temporarily or permanently).

| Passdb Lookups | Dovecot Proxy | Dovecot Backend |
| -------------- | ------------- | --------------- |
| IMAP & POP3 logins | YES | YES |
| LMTP mail delivery | YES | YES |
| doveadm commands | YES | YES |

See also [[link,userdb]].

## Passwords

The password can be in any format that Dovecot supports, but you need to tell
the format to Dovecot because it won't try to guess it.

The SQL and LDAP configuration files have the `default_pass_scheme` setting
for this.

If you have passwords in multiple formats, or the `passdb` doesn't have such a
setting, you'll need to prefix each password with `{<scheme>}`:
`{PLAIN}cleartext-password` or `{PLAIN-MD5}1a1dc91c907325c69271ddf0c944bc72`.

Dovecot authenticates users against password databases. It can also be used to
configure things like [[link,authentication_proxies]].

You can use multiple databases, so if the password doesn't match in the first
database, Dovecot checks the next one. This can be useful if you want to easily
support having both virtual users and also local system users (see
[[link,auth_multiple_dbs]]).

## Success/Failure Database

These **databases** simply verify if the given password is correct for the
user. Dovecot doesn't get the correct password from the database, it only gets
a `success` or a `failure` reply. This means that these databases can't be used
with non-cleartext [[link,authentication_mechanisms]].

Databases that belong to this category are:

| Database | Description |
| -------- | ----------- |
| [[link,auth_pam,PAM]] | Pluggable Authentication Modules. |
| [[link,auth_imap,IMAP]] | Authenticate against remote IMAP server. |
| [[link,auth_oauth2,OAuth2]] | Authenticate against OAuth2 provider. |
| [[link,auth_bsd,BSDAuth]] | BSD authentication (deprecated, unsupported). |

## Lookup Database

Dovecot does a lookup based on the username and possibly other information
(e.g. IP address) and verifies the password validity itself.

Databases that support looking up only passwords, but no user or extra fields:

| Database | Description |
| -------- | ----------- |
| [[link,auth_passwd,Passwd]] |  System users (NSS, `/etc/passwd`, or similar). |

::: info
Dovecot supports reading all [[link,password_schemes]] from passwd databases
(if prefix is specified), but that is of course incompatible with all other
tools using/modifying the passwords.
:::

Databases that support looking up everything:

| Database | Description |
| -------- | ----------- |
| [[link,auth_passwd_file,Passwd-file]] | `/etc/passwd`-like file. |
| [[link,auth_ldap,LDAP]] | Lightweight Directory Access Protocol. |
| [[link,auth_sql,SQL]] | SQL database (PostgreSQL, MySQL, SQLite, Cassandra). |
| [[link,auth_staticdb,Static]] | Static `passdb` for simple configurations. |
| [[link,auth_lua,Lua]] | Lua script for authentication. |

### Fields

Fields that the lookup can return:

#### `password`

User's password. See [[link,password_schemes]].

#### `password_noscheme`

Like `password`, but if a password begins with `{`, assume it belongs to the
password itself instead of treating it as a [[link,password_schemes]] prefix.
This is usually needed only if you use cleartext passwords.

#### `user`

Returning a user field can be used to change the username.

Typically used only for case changes (e.g. `UseR` -> `user`). See
[[link,passdb_user_extra_fields]].

#### `username`

Like `user`, but doesn't drop existing domain name (e.g. `username=foo` for
`user@domain` gives `foo@domain`).

#### `domain`

Updates the domain part of the username.

#### User Extra Fields

Other special [[link,passdb_extra_fields]].

## Settings

<SettingsComponent tag="passdb" />

## Result Values

The following values control the behavior of a passdb lookup result:

### `return-ok`

Return success, don't continue to the next `passdb`.

### `return-fail`

Return failure, don't continue to the next `passdb`.

### `return`

Return earlier `passdb`'s success or failure, don't continue to the next
`passdb`. If this was the first `passdb`, return failure.

### `continue-ok`

Set the current authentication state to "success", and continue to the next
`passdb`.

The following `passdb`s will skip password verification.

::: info
When using this value on a master `passdb { master = yes }`, execution will
jump to the first non-master `passdb` instead of continuing with the next
master `passdb`.
:::

### `continue-fail`

Set the current authentication state to "failure", and continue to the next
`passdb`.

The following `passdb`s will still verify the password.

::: info
When using this value on a master `passdb { master = yes }`, execution will
jump to the first non-master `passdb` instead of continuing with the next
master `passdb`.
:::

### `continue`

Continue to the next `passdb` without changing the authentication state. The
initial state is "failure found". If this was set in
[[setting,passdb_result_success]], the following `passdb`s will skip password
verification.

::: info
When using this value on a master `passdb` (`master = yes`), execution will
jump to the first non-master `passdb` instead of continuing with the next
master `passdb`.
:::

## Extra Fields

The primary purpose of a password database lookup is to return the password for
a given user. It may however also return other fields which are treated
specially.

How to return these extra fields depends on the password database you use.
Some `passdb`s don't support returning them at all, such as [[link,auth_pam]].

Boolean fields are true always if the field exists. So `nodelay`,
`nodelay=yes`, `nodelay=no` and `nodelay=0` all mean that the "nodelay"
field is true. With SQL the field is considered to be nonexistent if its
value is NULL.

::: info [[changed,extra_fields_empty]]
Extra fields can now also be set to empty string, while previously they were
changed to `yes`. Extra fields without value (without `=`) will default to
`yes`.
:::

### `userdb_<field>`

The password database may also return fields prefixed with `userdb_`. These
fields are only saved and used later as if they came from the
[[link,userdb_extra_fields]].

Typically this is used only when using [[link,auth_prefetch]].

### Suffixes

The following suffixes added to a field name are handled specially:

#### `:protected`

Set this field only if it hasn't been set before.

#### `:remove`

Remove this field entirely.

### Fields

#### `user`

Change the username (eg. lowercase it).

This is mostly useful in case-insensitive username lookups to get the username
returned back using the same casing always. Otherwise depending on your
configuration it may cause problems, such as `/var/mail/user` and
`/var/mail/User` mailboxes created for the same user.

##### SQL Example

An example `password_query` in `dovecot-sql.conf.ext` would be:

:::code-group
```[dovecot-sql.conf.ext]
password_query = \
    SELECT concat(user, '@', domain) AS user, password \
    FROM users \
    WHERE user = '%n' and domain = '%d'
```
:::

You can also update "username" and "domain" fields separately:

:::code-group
```[dovecot-sql.conf.ext]
password_query = \
    SELECT user AS username, domain, password \
    FROM users \
    WHERE user = '%n' and domain = '%d'
```
:::

#### `login_user`

Master `passdb` can use this to change the username.

#### `allow_nets`

Allow user to log in from only specified IPs (checks against remote client
IP).

This field is a comma separated list of IP addresses and/or networks
where the user is allowed to log in from. If the user tries to log in from
elsewhere, the authentication will fail the same way as if a wrong password was
given.

Example: `allow_nets=127.0.0.0/8,192.168.0.0/16,1.2.3.4,4.5.6.7`.

IPv6 addresses are also allowed. IPv6 mapped IPv4 addresses (eg.
`::ffff:1.2.3.4`) are converted to standard IPv4 addresses before matching.
Example: `allow_nets=::1,2001:abcd:abcd::0:0/80,1.2.3.4`.

Using `local` matches any auth connection that doesn't have an IP address.
This usually means internal auth lookups from, e.g., doveadm.
Example: `allow_nets=127.0.0.0/8,local`.

##### Example

[[link,auth_passwd_file]] example:

```
user:{plain}password::::::allow_nets=192.168.0.0/24
```

##### 'local' Keyword

The keyword `local` is accepted for Non-IP connections like Unix socket.

For example, with a Postfix/LMTP delivery setup, you must include `local` for
Postfix to verify the email account:

```[dovecot.conf]
passdb {
  driver = static
  args = password=test allow_nets=local,127.0.0.1/32
}
```

Otherwise, you will see this error in the log: "[/var/run/dovecot/lmtp] said:
550 5.1.1 <test2@example.com> User doesn't exist: test2@example.com (in
reply to RCPT TO command))".

#### `allow_real_nets`

Allow user's network connection to log in from only specified IPs (checks
against real remote IP, e.g. a Dovecot proxy).

See [`allow_nets`](#allow-nets) for additional documentation.

#### `proxy`

Proxy the connection to another IMAP/POP3 server.

See [[link,authentication_proxies]].

#### `proxy_maybe`

Proxy the connection to another IMAP/POP3 server.

See [[link,authentication_proxies]].

#### `host`

Send login referral to client (if `proxy=y` field isn't set).

See [[link,auth_referral]].

#### `nologin`

User isn't actually allowed to log in even if the password matches, with
optionally a different reason given as the authentication failure message.

Commonly used with [[link,authentication_proxies]] and [[link,auth_referral]],
but may also be used standalone.

One way to use this would be:

* `nologin=`
* `reason=System is being upgraded, please try again later`.

Unfortunately many clients don't show the reason to the user at all and just
assume that the password was given wrong, so it might not be a good idea to use
this unless the system will be down for days and you don't have a better way to
notify the users.

::: info Note
If you want to entirely block the user from logging in (i.e. account is
suspended), with no IMAP referral information provided, you must ensure that
neither `proxy` nor `host` are defined as one of the `passdb` extra fields.

The order of preference is: `proxy`, `host`, then `nologin`.
:::

#### `nodelay`

Don't delay reply to client in case of an authentication failure.

If the authentication fails, Dovecot typically waits 0-2 seconds before
sending back the "authentication failed" reply. If this field is set, no
such delay is done.

Commonly used with [[link,authentication_proxies]] and [[link,auth_referral]],
but may also be used standalone.

::: info Note
If [[link,auth_pam]] is used as the `passdb`, it adds an extra delay which
can't be removed by this setting.
:::

#### `nopassword`

If you want to allow all passwords, use an empty password and this field.

#### `fail`

If set, explicitly fails the `passdb` lookup.

#### `k5principals`

If using `auth_mechanisms = gssapi`, may contain Kerberos v5 principals
allowed to map to the current user, bypassing the internal call to
`krb5_kuserok()`. The database must support credentials lookup.

#### `delay_until=<UNIX timestamp>[+<max random secs>]`

Delay login until this time.

The timestamp must be less than 5 minutes into future or the login
will fail with internal error. The extra random seconds can be used to avoid
a load spike of everybody getting logged in at exactly the same time.

#### `noauthenticate`

Do not perform any authentication, just store extra fields if user is found.

#### `forward_<anything>`

In a proxy, pass the variable to the next hop (backend) as
`forward_<anything>`.

See [[link,auth_forward_fields]].

#### `event_<name>`

Import `name=value` to login events.

### Examples

#### SQL

::: code-group
```[dovecot-sql.conf.ext]
password_query = SELECT userid as user, password, 'Y' as proxy, host \
    FROM users WHERE userid = '%u'
```
:::

#### LDAP

::: code-group
```[dovecot-ldap.conf]
pass_attrs = \
    =user=%{ldap:user}, \
    =password=%{ldap:userPassword},
    =proxy=%{ldap:proxyEnabled}, \
    =host=%{ldap:hostName}
```
:::

::: warning Note
About the `proxy`, `proxy_maybe` and any other boolean type fields: these
represent an existence test. Currently this translates to `will proxy (or
proxy_maybe) if this attribute exists`. This allows the proxy behaviour to
be selectable per user.

To have it `always` on, use a template, e.g.:

```
pass_attrs = \
    =user=%{ldap:user}, \
    =password=%{ldap:userPassword},
    =proxy=y, \
    =host=%{ldap:hostName}
```
:::

### passwd-file

```
user:{plain}pass::::::proxy=y host=127.0.0.1
```
