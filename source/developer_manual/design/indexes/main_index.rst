.. _dovecot_main_index:

Main index
==========

The main index can be used to quickly look up messages' UIDs, flags,
keywords and extension-specific data, such as cache file or mbox file
offsets.

Reading, writing and locking
----------------------------

Reading ``dovecot.index`` file requires locking, unfortunately. Shared
read locking is done using the standard index locking method specified
in ``lock_method`` setting (``lock_method`` parameter for
``mail_index_open()``).

Writing to index files requires transaction log to be exclusively locked
first. This way the index locking only has to worry about existing read
locks. The locking works by first trying to lock the index with the
standard locking method, but if it couldn't acquire the lock in two
seconds, it'll fallback to copying the index file to a temporary file,
and when unlocking it'll ``rename()`` the temporary file over the
``dovecot.index`` file. Note that this is safe only because of the
exclusive transaction log lock. This way the writers are never blocked
by readers who are allowed to keep the shared lock as long as they want.

The copy-locking is used always when doing anything that could corrupt
the index file if it crashed in the middle of an operation. For example
if the header or record size changes, or if messages are expunged. New
messages can be appended however, because the message count in the
header is updated last. Expunging the last messages would probably be
safe also (because only the header needs updating), but it's not done
currently.

The index file should never be directly modified. Everything should go
through the transaction log, and the only time the index needs to be
write-locked is when transactions are written to it.

Currently the index file is updated whenever the backend mailbox is
synchronized. This isn't necessary, because an old index file can be
updated using the transaction log. In future there could be some smarter
decisions about when writing to the index isn't worth the extra disk
writes.

Header
------

.. code-block:: C

           struct mail_index_header {
                uint8_t major_version;
                uint8_t minor_version;

                uint16_t base_header_size;
                uint32_t header_size;
                uint32_t record_size;

                uint8_t compat_flags;
                uint8_t unused[3];

                uint32_t indexid;
                uint32_t flags;

                uint32_t uid_validity;
                uint32_t next_uid;

                uint32_t messages_count;
                uint32_t unused_old_recent_messages_count;
                uint32_t seen_messages_count;
                uint32_t deleted_messages_count;

                uint32_t first_recent_uid;
                uint32_t first_unseen_uid_lowwater;
                uint32_t first_deleted_uid_lowwater;

                uint32_t log_file_seq;
                uint32_t log_file_tail_offset;
                uint32_t log_file_head_offset;

                uint32_t unused_old_sync_size_part1;
                uint32_t log2_rotate_time;
                uint32_t last_temp_file_scan;

                uint32_t day_stamp;
                uint32_t day_first_uid[8];
        };

Fields that won't change without recreating the index:

``major_version``
   If this doesn't match ``MAIL_INDEX_MAJOR_VERSION``, don't try to read
   the index. Dovecot recreates the index file then.

``minor_version``
   If this doesn't match ``MAIL_INDEX_MINOR_VERSION`` there are some
   backwards compatible changes in the index file (typically header
   fields). Try to preserve the headers and the minor version when
   updating the index file.

``base_header_size``
   Extension headers begin after the base headers. This is normally the
   same as ``sizeof(struct mail_index_header)``.

``header_size``
   Records begin after base and extension headers.

``record_size``
   Size of each record and its extensions. Initially the same as
   ``sizeof(struct mail_index_record)``.

``compat_flags``
   Currently there is just one compatibility flag:
   ``MAIL_INDEX_COMPAT_LITTLE_ENDIAN``. Dovecot doesn't try to bother to
   read different endianess files, they're simply recreated.

``indexid``
   Unique index file ID. This is used to make sure that the main index,
   transaction log and cache file are all part of the same index.

Header ``flags``:

``MAIL_INDEX_HDR_FLAG_CORRUPTED``
   Set whenever the index file is found to be corrupted. If the reader
   notices this flag, it shouldn't try to continue using the index.

``MAIL_INDEX_HDR_FLAG_HAVE_DIRTY``
   This index has records with ``MAIL_INDEX_MAIL_FLAG_DIRTY`` flag set.

``MAIL_INDEX_HDR_FLAG_FSCK``
   Call ``mail_index_fsck()`` as soon as possible. This flag isn't
   actually set anywhere currently.

Message UIDs and counters:

``uid_validity``
   IMAP UIDVALIDITY field. Initially can be 0, but after it's set we
   don't currently try to even handle the case of UIDVALIDITY changing.
   It's done by marking the index file corrupted and recreating it.
   That's a bit ugly, but typically the UIDVALIDITY never changes.

``next_uid``
   UID given to the next appended message. Only increases.

``messages_count``
   Number of records in the index file.

``unused_old_recent_messages_count``
   No longer used in recent dovecot version

``seen_messages_count``
   Number of records with ``MAIL_SEEN`` flag set.

``deleted_messages_count``
   Number of records with ``MAIL_DELETED`` flag set.

``first_recent_uid``
   There are no UIDs lower than this with ``MAIL_RECENT`` flag set.

``first_unseen_uid_lowwater``
   There are no UIDs lower than this **without** ``MAIL_SEEN`` flag set.

``first_deleted_uid_lowwater``
   There are no UIDs lower than this with ``MAIL_DELETE`` flag set.

The lowwater fields are used to optimize searching messages with/without
a specific flag.

Fields related to syncing:

``unused_old_sync_size_part1``
   No longer used in recent dovecot version

``log_2_rotate_time``
   Timestamp of when .log was rotated into .log.2. This can be used to
   optimize checking when it's time to unlink it without stat()ing it.

``last_temp_file_scan``
   Timestamp of when index_update_header has been updated last.

Then there are day fields:

``day_stamp``
   UNIX timestamp to the beginning of the day when new records were last
   added to the index file.

``day_first_uid[8]``
   These fields are updated when ``day_stamp`` < today. The [0..6] are
   first moved to [1..7], then [0] is set to the first appended UID. So
   they contain the first UID of the day for last 8 days when messages
   were appended.

The ``day_first_uid[]`` fields are used by cache file compression to
decide when to drop ``MAIL_CACHE_DECISION_TEMP`` data.

Extension headers
-----------------

After the base header comes a list of extensions and their headers. The
first extension begins from ``mail_index_header.base_header_size``
offset. The second begins after the first one's ``data[]`` and so on.
The extensions always begin 64bit aligned however, so you may need to
skip a few bytes always. Read the extensions as long as the offset is
smaller than ``mail_index_header.header_size``.

.. code-block:: C

   struct mail_index_ext_header {
           uint32_t hdr_size; /* size of data[] */
           uint32_t reset_id;
           uint16_t record_offset;
           uint16_t record_size;
           uint16_t record_align;
           uint16_t name_size;
           /* unsigned char name[name_size] */
           /* unsigned char data[hdr_size] (starting 64bit aligned) */
   };

``reset_id``, record offset, size and alignment is explained in
:ref:`Transaction Log <dovecot_transaction_log>`'
``struct mail_transaction_ext_intro``.

Records
-------

There are ``hdr.messages_count`` records in the file. Each record
contains at least two fields: Record UID and flags. The UID is always
increasing for the records, so it's possible to find a record by its UID
with binary search. The record size is specified by
``mail_index_header.record_size``.

The flags are a combination of ``enum mail_flags`` and
``enum mail_index_mail_flags``. There exists only one index flag
currently: ``MAIL_INDEX_MAIL_FLAG_DIRTY``. If a record has this flag
set, it means that the mailbox syncing code should ignore the flag in
the mailbox and use the flag in the index file instead. This is used for
example with mbox and ``mbox_lazy_writes=yes``. It also allows having
modifiable flags for read-only mailboxes.

The rest data is stored in record extensions.

Keywords
--------

The keywords are stored in record extensions, but for better performance
and lower disk space usage in transaction logs, they are quite tightly
integrated to the index file code.

The list of keywords is stored in "keywords" extension header:

.. code-block:: C

   struct mail_index_keyword_header {
           uint32_t keywords_count;
           /* struct mail_index_keyword_header_rec[] */
           /* char name[][] */
   };
   struct mail_index_keyword_header_rec {
           uint32_t unused; /* for backwards compatibility */
           uint32_t name_offset; /* relative to beginning of name[] */
   };

The unused field originally contained ``count`` field, but while writing
this documentation I noticed it's not actually used anywhere. Apparently
it was added there accidentally. It'll be removed in later versions.

So there exists ``keywords_count`` keywords, each listed in a
NUL-terminated string beginning from ``name_offset``.

Since crashing in the middle of updating the keywords list pretty much
breaks the keywords, adding new keywords causes the index file to be
always copied to a temporary file and be replaced.

The keywords in the records are stored in a "keywords" extension
bitfield. So the nth bit in the bitfield points to the nth keyword
listed in the header.

It's not currently possible to safely remove existing keywords.

Extensions
----------

The extensions only specify their wanted size and alignment, the index
file syncing code is free to assign any offset inside the record to
them. The extensions may be reordered at any time.

Dovecot's current extension ordering code works pretty well, but it's
not perfect. If the extension size isn't the same as its alignment, it
may create larger records than necessary. This will be fixed later.

The records size is always divisible by the maximum alignment
requirement. This isn't strictly necessary either, so it could be fixed
later as well.
