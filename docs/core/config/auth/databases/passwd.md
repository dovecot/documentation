---
layout: doc
title: Passwd
dovecotlinks:
  auth_passwd: passwd authentication database
---

# Passwd (`passwd`)

User is looked up using `getpwnam()` call, which usually looks into
`/etc/passwd` file, but depending on [[link,auth_nss]] configuration it may
also look up the user from, e.g., LDAP database.

Most commonly used as a [[link,userdb]].

The lookup is by default done in the auth worker processes. If you have only a
small local passwd file, you can avoid having extra auth worker processes by
disabling it:

```
userdb db1 {
  driver = passwd
  args = blocking=no
}
```

## Field Overriding and Extra Fields

It's possible to override fields from passwd and add
[[link,userdb_extra_fields]] with templates, but it's done in a better way
by using `override_fields`.

For example:

```[dovecot.conf]
userdb db1 {
  driver = passwd
  override_fields {
    home = /var/mail/%u
    mail_driver = maildir
    mail_path = /var/mail/%u/Maildir
  }
}
```

This uses the UID and GID fields from passwd, but home directory is
overridden. Also the default [[link,mail_location]] is overridden.

## Passwd as a passdb

Many systems use shadow passwords nowadays so passwd doesn't usually work as a
password database. BSDs are an exception to this, they still set the password
field even with shadow passwords.

With FreeBSD, passwd doesn't work as a password database because the password
field is replaced by a `*`. But you can use [[link,auth_passwd_file]] instead.
