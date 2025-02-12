---
layout: doc
title: Rootless Installation
dovecotlinks:
  rootless: Rootless Installation
---

# Rootless Installation

It's possible to make Dovecot run under a single system user without
requiring root privileges at any point. This shouldn't be thought of as
a security feature, but instead simply as a way for non-admins to run
Dovecot in their favorite mail server. It's also useful if you just wish
to test Dovecot without messing up your system.

If you think of this as a good way to achieve security, ask yourself
which is worse:

- A very small possibility to get root privileges through Dovecot.

- A small possibility without logging in, to get into system as a
  non-privileged **dovecot** user, chrooted into an empty directory.

- A small possibility to get user's privileges after logging in, but no
  possibility to read others' mails since they're saved with different
  UIDs (plus you might also be chrooted to your own mailbox).

**or**

- Absolutely zero possibility to get root privileges through Dovecot.

- A small possibility to get into system as a mail user, possibly even
  without logging in, and being able to read everyone's mail (and
  finally gaining roots by exploiting some just discovered local
  vulnerability, unless you bothered to set up a special chrooted
  environment).

## Installation

Install somewhere under home directory:

```sh
./configure --prefix=$HOME/dovecot
make
make install
```

Dovecot is then started by running `~/dovecot/sbin/dovecot`. The
example configuration file exists in
`~/dovecot/share/doc/dovecot/example-config/` and needs to be copied
to `~/dovecot/etc/dovecot/`.

### Add Capabilities

Modern linux systems support capabilities which allows you to permit
selective rights to processes. This allows you to run dovecot rootless
without losing chroot and privileged ports.

Use following commands to enable this:

```sh
setcap cap_net_bind_service+ep ~/dovecot/sbin/dovecot
setcap cap_sys_chroot+ep ~/dovecot/libexec/dovecot/script-login
setcap cap_sys_chroot+ep ~/dovecot/libexec/dovecot/imap-urlauth-login
setcap cap_sys_chroot+ep ~/dovecot/libexec/dovecot/submission-login
setcap cap_sys_chroot+ep ~/dovecot/libexec/dovecot/managesieve-login
setcap cap_sys_chroot+ep ~/dovecot/libexec/dovecot/pop3-login
setcap cap_sys_chroot+ep ~/dovecot/libexec/dovecot/imap-login
setcap cap_sys_chroot+ep ~/dovecot/libexec/dovecot/lmtp
setcap cap_sys_chroot+ep ~/dovecot/libexec/dovecot/anvil

# if you have installed managesieve
setcap cap_sys_chroot+ep ~/dovecot/libexec/dovecot/managesieve-login
```

## Configuration

The important settings to change for rootless installation are:

- Set usernames and group to the user which dovecot will be run under:

  ```
  default_internal_user = user
  default_login_user = user
  default_internal_group = group
  ```

- Remove default chrooting from all services, this is optional if you want
  to use Linux capabilities instead.

  ```
  service anvil {
    chroot =
  }
  service imap-login {
    chroot =
  }
  service pop3-login {
    chroot =
  }
  ```

- Change listener ports, this is optional if you want to use Linux
  capabilities instead:

  ```
  service imap-login {
    inet_listener imap {
      port = 10143
    }
    inet_listener imaps {
      port = 10993
    }
  }

  service pop3-login {
    inet_listener pop3 {
      port = 10110
    }
    inet_listener pop3s {
      port = 10995
    }
  }
  ```

- Change logging destination:

  ```
  log_path = /home/user/dovecot.log
  ```

- Instead of [[link,auth_pam]], use, for example, [[link,auth_passwd_file]]:

  ```
  passdb passwd-file {
    passwd_file_path = /home/user/dovecot/etc/passwd
  }

  userdb passwd {
  }
  ```

  Where the `passwd` file contains the username and password for your
  login user:

  ```
  user:{PLAIN}pass
  ```
