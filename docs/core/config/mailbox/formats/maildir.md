---
layout: doc
title: Maildir
dovecotlinks:
  maildir: Maildir
---

# Maildir Mailbox Format

The Maildir format debuted with the qmail server in the mid-1990s. Each
mailbox folder is a directory and each message a file. This improves
efficiency because individual emails can be modified, deleted and added
without affecting the mailbox or other emails, and makes it safer to use on
networked file systems such as NFS.

::: warning
The Maildir mailbox format is mainly viable for smaller installations.

It will be maintained on a best-effort basis for
[Dovecot Community Edition][dovecot-ce], without any
prioritization of new features or optimizations.
:::

## Dovecot Extensions

Since the [Maildir standard][maildir-standard] doesn't provide everything
needed to fully support the IMAP protocol, Dovecot had to create some of its
own non-standard extensions. The extensions still keep the Maildir standards
compliant, so MUAs not supporting the extensions can still safely use it as a
normal Maildir.

### IMAP UID mapping

IMAP requires each message to have a permanent unique ID number. Dovecot uses
the `dovecot-uidlist` file to keep UID <-> filename mapping. The file is
basically in the same format as Courier IMAP's `courierimapuiddb` file,
except for one difference (see below).

The file begins with a header:

```
3 V1275660208 N25022 G3085f01b7f11094c501100008c4a11c1
```

* 3 is the file format version number used by Dovecot v1.1+
* 1275660208 is the IMAP UIDVALIDITY
* 25022 is the UID that will be given to the next added message
* 3085f01b7f11094c501100008c4a11c1 is the 128 bit mailbox global UID in hex
* There may be other fields, and the order of these fields isn't important

Version 1 file format is compatible with Courier. Version 2 was used by a few
Dovecot non-release versions.

After the header comes the list of UID <-> filename mappings:

```
25006 :1276528487.M364837P9451.kurkku,S=1355,W=1394:2,
25017 W2481 :1276533073.M242911P3632.kurkku:2,F
```

* 25006, 25017 are message UIDs
* 2481 is the second message's virtual size. First message contains it in the
  filename itself, so it's not duplicated.
* There may be more fields before ':' character
* Rest of the line after ':' is the last known filename. This filename doesn't
  necessarily exist currently, because the filename changes every time
  a message's flags change. Dovecot doesn't waste disk I/O by rewriting
  uidlist file every time flags change, but whenever it is rewritten the
  latest filenames are used. This allows Dovecot to try to guess what the
  message's current filename is and if successful, avoid having to scan the
  directory's contents.

The `dovecot-uidlist` file doesn't need to be locked for reading. When
writing, `dovecot-uidlist.lock` file needs to be created. New lines can be
appended to the end of file, but existing data must never be directly
modified; it can only be replaced with `rename()` system call.

`dovecot-uidlist` is updated lazily to optimize for disk I/O. If a message
is expunged, it may not be removed from `dovecot-uidlist` until sometimes
later. This means that if you create a new file using the same file name as
what already exists in `dovecot-uidlist`, Dovecot thinks you "unexpunged"
message by restoring a message from backup. This causes a warning to be logged
and the file to be renamed.

Note that messages must not be modified once they've been delivered. IMAP (and
Dovecot) requires that messages are immutable. If you wish to modify them in
any way, create a new message instead and expunge the old one.

### IMAP Keywords

All the non-standard message flags are called keywords in IMAP. Some clients
use these automatically for marking spam (eg. `$Junk`, `$!NonJunk`,
`$Spam`, `$!NonSpam` keywords). Thunderbird uses labels which map to
keywords `$Label1`, `$Label2`, etc.

Dovecot stores keywords in the Maildir filename's flags field using letters
`a..z`. This means that only 26 keywords are possible to store in the
Maildir. If more are used, they're still stored in Dovecot's index files. The
mapping from single letters to keyword names is stored in `dovecot-keywords`
file. The file is in format:

```
0 $Junk
1 $NonJunk
```

0 means letter `a` in the Maildir filename, 1 means `b`, and so on. The
file doesn't need to be locked for reading, but when writing
`dovecot-uidlist` file must be locked. The file must not be directly
modified; it can only be replaced with `rename()` system call.

For example, a file named

```
1234567890.M20046P2137.mailserver,S=4542,W=4642:2,Sb
```

would be flagged as `$NonJunk` with the above keywords.

### Maildir Filename Extensions

The standard filename definition is: `<base filename>:2,<flags>`. Dovecot
has extended the `<flags>` field to be `<flags>[,<non-standard fields>]`.
This means that if Dovecot sees a comma in the `<flags>` field while
updating flags in the filename, it doesn't touch anything after the comma.
However other Maildir MUAs may mess them up, so it's still not such a good
idea to do that. Basic `<flags>` are described in the Maildir standard.
The `<non-standard fields>` isn't used by Dovecot for anything currently.

Dovecot supports reading a few fields from the `<base filename>`:

* `,S=<size>`: `<size>` contains the file size. Getting the size from the
  filename avoids doing a system `stat()` call, which may improve the
  performance. This is especially useful with [[link,quota_backend_maildir]].
* `,W=<vsize>`: `<vsize>` contains the file's RFC822.SIZE, i.e., the file
  size with linefeeds being CR+LF characters. If the message was stored with
  CR+LF linefeeds, `<size>` and `<vsize>` are the same. Setting this may
  give a small speedup because now Dovecot doesn't need to calculate the size
  itself.

A Maildir filename with those fields would look something like:

```
1035478339.27041_118.foo.org,S=1000,W=1030:2,S
```

### Usage of Timestamps

Timestamps of message files:

* `mtime` is used as IMAP INTERNALDATE [[rfc,3501,2.3.3]], and must
  never change (see [[rfc,3501,2.3.1.1]]).
* `ctime` is used as Dovecot's internal "save/copy date", unless the correct
  value is found from `dovecot.index.cache`. This is used only by external
  commands, e.g. [[doveadm,expunge,savedbefore]].
* `atime` is not used.

Timestamps of `cur` and `new` directories:

* `mtime` is used to detect changes of the mailbox and may force
  regeneration of index files
* `atime` and `ctime` not used.

### Filename Examples

For a filename `1491941793.M41850P8566V0000000000000015I0000000004F3030E_0.mx1.example.com,S=10956:2,STln`:

`1491941793`
:    UNIX timestamp of arrival.

`S=10956`
:    Size of the e-mail.

`STln`
:    * **S** = seen (marked as read)
     * **T** = trashed
     * **l** = IMAP tag #12 (0=a, 1=b, 2=c, etc.) as defined in that folder's
       `dovecot-keywords` file.
     * **n** = IMAP tag #14 (0=a, 1=b, 2=c, etc.) as defined in that folder's
       `dovecot-keywords` file.

## Issues with the Maildir Specification

### Locking

Although Maildir was designed to be lockless, Dovecot locks the Maildir while
doing modifications to it or while looking for new messages in it. This is
required because otherwise Dovecot might temporarily see mails incorrectly
deleted, which would cause trouble. Basically the problem is that if one
process modifies the Maildir (eg. a `rename()` to change a message's flag),
another process in the middle of listing files at the same time could skip a
file. The skipping happens because `readdir()` system call doesn't guarantee
that all the files are returned if the directory is modified between the calls
to it. This problem exists with all the commonly used filesystems.

Because Dovecot uses its own non-standard locking (`dovecot-uidlist.lock`
dotlock file), other MUAs accessing the Maildir don't support it. This means
that if another MUA is updating message flags or expunging messages, Dovecot
might temporarily lose some message(s). After the next sync when it finds it
again, an error message may be written to log and the message will receive a
new UID.

Delivering mails to `new/` directory doesn't have any problems, so there's
no need for LDAs to support any type of locking.

### Mail Delivery

[Qmail's how a message is delivered page][qmail-message-delivery] suggests to
deliver the mail like this:

1. Create a unique filename (only `time.pid.host` here, later Maildir spec
   has been updated to allow more uniqueness identifiers)
2. Do `stat(tmp/<filename>)`. If the `stat()` found a file, wait 2 seconds
   and go back to step 1.
3. Create and write the message to `tmp/<filename>`.
4. `link()` it into `new/` directory. Although not mentioned here, the
   `link()` could again fail if the mail existed in `new/` dir. In that
   case you should probably go back to step 1.

All this trouble is rather pointless. Only the first step is what really
guarantees that the mails won't get overwritten, the rest just sounds nice.
Even though they might catch a problem once in a while, they give no
guaranteed protection and will just as easily pass duplicate filenames through
and overwrite existing mails.

Step 2 is pointless because there's a race condition between steps 2 and 3.
PID/host combination by itself should already guarantee that it never finds
such a file. If it does, something's broken and the `stat()` check won't
help since another process might be doing the same thing at the same time, and
you end up writing to the same file in `tmp/`, causing the mail to get
corrupted.

In step 4 the `link()` would fail if an identical file already existed in
the Maildir, right? Wrong. The file may already have been moved to `cur/`
directory, and since it may contain any number of flags by then you can't
check with a simple `stat()` anymore if it exists or not.

Step 2 was pointed out to be useful if clock had moved backwards. However,
this doesn't give any actual safety guarantees because an identical base
filename could already exist in `cur/`. Besides if the system was just
rebooted, the file in `tmp/` could probably be even overwritten safely
(assuming it wasn't already `link()`\ ed to `new/`).

So really, all that's important in not getting mails overwritten in your
Maildir is step 1: Always create filenames that are guaranteed to be unique.
Forget about the 2 second waits and such that the Qmail's man page talks
about.


## Maildir and Mail Header Metadata

Unlike when using [[link,mbox]], where mail headers (for example
`Status`, `X-UID`, etc.) are used to determine and store metadata, the
mail headers within Maildir files are (usually) **not** used for this purpose
by Dovecot; neither when mails are created/moved/etc. via IMAP nor when
Maildirs are placed (e.g., copied or moved in the filesystem) in a mail
location (and then "imported" by dovecot).

Therefore, it is (usually) **not** necessary, to strip any such mail headers
at the [[link,mta]], [[link,mda]], or [[link,lda]] (as is recommended with
[[link,mbox]]).

There is one exception, though, namely when [[setting,pop3_reuse_xuidl,yes]]
is used: in this case `X-UIDL` is used for the POP3 UIDLs.
Therefore, in this case, is recommended to strip the `X-UIDL` mail headers
*case-insensitively* at the mail delivery layer.

## Procmail Problems

Maildir format is somewhat compatible with MH format. This is sometimes a
problem when people configure their procmail to deliver mails to
`Maildir/new`. This makes procmail create the messages in MH format, which
basically means that the file is called `msg.inode_number`. While this
appears to work first, after expunging messages from the Maildir the inodes
are freed and will be reused later. This means that another file with the
same name may come to the Maildir, which makes Dovecot think that an expunged
file reappeared into the mailbox and an error is logged.

The proper way to configure procmail to deliver to a Maildir is to use
`Maildir/` as the destination.

## Settings

<SettingsComponent tag="maildir" />

## Configuration

### Mail Location

Maildir exists almost always in `~/Maildir` directory. The mail location is
specified with:

```[dovecot.conf]
mail_location = maildir:~/Maildir
```

#### Directory Layout

By default, Dovecot uses Maildir++ directory layout. This means that all
mailboxes are stored in a single directory and prefixed with a dot. For
example:

* `Maildir/.folder/`
* `Maildir/.folder.subfolder/`

If you want Maildirs to use hierarchical directories, such as:

* `Maildir/folder/`
* `Maildir/folder/subfolder/`

you'll need to enable fs layout:

```[dovecot.conf]
mail_location = maildir:~/Maildir:LAYOUT=fs
```

#### Default `mail_location` Keys

For Maildir, the default keys are:

| Key | Default Value |
| --- | ------------- |
| `FULLDIRNAME` | `<empty>` |

### Control Files

Dovecot stores some Maildir metadata into two control files:

* `dovecot-uidlist` file contains IMAP UID <-> Maildir filename mapping
* `dovecot-keywords` file contains Maildir filename flag (a..z = 0..25) <->
  keyword name mapping

They shouldn't be treated the
same way as index files. Index files can be deleted and rebuilt without any
side effects, but if you delete control files you'll cause messages to get
new UIDs and possibly lose keyword names.

If the messages get new UIDs, the IMAP clients will invalidate their local
cache and download the messages all over again. If you do this for all the
users, you could cause huge disk I/O bursts to your server.

Dovecot cannot currently handle not being able to write the control files, so
it will cause problems with [[link,quota_backend_fs]]. To
avoid problems with this,
you should place control files into a partition where quota isn't checked. You
can specify this by adding `:CONTROL=<path` to `mail_location`:

```[dovecot.conf]
mail_location = maildir:~/Maildir:CONTROL=/var/no-quota/%u
```

### Index Files

By default, index files are stored in the actual Maildirs.

See [[link,mail_location]] for an explanation of how to change the index
path. Example:

```[dovecot.conf]
mail_location = maildir:~/Maildir:INDEX=/var/indexes/%u
```

### Optimizations

* [[setting,maildir_copy_with_hardlinks,yes]]
* [[setting,maildir_stat_dirs,no]]
* [[setting,maildir_very_dirty_syncs,yes]]


### Mailbox Directory Name

When using `LAYOUT=fs`, there is a potential for naming collisions between
Maildir's `new/`, `cur/`, and `tmp/` subdirectories, and mail folders
of the same names.

For example, consider a mail folder `foo/bar`. Under `LAYOUT=fs`, data
for this mail folder will be stored under Maildir's usual three directories
`~/Maildir/foo/bar/{new,cur,tmp}/`. If the user then tries to create a mail
folder `foo/bar/new`, this would then imply that data should be stored in
Maildir's three directories `~/Maildir/foo/bar/new/{new,cur,tmp}/`. But
this would overlap Maildir's `new/` subdirectory of mail folder `foo/bar`.

This may not be a problem in many installations, but if a risk of collisions
with Maildir's three subdirectory names is perceived, then the `DIRNAME`
parameter can be used. For example, if we specify mail location as:

```[dovecot.conf]
mail_location = maildir:~/Maildir:LAYOUT=fs:DIRNAME=mAildir
```

then this will push Maildir's `new/`, `cur/`, and `tmp/` subdirectories
down into a subdirectory `mAildir/`, so a mail folder `foo/bar` would be
stored at `~/Maildir/foo/bar/mAildir/{new,cur,tmp}/`. A mail folder
`foo/bar/new` would be stored at
`~/Maildir/foo/bar/new/mAildir/{new,cur,tmp}/`, which would then have no
overlap with the mail folder `foo/bar`.

`DIRNAME` affects INBOX slightly differently. Without `DIRNAME`, INBOX
will be stored at `~/Maildir/{new,cur,tmp}/`, but when `DIRNAME` is
specified, we get an extra path component `INBOX/` immediately prior to the
`DIRNAME` value, so in the example above INBOX would be stored at
`~/Maildir/INBOX/mAildir/{new,cur,tmp}/`.

The value for `DIRNAME` should be chosen carefully so as to minimise the
chances of clashing with mail folder names. In the example here, unusual
upper/lower casing has been used.

### Multiple Namespaces pointing to INBOX

When there are multiple namespaces that point to the same INBOX namespace,
`dovecot.list.index` can potentially keep fighting over whether INBOX exists
or not.

For example:

```[dovecot.conf]
mail_location = maildir:~/Maildir:LAYOUT=fs

namespace inbox {
  inbox = yes
  prefix = INBOX/
  separator = /
  subscriptions = no
}

namespace empty {
  prefix =
  separator = /
  alias_for = inbox
  location = maildir:~/Maildir:LAYOUT=fs # Alias location
  subscriptions = yes
}
```

The solution is to disable `dovecot.list.index` for the alias namespace. In
the above example, this is done by changing the "Alias location" line to:

```[dovecot.conf]
location = maildir:~/Maildir:LAYOUT=fs:LISTINDEX=
```

[dovecot-ce]: https://repo.dovecot.org/
[maildir-standard]: https://cr.yp.to/proto/maildir.html
[qmail-message-delivery]: http://qmail.org/man/man5/maildir.html
