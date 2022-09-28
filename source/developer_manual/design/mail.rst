.. _lib-storage_mail:

====
Mail
====

Mail is first allocated with ``mail_alloc()``. Mails always belong to a
:ref:`transaction <lib-storage_mailbox_transactions>`.
Even if mail is treated read-only, Dovecot might write data to cache
file, so whenever possible, mail transactions should be committed. When
mail is allocated, you can specify a list of fields and headers that
you're (most likely) going to need. This allows Dovecot to optimize the
later ``mail_get_*()`` lookups so that it doesn't need to parse the
message multiple times. These fields are also added to cache file, so
you shouldn't list fields unless you're fairly certain you need them.

Usually the mails are created and returned by ``mailbox_search_*()``
functions. This is preferable even if you're doing a simple search, such
as "all mails". Using the search API allows the internal implementation to
prefetch mails, which can reduce latency. Alternatively you can use
``mail_set_seq()`` and ``mail_set_uid()`` to jump between mails, but this
prevents prefetching.

Getting data
------------

Some of the mail fields can be accessed directly:

``box``
   Mail's mailbox, same as the transaction's.

``transaction``
   Mail's transaction, the same that was given to ``mail_alloc()``.

``seq``
   Currently selected message's sequence number.

``uid``
   Currently selected message's UID.

``expunged``
   We already detected that the message is expunged and
   can't be accessed. This may also be set (and looked up) later when
   some ``mail_get_*()`` function fails.

``has_nuls``, ``has_no_nuls``
   Message body is known to (not) have NUL characters.

The final field is ``lookup_abort``, which is write-only. Normally when
doing a ``mail_get_*()`` operation for a field that isn't in a cache,
the field is generated and added to cache. If you don't want this, but
instead have figured out some better optimized way to do non-cached
lookups, you can change this field so that ``mail_get_*()`` lookups fail
instead with ``MAIL_ERROR_LOOKUP_ABORTED``. This is primarily used by
searching code internally.

``MAIL_LOOKUP_ABORT_NEVER``
   The default - do whatever it takes to return the value.

``MAIL_LOOKUP_ABORT_READ_MAIL``
   If returning the value would require reading message headers/body, abort.

``MAIL_LOOKUP_ABORT_NOT_IN_CACHE``:
   If the value isn't already in
   cache, abort. For example if looking up message's physical size would
   require ``stat()``\ ing the file this wouldn't be done.

Most of the ``mail_get_*()`` should be fairly obvious in how they work.
Only functions returning int can fail, others don't.

-  Keywords can be looked up either by getting an array of keyword
   strings or keyword indexes. The index lookups are slightly faster.
   Keyword indexes can be converted to strings by using the
   ``mailbox_status.keywords`` array returned by ``mailbox_get_status()``.

-  ``mail_get_first_header()`` returns 0 if header wasn't found, 1 if it
   was.

-  ``mail_get_special()`` can return various special fields. If a
   special isn't implemented by some backend, the call returns success
   and sets the value to empty string.

-  ``mail_get_stream()`` returns an input stream that can be used to
   access the mail. If this function is called multiple times, each call
   seeks the stream to beginning. Don't unreference the stream, it's
   destroyed automatically.

   -  Typically the input contains the raw data in disk, lines may end
      with LF or CRLF depending on how they're on disk.

   -  mbox drops Dovecot's internal headers from the stream (X-UID:,
      Status:, etc.).

   -  Plugins (e.g. :ref:`plugin-mail-compress`) can also hook into this call
      and modify the input stream.

Sometimes you might notice that some looked up field is actually
corrupted. For example you might notice that input stream returns EOF
earlier than previous ``mail_get_physical_size()`` said. This might have
been caused by various different things, but in any case all you can
really do then is to just call ``mail_set_cache_corrupted()`` and try
again.

Changing metadata
-----------------

Some of the messages' metadata can be updated:

-  ``mail_update_flags()`` and ``mail_update_keywords()`` changes
   flags/keywords.

   -  Usually you should set ``modify_type`` parameter to ``MODIFY_ADD``
      or ``MODIFY_REMOVE``, instead of replacing all the flags. That
      allows concurrent flag updates not to overwrite each others
      changes.

-  ``mail_expunge()`` expunges a message.

Other functions are mainly intended for mailbox replication or restoring
an existing mailbox (e.g. dsync):

-  ``mail_update_modseq()`` and ``mail_update_pvt_modseq()`` can be used to
   increase the message's shared/private modseq.

-  ``mail_update_pop3_uidl()`` can be used to give a specific POP3 UIDL
   for the message. This is used internally when ``pop3_save_uidl=yes``.

Other metadata can't be changed. IMAP protocol requires that messages
are immutable, so it's not possible to change a message's received date,
headers or body. If you wish to modify any of them, you need to create a
new message and expunge the old one.
