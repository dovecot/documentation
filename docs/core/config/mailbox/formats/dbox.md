---
layout: doc
title: dbox
dovecotlinks:
  dbox: dbox
  dbox_alt_storage:
    hash: alternate-storage
    text: dbox alternate storage
  mdbox:
    hash: multi-dbox-mdbox
    text: mdbox
  sdbox:
    hash: single-dbox-sdbox
    text: sdbox
---

# dbox Mailbox Format

dbox is Dovecot's own high-performance mailbox format. The original version
was introduced in v1.0 alpha4, but since then it has been completely
redesigned in v1.1 series and improved even further in v2.0.

One of the main reasons for dbox's high performance is that it uses Dovecot's
index files as the only storage for message flags and keywords, so the
indexes don't have to be "synchronized". Dovecot trusts that they're always
up-to-date (unless it sees that something is clearly broken).

::: danger
**You must not lose the dbox index files, as they can't be regenerated
without data loss!**
:::

dbox has a feature for transparently moving message data to an [alternate
storage](#alternate-storage) area.

dbox storage is extensible. Single instance attachment storage was already
implemented as such extension.

## dbox Modes

### single-dbox (`sdbox`)

One message per file, similar to [[link,maildir]].

For backwards compatibility, `dbox` is an alias to `sdbox` in
[[setting,mail_driver]].

### multi-dbox (`mdbox`)

Multiple messages per file,but unlike [[link,mbox]] stores multiple files per
mailbox.

## Layout

By default, the dbox filesystem layout is as follows.

Data which isn't the actual message content is stored in a layout common to
both `sdbox` and `mdbox`.

In these tables `<root>` is shorthand for the mail location root directory
on the filesystem.

Index files can be stored in a different location by using the
[[setting,mail_index_path]] setting. If specified, it will override the mail
location root for index files and mdbox's "map index" file.

| Location | Description |
| -------- | ----------- |
| `<root>/mailboxes/INBOX/dbox-Mails/dovecot.index*` | Index files for INBOX |
| `<root>/mailboxes/foo/dbox-Mails/dovecot.index*` | Index files for mailbox "foo" |
| `<root>/mailboxes/foo/bar/dbox-Mails/dovecot.index*` | Index files for mailbox "foo/bar" |
| `<root>/dovecot.mailbox.log*` | Mailbox changelog |
| `<root>/subscriptions` | Subscribed mailboxes list |
| `<root>/dovecot-uidvalidity*` | IMAP UID validity |

Note that with dbox the Index files contain significant data which is held
nowhere else. Index files for both `sdbox` and `mdbox` contain message
flags and keywords.

For `mdbox`, the index file also contains the map_uids
which link (via the "map index") to the actual message data. This data cannot
be automatically recreated, so it is important that Index files are treated
with the same care as message data files.

Actual message content is stored differently depending on whether it is
`sdbox` or `mdbox`.

### Message Storage: sdbox

| Location | Description |
| -------- | ----------- |
| `<root>/mailboxes/INBOX/dbox-Mails/u.*` | Numbered files (`u.1`, `u.2`, ...) each containing one message of INBOX |
| `<root>/mailboxes/foo/dbox-Mails/u.*` | Files each containing one message for mailbox "foo" |
| `<root>/mailboxes/foo/bar/dbox-Mails/u.*` | Files each containing one message for mailbox "foo/bar" |

### Message Storage: mdbox

| Location | Description |
| -------- | ----------- |
| `<root>/storage/dovecot.map.index*` | "Map index" containing a record for each message stored |
| `<root>/storage/m.*` | Numbered files (`u.1`, `u.2`, ...) each containing one or multiple messages |

The directory layout (under `~/mdbox/`) is:

| Location | Description |
| -------- | ----------- |
| `~/mdbox/storage/` | The mail data for all mailboxes |
| `~/mdbox/mailboxes/` | Directories for mailboxes and their index files |

The `storage` directory has files:

| File | Description |
| ---- | ----------- |
| `dovecot.map.index*` | The "map index" |
| `m.*` | Mail data. Each m.\* file contains one or more messages. [[setting,mdbox_rotate_size]] can be used to configure how large the files can grow. |

The "map index" contains a record for each message:

| Key | Description |
| --- | ----------- |
| `map_uid` | Unique growing 32 bit number for the message. |
| `refcount` | 16 bit reference counter for this message. Each time the message is copied the refcount is increased. |
| `file_id` | File number containing the message. For example if file_id=5, the message is in file `m.5`. |
| `offset`| Offset to message within the file. |
| `size` | Space used by the message in the file, including all metadata. |

Mailbox indexes refer to messages only using map_uids. This allows messages
to be moved to different files by updating only the map index. Copying is
done simply by appending a new record to mailbox index containing the
existing map_uid and increasing its refcount. If refcount grows over 32768,
currently Dovecot gives an error message. It's unlikely anyone really wants to
copy the same message that many times.

Expunging a message only decreases the message's refcount. The space is later
freed in "purge" step. This is typically done in a nightly cronjob when
there's less disk I/O activity. The purging first finds all files that have
refcount=0 mails. Then it goes through each file and copies the refcount>0
mails to other mdbox files (to the same files as where newly saved messages
would also go), updates the map index and finally deletes the original file.
So there is never any overwriting or file truncation.

The purging can be invoked explicitly running [[doveadm,purge]].

There are several safety features built into dbox to avoid losing messages or
their state if map index or mailbox index gets corrupted:

* Each message has a 128 bit globally unique identifier (GUID). The GUID is
  saved to message metadata in `m.*` files and also to mailbox indexes. This
  allows Dovecot to find messages even if map index gets corrupted.
* Whenever index file is rewritten, the old index is renamed to
  `dovecot.index.backup`. If the main index becomes corrupted, this backup
  index is used to restore flags and figure out what messages belong to the
  mailbox.
* Initial mailbox where message was saved to is stored in the message
  metadata in `m.*` files. So if all indexes get lost, the messages are put
  to their initial mailboxes. This is better than placing everything into a
  single mailbox.

## Alternate Storage

Unlike Maildir, with dbox the message file names don't change. This makes it
possible to support storing files in multiple directories or mount points.
dbox supports looking up files from "altpath" if they're not found from the
primary path. This means that it's possible to move older mails that are
rarely accessed to cheaper (slower) storage.

When messages are moved from primary storage to alternate storage, only the
actual message data (stored in files `u.*` under `sdbox` and `m.*`
under `mdbox`) is moved to alternate storage; everything else remains in
the primary storage.

Message data can be moved from primary storage to alternate storage using
[[doveadm,altmove]].

The granularity at which data is moved to alternate storage is individual
messages. This is true even for `mdbox` when multiple messages are stored
in a single `m.*` storage file. If individual messages from an `m.*`
storage file need to be moved to alternate storage, the message data is
written out to a different `m.*` storage file (either new or existing) in
the alternate storage area and the "map index" updated accordingly.

Alternate storage is completely transparent at the IMAP/POP level. Users
accessing mail through IMAP or POP cannot normally tell if any given message
is stored in primary storage or alternate storage. Conceivably users might be
able to measure a performance difference; the point is that there is no
IMAP/POP command which could be used to expose this information. It is
entirely possible to have a mail folder which contains a mix of messages
stored in primary storage and alternate storage.

### Configuration

To enable this functionality, use the [[setting,mail_alt_path]] setting. For
example:

```[dovecot.conf]
mail_driver = mdbox
mail_path = /var/vmail/%d/%n
mail_alt_path = /altstorage/vmail/%d/%n
```

will make Dovecot look for message data first under `/var/vmail/%d/%n`
("primary storage"), and if it is not found there it will look under
`/altstorage/vmail/%d/%n` ("alternate storage") instead. There's no problem
having the same (identical) file in both storages.

Keep the unmounted `/altstorage` directory permissions such that Dovecot
mail processes can't create directories under it (e.g. `root:root 0755`).
This way if the alt storage isn't mounted for some reason, Dovecot won't
think that all the messages in alt storage were deleted and lose their flags.

## dbox and Mail Header Metadata

Unlike when using [[link,mbox]], where mail headers (for example
`Status`, `X-UID`, etc.) are used to determine and store metadata, the
mail headers within dbox files are (usually) **not** used for this purpose by
Dovecot; neither when mails are created/moved/etc. via IMAP nor when dboxes
are placed (e.g. copied or moved in the filesystem) in a mail location (and
then "imported" by Dovecot).

Therefore, it is (usually) **not** necessary, to strip any such mail headers
at the [[link,mta]], [[link,mda]], or [[link,lda]] (as it is recommended with
[[link,mbox]]).

There is one exception, though, namely when [[setting,pop3_reuse_xuidl,yes]]:
in this case `X-UIDL` is used for the POP3 UIDLs.
Therefore, in this case, is recommended to strip the `X-UIDL` mail headers
*case-insensitively* at the mail delivery layer.

## Accessing Expunged Mails with mdbox

`mdbox_deleted` storage can be used to access mdbox's all mails that are
completely deleted (reference count = 0). The `mdbox_deleted` parameters
should otherwise be exactly the same as `mdbox`'s. Then you can use
e.g. [[doveadm,fetch]] or [[doveadm,import]] commands to access the mails.

For example, if you have:
* [[setting,mail_driver,mdbox]],
* [[setting,mail_path,~/mdbox]],
* [[setting,mail_index_path,/var/index/%u]],

use:
[[doveadm,import,-p mail_index_path=/var/index/%u mdbox_deleted:~/mdbox "" subject oops]].

This finds a deleted mail with subject "oops" and imports it into INBOX.

## Mail Delivery

Some MTA configurations have the MTA directly dropping mail into Maildirs or
mboxes. Since most MTAs don't understand the dbox format, this option is not
available. Instead, the MTA should use [[link,lmtp]] or [[link,lda]].

## dbox Configuration

### Settings

<SettingsComponent tag="mdbox" level="3" />

### Mail Location

#### sdbox

To use **single-dbox**, use the tag `sdbox` in [[setting,mail_driver]]:

```[dovecot.conf]
# single-dbox
mail_driver = sdbox
mail_path = ~/dbox
```

For backwards compatibility, `dbox` is an alias to `sdbox` in the mail
location. (This usage is deprecated.)

#### mdbox

To use **multi-dbox**, use the tag `mdbox` in [[setting,mail_driver]]:

```[dovecot.conf]
# multi-dbox
mail_driver = mdbox
mail_path = ~/mdbox
```

#### Default mail settings

* [[setting,mail_path,%{home}/sdbox]] for sdbox,
  [[setting,mail_path,%{home}/mdbox]] for mdbox,
* [[setting,mailbox_list_layout,fs]],
* [[setting,mailbox_directory_name,dbox-Mails]], and
* [[setting,mailbox_root_directory_name,mailboxes]].
