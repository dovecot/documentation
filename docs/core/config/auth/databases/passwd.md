---
layout: doc
title: Passwd
dovecotlinks:
  auth_passwd: passwd authentication database
---

# Passwd (`passwd`)

User is looked up using `getpwnam()` call, which usually looks into
`/etc/passwd` file, but depending on the NSS configuration it may
also look up the user from, e.g., LDAP database.

Most commonly used as a [[link,userdb]].

The lookup is by default done in the auth worker processes. If you have only a
small local passwd file, you can avoid having extra auth worker processes by
disabling it:

```
userdb passwd {
  use_worker = yes
}
```

## Field Overriding and Extra Fields

It's possible to override fields from passwd and add
[[link,userdb_extra_fields]].

For example:

```[dovecot.conf]
userdb passwd {
  fields {
    home = /var/mail/%{username}
    mail_driver = maildir
    mail_path = /var/mail/%{username}/Maildir
  }
}
```

This uses the UID and GID fields from passwd, but home directory is
overridden. Also the default [[link,mail_location]] setting is overridden.

::: info
[[setting,userdb_fields_import_all]] defaults to `yes`. If it is set to `no`
the fields to be imported need to be explicitly defined.

```[dovecot.conf]
userdb passwd {
  fields_import_all = no
  fields {
    uid = %{passwd:uid:vmail}
    gid = %{passwd:gid:vmail}
    home = /var/mail/%{username}
    mail_driver = maildir
    mail_path = /var/mail/%{username}/Maildir
  }
}
```
:::

## Passwd as a passdb

Many systems use shadow passwords nowadays so passwd doesn't usually work as a
password database. BSDs are an exception to this, they still set the password
field even with shadow passwords.

With FreeBSD, passwd doesn't work as a password database because the password
field is replaced by a `*`. But you can use [[link,auth_passwd_file]] instead.
