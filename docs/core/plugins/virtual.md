---
layout: doc
title: virtual
---

# Virtual Mailbox Plugin (`virtual`)

This plugin allows virtual mailboxes to be created.

Virtual mailboxes consist of Dovecot search criteria that are used to build
a listing of messages that don't exist in a physical mailbox.

## Settings

<SettingsComponent plugin="virtual" />

## Configuration

### Load Plugin

First, you'll have to load the plugin:

```[dovecot.conf]
mail_plugins = $mail_plugins virtual
```

### Namespace

Then, you'll have to create a [[link,namespaces,namespace]] for the virtual
mailboxes, for example:

```[dovecot.conf]
namespace {
  prefix = virtual/
  separator = /
  mail_driver = virtual
  mail_path = ~/Maildir/virtual
}
```

After this you can create virtual mailboxes under `~/Maildir/virtual`. By
default it uses the `fs` layout, so you can create directories such as:

* INBOX: `~/Maildir/virtual/INBOX/`
* Sub/mailbox: `~/Maildir/virtual/Sub/mailbox/`

If you prefer to use the Maildir++ layout instead, set
[[setting,mailbox_list_layout,maildir++]].

### Virtual Mailboxes

For each virtual directory you need to create a `dovecot-virtual` file. Its
syntax is like:

```
<1+ mailbox patterns>
  <search program>
[<more mailbox patterns>
  <search program for these mailboxes>
[etc..]]
```

Mailbox patterns can contain IMAP LIST-compatible [[rfc,3501,6.3.8]]
`*` and `%` wildcards. They are currently evaluated only when the virtual
mailbox is being selected, so if more mailboxes are created during that they
aren't noticed.

`*` wildcard matches only one namespace at a time based on the namespace
prefix. For example if you have namespaces with an empty prefix and a prefix
`mail/`:

* `*` matches only mailboxes from the namespace with empty prefix
* `mail*` matches mailboxes beginning with name `mail` from the namespace
  with empty prefix
* `mail/*` matches only mailboxes from the `mail/` namespace

Beware that `*` will not match any mailbox which already has a more
specialized match!

The mailbox names have special prefixes:

* `-`: Don't include this mailbox.
* `+`: Drop \Recent flags from the backend mailbox when opening it.
* `!`: Save new mails to this mailbox (see below).

If you need to actually include a mailbox name that contains such prefix, you
can currently just kludge it by using `+` prefix (if you don't care about the
\Recent flags) and adding the mailbox name after that (e.g. `+-box`).

Search program is compatible with IMAP SEARCH command
[[rfc,3501,6.4.4]]. Besides the standard SEARCH key you may want to
use X-MAILBOX key which matches the message's original mailbox.

::: tip
Leading whitespace is required in front of the search specifications.
:::

### Saving Mails to Virtual Mailboxes

It's possible to configure virtual mailbox so that it's possible to save/copy
messages there. This is done by specifying a single physical mailbox where the
message is really saved by prefixing it with `!`, e.g.:

```
!INBOX
work/*
  unseen
```
::: warning
Nothing guarantees that the saved mail will actually show up in
the virtual mailbox. If a message was saved with \Seen flag to the above
virtual mailbox, it wouldn't show up there. This also means it's problematic
to support IMAP UIDPLUS extension for virtual mailboxes, and currently
Dovecot doesn't even try (no [APPENDUID] or [COPYUID] is sent to client).
:::

The `!-prefixed` virtual mailbox is also selected from; you don't need to
list it again without an ! or you'll get two copies of your messages in the
virtual mailbox.

## IMAPSieve Filters

[[added,imapsieve_filters]]

When saving to a virtual mailbox is configured, imapsieve scripts act as if the
save was done directly to the physical destination mailbox. For example if
Virtual/All folder was configured with INBOX as the save destination, this
`sieve.before` script would be run both when saving to INBOX and when saving to
Virtual/All folder:

```[sieve.before]
imapsieve_mailbox_name = INBOX # Virtual/All would NOT work
imapsieve_mailbox_causes = COPY
imapsieve_mailbox_before = /etc/dovecot/sieve.before
```

Also, the `imap.mailbox` environment always contains INBOX, even when
saving via Virtual/All folder.

## Mailbox Selection Based on METADATA

Instead of a mailbox name, you can specify a metadata filter:

```
[-]/<metadata-entry-name>:<value-wildcard>
```

There can be multiple metadata entries. All the entries must match.

For example:

```
*
/private/vendor/vendor.dovecot/virtual:*
-/private/vendor/vendor.dovecot/virtual:ignore
  all
```

This matches all mailboxes, which contain a virtual METADATA entry that has any
value except `ignore`.

## Virtual POP3 INBOX

If you want POP3 INBOX to contain some or all mailboxes, you can do this in the
following way:

::: code-group
```[dovecot.conf]
# Namespace Configuration

# The default namespace that is visible to IMAP clients
namespace inbox {
  prefix =
  separator = /
  list = yes
}

# Virtual namespace for the virtual INBOX. Use a global directory for
# dovecot-virtual files.
namespace virtual {
  prefix = virtual/
  separator = /
  mail_driver = virtual
  mail_path = /etc/dovecot/virtual
  mail_index_path = ~/Maildir/virtual
  list = no
  hidden = yes
}

# Copy of the inbox namespace. We'll use this in dovecot-virtual file.
namespace real {
  prefix = RealMails/
  separator = /
  list = no
  hidden = yes
}
```

```[mysql.ext]
# Note: none of the namespaces have inbox=yes. This is because for IMAP users
# you want the inbox namespace to have 'inbox=yes', but for POP3 users you want
# the virtual namespace to have 'inbox=yes'. This requires setting the
# 'inbox=yes' in userdb extra fields. For example with MySQL you can do
# this like:

ser_query = SELECT ..., \
  CASE '%s' WHEN 'pop3' THEN NULL ELSE 'yes' END AS 'namespace/inbox/inbox', \
  CASE '%s' WHEN 'pop3' THEN 'yes' ELSE NULL END AS 'namespace/virtual/inbox' \
  WHERE ...
```

```[/etc/dovecot/virtual/INBOX/dovecot-virtual]
RealMails
RealMails/*
-RealMails/Trash
-RealMails/Trash/*
-RealMails/Spam
  all
```
:::

You'll have to use the `RealMails/` prefix if you want to use `*` wildcard,
otherwise it would match INBOX, which in turn would again lead to the virtual
INBOX and that would create a loop.

Also to avoid accidental POP3 UIDL changes, you shouldn't base the UIDLs on
IMAP UIDs. Instead use GUIDs (with Maildir the same as base filename):

```
pop3_uidl_format = %g
```

## Configuration Examples

List all messages with \Deleted flag in all mailboxes:

::: code-group
```[~/Maildir/virtual/Trash/dovecot-virtual]
*
  deleted
```
:::

List all unseen INBOX and work/\* messages:

::: code-group
```[~/Maildir/virtual/unseen/dovecot-virtual]
INBOX
work/*
  unseen
```
:::

Create a GMail-style conversation view for INBOX which shows all threads
that have messages in INBOX, but shows all messages in the thread regardless
of in what mailbox they physically exist in:

::: code-group
```[~/Maildir/virtual/all/dovecot-virtual]
*
  all
```

```[~/Maildir/virtual/INBOX/dovecot-virtual]
virtual/all
  inthread refs x-mailbox INBOX
```
:::

Create a mailbox containing messages from all mailboxes except Trash and its
children:

::: code-group
```[~/Maildir/virtual/all/dovecot-virtual]
*
-Trash
-Trash/*
  all
```
:::

Create a virtual Sentmail folder that includes Sent\*:

::: code-group
```[~/Maildir/virtual/Sentmail/dovecot-virtual]
Sent*
  all
```
:::

List messages from past 48 hours (syntax is in seconds):

::: code-group
```[~/Maildir/virtual/recent/dovecot-virtual]
INBOX
work/*
  all younger 172800
```
:::

List unseen messages from foo and flagged messages from all mailboxes
(including foo):

::: code-group
```[~/Maildir/virtual/example/dovecot-virtual]
foo
  or unseen flagged
*
  flagged
```
:::

