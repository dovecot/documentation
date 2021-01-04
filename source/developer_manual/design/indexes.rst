.. _dovecot_index_files:

=====================
Dovecot's index files
=====================

Dovecot's index files consist of three different files:

-  :ref:`Main index file <dovecot_main_index>` (``dovecot.index``)

-  :ref:`Transaction log <dovecot_transaction_log>` (``dovecot.index.log`` and ``dovecot.index.log.2``)

-  :ref:`Cache file <dovecot_cache>` (``dovecot.index.cache``)

See :ref:`Index Files <dovecot_index_files_2>`
for more generic information about what they contain and why.

The index files can be accessed using :ref:`mail-index.h API <dovecot_mail_index_api>`.

Locking
-------

The index files are designed so that readers cannot block a writer, and
write locks are always short enough not to cause other processes to wait
too long. Dovecot v0.99's index files didn't do this, and it was common
to get lock timeouts when using multiple connections to the same large
mailbox.

The main index file is the only file which has read locks. They can
however block the writer only for two seconds (and even this could be
changed to not block at all). The writes are locked only for the
duration of the mailbox synchronization.

Transaction logs don't require read locks. The writing is locked for the
duration of the mailbox synchronization, and also for single transaction
appends.

Cache files doesn't require read locks. They're locked for writing only
for the duration of allocating space inside the file. The actual writing
inside the allocated space is done without any locks being held.

In future these could be improved even further. For example there's no
need to keep any index files locked while synchronizing, as long the
mailbox backend takes care of the locking issues. Also writing to
transaction log could work in a similar way to cache files: Lock,
allocate space, unlock, write.


.. _locklessint:

Lockless integers
-----------------

Dovecot uses several different techniques to allow reading files without
locking them. One of them uses fields in a "lockless integer" format.
Initially these fields have "unset" value. They can be set to a wanted
value in range :math:`0..2^{28}` (with 32bit fields) once, but they cannot
be changed. It would be possible to set them back to "unset", but
setting them the second time isn't safe anymore, so Dovecot never does
this.

The lockless integers work by allocating one bit from each byte of the
value to "this value is set" flag. The reader then verifies that the
flag is set for the value's all bytes. If all of them aren't set, the
value is still "unset". Dovecot uses the highest bit for this flag. So
for example:

-  ``0x00000000``: The value is unset

-  ``0xFFFF7FFF``: The value is unset, because one of the bytes didn't have
   the highest bit set

-  ``0xFFFFFFFF``: The value is :math:`2^{28}-1`

-  ``0x80808080``: The value is ``0``

-  ``0x80808180``: The value is ``0x80``

Dovecot contains ``mail_index_uint32_to_offset()`` and
``mail_index_offset_to_uint32()`` functions to translate values between
integers and lockless integers. The "unset" value is returned as 0, so
it's not possible to differentiate between "unset" and "set" 0 values.
