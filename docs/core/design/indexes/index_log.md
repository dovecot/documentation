---
layout: doc
title: Transaction Log
---

# Transaction Log

::: info See Also
See [Mail Indexes](index_format) for an overview
of the transaction log is and what its benefits are.
:::

## File Format

The transaction log is usually appended to. Once in a while the log gets
rotated into .log.2 and a new .log is created. During this rotation the
main index is also recreated.

The log begins with a header (`struct mail_transaction_log_header`)
followed by transaction records. Each transaction record begins with a header
(`struct mail_transaction_header`) followed by transaction type specific
content. The transaction types are described in `enum mail_transaction_type`.

A single transaction record may contain multiple changes of the same
type, although some types don't allow this. Because the size of the
transaction record for each type is known (or can be determined from the
type-specific record contents), the `mail_transaction_header.size` field can
be used to figure out how many changes there are. For example a transaction
record that appends two mails:

```c
struct mail_transaction_header {
    .type = MAIL_TRANSACTION_APPEND,
    .size = sizeof(struct mail_index_record) * 2
}
struct mail_index_record { .uid = 1, .flags = 0 }
struct mail_index_record { .uid = 2, .flags = 0 }
```

For supporting multi-record transactions, there's a `MAIL_TRANSACTION_BOUNDARY`
type. These transactions are always processed at the same time, or if the
write broke before finishing them the log file truncates the partial
transaction away. However, there's no further guarantee that the subsequent
transaction processing will all either succeed or fail. Generally they should,
but the mailbox syncing could fail partially for example due to storage
problems.

See `lib-index/mail-transaction-log.h` in the source code for details.

## Internal vs. External

Transactions are either internal or external. The difference is that
external transactions describe changes that were already made to the
mailbox, while internal transactions are commands to do something to the
mailbox. This is especially relevant with mailbox formats that support
changes to them done outside Dovecot, like mbox or Maildir. When
beginning to synchronize such a mailbox with index files, the
index file is first updated with all the external changes, and the
uncommitted internal transactions are applied on top of them.

When synchronizing the mailbox, using the synchronization transaction
writes only external transactions. Also if the index file is updated
when saving new mails to the mailbox, the append transactions must be
external. This is because the changes are already in the mailbox at the
time the transaction is read.

## Reading and Writing

Appending to an existing `dovecot-index.log` file locks it exclusively
using the index files' default lock method ([[setting,lock_method]].
The transaction log files are opened with `O_APPEND` flag,
which usually makes the writes appear as atomic (although this doesn't
seem to be actually guaranteed, practically this seems to happen).

Reading transaction logs doesn't require any locking at all. Due to the
`O_APPEND` behavior the reads typically don't even see partially
written transactions (although they are also handled properly).

A new log is created by first creating a `dovecot.index.log.newlock`
dotlock file, which guarantees that the process itself is the only one
creating a new log. After this, verify whether another process had just
recreated the `dovecot.index.log`. If it had, there's no need to recreate
it again. If not, finish writing the log header to the newlock file and
finally `rename()` it to `dovecot.index.log`.

Transaction logs are always only appended to, with one exception: If a
partially written transaction is found, it'll be truncated away and new
transaction is overwritten on top of the old truncated data.

::: warning FIXME
This should be avoided, rather rotate the transaction log instead.
:::

## UIDs

Many record types contain `uint32_t uid1, uid2` fields. This means
that the changes apply to all the messages in uid1..uid2 range. Dovecot
used to optimize these so that if for example the first 3 messages in
a mailbox were 1,100,1000, these could have been referred to with
`{ uid1=1, uid2=1000 }`. However, this is no longer done for a few
reasons:

* Another session might still have the same mailbox open without having
  synced away the expunged messages (IMAP sessions can do this by not sending
  any commands that allow syncing expunges). For example it might still see
  that the 2nd mail is uid=50. It would be confusing that the already expunged
  mail gets flag updates.

* It makes it more difficult to debug problems when it's not clear which
  messages exactly were intended to be referred to.

* There are likely also some issues related to dsync.

## Expunges

Because expunges actually destroy messages, they deserve some extra
protection to make it less likely to accidentally expunge wrong messages
in case of for example file corruption. The expunge transactions must
have `MAIL_TRANSACTION_EXPUNGE_PROT` ORed to the transaction type
field. If an expunge type is found without it, assume a corrupted
transaction log.

`MAIL_TRANSACTION_EXPUNGE_GUID` is preferred to be used for expunging
messages over `MAIL_TRANSACTION_EXPUNGE` that just lists the UIDs. The
mailbox syncing looks up the actual GUID for the referred mail, and verifies
that it matches the GUID in the expunge request. If they don't match,
something's corrupted and the mail won't be expunged. The expunge GUID
records also improve dsync behavior.

## Flags and Keywords

IMAP protocol supports changing both flags and keywords with the same STORE
command, but in Dovecot index fields they are handled separately.

Flags can be added/removed with `MAIL_TRANSACTION_FLAG_UPDATE` while
keywords can be added/remove with `MAIL_TRANSACTION_KEYWORD_UPDATE`.
Keywords can be completely cleared out with `MAIL_TRANSACTION_KEYWORD_RESET`.

To completely replace all flags and keywords with wanted ones, set:

* `MAIL_TRANSACTION_FLAG_UPDATE`: Set
  `mail_transaction_flag_update.add_flags` to the wanted system flags and
  `.remove_flags = 0xff`.
* `MAIL_TRANSACTION_KEYWORD_RESET` to remove all keywords.
* `MAIL_TRANSACTION_KEYWORD_UPDATE` to set back the wanted keywords.


## Extensions

Extension records allow creating and updating extension-specific header
and message record data. For example messages' offsets to cache file or
mbox file are stored in extensions.

Whenever using an extension, you'll need to first write
`MAIL_TRANSACTION_EXT_INTRO` record. This is a bit kludgy and
hopefully will be replaced by something better in future. The intro
contains:

```c
struct mail_transaction_ext_intro {
    uint32_t ext_id;
    uint32_t reset_id;
    uint32_t hdr_size;
    uint16_t record_size;
    uint16_t record_align;
    uint16_t flags;
    uint16_t name_size;
    /* unsigned char name[]; */
};
```

If the extension already exists in the index file, `ext_id` can be set
to it directly (extensions can't be removed from an existing index).
For adding a new extension, specify the extension name instead and use
`ext_id=(uint32_t)-1`. It's always possible to just give the name if
you don't know the existing extension ID, but this uses more disk space.

`reset_id` contains kind of a "transaction validity" field. It's
updated with `MAIL_TRANSACTION_EXT_RESET` record, which (optionally)
causes the extension records' contents to be zeroed. If an introduction's
`reset_id` doesn't match the last EXT_RESET, it means that the
extension changes are stale and they must be ignored. For example:

- `dovecot.index.cache` file's `file_seq` header is used as a
  `reset_id`. Initially it's 1.

- Process A: Begins a cache transaction, updating some fields in it.

- Process B: Decides to compress the cache file, and issues a
  `reset_id = 2` change.

- Process A: Commits the transaction with `reset_id = 1`, but the
  cache file offsets point to the old file, so the changes must be
  ignored.

`hdr_size` specifies the number of bytes the extension wants to have
in the index file's header. `record_size` specifies the number of
bytes it wants to use for each record. The sizes may grow or shrink at any
time. `record_align` contains the required alignment for the
field. For example if the extension contains a 32bit integer, the alignment
should be 32bit so that the process won't crash in CPUs which
require proper alignment. Of course, if the field is accessed only as
4 individual bytes, the alignment can be 1.

Extension record updates typically are message-specific, so the changes
must be done for each message separately rather than an UID range.
For example:

```c
struct mail_transaction_ext_rec_update {
    uint32_t uid; // instead of uid1, uid2
    /* unsigned char data[]; */
};
```
