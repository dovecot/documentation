---
layout: doc
title: Restricting IMAP/POP3 access
---

# How To: Restricting IMAP/POP3 access

Below examples show how you can give POP3 access to everyone, but IMAP
access only for some people. The exact solution you want depends on what
passdb you use. The solutions can also be modified for other types of
IMAP/POP3/SMTP/etc. access checks.

## PAM

Set [[setting,passdb_pam_service_name,%{protocol}]], i.e.:

```[dovecot.conf]
passdb pam {
  service_name = %{protocol}
}
```

That way PAM uses `/etc/pam.d/imap` for IMAP, and `/etc/pam.d/pop3` for POP3.

In `/etc/pam.d/imap` you could then use, e.g., the pam_listfile.so module:

```[/etc/pam.d/imap]
# allow IMAP access only for users in /etc/imapusers file
auth    required        pam_listfile.so item=user sense=allow file=/etc/imapusers onerr=fail
```

## SQL

You can use the `%{protocol}` variable which expands to `imap` or `pop3` in
[[setting,passdb_sql_query]]:

```[dovecot.conf]
passdb sql {
  query = SELECT password \
    FROM users \
    WHERE userid = '%u' AND NOT (imap_allowed = false and '%{protocol}' = 'imap')
}
```

## LDAP

Just like with SQL, you can use `%{protocol}` in [[setting,ldap_filter]]:

```
pass_filter = (&(objectClass=posixAccount)(uid=%u)(protocol=%{protocol}))
```

That would require setting both protocol=pop3 and protocol=imap attributes
to the user objects.

## passwd-file

You can create a deny passwd-file based on the service:

```[dovecot.conf]
passdb passwd-file {
  passwd_file_path = /etc/dovecot/deny.%{protocol}
  deny = yes
}
```

This makes Dovecot look for `/etc/dovecot/deny.imap` and
`/etc/dovecot/deny.pop3` files. If the user exists in it, the access
is denied. The files don't need to have anything else than one username
per line.

Note that this deny passdb must be before other passdbs. It also means
that it can be used with any other passdb, not just with passwd-file
passdbs.

## Restricting IP Access

It's possible to allow a user to authenticate only from a specific IP or
network. This is especially useful for master users. This can be done by
returning `allow_nets` extra field from [[link,passdb_extra_fields]].
