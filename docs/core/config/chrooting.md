---
layout: doc
title: Chrooting
dovecotlinks:
  chrooting: chrooting
---

# Chrooting (change root)

Traditionally chrooting has been done to run the whole server within a
single chroot. This is also possible with Dovecot, but it requires
manually setting up the chroot and it can be a bit tricky.

Dovecot however supports internally running different parts of it in different
chroots:

- Login processes (imap-login, pop3-login) are chrooted by default into
  an empty non-writable directory.

- Authentication process (dovecot-auth) can be chrooted by setting
  `chroot=<path>` inside `service auth` and/or
  `service auth-worker` sections. This could be a good idea to change
  if you're not using a passdb or userdb that needs to access files
  outside of the chroot. Also make sure not to run the auth process as
  root then.

- Mail processes (imap, pop3) can be made to chroot in different ways.
  See below.

## Security Problems

If chrooting is used incorrectly, it allows local users to gain root
privileges. This is possible by hardlinking setuid binaries inside the
chroot jail and tricking them. There are at least two possibilities:

1. Hardlink `/bin/su` inside the chroot and create your own
   `<chroot>/etc/passwd`. Then simply run `su root`.

2. Create your own `<chroot>/lib/libc.so` and run any setuid binary.

Of course both of these require that the setuid binary can be run inside
the chroot. This isn't possible by default. Either user would have to
find a security hole from Dovecot, or the administrator would have had
to set up something special that allows running binaries.

In any case it's a good idea not to allow users to hardlink setuid
binaries inside the chroots. The safest way to do this is to mount the
filesystem with "nosuid" option.

## Mail Process Chrooting

Due to the potential security problem described above, Dovecot won't
chroot mail processes to directories which aren't listed in
[[setting,valid_chroot_dirs]] setting. For example if your users
may be chrooting under `/var/mail/<user>/` and `/home/<user>/`, use:

```[dovecot.conf]
valid_chroot_dirs = /var/mail /home
```

You can chroot all users globally into the same directory by using
[[setting,mail_chroot]] setting. For example:

```
mail_chroot = /home
```

You can also make userdb return a chroot. There are two ways to do that:

1. Make userdb return `chroot=<path>` field.

2. Insert "/./" inside the returned home directory, eg.:
   `home=/home/./user` to chroot into `/home`, or
   `home=/home/user/./` to chroot into `/home/user`.
