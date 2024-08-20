---
layout: doc
title: Quick Configuration
dovecotlinks:
  quick_config: quick configuration
---

# Quick Configuration

If you just want to get Dovecot running with typical configuration in a
typical environment, this guide will help you.

## TLDR; I Just Want Dovecot Running

Here is a very simple basic configuration with single vmail user to be placed
in `dovecot.conf`.

::: tip
Some distros split configuration under `/etc/dovecot/conf.d/`. This can
be useful, but it is not required.

For a simple setup, a single `dovecot.conf` file is recommended.
:::

You need to create group `vmail` and user `vmail`.

::: code-group
```[dovecot.conf]
mail_home=/srv/mail/%Lu
mail_location=sdbox:~/Mail

## this is sometimes needed
#first_valid_uid = uid-of-vmail-user

# if you want to use system users
passdb pam {
  driver = pam
}

userdb passwd {
  driver = passwd
  args = blocking=no
  override_fields = uid=vmail gid=vmail
}

ssl=yes
ssl_cert=</path/to/cert.pem
ssl_key=</path/to/key.pem

namespace {
  inbox = yes
  separator = /
}
```
:::

## Configuration File

Prebuilt packages usually install the configuration files into
`/etc/dovecot/`. You'll find the correct path by running:

```sh
doveconf -n | head -n 1
```

It's a good idea to read through all the config files and see what settings
you might want to change.

### Installing From Sources

If you compiled and installed Dovecot from sources, Dovecot has installed only
a `/usr/local/etc/dovecot/README` file, which contains the path to the
installed example configuration files, usually
`/usr/local/share/doc/dovecot/example-config`. Copy them to `etc/`:

```sh
cp -r /usr/local/share/doc/dovecot/example-config/* /usr/local/etc/dovecot/
```

### Split Configuration Files

The default configuration starts from `dovecot.conf`, which contains an
`!include conf.d/*.conf` statement to read the rest of the configuration.
The idea is that the settings are nicely grouped into different files to make
it easier for new admins to scan through related settings. It doesn't matter
which config file you add which setting.

In the production system it's often easier to just have a single
`dovecot.conf` file, which you can create easily using:

```sh
doveconf -nP > dovecot.conf
```

### Hints About Writing Configuration Files

* Usually it does not matter in which file you write the setting. You only need
  to be aware that later settings replace earlier ones. If you use the same
  section multiple times, the settings are merged together.
* To read the content of a file, for instance for the SSL certificate option,
  prefix the filename with a `<`, e.g.:

```
ssl_cert = </etc/ssl/certs/imap.pem
```

## Authentication

By default, Dovecot is setup to use system user authentication.
You'll probably be using PAM authentication. See the page [[link,auth_pam]]
for how to configure it.

A typical configuration with Linux would be to create `/etc/pam.d/dovecot`
which contains:

```
auth      required        pam_unix.so
account   required        pam_unix.so
```

### Virtual Users

If you're planning on using virtual users, it's easier to first create a
simple passwd-like file to make sure that the authentication will work.
Later when you know Dovecot is working, you can do it differently (see
[[link,virtual_users]]).

Run as your own non-root user:

```sh
echo "$USER:{PLAIN}password:$UID:$GID::$HOME" > users
sudo mv users /etc/dovecot/

# If SELinux is enabled:
restorecon -v /etc/dovecot/users
```

You can (and should) replace the "password" with whatever password you
wish to use, but don't use any important password here as we'll be
logging in with insecure plaintext authentication until [[link,ssl]]
is configured.

Switch to passwd-file authentication by adding to `dovecot.conf`:

```
passdb {
  driver = passwd-file
  args = scheme=CRYPT username_format=%u /etc/dovecot/users
}

userdb {
  driver = passwd-file
  args = username_format=%u /etc/dovecot/users
}
```

Verify with `doveconf -n passdb userdb` that the output looks like
above (and there are no other passdbs or userdbs).

If you're using something else, see [[link,passdb]] and [[link,userdb]].

## Mail Location

You can let Dovecot do its automatic mail location detection, but if that
doesn't work you can set the location manually in [[setting,mail_location]].

::: tip
It is recommended to use either [[link,maildir]] or [[link,dbox]] as your
mailbox format.

[[link,mbox]] is a deprecated format, and should
only be used for legacy message access and not for new systems.
:::

### Maildir

For better performance you may want to set
[[setting,mbox_very_dirty_syncs,yes]].

## Client Workarounds

Check [[setting,imap_client_workarounds]] and
[[setting,pop3_client_workarounds]] and see if you want to enable more of
them than the defaults.

## SSL and Plaintext Authentication

If you intend to use SSL, set [[setting,ssl_cert]] and [[setting,ssl_key]]
settings. Otherwise set [[setting,ssl,no]].

Easiest way to get SSL certificates built is to use Dovecot's
`doc/mkcert.sh` script. For more information see [[link,ssl_configuration]].

By default [[setting,auth_allow_cleartext,no]], which means that Dovecot
will fail the authentication if the client doesn't use SSL (or use
non-cleartext authentication mechanisms). This is recommended in most
situations, since it prevents leaking passwords. However, if you don't
offer SSL for some reason, you'll probably want to set
[[setting,auth_allow_cleartext,yes]].

## NFS

If you're using NFS or some other remote filesystem that's shared between
multiple computers, you should read [[link,nfs]].

## Running

See [[link,running_dovecot]] and [[link,logging]].
