---
layout: doc
title: Kerberos
---

# Kerberos Authentication

Dovecot supports Kerberos 5 using GSSAPI.

The Kerberos authentication mechanism doesn't require having a
[[link,passdb]], but you do need a [[link,userdb]] so Dovecot can lookup
user-specific information, such as where their mailboxes are stored.

With centralized systems, such as Microsoft Active Directory, LDAP is a
good choice.

::: info
If you only wish to authenticate clients using their Kerberos
*passphrase* (as opposed to ticket authentication), you will probably
want to use [[link,auth_pam]] with `pam_krb5.so` instead.

## Pre-requisites

This document assumes that you already have a Kerberos Realm up and
functioning correctly at your site, and that each host in your realm
also has a host *keytab* installed in the appropriate location.

For Dovecot, you will need to install the appropriate *service* keys on
your server. By default, Dovecot will look for these in the host's
keytab file, typically `/etc/krb5.keytab`, but you can specify an
alternate path using [[setting,auth_krb5_keytab]].

Keytab file should be readable by user "dovecot" (or whatever user the
auth process is running as).

If you wish to provide an IMAP service, you will need to install a
service ticket of the form `imap/hostname@REALM`.

For POP3, you will need a service ticket of the form `pop/hostname@REALM`.

When using Dovecot's [[link,sasl]] with [[link,mta]], you will need to
install service ticket of the form `smtp/hostname@REALM`.

## Setting up samba

Create symlink for krb5.conf, if you do not have krb5.conf ready:

```sh
ln -sf /usr/local/samba/private/krb5.conf /etc/krb5.conf
```

Create Dovecot user to your samba instance (choose random password):

```sh
samba-tool user create dovecot
```
```
New Password:
Retype Password:
User 'dovecot' created successfully
```

Add Service Principal Names (SPNs) and create keytab:

```sh
samba-tool spn add imap/host.domain.com dovecot
samba-tool domain exportkeytab --principal imap/host.domain.com /etc/dovecot/dovecot.keytab
```

Dovecot needs to be able to read the keytab:

```sh
chgrp dovecot /etc/dovecot/dovecot.keytab
chmod g+r /etc/dovecot/dovecot.keytab
```

Make sure your keytab has entry for `imap/host.domain.name@REALM`:

```sh
klist -Kek /etc/dovecot/dovecot.keytab
```
```
Keytab name: FILE:/etc/dovecot/dovecot.keytab
KVNO Principal
---- --------------------------------------------------------------------------
   1 imap/host.domain.name@REALM (des-cbc-crc)
   1 imap/host.domain.name@REALM (des-cbc-md5)
   1 imap/host.domain.name@REALM (arcfour-hmac)
```

## Example Configurations

If you only want to use Kerberos ticket-based authentication:

```[dovecot.conf]
auth_gssapi_hostname = "$ALL"
auth_mechanisms = gssapi
auth_krb5_keytab = /etc/dovecot/dovecot.keytab

userdb {
  driver = static
  args = uid=vmail gid=vmail home=/var/vmail/%u
}
```

(In this virtual-hosting example, all mail is stored in
`/var/vmail/$username` with uid and gid set to 'vmail')

If you also want to support plaintext authentication in addition to
ticket-based authentication, you will need something like:

```[dovecot.conf]
auth_mechanisms = plain login gssapi
auth_gssapi_hostname = "$ALL"
auth_mechanisms = gssapi
auth_krb5_keytab = /etc/dovecot/dovecot.keytab

passdb {
  driver = pam
}
userdb {
  driver = passwd
}
```

::: info
In this example, you will also need to configure PAM to use
whichever authentication backends are appropriate for your site.
:::

## Enable Plaintext Authentication to use Kerberos

This is needed when some of your clients don't support GSSAPI and you
still want them to authenticate against Kerberos.

Install pam_krb5 module for PAM, and create `/etc/pam.d/dovecot`:

```
auth sufficient pam_krb5.so
account sufficient pam_krb5.so
```

Then enable PAM passdb:

```
passdb {
  driver = pam
}
```

Check `/var/log/auth.log` if you have any problems logging in. The
problem could be that PAM is still trying to use pam_unix.so rather than
pam_krb5.so. Make sure pam_krb5.so is the first module for account or
just change pam_unix.so to sufficient.

## Cross-Realm Authentication

This seems to have all kinds of trouble. Search Dovecot mailing list for
previous threads about it. Some points about it:

- `krb5_kuserok()` is used to check if access is allowed. It may try to
  do the check by reading `~user/.k5login` (good!) or `~dovecot/.k5login`
  (bad!)

- Solaris uses `gss_userok()` instead of `krb5_kuserok()`. See "k5principals"
  [[link,passdb_extra_fields]] which is a comma separated list of usernames
  that are allowed to log in. If it's set, it bypasses the `krb5_kuserok()`
  check.

  ::: info
  For this to work, you need a password database which supports
  **credential lookups**. This excludes LDAP databases using authentication
  binds (`auth_bind = yes`). However, a second LDAP passdb entry without
  `auth_bind = yes` may be added for the sole purpose of Kerberos principals
  mapping. This passdb doesn't need to return a password attribute (and
  usually shouldn't). Authentication-bind LDAP databases are able to
  provide `k5principals` lookups if configured with `pass_filter`.
  :::

## Client Support

Mail clients that support Kerberos GSSAPI authentication include:

- Evolution
- Mozilla Thunderbird
- SeaMonkey
- Mutt
- UW Pine
- Apple Mail

## Testing

This test demonstrates that the server can acquire its private credentials.

You need to configure your server accordingly, and then you can use mutt
client to test this.

First telnet directly to the server:

```sh
telnet localhost 143
```
```
* OK Dovecot ready.
```

or, if you are using IMAPS then use openssl instead of telnet to
connect:

```sh
openssl s_client -connect localhost:993
```
```
CONNECTED(00000003)
...
* OK Dovecot ready.
```

Check that GSSAPI appears in the authentication capabilities:

```
a capability
* CAPABILITY ... AUTH=GSSAPI
```

Attempt the first round of GSS communication. The '+' indicates that the
server is ready:

```
a authenticate GSSAPI
+
```

Abort the telnet session by typing control-] and then 'close':

```
^]
telnet> close
```

The test:

- Setup mutt in /etc/Muttrc to use kerberos using gssapi and imap
  configuration

  - This is done with `set imap_authenticators="gssapi"`

- run `kinit` (type in password for kerb)

- run command `mutt`

- If you get error "No Authentication Method"

  - run command `klist` (list all kerberos keys) should show imap/HOSTNAME

- DNS has to function correctly so that kerberos works.
