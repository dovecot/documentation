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

::: tip See Also
[[man,dovecot-lda]]
:::

Parameters accepted by dovecot-lda binary:

### `-d <username>`

Destination username.

If given, the user information is looked up from dovecot-auth.

Typically used with virtual users, but not necessarily with system users.

### `-a <address>`

Original envelope recipient address (e.g. user+ext@domain), typically the
same as SMTP's RCPT TO: value.

If not specified, it's taken from header specified by
[[setting,lda_original_recipient_header]].

If the header doesn't exist either, defaults to same as username.

### `-r <address>`

Final envelope recipient address.

Defaults to `-a` address, but may differ if, e.g., aliases are used or
when dropping the +ext part.

### `-f <address>`

Envelope sender address. If not specified and message data begins with
a valid mbox-style "From " line, the address is taken from it.

### `-c <path>`

Alternative configuration file path.

### `-m <mailbox>`

Destination mailbox (default is INBOX).

If the mailbox doesn't exist, it will not be created (unless
[[setting,lda_mailbox_autocreate,yes]]).

If message couldn't be saved to the mailbox for any reason, it's delivered
to INBOX instead.

- If Sieve plugin is used, this mailbox is used as the "keep"
  action's mailbox. It's also used if there is no Sieve script or if
  the script fails for some reason.

- Deliveries to namespace prefix will result in saving the mail to
  INBOX instead. For example if you have "Mail/" namespace, this
  allows you to specify `dovecot-lda -m Mail/$mailbox` where mail
  is stored to Mail/$mailbox or to INBOX if $mailbox is empty.

- The mailbox name is specified the same as it's visible in IMAP
  client. For example if you've a Maildir with `.box.sub/`
  directory and your namespace configuration is `prefix=INBOX/`,
  `separator=/`, the correct way to deliver mail there is to use
  `-m INBOX/box/sub`

### `-e`

If mail gets rejected, write the rejection reason to stderr and exit with
EX_NOPERM.

The default is to send a rejection mail ourself.

### `-k`

Don't clear all environment at startup.

### `-p <path>`

Path to the mail to be delivered instead of reading
from stdin. If using maildir, the file is hard linked to the
if possible. This allows a single mail to be delivered to
multiple users using hard links, but currently it also prevents
dovecot-lda from updating cache file so it shouldn't be used unless
really necessary.

### `-o name=value`

Override a setting from `dovecot.conf`.

You can give this parameter multiple times.

## Return Values

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

This way you don't need to have a master listener socket. Note that you
should verify the user's existence prior to running dovecot-lda,
otherwise you'll end up having mail delivered to nonexistent users as
well.

You must have set the proper UID (and GID) before running dovecot-lda.
It's not possible to run dovecot-lda as root without `-d` parameter.

### Multiple UIDs

If you're using more than one UID for users, you're going to have
problems running dovecot-lda, as most MTAs won't let you run dovecot-lda
as root.

Best solution is to use [[link,lmtp]] instead, but if you can't
do that, there are two ways to work around this problem:

1. Make dovecot-lda setuid-root.
2. Use sudo to wrap the invocation of dovecot-lda.

#### Making dovecot-lda setuid-root

::: danger
**It's insecure to make dovecot-lda setuid-root**, especially if
you have untrusted users in your system. **Setuid-root dovecot-lda can
be used to gain root privileges**.
:::

You should take extra steps to make sure that untrusted users can't run it
and potentially gain root privileges. You can do this by making sure only
your MTA has execution access to it. For example:

```
# chgrp secmail /usr/local/libexec/dovecot/dovecot-lda
# chmod 04750 /usr/local/libexec/dovecot/dovecot-lda
# ls -l /usr/local/libexec/dovecot/dovecot-lda
-rwsr-x--- 1 root secmail 4023932 2010-06-15 16:23 dovecot-lda
```

Then start dovecot-lda as a user that belongs to secmail group. Note
that you have to recreate these rights after each update of Dovecot.

#### Using sudo

::: danger
Alternatively, you can use sudo to wrap the invocation of dovecot-lda.
This has the advantage that updates will not clobber the setuid bit, but
note that **it is just as insecure being able to run dovecot-lda via
sudo as setuid-root**. Make sure you only give your MTA the ability to
invoke dovecot-lda via sudo.
:::

First configure sudo to allow 'dovelda' user to invoke dovecot-lda by
adding the following to your `/etc/sudoers`:

```
Defaults:dovelda !syslog
dovelda          ALL=NOPASSWD:/usr/local/libexec/dovecot/dovecot-lda
```

Then configure your MTA to invoke dovecot-lda as user 'dovelda' and via
sudo:

```sh
/usr/bin/sudo /usr/local/libexec/dovecot/dovecot-lda
```

instead of just plain `/usr/local/libexec/dovecot/dovecot-lda`.

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

## LDA Indexing

LDA's indexing basically does two things while message is being saved:

1. It updates the main index file.

   - This improves performance with [[link,mbox]],
      especially if [[setting,mbox_very_dirty_syncs,no]].

   - With [[link,maildir]] the benefits of this are almost irrelevant.

2. It updates the `dovecot.index.cache` file.

### Cache file

The LDA also updates the cache file, which can be very useful with all
mailbox formats. It means that when an IMAP client wants to fetch the
message's metadata (e.g. some header fields), they're can be retrieved
from the cache file and Dovecot doesn't have to open and parse the
message file. There are some tradeoffs though:

- LDA indexing wastes disk I/O because it has to open and update index files

- LDA indexing saves disk I/O because it already has the message body
  in memory, so it doesn't need to read it from disk.

- IMAP indexing wastes disk I/O because it has to open and read message files

- IMAP indexing may save disk I/O because IMAP process always has index
  files opened, and many IMAP clients are configured to download all
  new message bodies anyway, so the second time message bodies are read
  they're already in memory

So it depends on IMAP client if it's faster to use LDA or IMAP time
indexing. In any case the user experience is typically faster with LDA
indexing, because the message list metadata can be returned faster when
it's pre-indexed.

### Non-indexed Mail Delivery

Ignoring the benefits of cache file updates, the only thing left is the
main index updates. As mentioned above, with Maildir format these
benefits are very small. This also means that it's perfectly fine to use
a non-Dovecot MDA to deliver mails that doesn't update indexes. Dovecot
can efficiently see and index such new mails without doing anything
expensive like "rebuilding indexes".
