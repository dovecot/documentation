---
layout: doc
title: mbox
dovecotlinks:
  mbox: mbox
  mbox_child_folders:
    hash: child-folders
    text: mbox child folders
  mbox_header_filter:
    hash: avoiding-crashes-and-errors
    text: mbox header filtering
  mbox_locking:
    hash: locking
    text: mbox locking
---

# Mbox Mailbox Format

::: danger
Mbox format is deprecated and should not be used in production setups at all.

Mbox is no longer being maintained for write fixes, for any new or advanced
features, nor for optimization improvements.

It still exists solely to read old mail storages, and for backwards utility
purposes (specifically for archival purposes, as mbox allows multiple
messages to be natively stored in a single file).

In a production system, a more modern mailbox format should be used, e.g.,
[[link,dbox]] (or [[link,maildir]]).
:::

Usually UNIX systems are configured by default to deliver mails to
`/var/mail/username` or `/var/spool/mail/username` mboxes. In the IMAP
world, these files are called INBOX mailboxes. IMAP protocol supports multiple
mailboxes , so there needs to be a place for them as well. Typically they're
stored in `~/mail/` or `~/Mail/` directories.

The mbox file contains all the messages of a single mailbox. Because of this,
the mbox format is typically thought of as a slow format. However with
Dovecot's indexing this isn't true. Only expunging messages from the
beginning of a large mbox file is slow with Dovecot, most other operations
should be fast. Also because all the mails are in a single file, searching
is much faster (if FTS is not used) than with Maildir.

Modifications to mbox may require moving data around within the file, so
interruptions (eg. power failures) can cause the mbox to break more or less
badly. Although Dovecot tries to minimize the damage by moving the data in a
way that data should never get lost (only duplicated), mboxes still aren't
recommended to be used for important data.

## History

The history of mbox format, and a discussion of its historical use and
generally agreed-upon conventions, can be found in [[rfc,4155]].

Additionally, see the
[mbox Wikipedia page](https://en.wikipedia.org/wiki/Mbox).

## Locking

Locking is a mess with mboxes. There are multiple different ways to lock a
mbox, and software often uses incompatible locking.

The only standard way to lock an mbox is using a method called "dotlock".
This means that a file named `<mailbox-name>.lock` is created in the same
directory as the mailbox being locked. This works pretty well when the mbox
is locked for writing, but for reading it's very inefficient. That's why
other locking methods have been used.

It's important that all software that's reading or writing to mboxes use
the same locking settings. If they use different methods, they might
read/write to an mbox while another process is modifying it, and see
corrupted mails. If they use the same methods but in a different order,
they can both end up in a deadlock.

### Locking Methods

There are at least four different ways to lock a mbox:

#### dotlock

`mailboxname.lock` file created by almost all software when
writing to mboxes. This grants the writer an exclusive lock over
the mbox, so it's usually not used while reading the mbox so that
other processes can also read it at the same time. So while using
a dotlock typically prevents actual mailbox corruption, it doesn't
protect against read errors if mailbox is modified while a process
is reading.

Another problem with dotlocks is that if the mailboxes exist in
`/var/mail/`, the user may not have write access to the directory, so the
dotlock file can't be created. There are a couple of ways to work around this:

* Give a mail group write access to the directory and then make sure that all
  software requiring access to the directory runs with the group's privileges.
  This may mean making the binary itself setgid-mail, or using a separate
  dotlock helper program which is setgid-mail. With Dovecot this can be done
  by setting [[setting,mail_privileged_group,mail]].

* Set sticky bit to the directory (`chmod +t /var/mail`). This makes it
  somewhat safe to use, because users can't delete each others mailboxes, but
  they can still create new files (the dotlock files). The downside to this is
  that users can create whatever files they wish in there, such as a mbox for
  newly created user who hadn't yet received mail.

#### flock

`flock()` system call is quite commonly used for both read and
write locking. The read lock allows multiple processes to obtain a
read lock for the mbox, so it works well for reading as well. The
downside is that it doesn't work if mailboxes are stored in NFS.

#### fcntl

Very similar to flock, also commonly used by software. In some
systems this `fcntl()` system call is compatible with
`flock()`, but in other systems it's not, so you shouldn't rely
on it. fcntl works with NFS if you're using lockd daemon in both
NFS server and client.

#### lockf

POSIX `lockf()` locking. Because it allows creating only
exclusive locks, it's somewhat useless so Dovecot doesn't support
it. With Linux `lockf()` is internally compatible with
`fcntl()` locks, but again you shouldn't rely on this.

### Deadlocks

If multiple lock methods are used, which is usually the case since dotlocks
aren't typically used for read locking, the order in which the locking is done
is important. Consider if two programs were running at the same time, both use
dotlock and fcntl locking but in different order:

* Program A: fcntl locks the mbox
* Program B at the same time: dotlocks the mbox
* Program A continues: tries to dotlock the mbox, but since it's already
  dotlocked by B, it starts waiting
* Program B continues: tries to fcntl lock the mbox, but since it's already
  fcntl locked by A, it starts waiting

Now both of them are waiting for each others locks. Finally after a couple of
minutes they time out and fail the operation.

### Lock Configuration

For Dovecot you can configure locking using the [[setting,mbox_read_locks]]
and [[setting,mbox_write_locks]] settings. The defaults are:

```
mbox_read_locks = fcntl
mbox_write_locks = dotlock fcntl
```

Here's a list of how to find out the locking settings for other software:

#### Procmail

```sh
procmail -v 2>&1|grep Locking
```
```
Locking strategies:     dotlocking, fcntl()
```

#### Postfix

Postfix has two different ways to deliver to mboxes. One is the "mailbox"
transport and another one is the "virtual" transport.

```
# postconf mailbox_delivery_lock
mailbox_delivery_lock = fcntl, dotlock
# postconf virtual_mailbox_lock 
virtual_mailbox_lock = fcntl 
```

In the above case, if you used the mailbox transport, you'd have to change
Dovecot's configuration to [[setting,mbox_write_locks,fcntl]] dotlock or
vice versa for Postfix.

If you used the virtual transport, it doesn't really matter if the dotlock
is missing, since the fcntl is common with Dovecot and Postfix.

#### mutt

```sh
mutt -v|grep -i lock
```

#### Debian

Debian's policy specifies that all software should use "fcntl and then
dotlock" locking, but this probably applies only to most commonly used
software.

## Directory Structure

By default, when listing mailboxes, Dovecot simply assumes that all files it
sees are mboxes and all directories mean that they contain sub-mailboxes.
There are two special cases however which aren't listed:

* `.subscriptions` file contains IMAP's mailbox subscriptions.
* `.imap/` directory contains Dovecot's index files.

Because it's not possible to have a file which is also a directory, it's not
normally possible to create a mailbox and child mailboxes under it.

However if you really want to be able to have mailboxes containing both
messages and child mailboxes under mbox, then Dovecot can be configured to do
this, subject to certain provisos; see [child folders](#child-folders).

## Dovecot's Metadata

Dovecot uses c-Client (ie. UW-IMAP, Pine) compatible headers in mbox messages
to store metadata. These headers are:

| Header | Description |
| ------ | ----------- |
| `X-IMAPbase` | Contains UIDVALIDITY, last used UID, and list of used keywords |
| `X-IMAP` | Same as X-IMAPbase but also specifies that the message is a "pseudo-message" |
| `X-UID` | Message's allocated UID |
| `Status` | **R** (\Seen) and **O** (non-\Recent) flags |
| `X-Status` | **A** (\Answered), **F** (\Flagged), **T** (\Draft), and **D** (\Deleted) flags |
| `X-Keywords` | Message's keywords |
| `Content-Length` | Length of the message body in bytes |

Whenever any of these headers exist, Dovecot treats them as its own private
metadata. It does sanity checks for them, so the headers may also be modified
or removed completely. None of these headers are sent to IMAP/POP3 clients
when they read the mail.

::: warning
**The [[link,mta]], [[link,mda]], or [[link,lda]] should strip all these
headers case-insensitively before writing the mail to the mbox.**
:::

Only the first message contains the X-IMAP or X-IMAPbase header. The
difference is that when all the messages are deleted from mbox file, a pseudo
message is written to the mbox which contains X-IMAP header.

This is the "DON'T DELETE THIS MESSAGE -- FOLDER INTERNAL DATA" message
which you hate seeing when using non-C-client and non-Dovecot software. This
is however important to prevent abuse, otherwise the first mail which is
received could contain faked X-IMAPbase header which could cause trouble.

If message contains X-Keywords header, it contains a space-separated list of
keywords for the mail. Since the same header can come from the mail's sender,
only the keywords are listed in X-IMAP header are used.

The UID for a new message is calculated from last used UID in X-IMAP header +
1. This is done always, so fake X-UID headers don't really matter. This is
also why the pseudo-message is important. Otherwise the UIDs could easily
grow over 231 which some clients start treating as negative numbers, which
then cause all kinds of problems. Also when 232 is exceeded, Dovecot will also
start having some problems.

Content-Length is used as long as another valid mail starts after that many
bytes. Because the byte count must be exact, it's quite unlikely that
abusing it can cause messages to be skipped (or rather appended to the
previous message's body).

Status and X-Status headers are trusted completely, so it's pretty good idea
to filter them in LDA if possible.

## Dovecot's Speed Optimizations

Updating messages' flags and keywords can be a slow operation since you may
have to insert a new header (Status, X-Status, X-Keywords) or at least insert
data in the header's value. Some mbox MUAs do this simply by rewriting all of
the mbox after the inserted data. If the mbox is large, this can be very slow.
Dovecot optimizes this by always leaving some space characters after some of
its internal headers. It can use this space to move only minimal amount of
data necessary to get the necessary data inserted. Also if data is removed, it
just grows these spaces areas.

There are several configuration options that can be used that will affect
optimization:

* [[setting,mbox_dirty_syncs]]
* [[setting,mbox_lazy_writes]]
* [[setting,mbox_very_dirty_syncs]]

## From Escaping

In mboxes a new mail always begins with a "From " line, commonly referred to
as `From_`-line. To avoid confusion, lines beginning with "From " in message
bodies are usually prefixed with '>' character while the message is being
written to in mbox.

Dovecot doesn't currently do this escaping however. Instead it prevents this
confusion by adding Content-Length headers so it knows later where the next
message begins. Dovecot also doesn't remove the '>' characters before
sending the data to clients.

## Mbox Variants

There are a few minor variants of this format:

### mboxo

An original mbox format originated with Unix System V. Messages are
stored in a single file, with each message beginning with a line
containing "From SENDER DATE". If "From " (case-sensitive, with
the space) occurs at the beginning of a line anywhere in the
email, it is escaped with a greater-than sign (to ">From ").
Lines already quoted as such, for example ">From " or ">>>From "
are not quoted again, which leads to irrecoverable corruption of
the message content.

### mboxrd

Named for Raul Dhesi in June 1995, though several people came up
with the same idea around the same time. An issue with the mboxo
format was that if the text ">From " appeared in the body of an
email (such as from a reply quote), it was not possible to
distinguish this from the mailbox format's quoted ">From ".
mboxrd fixes this by always quoting already quoted "From " lines
(e.g. ">From ", ">>From ", ">>>From ", etc.) as well, so readers
can just remove the first ">" character. This format is used by
qmail and getmail (>=4.35.0).

### mboxcl

Originated with Unix System V Release 4 mail tools. It adds a
Content-Length field which indicates the number of bytes in the
message. This is used to determine message boundaries. It still
quotes "From " as the original mboxo format does (and not as
mboxrd does it).

### mboxcl2

Like mboxcl but does away with the "From " quoting. Dovecot uses
this format internally.

### MMDF

(Multi-channel Memorandum Distribution Facility mailbox format)
originated with the MMDF daemon. The format surrounds each
message with lines containing four control-A's. This eliminates
the need to escape From: lines.

## How a message is read stored in mbox extension

* An email client reader scans throughout mbox file looking for `From_`
  lines.
* Any `From_` line marks the beginning of a message.
* Once the reader finds a message, it extracts a (possibly corrupted) envelope
  sender and delivery date out of the `From_` line.
* It then reads until the next `From_` line or scans till the end of file,
  whenever `From_` comes first.
* It removes the last blank line and deletes the quoting of `>From_` lines
  and `>>From_` lines and so on.

## Known Problems

### External modifications

In general Dovecot doesn't mind if you modify the mbox file externally.
It's fine if external software expunges messages or appends new ones.
However moving around existing messages, inserting messages in the
middle of the file or modifying existing messages isn't allowed.

Especially modifying existing messages (eg. removing attachments) may
cause all kinds of problems. If you do that, at the minimum go and
delete `dovecot.index.cache` file from the mailbox, otherwise weird
things may happen. However IMAP protocol guarantees that messages don't
change at all, and deleting Dovecot's cache file doesn't clear clients'
local caches, so it still may not work right.

If you insert messages, or if you "undelete" messages (eg. replace mbox
from a backup), you may see errors in Dovecot's logs:

```
mbox sync: UID inserted in the middle of mailbox /home/tss/mail/inbox (817 > 787, seq=18, idx_msgs=32)
```

This is normal. Dovecot just assigned new UIDs for the messages. See
below for other reasons why UID insertions could happen.

### Debugging UID insertions

The above error message can be read as: "18th message in the mbox file
contained X-UID: 787 header, however the index file at that position
told the message was supposed to have UID 817. There are 32 messages
currently in the index file."

There are four possibilities why the error message could happen:

1. Message with a X-UID: 787 header really was inserted in the mbox
   file. For example you replaced mbox from a backup.

2. Something changed the X-UID headers. Very unlikely.

3. The message was expunged from the index file, but for some reason it
   wasn't expunged from the mbox file. The index file is updated only
   after a successful mbox file modification, so this shouldn't really
   happen either.

4. If this problem happens constantly, it could mean that you're sharing
   the same index file for multiple different mboxes!

   - This could happen if you let Dovecot do mailbox autodetection and
     it sometimes uses `/var/mail/%u` (when it exists) and other
     times `~/mail/inbox`. Use an explicit [[setting,mail_location]]
     setting to make sure the same INBOX is used.

   - Another possibility is that you're sharing index files between
     multiple users. Each user must have their own home directory.

It's possible that broken X-UID headers in mails and
[[setting,mbox_lazy_writes,yes]] combination has some bugs.
If you're able to reproduce such an error, please let us know how.

### UIDVALIDITY changes

UIDVALIDITY is stored in X-IMAPbase: or X-IMAP: header of the first
message in mbox file. This is done by both Dovecot and UW-IMAP (and
Pine). It's also stored in `dovecot.index` file. It shouldn't normally
change, because if it does it means that client has to download all the
messages for the mailbox again.

If the UIDVALIDITY in mbox file doesn't match the one in
`dovecot.index` file, Dovecot logs an error:

```
UIDVALIDITY changed (1100532544 -> 1178155834) in mbox file /home/user/mail/mailbox
```

This can happen when the following happens:

1. Dovecot accesses the mailbox saving the current UIDVALIDITY to
   `dovecot.index` file.

2. The UIDVALIDITY gets lost from the mbox file

   - X-IMAP: or X-IMAPbase: header gets lost because something else
     than Dovecot or UW-IMAP deletes the first message

   - The whole file gets truncated

   - Something else than Dovecot deletes or renames the mbox

3. The mailbox is accessed (or created if necessary) by UW-IMAP or Pine.
   It notices that the mailbox is missing UIDVALIDITY, so it assigns a
   new UIDVALIDITY and writes the X-IMAPbase: or X-IMAP: header.

   - Also Dovecot that's configured to not use index files behaves the same.

4. Dovecot accesses again the mailbox. UIDVALIDITY in the mbox file's
   header doesn't match the one in `dovecot.index` file. It logs an
   error and updates the UIDVALIDITY in the index file to the new one.

### Crashes

Dovecot's mbox code is a bit fragile because of the way it works.
However instead of just corrupting the mbox file, it usually
assert-crashes whenever it notices an inconsistency. You may see crashes
such as:

```
Panic: mbox /home/user/mail/mailbox: seq=2 uid=45 uid_broken=0 originally needed 12 bytes, now needs 27 bytes
```

This is a bit difficult problem to fix. Usually this crash has been
related to Dovecot rewriting some headers that were broken. If you see
these crashes, it would really help if you were able to reproduce the
crash.

If you have such a mailbox which crashes every time when it's tried to
be opened, please put the mbox through
[mbox anonymizer](https://github.com/dovecot/tools/blob/main/mbox-anonymize.pl)
and send it, the mailbox's `dovecot.index` and `dovecot.index.log` files to
dovecot@dovecot.org.

None of those files contain any actual message contents so it's safe to
send them.

### Avoiding Crashes and Errors

Since the problems usually have been related to broken headers, you
should be able to avoid them by filtering out all the Dovecot's internal
metadata headers. This is a good idea to do in any case.

If you use [[link,lda]] it does this filtering automatically. Otherwise you
could do this in your SMTP server. The headers that you should filter out are:

- Content-Length
- Status
- X-IMAP
- X-IMAPbase
- X-Keywords
- X-Status
- X-UID
- X-UIDL (if you're using [[setting,pop3_reuse_xuidl,yes]])

## Configuration

### Settings

<SettingsComponent tag="mbox" level="3" />

### Mail Location Configuration

In many systems, the user's mails are by default stored in
`/var/mail/username` file. This file is called INBOX in IMAP world. Since
IMAP supports multiple mailboxes, you'll need to have a directory for them as
well. Usually `~/mail` is a good choice for this.

For an installation such as this, the mail location is specified with:

```
# %u is replaced with the username that logs in
mail_location = mbox:~/mail:INBOX=/var/mail/%u
```

It's in no way a requirement to have the INBOX in `/var/mail/` directory. In
fact, this often just brings problems because Dovecot might not be able to
write dotlock files to the directory (see below). You can avoid this
completely by just keeping everything in `~/mail/`:

```
# INBOX exists in ~/mail/inbox
mail_location = mbox:~/mail
```

#### Default `mail_location` Keys

For mbox, the default keys are:

| Key | Default Value |
| --- | ------------- |
| `FULLDIRNAME` | `<empty>` (For mbox, this setting specifies the mailbox message file name) |

### Index Files

By default, index files are stored under an `.imap/` directory.

See the [[link,mail_location]] for an explanation of how to
change the index path. Example:

```
mail_location = mbox:~/mail:INBOX=/var/mail/%u:INDEX=/var/indexes/%u
```

### Locking

Make sure that all software accessing the mboxes are using the same locking
methods in the same order. The order is important to prevent deadlocking.

From Dovecot's side you can change these from [[setting,mbox_read_locks]]
and [[setting,mbox_write_locks]] settings.

#### /var/mail/ Dotlocks

Often mbox write locks include dotlock, which means that Dovecot needs to
create a new `<mbox>.lock` file to the directory where the mbox file exists.
If your INBOXes are in `/var/mail/` directory, you may have to give Dovecot
write access to the directory. There are two ways the `/var/mail/`
directory's permissions have traditionally been set up:

* World-writable with sticky bit set, allowing anyone to create new files
  but not overwrite or delete existing files owned by someone else (i.e.
  same as `/tmp`). You can do this with `chmod a+rwxt /var/mail`.
* Directory owned by a mail group and the directory set to group-writable
  (mode=0770, group=mail)

You can give Dovecot access to mail group by setting:

```
mail_privileged_group = mail
```

NOTE: With [[link,lda]] the [[setting,mail_privileged_group]] setting
unfortunately doesn't work, so you'll have to use the sticky bit, disable
dotlocking completely, or use LMTP server instead.

### /var/mail/\* Permissions

In some systems the `/var/mail/$USER` files have 0660 mode permissions.
This causes Dovecot to try to preserve the file's group, and if it doesn't
have permissions to do so, it'll fail with an error like:

```
imap(user): Error: chown(/home/user/mail/.imap/INBOX, -1, 12(mail)) failed: Operation not permitted (egid=1000(user), group based on /var/mail/user)
```

There is rarely any real need for the files to have 0660 mode, so the best
solution for this problem is to just change the mode to 0600:

```sh
chmod 0600 /var/mail/*
```

### Only /var/mail/ mboxes

With POP3 it's been traditional that users have their mails only in the
`/var/mail/` directory. IMAP however supports having multiple mailboxes, so
each user has to have a private directory where the mailboxes are stored.
Dovecot also needs a directory for its index files unless you disable them
completely.

If you **really** want to use Dovecot as a plain POP3 server without index
files, you can work around not having a per-user directory:

* Set users' home directory in userdb to some empty non-writable directory,
  for example `/var/empty`
* Modify [[setting,mail_location]] so that the mail root directory is also
  the empty directory and append `:INDEX=MEMORY` to it. For example:
  `mail_location = mbox:/var/empty:INBOX=/var/mail/%u:INDEX=MEMORY`
* Note that if you have IMAP users, they'll see `/var/empty` as the
  directory containing other mailboxes than INBOX. If the directory is
  writable, all the users will have their mailboxes shared.

### Directory Layout

By default Dovecot uses filesystem layout under mbox. This means that mail is
stored in mbox files under hierarchical directories, for example:

| File | Description |
| `~/mail/inbox` | mbox file containing mail for INBOX |
| `~/mail/foo` | mbox file containing mail for mailbox "foo" |
| `~/mail/bar/baz` | mbox file containing mail for mailbox "bar/baz" |

One upshot of this is that it is not normally possible to have mailboxes
which are subfolders of mailboxes containing messages.

As an alternative, it is possible to configure Dovecot to store all mailboxes
in a single directory with hierarchical levels separated by a dot. This can
be configured by adding `:LAYOUT=maildir++` to the mail location. There
are, however, some further considerations when doing this; see
[child folders](#child-folders) for some examples.

### Control Files

Under mbox format, Dovecot maintains the subscribed mailboxes list in a file
`.subscriptions` which by default is stored in the mail location root. So
in the example configuration this would be at `~/mail/.subscriptions`.

If you want to put this somewhere else, you can change the directory in which
the `.subscriptions` file is kept by using the `CONTROL` parameter. For
example:

```
mail_location = mbox:~/mail:CONTROL=~/mail-control
```

would store the subscribed mailboxes list at `~/mail-control/.subscriptions`.

One practical application of the `CONTROL` parameter is described at
[child folders](#child-folders).

### Message Filename

By default, Dovecot stores messages for INBOX in an mbox file called "inbox",
and messages for all other mailboxes in an mbox file whose relative path is
equivalent to the name of the mailbox. Under this scheme, it is not possible
to have mailboxes which contain both messages and child mailboxes.

However, the behaviour (for mailboxes other than INBOX) can be changed using
the `DIRNAME` parameter. If the `DIRNAME` parameter is specified with a
particular value, then Dovecot will store messages in a file with a name of
that value, in a directory with a name equivalent to the mailbox name.

There are, however, some further considerations when doing this; see
[child folders](#child-folders) for an example.

### Child Folders

Under mbox, it is not normally possible to have a
mail folder which contains both messages and sub-folders. This is because
there would be a filesystem name collision between the name of the mbox file
containing the messages and the name of the directory containing the
sub-folders. For example:

* Mail folder "foo" containing messages would be stored in a file at
  `~/mail/foo`.
* Mail folder "foo/bar" containing messages would be stored in a file at
  `~/mail/foo/bar`, but this cannot happen because this relies on the
  existence of a directory `~/mail/foo/` which can't exist because there is
  already a file with that name.

Under mbox, Dovecot normally stores mail folders in "filesystem" layout. In
this layout, mail folders are stored in mbox files (potentially under
subdirectories) with the same relative path as the mail folder path. For
example:

| File | Description |
| ---- | ----------- |
| `~/mail/foo` | mbox file containing mail for mail folder "foo"; cannot create any mail sub-folders of "foo" |
| `~/mail/bar/baz` | mbox file containing mail for mail folder "bar/baz"; cannot create any mail sub-folders of "bar/baz" |
| `~/mail/inbox` | mbox file containing mail for INBOX |

If there is a requirement to be able to have a mail folder which contains both
messages and sub-folders, then there are two ways to do it:

1. Maildir++ layout
2. Messages in named file

These approaches are described in more detail below.

#### Maildir++ Layout

Dovecot can be configured to keep mbox mail in a Maildir++-like
layout. This makes Dovecot keep mail in mbox files where all the mailbox
folder naming levels are separated with dots (with a leading dot). For
example:

| File | Description |
| ---- | ----------- |
| `~/mail/.foo` | mbox file containing mail for mail folder "foo" |
| `~/mail/.foo.bar`| mbox file containing mail for mail folder "foo/bar". We can now do this. |
| `~/mail/.bar.baz`| mbox file containing mail for mail folder "bar/baz" |
| `~/mail/inbox` | mbox file containing mail for INBOX |

This can be enabled by adding `:LAYOUT=maildir++` to the mail location:

```
# Incomplete example. Do not use!
mail_location = mbox:~/mail:LAYOUT=maildir++
```

However, there is a problem. Under mbox, setting `LAYOUT=maildir++` alone
leaves Dovecot unable to place index files, which would likely result in
performance issues. So when using `LAYOUT=maildir++` with mbox, it is
advisable to also configure `INDEX`. Now, mail files (other than INBOX) all
have names beginning with a dot, so if we like we can store other things in
the `~/mail` directory by using names which do not begin with a dot. So we
could think to use `INDEX` to store indexes at `~/mail/index/`. Example:

```
# Incomplete example. Do not use!
mail_location = mbox:~/mail:LAYOUT=maildir++:INDEX=~/mail/index
```

If we do this, then indexes will be kept at `~/mail/index/` and this will
not clash with any names used for mail folders. There is one more thing we
may want to consider though. By default Dovecot will maintain a list of
subscribed folders in a file `.subscriptions` under the mail location root.
In this case that means it would end up at `~/mail/.subscriptions`. This
would then mean that it would be impossible to create a mail folder called
"subscriptions". We can get around this by using the `CONTROL` parameter to
move the `.subscriptions` file somewhere else, for example into the
directory `~/mail/control` (again, choosing a name which doesn't begin with
a dot so we don't collide with the names of mbox files storing mail folders).
That gives us:

```
# Trick mbox configuration which allows a mail folder which contains both
# messages and sub-folders
mail_location = mbox:~/mail:LAYOUT=maildir++:INDEX=~/mail/index:CONTROL=~/mail/control
```

This then allows mail folders which contains both messages and sub-folders
without possibility of naming collisions between mail folders and other data.

There is one further wrinkle. Specifying `:LAYOUT=maildir++` for mbox
changes the default hierarchy separator from a slash to a dot. This should
not be a problem for IMAP clients as the hierarchy separator is exposed
through IMAP. However anything which expects to just "know" that the
hierarchy separator is a slash may get confused. This can be worked around by
configuring [[link,namespaces]] to set the folder separator back to a slash.

#### Messages in Named File

In the default "filesystem" example from above, we can't create any
sub-folders of "foo" because there is a file - `foo` - in the way. So we
could think to get rid of that file and put a directory there instead. But if
we do that then we need somewhere to put the messages for folder "foo". We
could think to put them in a specially-named file in the directory: `foo/`.
Then if we wanted to create a sub-folder of "foo" we would be fine because we
could then do that. The rule would then be that messages go into the
specially-named file in the directory corresponding to the mail folder name.
We want to choose a special name which would be unlikely to collide with
a folder name. We could think to use something like `mBoX-MeSsAgEs`. Now,
it turns out that you can configure Dovecot to do this using the `DIRNAME`
parameter:

```
# Incomplete example. Do not use!
mail_location = mbox:~/mail:DIRNAME=mBoX-MeSsAgEs
```

With that config, we would get a layout like this:

| File | Description |
| ---- | ----------- |
| `~/mail/inbox` | mbox file containing mail for INBOX |
| `~/mail/foo/mBoX-MeSsAgEs` | mbox file containing mail for mail folder "foo" |
| `~/mail/foo/bar/mBoX-MeSsAgEs` | mbox file containing mail for mail folder "foo/bar" |

However there is a problem. Under mbox, setting `DIRNAME` alone leaves
Dovecot unable to place index files, which would likely result in performance
issues, or worse, if the index directory gets created first, this will
obstruct the creation of the mbox file. So when using `DIRNAME` with mbox,
it is also necessary to configure `INDEX`. The question then arises where
to put index files.

Any directory under the `~/mail` directory could be considered as a mail
folder. We could think to use a name beginning with a dot, for example
`~/mail/.index` but that would then mean that it would not be possible to
create a mail folder called ".index"; unlikely, but it would be nice to have
as few implementation-specific restrictions as possible.

In addition, by default, Dovecot will create a file `.subscriptions` at the
mail location root to hold a list of mailbox subscriptions. This would make it
impossible to create a mail folder called ".subscriptions". But we can move
the `.subscriptions` file to another directory by using the `CONTROL`
parameter. To get around these issues, we can add another directory layer
which separates these purposes. For example:

```
# Trick mbox configuration which allows a mail folder which contains both
# messages and sub-folders
mail_location = mbox:~/mail/mailboxes:DIRNAME=mBoX-MeSsAgEs:INDEX=~/mail/index:CONTROL=~/mail/control
```

would result in the following layout:

| File | Description |
| ---- | ----------- |
| `~/mail/mailboxes/foo/mBoX-MeSsAgEs` | mbox file containing messages for mail folder "foo" |
| `~/mail/mailboxes/foo/bar/mBoX-MeSsAgEs` | mbox file containing messages for mail folder "foo/bar" |
| `~/mail/mailboxes/inbox` | mbox file containing messages for INBOX |
| `~/mail/control/.subscriptions` | File containing list of subscribed mailboxes |
| `~/mail/index/INBOX/dovecot.index.*` | Index files for INBOX |
| `~/mail/index/foo/dovecot.index.*` | Index files for mail folder "foo" |
| `~/mail/index/foo/bar/dovecot.index.*` | Index files for mail folder "foo/bar" |
| `~/mail/index/dovecot.mailbox.log` | Other index files |

Restrictions on mail folder names are then minimised; we can't have mail
folders with the names "mBoX-MeSsAgEs", "dovecot.index.*, or
"dovecot.mailbox.log".

Unlike the Maildir++ layout approach above, because we are still using
"filesystem" layout, the hierarchy separator remains as a slash.
