---
layout: doc
title: Passwd-file
dovecotlinks:
  auth_passwd_file: passwd-file authentication database
---

# Passwd-file (`passwd-file`)

This file is compatible with a normal `/etc/passwd` file, and a password file
used by [[link,auth_pam,libpam-pwdfile]] plugin.

## Configuration

`user:password:uid:gid:(gecos):home:(shell):extra_fields`

For a [[link,passdb]] it's enough to have only the user and password fields.

For a [[link,userdb]], you need to set also uid, gid, and preferably also home
[[link,virtual_users]]). (gecos) and (shell) fields are unused by Dovecot.

The password field can be in four formats (see [[link,password_schemes]]):

* `password`: Assume CRYPT password scheme.
* `{SCHEME}password`: The password is in the given scheme.
* `password[13]`: libpam-passwd file compatible format for CRYPT scheme.
* `password[34]`: libpam-passwd file compatible format for MD5 scheme.

`extra_fields` is a space-separated list of `key=value` pairs which can be
used to set various [[link,passdb_extra_fields]] and
[[link,userdb_extra_fields]].

Keys which begin with a `userdb_ prefix` are used for userdb, others are
used for passdb.

For example, if you wish to override [[setting,mail_location]] for one use,
use `userdb_mail=mbox:~/mail`.

[[variable]] expansion is done for `extra_fields`.

Empty lines and lines beginning with `#` character are ignored.

### Passwd-file Args

#### `scheme=<s>`

Allows you to specify the default [[link,password_schemes]].

The default is `CRYPT`. This is available only for passdb.

#### `username_format=<s>`

Look up usernames using this format instead of the full username (`%u`).

If you want to enable user@domain logins but have only `user` in the file,
set this to `%n`.

### Multiple passwd-files

You can use all [[variable]] in the passwd-file filenames, for example:

```[dovecot.conf]
passdb {
  driver = passwd-file
  # Each domain has a separate passwd-file:
  args = /etc/auth/%d/passwd
}
```

### Examples

```[dovecot.conf]
passdb {
  driver = passwd-file
  args = scheme=plain-md5 username_format=%n /etc/imap.passwd
}
userdb {
  driver = passwd-file
  args = username_format=%n /etc/imap.passwd
  default_fields = uid=vmail gid=vmail home=/home/vmail/%u
}
```

* The `default_fields` is explained in [[link,userdb]]. They can be used
  to provide default userdb fields based on templates in case they're not
  specified for everyone in the passwd file. If you leave any of the standard
  userdb fields (uid, gid, home) empty, these defaults will be used.

This file can be used as a passdb:

```
user:{plain}password
user2:{plain}password2
```

A passdb with extra fields:

```
user:{plain}password::::::allow_nets=192.168.0.0/24
```

This file can be used as both a passwd and a userdb:

```
user:{plain}pass:1000:1000::/home/user::userdb_mail=maildir:~/Maildir allow_nets=192.168.0.0/24
user2:{plain}pass2:1001:1001::/home/user2
```

## FreeBSD /etc/master.passwd as passdb and userdb

On FreeBSD, `/etc/passwd` doesn't work as a password database because the
password field is replaced by a `*`.

`/etc/master.passwd` can be converted into a format usable by passwd-file.
As [[link,auth_pam]] can access the system-wide credentials on FreeBSD,
what follows is generally needed only if the mail accounts are different
from the system accounts.

If only using the result for `name:password:uid:gid` and not using
[[link,passdb_extra_fields]], you may be able to use the extract directly.
However, the Linux-style passwd file has fewer fields than that used by
FreeBSD and it will need to be edited if any fields past the first four are
needed.

In particular, it will fail if used directly as a `userdb` as the field used
for `home` is not in the same place as expected by the Dovecot parser. The
`:class:change:expire` stanza in each line should be removed to be consistent
with the Linux-style format. While that stanza often is `::0:0` use of
`cut` is likely much safer than sed or other blind substitution.

In `/etc/master.passwd`, a password of `* ` indicates that password
authentication is disabled for that user and the token `*LOCKED*` prevents
all login authentication, so you might as well exclude those:

```console
$ fgrep -v '*' /etc/master.passwd | cut -d : -f 1-4,8-10 > /path/to/file-with-encrypted-passwords
$ chmod 640 /path/to/file-with-encrypted-passwords
$ chown root:dovecot /path/to/file-with-encrypted-passwords
```

The following will work in many situations, after disabling the inclusion of
other `userdb` and `passdb` sections:

```
passdb {
  driver = passwd-file
  args = username_format=%n /path/to/file-with-encrypted-passwords
}

userdb {
  driver = passwd-file
  args = username_format=%n /path/to/file-with-encrypted-passwords
}
```
