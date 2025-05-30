---
layout: doc
title: LDAP
dovecotlinks:
  auth_ldap: LDAP authentication
---

# LDAP Authentication (`ldap`)

There are two ways to do LDAP authentication in [[link,passdb,passdb]]:

* [Authentication Binds](#authentication-binds)
* [Password Lookups](#password-lookups)

LDAP can be used as [userdb ldap](#ldap-userdb).

## Connecting

The LDAP server(s) endpoints must be specified as ldap URIs:

* [[setting,ldap_uris]]: A space separated list of LDAP URIs to connect to.

If multiple LDAP servers are specified, it's decided by the LDAP library how
the server connections are handled. Typically the first working server is used,
and it's never disconnected from. So there is no load balancing or automatic
reconnecting to the "primary" server.

### Connection Authentication

If LDAP server requires authentication, set:

 * [[setting,ldap_auth_dn]]
 * [[setting,ldap_auth_dn_password]]
 * [[setting,ldap_auth_sasl_mechanisms]] can be set to list of SASL mechanisms
   to authenticate with. Note that this is used only for the initial connection
   authentication, not for any subsequent [authentication binds](#authentication-binds).

### Worker Processes

If [[setting,passdb_use_worker,no]] / [[setting,userdb_use_worker,no]]
(default for passdb ldap), all LDAP lookups are performed by the auth master
process. Each LDAP connection can keep up to 8 requests pipelined. For small
systems this is sufficient and uses less resources, but it may become a
bottleneck if there are a lot of queries.

If [[setting,passdb_use_worker,yes]], `auth-worker` processes are used to
perform the lookups. Each auth worker process creates its own LDAP connection
so this can increase parallelism.

### Connection Optimization

When using

-  [[setting,passdb_use_worker,no]],
-  [[setting,userdb_use_worker,no]],
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

### SSL/TLS

You can enable TLS in two alternative ways:

* Connect to ldaps port (636) by using "ldaps" protocol, e.g. `ldap_uris =
  ldaps://secure.domain.org`
* Connect to ldap port (389) and use STARTTLS command. Use
  [[setting,ldap_starttls,yes]] to enable this.

See the [[link,ssl_configuration]] settings for how to configure TLS. Not all
of Dovecot SSL settings are supported by the LDAP library. Below is the list
of supported settings:

<SettingsComponent tag="ssl-ldap" level="3" />

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

## LDAP Settings

<SettingsComponent tag="auth-ldap" level="2" />

## LDAP-Specific Variables

The following variables can be used inside the [[setting,passdb]] / [[setting,userdb]] sections:

| Variable | Description |
| -------- | ----------- |
| `%{ldap:attrName}` | Fetches a single-valued attribute. Fails if the attribute is not present, unless the `|default` filter is given. If there are multiple values, all except the first are ignored (with warning). |
| `%{ldap_multi:attrName}` | [[added,ldap_multi_added]] Fetches a multi-valued attribute and outputs the values separated by tabs, with each value "tab-escaped". Use the `list` [[link,settings_variables_filters,filter]] to further convert it to a wanted value. For example: `mail_access_groups = %{ldap_multi:userGroups \| list \| default('mail')}` |
| `%{ldap:dn}` | Retrieves the Distinguished Name of the entry. |

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

- [[setting,passdb_ldap_filter]] specifies the LDAP filter how user is found from the
  LDAP. You can use all the normal [[variable]] like `%{user}` in the filter.

- [[setting,passdb_fields]] specifies a list of attributes that are returned and
  how to produce the returned value.

Usually the LDAP attribute names aren't the same as
[[link,passdb,the field names that Dovecot uses internally]]. You must
create a mapping between them to get the wanted results. This
is done by listing the [[setting,passdb_fields]] as `<dovecot field> = <expression>` where
expression can include ldap specific variables and other variables too.

For example:
::: code-group
```[dovecot.conf]
ldap_uris = ldap://ldap.example.org
ldap_auth_dn = cn=admin,dc=example,dc=org
ldap_auth_dn_password = secret
ldap_base = dc=example,dc=org

passdb ldap {
  filter = (&(objectClass=posixAccount)(uid=%{user}))
  fields {
    user = %{ldap:uid}
    password = %{ldap:userPassword}
  }
}
```
:::

This maps the LDAP "uid" attribute to Dovecot's "user" field and LDAP's
"userPassword" attribute to Dovecot's "password" field. These two fields
should always be returned, but it's also possible to return other
special [[link,passdb_extra_fields]].

#### Password

Most importantly, [[setting,passdb_fields]] must return a `password` field,
which contains the user's password.

The next thing Dovecot needs to know is what format the password is in.
If all the passwords are in same format, you can use [[setting,passdb_default_password_scheme]]
setting in `dovecot.conf` to specify it. Otherwise each password needs
to be prefixed with `{password-scheme}`, for example
`{plain}plaintext-password`.

See [[link,password_schemes]] for a list of supported password schemes.

#### Username

LDAP lookups are case-insensitive. Unless the username is normalized, it's
possible that a user logging in as "user", "User" and "uSer" are treated
differently. By default Dovecot uses [[setting,auth_username_format,
%{user | lower}]] to lowercase the username before it reaches the LDAP lookup.

Alternatively, you may want to change the username to be exactly as it is in
the LDAP database. You can do this by returning `user` field in
[[setting,passdb_fields]] setting, as shown in the above example.

### Example

A typical configuration would look like:

::: code-group
```[dovecot.conf]
ldap_uris = ldap://ldap.example.org
ldap_auth_dn = cn=admin,dc=example,dc=org
ldap_auth_dn_password = secret
ldap_base = dc=example,dc=org

passdb ldap {
  bind = no
  default_password_scheme = MD5
  filter = (&(objectClass=posixAccount)(uid=%{user}))
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

DN is looked up by sending a [[setting,passdb_ldap_filter]] LDAP request and
getting the DN from the reply. This is very similar to doing a
[password lookup](#password-lookups). The only difference is that
`userPassword` attribute isn't returned.

Just as with password lookups, the [[setting,passdb_fields]] may contain special
[[link,passdb_extra_fields]].

Example:

::: code-group
```[dovecot.conf]
ldap_uris = ldap://ldap.example.org
ldap_auth_dn = cn=admin,dc=example,dc=org
ldap_auth_dn_password = secret
ldap_base = dc=example,dc=org

passdb ldap {
  bind = yes
  filter = (&(objectClass=posixAccount)(uid=%{user}))
  fields {
    user = %{ldap:uid}
  }
}
```
:::

### DN Template

You can do authentication binding using DN template by configuring it in the
[[setting,passdb_ldap_bind_userdn]] setting.

The main reason to use DN template is to avoid doing the DN lookup, so
that the authentication consists only of one LDAP request.

With IMAP and POP3 logins, the same optimization can be done by using
[[link,auth_prefetch]] and returning userdb info in the DN lookup (a total
of two LDAP requests per login in both cases). If you're also using Dovecot
for SMTP AUTH, it doesn't do a userdb lookup so the prefetch optimization
doesn't help.

If you're using DN template, there is no LDAP lookup that returns fields, so
[[setting,passdb_fields]] can't access any `%{ldap:*}` variables. Also,
[[setting,passdb_ldap_filter]] setting is ignored.

::: code-group
```[dovecot.conf]
ldap_uris = ldap://ldap.example.org
ldap_auth_dn = cn=admin,dc=example,dc=org
ldap_auth_dn_password = secret
ldap_base = dc=example,dc=org

passdb ldap {
  bind = yes
  bind_userdn = cn=%{user},ou=people,o=org
}
```
:::

## LDAP userdb

Usually your LDAP database also contains the [[link,userdb]].

If your home directory can be specified with a template, you're using only a
single UID and GID, and you don't need any other user-specific fields, you
should use [[link,userdb_static]] instead to avoid an unnecessary LDAP lookup.
You can also use [[link,auth_prefetch]] to avoid the userdb LDAP lookup.

Userdb lookups are always done using the [[setting,ldap_auth_dn]]
bind. It's not possible to do the lookup using the user's DN (remember
that e.g. [[link,lda]] or [[link,lmtp]] needs to do userdb lookups
without knowing the user's password).

The userdb lookups are configured in very much the same way as
[password lookups](#password-lookups). [[setting,userdb_fields]] and
[[setting,userdb_ldap_filter]], are used in the same way in passdb.

If you're using a single UID and GID for all the users, you can specify
them globally with [[setting,mail_uid]] and [[setting,mail_gid]] settings instead of
returning them from LDAP.

```
ldap_uris = ldap://ldap.example.org
ldap_auth_dn = cn=admin,dc=example,dc=org
ldap_auth_dn_password = secret
ldap_base = dc=example,dc=org

userdb ldap {
  filter = (&(objectClass=posixAccount)(uid=%{user}))
  fields {
    home = %{ldap:homeDirectory}
    uid = %{ldap:uidNumber}
    gid = %{ldap:gidNumber}
  }
}
```

### User Iteration

For using `doveadm -A` or `-u` with wildcards:
```
ldap_uris = ldap://ldap.example.org
ldap_auth_dn = cn=admin,dc=example,dc=org
ldap_auth_dn_password = secret
ldap_base = dc=example,dc=org

userdb ldap {
  iterate_filter = (objectClass=posixAccount)
  iterate_fields {
    user = %{ldap:uid}
  }
}
```

### Attribute Templates

You can mix static text with the value returned from LDAP by using
`%{ldap:*}` variables, which expand to the named LDAP attribute's value.

#### Examples

Create a `quota_storage_size` field with value `<n>B` where `<n>` comes
from "quotaBytes" LDAP attribute:

```
userdb ldap {
  fields {
    quota_storage_size = %{ldap:quotaBytes}B
  }
}
```

Create a `mail_path` field with value `/var/mail/<dir>/Maildir` where
`<dir>` comes from "sAMAccountName" LDAP attribute:

```
userdb ldap {
  fields {
    mail_path = /var/spool/vmail/%{ldap:sAMAccountName}/Maildir
  }
}
```

You can add static fields that aren't looked up from LDAP. For example
create a "mail_path" field with value `/var/vmail/%{user | domain}/%{user | username}/Maildir`:

```
userdb ldap {
  fields {
    quota_storage_size = %{ldap:quotaBytes}B
    mail_path = /var/vmail/%{user | domain}/%{user | username}/Maildir
  }
}
```

It is possible to give default values to nonexistent attributes by
using e.g. `%{ldap:userDomain | default('example.com')}` where if
userDomain attribute doesn't exist, example.com is used instead.

### Multiple Queries via userdbs

Example: Give the user a class attribute, which defines the quota:

::: code-group
```[dovecot.conf]
ldap_uris = ldap://ldap.example.org
ldap_auth_dn = cn=admin,dc=example,dc=org
ldap_auth_dn_password = secret
ldap_base = dc=example,dc=org

userdb ldap-user {
  driver = ldap
  result_success = continue-ok
  ldap_filter = (&(objectClass=posixAccount)(uid=%{user}))
  fields {
    class = %{ldap:userClass}
  }
}

userdb ldap-class {
  driver = ldap
  skip = notfound
  ldap_filter = (&(objectClass=classSettings)(class=%{userdb:class}))
  fields {
    quota_storage_size = %{ldap:quotaBytes}B
  }
}
```
:::
