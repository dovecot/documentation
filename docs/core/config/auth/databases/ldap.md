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

[[changed,settings_ldap_client_changed]] Dovecot has its own LDAP client
instead of using the OpenLDAP libraries. The `ldap_*` connection settings were
renamed to [[setting,ldap_client_uris,ldap_client_*]] and
[[setting,client_auth_authid,client_auth_*]]. See
[[link,upgrading-2.4-to-2.4]] for the list.

## Connecting

The LDAP server(s) endpoints must be specified as LDAP URIs:

* [[setting,ldap_client_uris]]: A space separated list of LDAP URIs to connect
  to. `ldap://`, `ldaps://` and `ldapi://` (UNIX socket) are supported.

If multiple LDAP servers are specified, a new connection tries them in the
listed order, so the first working server is always used. A connection that
was ready and is lost is not moved to another server, but the next request
connects again starting from the first one. There is no load balancing.

Dovecot has its own LDAP client. It doesn't use OpenLDAP libraries, so
`/etc/ldap/ldap.conf` and the `LDAP*` environment variables aren't read. All
the configuration is in `dovecot.conf`.

### Connection Authentication

If the LDAP server requires authentication, set it in the
[[setting,ldap_client]] block:

 * [[setting,client_auth_authid]]: The DN to bind as, or the SASL
   authentication ID if [[setting,client_auth_mechanism]] is set.
 * [[setting,client_auth_password]]: The password.
 * [[setting,client_auth_mechanism]]: The SASL mechanism to use. By default a
   simple bind is used. Only one mechanism can be given, not a list.
 * [[setting,client_auth_authzid]]: The SASL authorization ID.

Note that these are used only for the bind after connecting, not for any
subsequent [authentication binds](#authentication-binds).

::: code-group
```doveconf[dovecot.conf]
ldap_client_uris = ldap://ldap.example.org

ldap_client {
  client_auth_authid = cn=admin,dc=example,dc=org
  client_auth_password = secret
}
```
:::

### Worker Processes

If [[setting,passdb_use_worker,no]] / [[setting,userdb_use_worker,no]]
(default for passdb ldap), all LDAP lookups are performed by the auth master
process. Each LDAP connection can keep up to 8 requests pipelined (see
[[setting,ldap_client_max_outstanding_requests]]). For small
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
```doveconf[dovecot.conf]
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

The binds that verify users' passwords ([[setting,passdb_ldap_bind,yes]]) use
connections of their own, at most
[[setting,ldap_client_max_auth_bind_connections]] at a time.

### Timeouts and Retries

Requests are limited by the following settings:

| Setting | Meaning |
| ------- | ------- |
| [[setting,ldap_client_connect_timeout]] | Connecting to a server address, including the TLS handshake. |
| [[setting,ldap_client_request_timeout]] | One attempt of a request. `20s` by default for passdb and userdb ldap. |
| [[setting,ldap_client_request_absolute_timeout]] | The whole request with its attempts and queue time. |
| [[setting,ldap_client_max_request_retries]] | How many times a request is sent again after a lost connection or a timeout. |

Searches are sent again if the connection is lost or the server doesn't
answer in time. The bind of a user is sent again only if it got no answer
from the server. If your LDAP server locks accounts out after failed binds,
a wrong password can be counted twice, so consider lowering
[[setting,ldap_client_max_request_retries]].

[[setting,userdb_ldap_iterate_filter,User iteration]] (e.g.
`doveadm user '*'`) isn't limited by
[[setting,ldap_client_request_absolute_timeout]].

Firewalls and NAT devices can drop idle connections without telling either
end. Set [[setting,ldap_client_max_idle_time]] below the idle limit of the
network (e.g. `5 mins` is a good start for Active Directory, Azure or NAT) so
that Dovecot closes the idle connections itself.

### SSL/TLS

Use TLS to protect the passwords and the LDAP data. You can enable TLS in two
alternative ways:

* Connect to ldaps port (636) by using "ldaps" protocol, e.g.
  `ldap_client_uris = ldaps://secure.domain.org`
* Connect to ldap port (389) and use STARTTLS command. Use
  [[setting,ldap_client_starttls,yes]] to enable this.

See the [[link,ssl_configuration]] settings for how to configure TLS. The
server certificate is verified with [[setting,ssl_client_ca_file]] /
[[setting,ssl_client_ca_dir]] (the system CA store by default).

<SettingsComponent tag="ssl-ldap" level="3" />

#### Custom Certs

If you need to connect to ldaps secured against a custom certificate of
authority (CA), point [[setting,ssl_client_ca_file]] to the CA certificate
file:

```doveconf[dovecot.conf]
ssl_client_ca_file = /etc/ssl/certs/my-ldap-ca.pem
```

You can test the CA with this command:

```sh
$ openssl s_client -connect yourldap.example.org:636 \
      -CAfile /etc/ssl/certs/my-ldap-ca.pem -showcerts
```

This should report "Verify return code: 0 (ok)".

### Client Certificate Authentication

To authenticate with a TLS client certificate, set
[[setting,ssl_client_cert_file]] and [[setting,ssl_client_key_file]], and use
the SASL `EXTERNAL` mechanism with StartTLS:

::: code-group
```doveconf[dovecot.conf]
ldap_client_uris = ldap://ldap.example.org
ldap_client_starttls = yes
ssl_client_cert_file = /etc/dovecot/ldap-client.pem
ssl_client_key_file = /etc/dovecot/ldap-client.key

ldap_client {
  client_auth_mechanism = EXTERNAL
}
```
:::

With `EXTERNAL`, [[setting,client_auth_authzid]] (or, if it is empty,
[[setting,client_auth_authid]]) is sent to the server as it is as the
authorization ID, so it must be in the format that the server expects (RFC 4513
`dn:<DN>` or `u:<id>`). If both are empty, the server derives the identity from
the certificate.

StartTLS with `EXTERNAL` works with OpenLDAP slapd, Active Directory and
389 Directory Server. With `ldaps://`, slapd needs the `EXTERNAL` bind, but
Active Directory refuses it and logs the certificate in during the TLS
handshake instead: add the `implicit-external-auth` workaround, see
[Active Directory](#active-directory). 389 Directory Server accepts both.

### Workarounds

[[setting,ldap_client_workarounds]] has workarounds for server quirks, mainly
for Active Directory and for the SCRAM channel binding of OpenLDAP.

## LDAP Settings

<SettingsComponent tag="auth-ldap" level="2" />

## LDAP-Specific Variables

The following variables can be used inside the [[setting,passdb]] / [[setting,userdb]] sections:

| Variable | Description |
| -------- | ----------- |
| `%{ldap:attrName}` | Fetches a single-valued attribute. Fails if the attribute is not present, unless the `\|default` filter is given. If there are multiple values, all except the first are ignored (with warning). |
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

Replace `<dovecot's dn>` with the DN you specified in
[[setting,client_auth_authid]] in `dovecot.conf`'s ldap settings.

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

The filter must be in parentheses, e.g. `(uid=%{user})`. The outer parentheses
can be left out if the filter is a single item, like `uid=%{user}`, but not
with `&` or `|` combinations.

Usually the LDAP attribute names aren't the same as
[[link,passdb,the field names that Dovecot uses internally]]. You must
create a mapping between them to get the wanted results. This
is done by listing the [[setting,passdb_fields]] as `<dovecot field> = <expression>` where
expression can include ldap specific variables and other variables too.

For example:
::: code-group
```doveconf[dovecot.conf]
ldap_client_uris = ldap://ldap.example.org
ldap_client_starttls = yes
ldap_client {
  client_auth_authid = cn=admin,dc=example,dc=org
  client_auth_password = secret
}
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
```doveconf[dovecot.conf]
ldap_client_uris = ldap://ldap.example.org
ldap_client_starttls = yes
ldap_client {
  client_auth_authid = cn=admin,dc=example,dc=org
  client_auth_password = secret
}
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
```doveconf[dovecot.conf]
ldap_client_uris = ldap://ldap.example.org
ldap_client_starttls = yes
ldap_client {
  client_auth_authid = cn=admin,dc=example,dc=org
  client_auth_password = secret
}
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
```doveconf[dovecot.conf]
ldap_client_uris = ldap://ldap.example.org
ldap_client_starttls = yes
ldap_client {
  client_auth_authid = cn=admin,dc=example,dc=org
  client_auth_password = secret
}
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

Userdb lookups are always done using the [[setting,client_auth_authid]]
bind. It's not possible to do the lookup using the user's DN (remember
that e.g. [[link,lda]] or [[link,lmtp]] needs to do userdb lookups
without knowing the user's password).

The userdb lookups are configured in very much the same way as
[password lookups](#password-lookups). [[setting,userdb_fields]] and
[[setting,userdb_ldap_filter]], are used in the same way in passdb.

If you're using a single UID and GID for all the users, you can specify
them globally with [[setting,mail_uid]] and [[setting,mail_gid]] settings instead of
returning them from LDAP.

```doveconf[dovecot.conf]
ldap_client_uris = ldap://ldap.example.org
ldap_client_starttls = yes
ldap_client {
  client_auth_authid = cn=admin,dc=example,dc=org
  client_auth_password = secret
}
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

For using `doveadm -A` or `-u` with wildcards you need to configure the userdb
to support user iteration. This is done by adding
[[setting,userdb_ldap_iterate_filter]] and
[[setting,userdb_ldap_iterate_fields]] settings to the userdb:
```doveconf[dovecot.conf]
userdb ldap {
  # filter = ...
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

```doveconf[dovecot.conf]
userdb ldap {
  fields {
    quota_storage_size = %{ldap:quotaBytes}B
  }
}
```

Create a `mail_path` field with value `/var/mail/<dir>/Maildir` where
`<dir>` comes from "sAMAccountName" LDAP attribute:

```doveconf[dovecot.conf]
userdb ldap {
  fields {
    mail_path = /var/spool/vmail/%{ldap:sAMAccountName}/Maildir
  }
}
```

You can add static fields that aren't looked up from LDAP. For example
create a "mail_path" field with value `/var/vmail/%{user | domain}/%{user | username}/Maildir`:

```doveconf[dovecot.conf]
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
```doveconf[dovecot.conf]
ldap_client_uris = ldap://ldap.example.org
ldap_client_starttls = yes
ldap_client {
  client_auth_authid = cn=admin,dc=example,dc=org
  client_auth_password = secret
}
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

## Active Directory

Active Directory (AD) refuses binds on plain LDAP connections that have no
integrity protection, and Dovecot's LDAP client doesn't support SASL security
layers. Therefore use TLS: either `ldaps://` (port 636, or 3269 for the global
catalog) or [[setting,ldap_client_starttls,yes]] with `ldap://`. See also
[[link,active_directory]].

Simple bind with a service account (the user principal name can be used as the
bind identity):

::: code-group
```doveconf[dovecot.conf]
ldap_client_uris = ldaps://ad.example.com
ldap_client_max_idle_time = 5 mins
ldap_client {
  client_auth_authid = dovecot@example.com
  client_auth_password = secret
}
ldap_base = dc=example,dc=com
```
:::

Set [[setting,ldap_client_max_idle_time]] below the idle limit of the network
between Dovecot and AD, so that connections aren't silently dropped.

Other ways to authenticate to AD:

 * `client_auth_mechanism = GSSAPI` or `GSS-SPNEGO` use the default
   Kerberos credentials of the Dovecot process (for example the default client
   keytab, see `KRB5_CLIENT_KTNAME`); [[setting,client_auth_authid]] and
   [[setting,client_auth_password]] are not used. Over TLS they send the
   `tls-server-end-point` channel binding, which AD can require. Without TLS,
   `GSSAPI` provides no integrity or confidentiality after the bind, because
   the client negotiates no security layer, so use TLS.
 * `client_auth_mechanism = EXTERNAL` uses the TLS client certificate
   ([[setting,ssl_client_cert_file]] and [[setting,ssl_client_key_file]]). With
   StartTLS it works as it does with other LDAP servers. With `ldaps://` AD
   logs the certificate in during the TLS handshake and refuses an `EXTERNAL`
   bind, so add the `implicit-external-auth` workaround. No bind is then sent
   and [[setting,client_auth_authzid]] is ignored:

::: code-group
```doveconf[dovecot.conf]
ldap_client_uris = ldaps://ad.example.com
ldap_client_workarounds = implicit-external-auth
ldap_client {
  client_auth_mechanism = EXTERNAL
}
ssl_client_cert_file = /etc/dovecot/ldap-client.pem
ssl_client_key_file = /etc/dovecot/ldap-client.key
```
:::

If AD doesn't accept the certificate, the connection stays anonymous and the
searches are refused. The error then notes that the connection may be
anonymous.
