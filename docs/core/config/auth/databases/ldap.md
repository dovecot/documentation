---
layout: doc
title: LDAP
dovecotlinks:
  auth_ldap: LDAP authentication
---

# LDAP Authentication (`ldap`)

There are two ways to do LDAP authentication:

* [Password Lookups](#password-lookups)
* [Authentication Binds](#authentication-binds)

## Password Lookups

Advantages over [Authentication Binds](#authentication-binds):

- Faster, because Dovecot can keep sending multiple LDAP requests
  asynchronously to the server. With auth binds Dovecot must wait for
  each request to finish before sending the next one.

- Supports non-plaintext [[link,authentication_mechanisms]] (if returning
   plaintext or [[link,password_schemes,properly hashed passwords]]).

- When using [[link,lda]] or [[link,lmtp]] and
  [[link,auth_staticdb,static userdb]], deliver can check if destination
  user exists. With auth binds this check isn't possible.

### LDAP Server Permissions

Normally LDAP server doesn't give anyone access to users' passwords, so
you'll need to create an administrator account that has access to the
`userPassword` field. With OpenLDAP this can be done by modifying
`/etc/ldap/slapd.conf`:

```
# there should already be something like this in the file:
access to attribute=userPassword
    by dn="<dovecot's dn>" read  # just add this line
    by anonymous auth
    by self write
    by * none
```

Replace `<dovecot's dn>` with the DN you specified in `dovecot-ldap.conf`'s
`dn` setting.

### Dovecot Configuration

The two important settings in password lookups are:

- `pass_filter` specifies the LDAP filter how user is found from the
  LDAP. You can use all the normal [[variable]] like `%u` in the filter.

- `pass_attrs` specifies a comma-separated list of attributes that
  are returned from the LDAP. If you set it to empty, all the
  attributes are returned.

Usually the LDAP attribute names aren't the same as
[[link,passdb,the field names that Dovecot uses internally]]. You must
create a mapping between them to get the wanted results. This
is done by listing the fields as `<ldap attribute>=<dovecot field>`.

For example: `pass_attrs = uid=user, userPassword=password`.

This maps the LDAP "uid" attribute to Dovecot's "user" field and LDAP's
"userPassword" attribute to Dovecot's "password" field. These two fields
should always be returned, but it's also possible to return other
special [[link,passdb_extra_fields]].

#### Password

Most importantly, the `pass_attrs` must return a "password" field,
which contains the user's password.

The next thing Dovecot needs to know is what format the password is in.
If all the passwords are in same format, you can use `default_pass_scheme`
setting in `dovecot-ldap.conf` to specify it. Otherwise each password needs
to be prefixed with `{password-scheme}`, for example
`{plain}plaintext-password`.

See [[link,password_schemes]] for a list of supported password schemes.

#### Username

LDAP lookups are case-insensitive. Unless you somehow normalize the
username, it's possible that a user logging in as "user", "User" and
"uSer" are treated differently.

The easiest way to handle this is to tell Dovecot to change the username
to the same case as it's in the LDAP database. You can do this by
returning "user" field in the `pass_attrs`, as shown in the above example.

If you can't normalize the username in LDAP, you can alternatively
lowercase the username via [[setting,auth_username_format,%Lu]].

### Example

A typical configuration would look like:

```[dovecot.conf]
auth_bind = no
pass_attrs = uid=user, userPassword=password
pass_filter = (&(objectClass=posixAccount)(uid=%u))
default_pass_scheme = MD5
```

## Authentication Binds

Advantages over [Password Lookups](#password-lookups)

- LDAP server verifies the password, so Dovecot doesn't need to know
  what format the password is stored in.

- A bit more secure, as a security hole in Dovecot doesn't give
  attacker access to all the users' password hashes. (And Dovecot
  admins in general don't have direct access to them.)

You can enable authentication binds by setting `auth_bind=yes`.

Dovecot needs to know what DN to use in the binding. There are two ways
to configure this: lookup or template.

### DN Lookup

DN is looked up by sending a `pass_filter` LDAP request and getting
the DN from the reply. This is very similar to doing a
[password lookup](#password-lookups). The only difference is that
`userPassword` attribute isn't returned.

Just as with password lookups, the `pass_attrs` may contain special
[[link,passdb_extra_fields]].

Example:

```[dovecot.conf]
auth_bind = yes
pass_attrs = uid=user
pass_filter = (&(objectClass=posixAccount)(uid=%u))
```

### DN Template

The main reason to use DN template is to avoid doing the DN lookup, so
that the authentication consists only of one LDAP request.

With IMAP and POP3 logins, the same optimization can be done by using
[[link,auth_prefetch]] and returning userdb info in the DN lookup (a total
of two LDAP requests per login in both cases).

If you're also using Dovecot for SMTP AUTH, it doesn't do a userdb lookup
so the prefetch optimization doesn't help.

If you're using DN template, `pass_attrs` and `pass_filter` settings
are completely ignored. That means you can't make passdb return any
[[link,passdb_extra_fields]]. You should also set
[[setting,auth_username_format,%Lu]] in `dovecot.conf` to normalize the
username by lowercasing it.

```[dovecot.conf]
auth_bind = yes
auth_bind_userdn = cn=%u,ou=people,o=org
```

### Connection Optimization

When using

-  auth binds and
-  userdb ldap lookups,

the userdb lookups should use a separate connection to the LDAP server.
That way it can send LDAP requests asynchronously to the server, which
improves the performance. This can be done by specifying different
filenames in the LDAP passdb and userdb args. The second file could be a
symlink to the first one.

```[dovecot.conf]
passdb {
  driver = ldap
  args = /etc/dovecot/dovecot-ldap.conf.ext
}

userdb db1 {
  driver = ldap
  args = /etc/dovecot/dovecot-ldap-userdb.conf.ext
}
```

And create the symlink:

```sh
ln -s /etc/dovecot/dovecot-ldap.conf.ext \
  /etc/dovecot/dovecot-ldap-userdb.conf.ext
```

## Common Configuration

This sections describes the configuration common to LDAP [[link,passdb]] and
[[link,userdb]].

### Connecting

There are two alternative ways to specify what LDAP server(s) to connect to:

* `hosts`: A space separated list of LDAP hosts to connect to. You can also
  use `host:port` syntax to use different ports.
* `uris`: A space separated list of LDAP URIs to connect to. This isn't
  supported by all LDAP libraries. The URIs are in syntax
  `protocol://host:port`. For example `ldap://localhost` or
  `ldaps://secure.domain.org`.

If multiple LDAP servers are specified, it's decided by the LDAP library how
the server connections are handled. Typically the first working server is used,
and it's never disconnected from. So there is no load balancing or automatic
reconnecting to the "primary" server.

### SSL/TLS

You can enable TLS in two alternative ways:

* Connect to ldaps port (636) by using "ldaps" protocol, e.g. `uris =
  ldaps://secure.domain.org`
* Connect to ldap port (389) and use STARTTLS command. Use `tls=yes` to
  enable this.

See the `tls_*` settings in `dovecot-ldap-example.conf` for how to
configure TLS.

#### Custom Certs

If you need to connect to ldaps secured against a custom certificate of
authority (CA), you will need to install the custom CA on your system.

For OpenLDAP, by default, the CA must be installed under the directory
specified in the `TLS_CACERTDIR` option found under `/etc/openldap/ldap.conf`
(default value is `/etc/openldap/certs`).

After copying the CA, you'll need to run "c_rehash ." inside the directory,
this will create a symlink pointing to the CA.

You can test the CA installation with this command:

```sh
openssl s_client -connect yourldap.example.org:636 \
  -CApath /etc/openldap/certs -showcerts
```

This should report "Verify return code: 0 (ok)".

### SASL binds

It's possible to use SASL binds instead of the regular simple binds if your
LDAP library supports them.

See the `sasl_*` settings in `dovecot-ldap-example.conf`.

::: warning
SASL binds are currently incompatible with authentication binds.
:::

### Active Directory

When connecting to AD, you may need to use port 3268. Then again, not all LDAP
fields are available in port 3268. Use whatever works. See:
https://technet.microsoft.com/en-us/library/cc978012.aspx.

### LDAP Backend Configuration

```[dovecot.conf]
passdb {
  args = /etc/dovecot/dovecot-ldap.conf.ext
  driver = ldap
}
```

This enables LDAP to be used as passdb.

The included `dovecot-ldap-backend.conf.ext` can be used as template for the
`/etc/dovecot/dovecot-ldap.conf.ext.` Its most important settings are:

Configure how the LDAP server is reached.
(Active directory allows binding with username@domain):

```
hosts = ldap.example.com
dn = cn=admin,dc=example,dc=com
dnpass = secret
base = dc=example,dc=com
```

Use LDAP authentication binding for verifying users' passwords:

```
auth_bind_userdn = %u
auth_bind = yes
```

Use auth worker processes to perform LDAP lookups in order to use multiple
concurrent LDAP connections. Otherwise only a single LDAP connection is used.

```
blocking = yes
```

Normalize the username to exactly the `mailRoutingAddress` field's value
regardless of how the `pass_filter` found the user:

```
pass_attrs =                          \
    =proxy=y,                         \
    =proxy_timeout=10,                \
    =user=%{ldap:mailRoutingAddress}, \
    =password=%{ldap:userPassword}
```

Returns userdb fields when prefetch userdb wasn't used (LMTP & doveadm).
The username is again normalized in case `user_filter` found it via some
other means:

```
user_attrs =                          \
    =user=%{ldap:mailRoutingAddress}, \
    =quota_rule=*:storage=%{ldap:messageQuotaHard}
```

How to find the user for passdb lookup:

```
pass_filter = (mailRoutingAddress=%u)
user_filter = (mailRoutingAddress=%u)
```

How to iterate through all the valid usernames:

```
pass_filter = (mailRoutingAddress=%u)
iterate_attrs = mailRoutingAddress=user
iterate_filter = (objectClass= messageStoreRecipient)
```

### LDAP-Specific Variables

The following variables can be used inside the `dovecot-ldap.conf.ext` files:

| Variable | Description |
| -------- | ----------- |
| `%{ldap:attrName:default}` | Fetches a single-valued attribute. If the attribute is not present, the specified default is taken instead. If there are multiple values, all except the first are ignored (with warning). |
| `%{ldap:attrName}` | If the default is omitted, empty string `""` is assumed. |
| `%{ldap_multi:attrName:sep:default}` | [[added,ldap_multi_added]] Fetches a multi-valued attribute. If the attribute is not present, the specified default is taken instead. If there are multiple values, they are concatenated using sep as the separator. |
| `%{ldap_multi:attrName:sep}` | [[added,ldap_multi_added]] If the default is omitted, empty string is assumed `""`. |
| `%{ldap_multi:attrName::default}` | [[added,ldap_multi_added] The default for the separator is a single space `" "`. |
| `%{ldap_multi:attrName::}` | [[added,ldap_multi_added]] How to specify a column `":"` as separator, default is `""`. |
| `%{ldap_multi:attrName:::default}` | [[added,ldap_multi_added]] How to specify a column `":"` as separator, default explicitly defined. |
| `%{ldap_multi:attrName:,}` | [[added,ldap_multi_added]] How to specify a comma `","` as separator, default is `""`. |
| `%{ldap_multi:attrName:,:default}` | [[added,ldap_multi_added]] How to specify a comma `","` as separator, default explicitly defined. |
| `%{ldap_dn}` | Retrieves the Distinguished Name of the entry. |
| `%{ldap_ptr:attrName}` | Indirect fetch. Retrieves the attribute attrName, then it uses its content as a 2nd attrName where to fetch the actual value. |

### Subqueries And Pointers

LDAP values can now have DN pointers to other entries that are queried.

::: info
These aren't actually very useful anymore. See the next section for how
to do multiple queries more easily using multiple userdbs.
:::

```
user_attrs = \
    =user=%{ldap:uid}, \
    @mail=%{ldap:mailDN}, \
    =uid=%{ldap:uidNumber@mail}, \
    =gid=%{ldap:gidNumber@mail}, \
    =home=%{ldap:rootPath@mail}/%d/%n
```

This will do a regular lookup first. Then does another lookup with DN taken
from mailDN's value. The `@mail` attributes are assigned from the second
lookup's results.

```
user_attrs = \
    =user=%{ldap:uid}, \
    =home=%{ldap_ptr:activePath}, \
    !primaryPath, !secondaryPath
```

The activePath's value can be either `primaryPath` or `secondaryPath`.
The home's value will be the contents of that field. The `!field` tells Dovecot
to fetch the field's value but not to do anything with it otherwise.

### Multiple Queries via userdbs

Example: Give the user a class attribute, which defines the default quota:

::: code-group
```[dovecot.conf]
userdb db1 {
  driver = ldap
  args = /etc/dovecot/dovecot-users-ldap.conf.ext
  result_success = continue-ok
}

userdb db2 {
  driver = ldap
  args = /etc/dovecot/dovecot-class-ldap.conf.ext
  skip = notfound
}
```

```[/etc/dovecot/dovecot-users-ldap.conf.ext]
# If user has overridden quota, quota_rule is set below. Otherwise it's
# still unset.
user_attrs = =class=%{ldap:userClass} \
    quotaBytes=quota_rule=*:bytes=%{ldap:quotaBytes}
```

```[/etc/dovecot/dovecot-class-ldap.conf.ext]
# Do the lookup using the user's class:
user_filter = (&(objectClass=userClass)(class=%{userdb:class}))

# With :protected suffix the quota_rule isn't overridden if it's already set.
user_attrs = \
    classQuotaBytes=quota_rule:protected=*:bytes=%{ldap:classQuotaBytes}
```
:::

### Variables and Domains

User names and domains may be distinguished using the Variables `%n` and `%d`.
They split the previous username at the `@` character.

The previous username is:

- For LMTP, it will be `user@hostname`, where hostname depends on,
  e.g., the Postfix configuration.

- For IMAP, it will be whatever the password database has designated as
  the username.

  If the (LDAP) password database has `user_attrs = =user=%n`, then the
  domain part of the login name will be stripped by the password database.

- The userdb will not see any domain part, i.e. `%n` and `%u` are the same
  thing for the userdb. The userdb may set a new username, too, using
  `user_attrs = =user=...`. This will be used for Logging `%u` and `%d`
  variables in other parts of the configuration (e.g. quota file names).

```[dovecot.conf]
passdb {
  args = /etc/dovecot/dovecot-ldap.conf.ext
  driver = ldap
}

userdb db1 {
  driver = prefetch
}

userdb db2 {
  args = /etc/dovecot/dovecot-ldap.conf.ext
  driver = ldap
}
```

These enable `LDAP` to be used as `passdb` and `userdb`. The userdb
prefetch allows `IMAP` or `POP3` logins to do only a single LDAP lookup by
returning the userdb information already in the passdb lookup.
[[link,auth_prefetch]] has more details on the prefetch userdb.

## LDAP Settings

### `auth_bind`

- Default: `no`
- Values: [[link,settings_types_boolean]]
- *LDAP Authentication Only*

Set `yes` to use authentication binding for verifying password's validity.

This works by logging into LDAP server using the username and password given by client.

The [`pass_filter`](#pass-filter) is used to find the DN for the user.
Note that the `pass_attrs` is still used, only the password field
is ignored in it.

Before doing any search, the binding is switched back to the default DN.

If you use this setting, it's a good idea to use a different
`dovecot-ldap.conf.ext` for userdb (it can even be a symlink, just as long as
the filename is different in userdb's args). That way one connection is used
only for LDAP binds and another connection is used for user lookups.
Otherwise the binding is changed to the default DN before each user lookup.

::: info
If you're not using authentication binding, you'll need to give dovecot-auth
(the user which is specified with `dn` parameter) read access to
`userPassword` field in the LDAP server.

An example of this: assuming that the user assigned to `dn` is
"cn=authuser,dc=test,dc=dovecot,dc=net":

1. Create below text file and save it as `authuser_modify.ldif`.

```
dn: olcDatabase={2}hdb,cn=config
changetype: modify
replace: olcAccess
olcAccess: {0}to attrs=userPassword
    by self write
    by dn="cn=authuser,dc=test,dc=dovecot,dc=net" read
    by * auth
olcAccess: {1}to *
    by self read
    by dn="cn=authuser,dc=test,dc=dovecot,dc=net" read
    by * auth
```

2. Run `ldapmodify` to apply the change.

```sh
ldapmodify -Q -Y EXTERNAL -H ldapi:/// -f doveauth_access.ldif
```

### `auth_bind_userdn`

- Default: `<empty>`
- Values: [[link,settings_types_string]]
- *LDAP Authentication Only*

If authentication binding is used, you can save one LDAP request per login
if users' DN can be specified with a common template. The template can use
the standard %variables (see [`user_filter`](#user-filter)).

Note that you can't use any `pass_attrs` if you use this setting.

Example: `auth_bind_userdn = cn=%u,ou=people,o=org`

### `base`

- Default: `<empty>`
- Values: [[link,settings_types_string]]

LDAP base.

[[variable]] can be used.

Example: `base = dc=mail, dc=example, dc=org`

### `blocking`

- Default: `no`
- Values: [[link,settings_types_boolean]]
- *LDAP Authentication Only*

By default all LDAP lookups are performed by the auth master process.

If `blocking=yes`, auth worker processes are used to perform the lookups.

Each auth worker process creates its own LDAP connection so this can
increase parallelism.

With `blocking=no`, the auth master process can keep 8 requests pipelined
for the LDAP connection, while with `blocking=yes` each connection has a
maximum of 1 request running.

For small systems, `blocking=no` is sufficient and uses less resources.

### `debug_level`

- Default: `0`
- Values: [[link,settings_types_uint]]

LDAP library debug level as specified by `LDAP_DEBUG_*` in `ldap_log.h`.

Value `-1` means everything.

You may need to recompile OpenLDAP with debugging enabled to get enough
output.

### `default_pass_scheme`

- Default: `crypt`
- Values: [[link,settings_types_string]]
- *LDAP Authentication Only*

Default password scheme. `{scheme}` before password overrides this.

See [[link,password_schemes]] for a list of supported schemes.

### `deref`

- Default: `never`
- Values:  `never`, `searching`, `finding`, `always`

Specify dereference which is set as an LDAP option.

### `dn`

- Default: `<empty>`
- Values: [[link,settings_types_string]]

Specify the Distinguished Name (the username used to login to the LDAP
server).

Leave it commented out to bind anonymously (useful with
`auth_bind = yes`).

Example: `dn = uid=dov-read,dc=ocn,dc=ad,dc=jp,dc=.`

### `dnpass`

- Default: `<empty>`
- Values: [[link,settings_types_string]]

Password for LDAP server, used if [`dn`](#dn) is specified.

### `hosts`

- Default: `<empty>`
- Values: [[link,settings_types_string]]

A space separated list of LDAP hosts to connect to.

Configure either this setting or [`uris`](#uris) to specify what LDAP
server(s) to connect to.

You can also use `host:port` syntax to use different ports.

Example: `hosts = 10.10.10.10 10.10.10.11 10.10.10.12`

### `iterate_attrs`

- Default: `<empty>`
- Values: [[link,settings_types_string]]
- *LDAP Authentication Only*

Attributes to get a list of all users.

Example: `iterate_attrs = mailRoutingAddress=user`

### `iterate_filter`

- Default: `<empty>`
- Values: [[link,settings_types_string]]
- *LDAP Authentication Only*

Filter to get a list of all users.

Example: `iterate_filter = (objectClass=smiMessageRecipient)`

### `ldap_version`

- Default: `3`
- Values: [[link,settings_types_uint]]

LDAP protocol version to use. Likely `2` or `3`.

### `ldaprc_path`

- Default: `<empty>`
- Values: [[link,settings_types_string]]

If a non-empty value is set, it will be set to the LDAPRC environment variable.

### `pass_attrs`

- Default: `<empty>`
- Values: [[link,settings_types_string]]
- *LDAP Authentication Only*

Specify user attributes to be retrieved from LDAP in passdb look up.

Password checking attributes:

* `user`: Virtual user name (user@domain), if you wish to change the
  user-given username to something else
* `password`: Password, may optionally start with `{type}`, e.g., `{crypt}`

Example:

```
pass_attrs = \
    =password=%{ldap:userPassword}, \
    =user=%{ldap:mailRoutingAddress}, \
    =home=%{ldap:homeDirectory}, \
    =uid=%{ldap:uidNumber}, \
    =gid=%{ldap:gidNumber}
```

There are also other special fields which can be returned. See
[[link,passdb_extra_fields]].

If you wish to avoid two LDAP lookups (passdb + userdb), you can use
[[link,auth_prefetch]] instead of userdb ldap in `dovecot.conf`. In that
case you'll also have to include `user_attrs` in `pass_attrs` field
prefixed with `userdb_` string.

### `pass_filter`

- Default: `<empty>`
- Values: [[link,settings_types_string]]
- *LDAP Authentication Only*

Filter for password lookups (passdb lookup).

Example: `pass_filter = (&(objectClass=posixAccount)(uid=%u))`

### `sasl_authz_id`

- Default: `<empty>`
- Values: [[link,settings_types_string]]

SASL authorization ID, ie. the `dnpass` is for this "master user", but the
`dn` is still the logged in user. Normally you want to keep this empty.

### `sasl_bind`

- Default: `no`
- Values: [[link,settings_types_boolean]]

Set `yes` to use SASL binding instead of the simple binding.

Note that this changes [`ldap_version`](#ldap-version) automatically to be
`3` if it's lower.

### `sasl_mech`

- Default: `<empty>`
- Values: [[link,settings_types_string]]

SASL mechanism names (a space-separated list of candidate mechanisms) to use.

### `sasl_realm`

- Default: `<empty>`
- Values: [[link,settings_types_string]]

SASL realm to use.

### `scope`

- Default: `subtree`
- Values:  `base`, `onelevel`, `subtree`

This specifies the search scope.

### `tls`

- Default: `no`
- Values: [[link,settings_types_boolean]]

Set to `yes` to use TLS to connect to the LDAP server.

### `tls_ca_cert_dir`

- Default: `<empty>`
- Values: [[link,settings_types_string]]

Specify a value for TLS `tls_ca_cert_dir` option.

Currently supported only with OpenLDAP.

### `tls_ca_cert_file`

- Default: `<empty>`
- Values: [[link,settings_types_string]]

Specify a value for TLS `tls_ca_cert_file` option.

Currently supported only with OpenLDAP.

### `tls_cert_file`

- Default: `<empty>`
- Values: [[link,settings_types_string]]

Specify a value for TLS `tls_cert_file` option.

Currently supported only with OpenLDAP.

### `tls_cipher_suite`

- Default: `<empty>`
- Values: [[link,settings_types_string]]

Specify a value for TLS `tls_cipher_suite` option.

Currently supported only with OpenLDAP.

### `tls_key_file`

- Default: `<empty>`
- Values: [[link,settings_types_string]]

Specify a value for TLS `tls_key_file` option.

Currently supported only with OpenLDAP.

### `tls_require_cert`

- Default: `<empty>`
- Values: `never`, `hard`, `demand`, `allow`, `try`

Specify a value for TLS `tls_require_cert` option.

Currently supported only with OpenLDAP.

### `uris`

- Default: `<empty>`
- Values: [[link,settings_types_string]]

LDAP URIs to use.

Configure either this setting or [`hosts`](#hosts) to specify what LDAP
server(s) to connect to.

Note that this setting isn't supported by all LDAP libraries.

The URIs are in syntax `protocol://host:port`.

Example: `uris = ldaps://secure.domain.org`

### `user_attrs`

- Default: `<empty>`
- Values: [[link,settings_types_string]]
- *LDAP Authentication Only*

Specify user attributes to be retrieved from LDAP (in userdb look up).

User attributes are given in `LDAP-name=dovecot-internal-name` list.

The internal names are:

| Name | Description |
| ---- | ----------- |
| `uid` | System UID |
| `gid` | System GID |
| `home` | Home directory |
| `mail` | [[link,mail_location]] |

There are also other special fields which can be returned. See
[[link,userdb_extra_fields]].

Example:

```
user_attrs = \
    =home=%{ldap:homeDirectory}, \
    =uid=%{ldap:uidNumber}, \
    =gid=%{ldap:gidNumber}
```

### `user_filter`

- Default: `<empty>`
- Values: [[link,settings_types_string]]
- *LDAP Authentication Only*

Filter for user lookup (userdb lookup).

Variables that can be used (see [[variable]] for full list):

| Variable | Long Name | Description |
| -------- | --------- | ----------- |
| `%u` | `%{user}` | Username |
| `%n` | `%{username}` | User part in user@domain, same as %u if there's no domain |
| `%d` | `%{domain}` | Domain part in user@domain, empty if user there's no domain |

Example:

```
user_filter = (&(objectClass=posixAccount)(uid=%u))
```

## LDAP userdb

Usually your LDAP database also contains the [[link,userdb]].

If your home directory can be specified with a template and you're using
only a single UID and GID, you should use [[link,auth_staticdb]]
instead to avoid an unnecessary LDAP lookup. You can also use
[[link,auth_prefetch]] to avoid the userdb LDAP lookup.

Userdb lookups are always done using the default DN (`dn` setting)
bind. It's not possible to do the lookup using the user's DN (remember
that e.g. [[link,lda]] or [[link,lmtp]] needs to do userdb lookups
without knowing the user's password).

The userdb lookups are configured in very much the same way as
[password lookups](#password-lookups). Instead of `pass_attrs` and
`pass_filter`, the userdb uses `user_attrs` and `user_filter`.
Typically `pass_filter` and `user_filter` are equivalent.

If you're using a single UID and GID for all the users, you can specify
them globally with `mail_uid` and `mail_gid` settings instead of
returning them from LDAP.

```
user_attrs = \
    =home=%{ldap:homeDirectory}, \
    =uid=%{ldap:uidNumber}, \
    =gid=%{ldap:gidNumber}
user_filter = (&(objectClass=posixAccount)(uid=%u))

# For using doveadm -A:
iterate_attrs = =user=%{ldap:uid}
iterate_filter = (objectClass=posixAccount)
```

### Attribute Templates

You can mix static text with the value returned from LDAP by using
`%{ldap:*}` variables, which expand to the named LDAP attribute's value.

#### Examples

Create a "quota_rule" field with value `*:bytes=<n>` where `<n>` comes
from "quotaBytes" LDAP attribute:

```
user_attrs = =quota_rule=\*:bytes=%{ldap:quotaBytes}
```

Create a "mail" field with value `maildir:/var/mail/<dir>/Maildir` where
`<dir>` comes from "sAMAccountName" LDAP attribute:

```
user_attrs = =mail_path=/var/spool/vmail/%{ldap:sAMAccountName}/Maildir
```

You can add static fields that aren't looked up from LDAP. For example
create a "mail" field with value `maildir:/var/vmail/%d/%n/Maildir`:

```
user_attrs = \
    =quota_rule=*:bytes=%{ldap:quotaBytes}, \
    =mail_path=/var/vmail/%d/%n/Maildir
```

If you don't want a field to exist at all when its LDAP attribute
doesn't exist, you can give the attribute name before the first "="
character. For example this doesn't return "home" or "mail" fields if
"mailboxPath" doesn't exist:

```
user_attrs = \
    =quota_rule=*:bytes=%{ldap:quotaBytes}, \
    mailboxPath=home=/home/%{ldap:mailboxPath}, \
    mailboxPath=mail_path=~/Maildir
```

It's also possible to give default values to nonexistent attributes by
using e.g. `%{ldap:userDomain:example.com}` where if
userDomain attribute doesn't exist, example.com is used instead.

### Variables and Domains

User names and domains may be distinguished using the [[variable]]
`%n` and `%d`. They split the *previous username* at the "@" character. The
*previous username* is:

- For LMTP, it will be `user@hostname`, where hostname depends on e.g.
  the Postfix configuration.

- For IMAP, it will be whatever the password database has designated as
  the username. If the (LDAP) password database has `user_attrs =
  =user=%n`, then the domain part of the login name will be stripped by
  the password database. The userdb will not see any domain part, i.e.
  %n and %u are the same thing for the userdb.

The userdb may set a new username, too, using `user_attrs = =user=...`.
This will be used for

- Logging

- `%u` and `%d` variables in other parts of the configuration (e.g. quota
  file names)
