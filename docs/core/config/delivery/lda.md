---
layout: doc
title: LDA
dovecotlinks:
  lda: LDA
---

# Dovecot LDA

The Dovecot LDA is a [[link,mda]], which takes mail from an [[link,mta]]
and delivers it to a user's mailbox, while keeping Dovecot index files up to
date.

::: tip
These days most people should use [[link,lmtp]] as the MDA instead,
as it's somewhat easier to configure (especially related to
permissions) and gives better performance.
:::

This page describes the common settings required to make LDA work.

## Main features of Dovecot LDA

- [Mailbox indexing during mail delivery](#lda-indexing), providing
  faster mailbox access later

- Quota enforcing by a plugin ([[plugin,quota]])

- Sieve language support [[link,sieve]]

  - Mail filtering
  - Mail forwarding
  - Vacation auto-reply

<!-- @include: include/delivery_common.inc -->

## Parameters

See [[man,dovecot-lda]].

## System Users

You can use LDA with a few selected system users (i.e. user is found from
`/etc/passwd` / NSS) by calling dovecot-lda in the user's `~/.forward` file:

```
| "/usr/local/libexec/dovecot/dovecot-lda"
```

This should work with any MTA which supports per-user `.forward`
files.

This method doesn't require the authentication socket explained below
since it's executed as the user itself.

## Virtual Users

### With a Lookup

Give the destination username to dovecot-lda with `-d` parameter, for
example:

```sh
dovecot-lda -f $FROM_ENVELOPE -d $DEST_USERNAME
```

You'll need to set up a auth-userdb socket for dovecot-lda so it knows
where to find mailboxes for the users:

```[dovecot.conf]
service auth {
  unix_listener auth-userdb {
    mode = 0600
    user = vmail # User running dovecot-lda
    #group = vmail # Or alternatively mode 0660 + dovecot-lda user in this group
  }
}
```

The auth-userdb socket can be used to do [[link,userdb]] lookups for
given usernames or get a list of all users. Typically the result will
contain the user's UID, GID and home directory, but depending on your
configuration it may return other information as well. So the
information is similar to what can be found from eg. `/etc/passwd` for
system users. This means that it's probably not a problem to use
mode=0666 for the socket, but you should try to restrict it more just to
be safe.

### Without a Lookup

If you have already looked up the user's home directory and you don't
need a userdb lookup for any other reason either (such as overriding
settings for specific users), you can run dovecot-lda similar to how
it's run for system users:

```sh
HOME=/path/to/user/homedir dovecot-lda -f $FROM_ENVELOPE
```

This way you don't need to have a userdb listener socket. Note that you
should verify the user's existence prior to running dovecot-lda,
otherwise you'll end up having mail delivered to nonexistent users as
well.

You must have set the proper UID (and GID) before running dovecot-lda.
It's not possible to run dovecot-lda as root without `-d` parameter.

### Multiple UIDs

If you're using more than one UID for users, you're going to have
problems running dovecot-lda, as most MTAs won't let you run dovecot-lda
as root. The only recommended solution is to use [[link,lmtp]]. It is not
recommended to make `dovecot-lda` binary setuid-root, nor to run it via
`sudo`, as these cannot be used safely.

## Problems with dovecot-lda

- If you are using [[link,auth_prefetch]], keep in mind that
  `dovecot-lda` does not make a password query and thus will not work
  if `-d` parameter is used.

  The [[link,auth_prefetch]] page explains how to fix this.

## Logging

- Normally Dovecot logs everything through its log process, which is
  running as root. dovecot-lda doesn't, which means that you might need
  some special configuration for it to log anything at all.

- If dovecot-lda fails to write to log files it exits with temporary
  failure.

- If you have trouble finding where Dovecot logs by default, see
  [[link,logging]].

- Note that Postfix's `mailbox_size_limit` setting applies to all
  files that are written to. So if you have a limit of 50 MB,
  dovecot-lda can't write to log files larger than 50 MB and you'll
  start getting temporary failures.

If you want dovecot-lda to keep using Dovecot's the default log files:

- If you're logging to syslog, make sure the syslog socket (usually
  `/dev/log`) has enough write permissions for dovecot-lda. For
  example set it world-read/writable: `chmod a+rw /dev/log`.

- If you're logging to Dovecot's default log files again you'll need to
  give enough write permissions to the log files for dovecot-lda.

You can also specify different log files for dovecot-lda. This way you
don't have to give any extra write permissions to other log files or the
syslog socket. You can do this by overriding the [[setting,log_path]]
and [[setting,info_log_path]] settings:

```[dovecot.conf]
protocol lda {
  ...
  # remember to give proper permissions for these files as well
  log_path = /var/log/dovecot-lda-errors.log
  info_log_path = /var/log/dovecot-lda.log
}
```

For using syslog with dovecot-lda, set the paths empty:

```[dovecot.conf]
protocol lda {
  ...
  log_path =
  info_log_path =
  # You can also override the default syslog_facility:
  #syslog_facility = mail
}
```

## Plugins

- Most of the Dovecot plugins work with dovecot-lda.

- Virtual quota can be enforced using [[plugin,quota]]

- Sieve language support can be added with [[link,sieve]].

### Non-Dovecot LDA

Dovecot allows using non-Dovecot LDA to deliver mails to mbox and
Maildir files. Dovecot adds the newly delivered mails to its index files,
which is relatively fast operation. However, IMAP clients often want to first
fetch some of the email headers and other metadata. This requires Dovecot to
open and parse the emails, which may add user-visible latency. By using
Dovecot LDA this is done as part of the mail delivery stage, so the user
visible latency is smaller.
