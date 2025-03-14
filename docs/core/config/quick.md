---
layout: doc
title: Quick Configuration
order: 2
dovecotlinks:
  quick_config: Quick configuration
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
# Start new configs with the latest Dovecot version numbers here:
dovecot_config_version = 2.4.0
dovecot_storage_version = 2.4.0

# Enable wanted protocols:
protocols {
  imap = yes
  lmtp = yes
}

mail_home = /srv/mail/%{user}
mail_driver = sdbox
mail_path = ~/mail

mail_uid = vmail
mail_gid = vmail

# By default first_valid_uid is 500. If your vmail user's UID is smaller,
# you need to modify this:
#first_valid_uid = uid-number-of-vmail-user

namespace inbox {
  inbox = yes
  separator = /
}

# Authenticate as system users:
passdb pam {
}

ssl_server_cert_file = /etc/dovecot/ssl-cert.pem
ssl_server_key_file = /etc/dovecot/ssl-key.pem
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

If you compiled and installed Dovecot from sources, Dovecot has installed an example
configuration file in `/usr/local/etc/dovecot/dovecot.conf`

### Split Configuration Files

The default configuration starts from `dovecot.conf`, which contains an
`!include conf.d/*.conf` statement to read the rest of the configuration.
You can group settings into these included config files, or you can place
everything into the `dovecot.conf`, whichever you prefer.

Usually it does not matter in which file you write the setting. You only need
 to be aware that later settings replace earlier ones. If you use the same
section multiple times, the settings are merged together.

## Authentication

The above example configures Dovecot to use PAM for system user authentication.
See [[link,auth_pam]] for how to configure it.

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
echo "$USER:{PLAIN}password" > passwd
sudo mv passwd /etc/dovecot/

# If SELinux is enabled:
restorecon -v /etc/dovecot/users
```

You can (and should) replace the "password" with whatever password you
wish to use, but don't use any important password here as we'll be
logging in with insecure plaintext authentication until [[link,ssl]]
is configured.

Switch to passwd-file authentication by replacing `passdb pam` in
`dovecot.conf` with `passdb passwd-file`:

```
passdb passwd-file {
  passwd_file_path = /etc/dovecot/passwd
}
```

Verify with `doveconf -n passdb` that the output looks like
above (and there are no other passdbs and no userdbs).

If you're using something else, see [[link,passdb]] and [[link,userdb]].

## Mail Location

You can let Dovecot do its automatic mail location detection, but if that
doesn't work you can set the location manually. See
[[link,mail_location_mailbox_root_autodetection]].

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

Configure SSL certificate and private key paths with [[setting,ssl_server_cert_file]]
and [[setting,ssl_server_key_file]] settings.

An easy way to build a self-signed test certificate is using Dovecot's
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
