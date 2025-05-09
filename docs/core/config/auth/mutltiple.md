---
layout: doc
title: Multiple Databases
dovecotlinks:
  auth_multiple_dbs: Multiple Authentication Databases
---

# Multiple Authentication Databases

Dovecot supports defining multiple authentication databases, so that if the
password doesn't match in the first database, it checks the next one. This can
be useful if you want to easily support having both local system users in
`/etc/passwd` and virtual users.

Currently the fallback works only with the PLAIN authentication mechanism.

Often you also want a different mail location for system and virtual users. The
best way to do this would be to always have mails stored below the home
directory.

* System users' mails: /home/user/Maildir
* Virtual users' mails: /var/vmail/domain/user/Maildir

This can be done by simply having both system and virtual userdbs return home
directory properly (i.e. virtual users' `home=/var/vmail/%{user | domain}/%{user | username}`) and then set
[[setting,mail_path,~/Maildir]].

If it's not possible to have a home directory for virtual users (avoid that if
possible), you can do this by pointing multiple authentication databases
to system users' mail location and have the virtual userdb override it by
returning mail [[link,passdb_extra_fields]].

## Example with Home Dirs

* System users' mails: /home/user/Maildir
* Virtual users' mails: /var/vmail/domain/user/Maildir

::: code-group
```[dovecot.conf]
# Mail location for both system and virtual users:
mail_driver = maildir
mail_path = ~/Maildir

sql_driver = mysql
mysql localhost {
}

# try to authenticate using SQL database first
passdb sql {
  query = SELECT userid AS user, password FROM users WHERE userid = '%{user}'
}

# fallback to PAM
passdb pam {
}

# look up users from SQL first (even if authentication was done using PAM!)
userdb sql {
  query = SELECT uid, gid, '/var/vmail/%{user | domain}/%{user | username}' AS home FROM users WHERE userid = '%{user}'
}

# if not found, fallback to /etc/passwd
userdb passwd {
}
```
