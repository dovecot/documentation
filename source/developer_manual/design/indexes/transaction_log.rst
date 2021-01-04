.. _dovecot_transaction_log:

===============
Transaction log
===============

The transaction log is a bit similar to transaction logs in databases.
All the updates to the main index files are first written to the
transaction log, and only after that the main index file is updated.
There are several advantages to this:

-  It provides atomic transactions: The transaction either succeeds, or
   it doesn't. For example if a transaction sets a flag to one message
   and removes it from another, it's guaranteed that both changes
   happen.

   -  When updating the changes to the main index file, the last thing
      that's done is to update the "transaction log position" in the
      header. So if Dovecot crashes after having updated only the first
      flag, the next time the mailbox is opened both of the changes are
      done all over again.

-  It allows another process to quickly see what changes have been made.
   For example IMAP needs to get a list of external changes after each
   command.

   -  This is also important when storing the index files in NFS or in a
      clustered filesystem. Instead of re-reading the whole index file
      after each external change, Dovecot can simply read the new
      changes from the transaction log and apply them to the in-memory
      copy of the main index. In-memory caching of
      ``dovecot.index.cache`` file also relies on the transaction log
      telling what parts of the file has changed.

-  In future the transaction logs can be somewhat easily used to
   implement replication.

Internal vs. external
---------------------

Transactions are either internal or external. The difference is that
external transactions describe changes that were already made to the
mailbox, while internal transactions are commands to do something to the
mailbox. When beginning to synchronize a mailbox with index files, the
index file is first updated with all the external changes, and the
uncommitted internal transactions are applied on top of them.

When synchronizing the mailbox, using the synchronization transaction
writes only external transactions. Also if the index file is updated
when saving new mails to the mailbox, the append transactions must be
external. This is because the changes are already in the mailbox at the
time the transaction is read.

Reading and writing
-------------------

Reading transaction logs doesn't require any locking at all. Writing is
exclusively locked using the index files' default lock method (as
specified by the ``lock_method`` setting).

A new log is created by first creating a ``dovecot.index.log.newlock``
dotlock file. Once you have the dotlock, check again that the
``dovecot.index.log`` wasn't created (or recreated) by another process.
If not, go ahead and write the log header to the dotlock file and
finally ``rename()`` it to ``dovecot.index.log``.

Currently there doesn't exist actual transaction boundaries in the log
file. All the changes in a transaction are simply written as separate
records to the file. Each record begins with a
``struct mail_transaction_header``, which contains the record's size and
type. The size is in :ref:`lockless integer format <locklessint>`.

The first transaction record is written with the size field being 0.
Once the whole transaction has been written, the 0 is updated with the
actual size. This way the transaction log readers won't see partial
transactions because they stop at the size=0 if the transaction isn't
fully written yet.

Note that because there are no transaction boundaries, there's a small
race condition here with mmap()ed log files:

1. Process A: write() half of the transaction

2. Process B: mmap() the file.

3. Process A: write() the rest of the transaction, updating the size=0
   also

4. Process B: parse the log file. it'll go past the original size=0
   because the size had changed in the mmap, but it stops in the middle
   of the transaction because the mmap size doesn't contain the whole
   transaction

This probably isn't a big problem, because I've never seen this happen
even with stress tests. Should be fixed at some point anyway.

Header
------

The transaction log's header never changes, except the indexid field may
be overwritten with 0 if the log is found to be corrupted. The fields
are:

major_version
   If this doesn't match ``MAIL_TRANSACTION_LOG_MAJOR_VERSION``, don't
   try to parse it. If Dovecot sees this, it'll recreate the log file.

minor_version
   If this doesn't match ``MAIL_TRANSACTION_LOG_MINOR_VERSION``, the log
   file contains some backwards compatible changes. Currently you can
   just ignore this field.

hdr_size
   Size of the log file's header. Use this instead of
   ``sizeof(struct mail_transaction_log_header)``, so that it's possible
   to add new fields and still be backwards compatible.

indexid
   This field must match to main index file's indexid field.

file_seq
   The file's creation sequence. Must be increasing.

prev_file_seq, prev_file_offset
   Contains the sequence and offset of where the last transaction log
   ended. When transaction log is rotated and the reader's "sync
   position" still points to the previous log file, these fields allow
   it to easily check if there had been any more changes in the previous
   file.

create_stamp
   UNIX timestamp when the file was created. Used in determining when to
   rotate the log file.

Record header
-------------

The transaction record header (``struct mail_transaction_header``)
contains ``size`` and ``type`` fields. The ``size`` field is in
:ref:`lockless integer format <locklessint>`.
A single transaction record may contain multiple changes of the same
type, although some types don't allow this. Because the size of the
transaction record for each type is known (or can be determined from the
type-specific record contents), the ``size`` field can be used to figure
out how many changes need to be done. So for example a record can
contain:

-  ``struct mail_transaction_header { type = MAIL_TRANSACTION_APPEND, size = sizeof(struct mail_index_record) * 2 }``

-  ``struct mail_index_record { uid = 1, flags = 0 }``

-  ``struct mail_index_record { uid = 2, flags = 0 }``

UIDs
----

Many record types contain ``uint32_t uid1, uid2`` fields. This means
that the changes apply to all the messages in uid1..uid2 range. The
messages don't really have to exist in the range, so for example if the
first messages in the mailbox had UIDs 1, 100 and 1000, it would be
possible to use uid1=1, uid2=1000 to describe changes made to these 3
messages. This also means that it's safe to write transactions
describing changes to messages that were just expunged by another
process (and already written to the log file before our changes).

Appends
-------

As described above, the appends must be in external transactions. The
append transaction's contents is simply the
``struct mail_index_record``, so it contains only the message's UID and
flags. The message contents aren't written to transaction log. Also if
the message had any keywords when it was appended, they're in a separate
transaction record.

Expunges
--------

Because expunges actually destroy messages, they deserve some extra
protection to make it less likely to accidentally expunge wrong messages
in case of for example file corruption. The expunge transactions must
have ``MAIL_TRANSACTION_EXPUNGE_PROT`` ORed to the transaction type
field. If an expunge type is found without it, assume a corrupted
transaction log.

Flag changes
------------

The flag changes are described in:

::

   struct mail_transaction_flag_update {
           uint32_t uid1, uid2;
           uint8_t add_flags;
           uint8_t remove_flags;
           uint16_t padding;
   };

The ``padding`` is ignored completely. A single flag update structure
can add new flags or remove existing flags. Replacing all the files
works by setting ``remove_flags = 0xFF`` and the ``add_flags``
containing the new flags.

Keyword changes
---------------

Specific keywords can be added or removed one keyword at a time:

::

   struct mail_transaction_keyword_update {
           uint8_t modify_type; /* enum modify_type : MODIFY_ADD / MODIFY_REMOVE */
           uint8_t padding;
           uint16_t name_size;
           /* unsigned char name[];
              array of { uint32_t uid1, uid2; }
           */
   };

There is padding after ``name[]`` so that uid1 begins from a 32bit
aligned offset.

If you want to replace all the keywords (eg. IMAP's
``STORE 1:* FLAGS (keyword)`` command), you'll first have to remove all
of them with ``MAIL_TRANSACTION_KEYWORD_RESET`` and then add the new
keywords.

Extensions
----------

Extension records allow creating and updating extension-specific header
and message record data. For example messages' offsets to cache file or
mbox file are stored in extensions.

Whenever using an extension, you'll need to first write
``MAIL_TRANSACTION_EXT_INTRO`` record. This is a bit kludgy and
hopefully will be replaced by something better in future. The intro
contains:

::

   struct mail_transaction_ext_intro {
           /* old extension: set ext_id. don't set name.
              new extension: ext_id = (uint32_t)-1. give name. */
           uint32_t ext_id;
           uint32_t reset_id;
           uint32_t hdr_size;
           uint16_t record_size;
           uint16_t record_align;
           uint16_t unused_padding;
           uint16_t name_size;
           /* unsigned char name[]; */
   };

If the extension already exists in the index file (it can't be removed),
you can use the ``ext_id`` field directly. Otherwise you'll need to give
a name to the extension. It's always possible to just give the name if
you don't know the existing extension ID, but this uses more space of
course.

``reset_id`` contains kind of a "transaction validity" field. It's
updated with ``MAIL_TRANSACTION_EXT_RESET`` record, which also causes
the extension records' contents to be zeroed. If an introduction's
``reset_id`` doesn't match the last EXT_RESET, it means that the
extension changes are stale and they must be ignored. For example:

-  ``dovecot.index.cache`` file's ``file_seq`` header is used as a
   ``reset_id``. Initially it's 1.

-  Process A: Begins a cache transaction, updating some fields in it.

-  Process B: Decides to compress the cache file, and issues a
   ``reset_id = 2`` change.

-  Process A: Commits the transaction with ``reset_id = 1``, but the
   cache file offsets point to the old file, so the changes must be
   ignored.

``hdr_size`` specifies the number of bytes the extension wants to have
in the index file's header. ``record_size`` specifies the number of
bytes it wants to use for each record. The sizes may grow or shrink any
time. ``record_align`` contains the required alignmentation for the
field. For example if the extension contains a 32bit integer, you want
it to be 32bit aligned so that the process won't crash in CPUs which
require proper alignmentation. Then again if you want to access the
field as 4 bytes, the alignmentation can be 1.

Extension record updates typically are message-specific, so the changes
must be done for each message separately:

::

   struct mail_transaction_ext_rec_update {
           uint32_t uid;
           /* unsigned char data[]; */
   };
