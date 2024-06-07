---
layout: doc
title: Main Index
---

# Main Index

The main index can be used to quickly look up messages' UIDs, flags,
keywords and extension-specific data, such as cache file or mbox file
offsets.

::: info See Also
See [Mail Indexes](index_format) for a more detailed overview.
:::

## File Format

The main index is only updated by recreating the whole file. An existing
file is never modified. All the changes to the index go through the
[Transaction Log](index_log).

The main index file format is:

* Base header (`struct mail_index_header`).
* Extension headers (`struct mail_index_ext_header`)
* Message records (`struct mail_index_record`) including extension records.

See `lib-index/mail-index.h` and `lib-index/mail-index-private.h` in the
source code for details about these structs.

## Extension Headers

Extensions allow adding extra data into index header and/or message records.
For example cache file offsets are stored as extensions. See
[Transaction Log](index_log) for more details about extensions.

The extensions are listed in the main index file after the base header. The
first extension begins from `mail_index_header.base_header_size`
offset. The second begins after the first one's `data[]` and so on.
The extensions are always 64bit aligned, so the reader may need to skip a few
bytes to get to the proper alignment offset. Read the extensions as long as
the offset is smaller than `mail_index_header.header_size`.

## Message Records

There are `mail_index_header.messages_count` records in the file. The size
of each record is `mail_index_header.record_size`. Each record
contains at least two fields: Record UID and flags. The UID is always
increasing for the records, so it's possible to find a record by its UID
with binary search.

The flags are a combination of `enum mail_flags` and
`enum mail_index_mail_flags`:

* 0x01 - `MAIL_ANSWERED` - `\Answered` IMAP system flag
* 0x02 - `MAIL_FLAGGED` - `\Flagged` IMAP system flag
* 0x04 - `MAIL_DELETED` - `\Deleted` IMAP system flag
* 0x08 - `MAIL_SEEN` - `\Seen` IMAP system flag
* 0x10 - `MAIL_DRAFT` - `\Draft` IMAP system flag
* 0x20 - `MAIL_INDEX_MAIL_FLAG_UNUSED` - This used to contain the `\Recent`
  IMAP system flag, but is always unset in current index files. This could be
  reused for other purposes.
* 0x40 - `MAIL_INDEX_MAIL_FLAG_BACKEND` - For private use by backend.
* 0x80 - `MAIL_INDEX_MAIL_FLAG_DIRTY` - Message flags haven't been
  successfully written to backend mailbox. This is used for example with mbox
  and `mbox_lazy_writes=yes`. It also allows having modifiable flags for
  read-only mailboxes. Alternatively, with some mailbox formats this flag
  can be used in a backend-specific way.

The rest of the data is stored in record extensions.

## Keywords

The keywords are stored in "keywords" named extension, where the keyword names
are listed in the extension header and stored as bitmask in the extension
records. So the nth bit in the bitfield points to the nth keyword
listed in the header.

For better performance and lower disk space usage in transaction logs, the
keywords extension is more tightly integrated to the index file code than
other extensions.

The list of keywords is stored in "keywords" extension header:

```c
struct mail_index_keyword_header {
    uint32_t keywords_count;
    /* struct mail_index_keyword_header_rec[] */
    /* char name[][] */
};

struct mail_index_keyword_header_rec {
    uint32_t unused; /* for backwards compatibility */
    uint32_t name_offset; /* relative to beginning of name[] */
};
```

The `mail_index_keyword_header_rec` records (and `keywords_count`)
are actually unnecessary. They were used to optimize reading only newly
added keywords since the last sync, but that happens rarely. Also
nowadays this would be noticed by reading the change from
`dovecot.index.log` instead of re-reading the `dovecot.index` header.
So at some point the "keywords" extension should be replaced with a new
"keywords" extension that no longer has these records.

It's not currently possible to safely remove existing keywords.

## Extension Records

The extensions only specify their wanted size and alignment in the mail
records. The index file syncing code is free to assign any offset inside
the message record to them. The extensions may be reordered at any time.

Dovecot's current extension ordering code works pretty well, but it's
not perfect. If the extension size isn't the same as its alignment, it
may create larger message records than necessary.

To guarantee aligned access to an extension, the message record size is
always divisible by the maximum alignment requirement.

See [Transaction Log](index_log) for more details about extensions.
