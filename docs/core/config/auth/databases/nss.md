---
layout: doc
title: NSS
dovecotlinks:
  auth_nss: NSS authentication database
---

# NSS (`nss`)

[[deprecated,auth_nss]]

::: danger
This userdb is probably useless with Dovecot Core v2.0.12+, since it uses
`getpwnam_r()`, which supports error reporting.
:::

Usually [NSS](https://en.wikipedia.org/wiki/Name_Service_Switch) is used
with [[link,auth_passwd]] but it has one problem: it can't distinguish
between temporary and permanent errors.

So if you're using, e.g., `nss_ldap` and your LDAP database is down, all userdb
lookups may return "user doesn't exist" errors. This is especially bad if
you're using [[link,lda]], which causes the mails to be bounced back to
sender.

The NSS userdb works around this problem by loading the NSS modules and
calling them itself. This is a bit kludgy, and it probably works only with
Linux.

## Database Parameters

### `service=<name>`

The name specifies what NSS module to use, for example `ldap`.

This parameter is **REQUIRED**.

### `blocking=no`

Causes the lookups to be done in auth master processes instead of in worker
processes.

## Example

```[dovecot.conf]
userdb db1 {
  driver = nss
  args = service=ldap
}
```
