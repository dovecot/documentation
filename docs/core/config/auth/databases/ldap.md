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
`userPassword` field.

With OpenLDAP this can be done by modifying `/etc/ldap/slapd.conf`:

::: code-group
```[/etc/ldap/slapd.conf]
#---- there should already be something like this in the file
access to attribute=userPassword

    #---- just add this line
    by dn="<dovecot's dn>" read

    by anonymous auth
    by self write
    by * none
```
:::

Replace `<dovecot's dn>` with the DN you specified in [[setting,ldap_auth_dn]]
in `dovecot.conf`'s ldap settings.

Alternatively, you can:

1. Create below text file and save it as `authuser_modify.ldif`.

::: code-group
```[authuser_modify.ldif]
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
:::

2. Run `ldapmodify` to apply the change.

```sh
$ ldapmodify -Q -Y EXTERNAL -H ldapi:/// -f doveauth_access.ldif
```

### Dovecot Configuration

The two important settings in password lookups are:

- [[setting,ldap_filter]] specifies the LDAP filter how user is found from the
  LDAP. You can use all the normal [[variable]] like `%{user}` in the filter.

- [[setting,passdb_fields]] specifies a list of attributes that are returned and
  how to produce the returned value.

Usually the LDAP attribute names aren't the same as
[[link,passdb,the field names that Dovecot uses internally]]. You must
create a mapping between them to get the wanted results. This
is done by listing the fields as `<dovecot field> = <expression>` where
expression can include ldap specific variables and other variables too.

For example:
::: code-group
```[dovecot.conf]
  fields {
    user = %{ldap:uid}
    password = %{ldap:userPassword}
  }
```
:::

This maps the LDAP "uid" attribute to Dovecot's "user" field and LDAP's
"userPassword" attribute to Dovecot's "password" field. These two fields
should always be returned, but it's also possible to return other
special [[link,passdb_extra_fields]].

#### Password

Most important, [[setting,passdb_fields]] must return a `password` field,
which contains the user's password.

The next thing Dovecot needs to know is what format the password is in.
If all the passwords are in same format, you can use [[setting,passdb_default_password_scheme]]
setting in `dovecot.conf` to specify it. Otherwise each password needs
to be prefixed with `{password-scheme}`, for example
`{plain}plaintext-password`.

See [[link,password_schemes]] for a list of supported password schemes.

#### Username

LDAP lookups are case-insensitive. Unless you somehow normalize the
username, it's possible that a user logging in as "user", "User" and
"uSer" are treated differently.

The easiest way to handle this is to tell Dovecot to change the username
to the same case as it's in the LDAP database. You can do this by
returning "user" field in [[setting,passdb_fields]] setting, as shown in the above example.

If you can't normalize the username in LDAP, you can alternatively
lowercase the username via [[setting,auth_username_format,%{user | lower}]].

#### Use Worker

By default (`no`) all LDAP lookups are performed by the auth master process.

If [[setting,passdb_use_worker]]/[[setting,passdb_use_worker,]]`= yes`,
auth worker processes are used to perform the lookups. Each auth worker process
creates its own LDAP connection so this can increase parallelism.

With [[setting,passdb_use_worker]]/[[setting,passdb_use_worker]]`= no`,
the auth master process can keep 8 requests pipelined for the LDAP connection,
while with [[setting,passdb_use_worker]]/[[setting,passdb_use_worker,]]`= yes`
each connection has a maximum of 1 request running.

For small systems, [[setting,passdb_use_worker]]/[[setting,passdb_use_worker]]`= no`
is sufficient and uses less resources.

### Example

A typical configuration would look like:

::: code-group
```[dovecot.conf]
  passdb ldap {
    bind = no
    default_password_scheme = MD5
    ldap_filter = (&(objectClass=posixAccount)(uid=%{user}))
    fields {
      user = %{ldap:uid}
      password = %{ldap:userPassword}
    }
  }
```
:::

## Authentication Binds

Advantages over [Password Lookups](#password-lookups)

- LDAP server verifies the password, so Dovecot doesn't need to know
  what format the password is stored in.

- A bit more secure, as a security hole in Dovecot doesn't give
  attacker access to all the users' password hashes. (And Dovecot
  admins in general don't have direct access to them.)

You can enable authentication binds by setting [[setting,passdb_ldap_bind,yes]].

Dovecot needs to know what DN to use in the binding. There are two ways
to configure this: lookup or template.

### DN Lookup

DN is looked up by sending a [[setting,ldap_filter]] LDAP request and getting
the DN from the reply. This is very similar to doing a
[password lookup](#password-lookups). The only difference is that
`userPassword` attribute isn't returned.

Just as with password lookups, the [[setting,passdb_fields]] may contain special
[[link,passdb_extra_fields]].

Example:

::: code-group
```[dovecot.conf]
  passdb ldap {
    bind = yes
    ldap_filter = (&(objectClass=posixAccount)(uid=%{user}))
    fields {
      user = %{ldap:uid}
    }
  }
```
:::

### DN Template

The main reason to use DN template is to avoid doing the DN lookup, so
that the authentication consists only of one LDAP request.

With IMAP and POP3 logins, the same optimization can be done by using
[[link,auth_prefetch]] and returning userdb info in the DN lookup (a total
of two LDAP requests per login in both cases).

If you're also using Dovecot for SMTP AUTH, it doesn't do a userdb lookup
so the prefetch optimization doesn't help.

If you're using DN template, [[setting,passdb_fields]] and [[setting,ldap_filter]] settings
are completely ignored. That means you can't make passdb return any
[[link,passdb_extra_fields]]. You should also set
[[setting,auth_username_format,%{user | lower}]] in `dovecot.conf` to normalize the
username by lowercasing it.

::: code-group
```[dovecot.conf]
  passdb ldap {
    bind = yes
    bind_userdn = cn=%{user},ou=people,o=org
  }
```
:::

### Connection Optimization

When using

-  auth binds and
-  userdb ldap lookups,

the userdb lookups should use a separate connection to the LDAP server.
That way it can send LDAP requests asynchronously to the server, which
improves the performance. This can be done by specifying distinct
[[setting,ldap_connection_group]] in the LDAP
[[setting,passdb]] / [[setting,userdb]] sections.

::: code-group
```[dovecot.conf]
passdb ldap {
  # ldap_connection_group left unchanged, the default is ''
  ...
}

userdb ldap {
  ldap_connection_group = different-connection-group
  ...
}
```
:::

## Common Configuration

This sections describes the configuration common to LDAP [[link,passdb]] and
[[link,userdb]].

### Connecting

The LDAP server(s) endpoints must be specified as ldap URIs:

* [[setting,ldap_uris]]: A space separated list of LDAP URIs to connect to.

If multiple LDAP servers are specified, it's decided by the LDAP library how
the server connections are handled. Typically the first working server is used,
and it's never disconnected from. So there is no load balancing or automatic
reconnecting to the "primary" server.

### SSL/TLS

You can enable TLS in two alternative ways:

* Connect to ldaps port (636) by using "ldaps" protocol, e.g. `ldap_uris =
  ldaps://secure.domain.org`
* Connect to ldap port (389) and use STARTTLS command. Use [[setting,ssl,yes]] to
  enable this.

See the [[link,ssl_configuration]] settings for how to configure TLS.

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
$ openssl s_client -connect yourldap.example.org:636 \
      -CApath /etc/openldap/certs -showcerts
```

This should report "Verify return code: 0 (ok)".

### SASL binds

It's possible to use SASL binds instead of the regular simple binds if your
LDAP library supports them.

::: warning Note
SASL binds are currently incompatible with authentication binds.
:::

### Active Directory

When connecting to AD, you may need to use port 3268. Then again, not all LDAP
fields are available in port 3268. Use whatever works. See:
https://technet.microsoft.com/en-us/library/cc978012.aspx.

### LDAP Driver Configuration

::: code-group
```[dovecot.conf]
passdb ldap {
  ...
}
```
:::

This enables LDAP to be used as passdb.
The most important settings are:

- Configure how the LDAP server is reached.
(Active directory allows binding with username@domain):

::: code-group
```[dovecot.conf]
  ldap_uris = ldap://ldap.example.com
  ldap_auth_dn = cn=admin,dc=example,dc=com
  ldap_auth_dn_password = secret
  ldap_base = dc=example,dc=com
```
:::

- Use LDAP authentication binding for verifying users' passwords:

::: code-group
```[dovecot.conf]
  passdb_ldap_bind_userdn = %{user}
  passdb_ldap_bind = yes
```
:::

- Use auth worker processes to perform LDAP lookups in order to use multiple
concurrent LDAP connections. Otherwise only a single LDAP connection is used.

::: code-group
```[dovecot.conf]
(passdb|userdb) ... {
  use_worker = yes
}
```
:::

- Normalize the username to exactly the `mailRoutingAddress` field's value
regardless of how the [[setting,ldap_filter]] found the user:

::: code-group
```[dovecot.conf]
  fields {
      user     = %{ldap:mailRoutingAddress}
      password = %{ldap:userPassword}
      proxy    = y
      proxy_timeout = 10
  }
```
:::

- Returns userdb fields when prefetch userdb wasn't used (LMTP & doveadm).
The username is again normalized in case `user_filter` found it via some
other means:

::: code-group
```[dovecot.conf]
  fields {
    user = %{ldap:mailRoutingAddress}
    quota_storage_size = %{ldap:messageQuotaHard}B
  }
```
:::

- How to find the user for passdb lookup (this can be set specifically to
distinct values inside each [[setting,passdb]] / [[setting,userdb]] section):

::: code-group
```[dovecot.conf]
ldap_filter = (mailRoutingAddress=%{user})
```
:::

- How to iterate through all the valid usernames:

::: code-group
```[dovecot.conf]
  ldap_filter = (mailRoutingAddress=%{user})
  ldap_iterate_filter = (objectClass=messageStoreRecipient)
  iterate_fields {
    user = %{ldap:mailRoutingAddress}
  }
```
:::

### LDAP-Specific Variables

The following variables can be used inside the [[setting,passdb]] / [[setting,userdb]] sections:

| Variable | Description |
| -------- | ----------- |
| `%{ldap:attrName:default}` | Fetches a single-valued attribute. If the attribute is not present, the specified default is taken instead. If there are multiple values, all except the first are ignored (with warning). |
| `%{ldap:attrName}` | If the default is omitted, empty string `""` is assumed. |
| `%{ldap_multi:attrName:sep:default}` | [[added,ldap_multi_added]] Fetches a multi-valued attribute. If the attribute is not present, the specified default is taken instead. If there are multiple values, they are concatenated using sep as the separator. |
| `%{ldap_multi:attrName:sep}` | [[added,ldap_multi_added]] If the default is omitted, empty string is assumed `""`. |
| `%{ldap_multi:attrName::default}` | [[added,ldap_multi_added]] The default for the separator is a single space `" "`. |
| `%{ldap_multi:attrName::}` | [[added,ldap_multi_added]] How to specify a column `":"` as separator, default is `""`. |
| `%{ldap_multi:attrName:::default}` | [[added,ldap_multi_added]] How to specify a column `":"` as separator, default explicitly defined. |
| `%{ldap_multi:attrName:,}` | [[added,ldap_multi_added]] How to specify a comma `","` as separator, default is `""`. |
| `%{ldap_multi:attrName:,:default}` | [[added,ldap_multi_added]] How to specify a comma `","` as separator, default explicitly defined. |
| `%{ldap:dn}` | Retrieves the Distinguished Name of the entry. |

### Multiple Queries via userdbs

Example: Give the user a class attribute, which defines the default quota:

::: code-group
```[dovecot.conf]
userdb ldap1 {
  driver = ldap
  result_success = continue-ok
  fields {
    class = %{ldap:userClass}
    quota_storage_size = %{ldap:quotaBytes}B
  }
}

userdb ldap2 {
  driver = ldap
  skip = notfound
  fields {
    quota_storage_size:default = %{ldap:classQuotaBytes}B
  }
}
```
:::

### Variables and Domains

User names and domains may be distinguished using the Variables `%{user | username}` and `%{user | domain}`.
They split the previous username at the `@` character.

The previous username is:

- For LMTP, it will be `user@hostname`, where hostname depends on,
  e.g., the Postfix configuration.

- For IMAP, it will be whatever the password database has designated as
  the username.

  If the (LDAP) password database has:
  ```
  fields {
    user = %{user | username}
  }
  ```
  then the domain part of the login name will be stripped by the password database.

- The userdb will not see any domain part, i.e. `%{user | username}` and `%{user}` are the same
  thing for the userdb. The userdb may set a new username, too, using:
  ```
  fields {
    user = ...
  }
  ```
  This will be used for Logging `%{user}` and `%{user | domain}`
  variables in other parts of the configuration (e.g. quota file names).

::: code-group
```[dovecot.conf]
passdb ldap {
  ...
}

userdb prefetch {
  driver = prefetch
}

userdb ldap {
  ...
}
```
:::

These enable `LDAP` to be used as [[setting,passdb]] / [[setting,userdb]]. The userdb
prefetch allows `IMAP` or `POP3` logins to do only a single LDAP lookup by
returning the userdb information already in the passdb lookup.
[[link,auth_prefetch]] has more details on the prefetch userdb.

## LDAP Settings

<SettingsComponent tag="ldap" level="2" />

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
[password lookups](#password-lookups). [[setting,userdb_fields]] and
[[setting,ldap_filter]], are used in the same way in passdb.

If you're using a single UID and GID for all the users, you can specify
them globally with [[setting,mail_uid]] and [[setting,mail_gid]] settings instead of
returning them from LDAP.

```
ldap_filter = (&(objectClass=posixAccount)(uid=%{user}))
ldap_iterate_filter = (objectClass=posixAccount)
fields {
    home = %{ldap:homeDirectory}
    uid = %{ldap:uidNumber}
    gid = %{ldap:gidNumber}
}
```

```
# For using doveadm -A:
fields=user=%{ldap:uid}
```

### Attribute Templates

You can mix static text with the value returned from LDAP by using
`%{ldap:*}` variables, which expand to the named LDAP attribute's value.

#### Examples

Create a `quota_storage_size` field with value `<n>B` where `<n>` comes
from "quotaBytes" LDAP attribute:

```
fields {
  quota_storage_size = %{ldap:quotaBytes}B
}
```

Create a `mail_path` field with value `/var/mail/<dir>/Maildir` where
`<dir>` comes from "sAMAccountName" LDAP attribute:

```
fields {
  mail_path = /var/spool/vmail/%{ldap:sAMAccountName}/Maildir
}
```

You can add static fields that aren't looked up from LDAP. For example
create a "mail_path" field with value `/var/vmail/%{user | domain}/%{user | username}/Maildir`:

```
fields {
    quota_storage_size = %{ldap:quotaBytes}B
    mail_path = /var/vmail/%{user | domain}/%{user | username}/Maildir
}
```

It is possible to give default values to nonexistent attributes by
using e.g. `%{ldap:userDomain:example.com}` where if
userDomain attribute doesn't exist, example.com is used instead.

### Variables and Domains

User names and domains may be distinguished using the [[variable]]
`%{user | username}` and `%{user | domain}`. They split the *previous username* at the "@" character. The
*previous username* is:

- For LMTP, it will be `user@hostname`, where hostname depends on e.g.
  the Postfix configuration.

- For IMAP, it will be whatever the password database has designated as
  the username. If the (LDAP) password database [[setting,passdb_fields ]]
  contains `user=%{user | username}`, then the domain part of the login name will be stripped by
  the password database. The userdb will not see any domain part, i.e.
  %{user | username} and %{user} are the same thing for the userdb.

The userdb may set a new username, too, using
```
  fields {
    user = ...
  }
```

This will be used for:

- Logging

- `%{user}` and `%{user | domain}` variables in other parts of the configuration (e.g. quota
  file names)
