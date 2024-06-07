---
layout: doc
title: GSSAPI
dovecotlinks:
  auth_gssapi: GSSAPI
---

# GSSAPI

GSSAPI (Generic Security Services Application Program Interface) is an
authentication mechanism that provides mutual authentication using opaque
messages (such as tokens).

GSSAPI is usually used with Kerberos, and is a good choice when dealing
with centralized authentications, like Active Directory or FreeIPA.

These instructions cover using Kerberos, and assume that you have a fully
functional Kerberos environment. Most importantly, you need to ensure
your DNS lookups and reverse DNS lookups work and return correct names.

## Preparations

First thing, you need to create Service Principal for Dovecot. This is
done with `kadmin` tool.

```console
$ kadmin -q 'addprinc -randkey imap/fully.qualified.host@REALM'
$ kadmin -q 'addprinc -randkey IMAP/fully.qualified.host@REALM'
```

To create a keytab, use:

```console
$ kadmin -q 'ktadd -k /root/keytab imap/fully.qualified.host@REALM'
$ kadmin -q 'ktadd -k /root/keytab IMAP/fully.qualified.host@REALM'
```

and put the keytab file into `/etc/dovecot`, set mode `0440` and ownership
to `root:dovecot`.

On Active Directory, you need to create a Service User with password that
never expires and cannot be changed, and then use `setspn.exe` to create the
service principals for this user.

```console
$ setspn -A IMAP/hostname service_user_name
$ setspn -A imap/hostname service_user_name
```

Then you need to use `ktpass` utility to export the keytab.

```console
$ ktpass -princ imap/hostname -mapuser service_user_name \
      -crypto ALL -ptype KRB5_NT_PRINCIPAL -pass service_user_password \
      -target dc.test.com -out c:\share\keytab
$ ktpass -princ IMAP/hostname -mapuser service_user_name -crypto ALL \
      -ptype KRB5_NT_PRINCIPAL -pass service_user_password \
      -target dc.test.com -out c:\share\keytab
```

Use `klist` on your Dovecot server to verify the keytab contains the
expected results:

```console
$ klist -k /etc/dovecot/keytab
Keytab name: FILE:/etc/krb5.keytab
KVNO Principal
---- --------------------------------------------------------------------------
   2 imap/hostname@REALM
```

## Configuring Dovecot

Once you have a keytab, configure GSSAPI on Dovecot.

```[dovecot.conf]
auth_mechanisms = $auth_mechanisms gssapi
auth_gssapi_hostname = hostname-from-spn # or "$ALL"
auth_krb5_keytab = /etc/dovecot/keytab
```

This should enable GSSAPI support for Dovecot.

GSSAPI requires at least one passdb configured. Note that authentication
will normally succeed, even if user is not found in any passdb. Please
configure a userdb if you do not want this.

### Specifying Accepted Credential

If passdb lookup succeeds, it can optionally return `k5principals` extra
field, which contains comma separated list of identities to accepted for
the user.

This enables cross-realm and on-behalf authentication.

See [[link,passdb_extra_fields]].

### Testing

You need an GSSAPI capable client, such as Thunderbird, running on a
fully working Kerberos workstation. You can choose GSSAPI as your
authentication mechanism and you should be able to log in.

If necessary, you can use [[setting,auth_username_format]] to normalize
usernames.
