.. _lib-storage_mailbox_sync:

=======================
Mailbox Synchronization
=======================

The idea behind synchronization is to find out what changes other
sessions have done to the mailbox and to finalize our own changes to the
mailbox.

For example if you expunge a message in a transaction and commit it, the
commit will only write a "please expunge UID n" record to Dovecot's
transaction log file. The message still exists on the disk. The next
time Dovecot syncs the mailbox (either the session that wrote the record
or another one), it goes through all the non-synchronized records in
transaction log and applies the requested changes to the backend
mailbox. Syncing can be a bit heavyweight operation, so it's possible to
commit multiple transactions and perform a single sync for all of them.
Dovecot attempts to do this with IMAP protocol when pipelining commands.

The other important job of syncing is to refresh mailbox's state:

-  Finding out about external modifications to mailbox (e.g. a new mail
   delivered to Maildir/new/).

-  Updating in-memory view of what messages exist, what their flags are,
   etc.

When a mailbox is opened, its state starts with what index files contain
at the time. Since the backend mailbox may have already changed, and
syncing an up-to-date mailbox is usually really cheap, there isn't much
point in not syncing mailbox immediately after opening. The mailbox
state stays the same until you synchronize the mailbox again, before
that no new messages show up and no messages get expunged.

Typically you would sync the mailbox

-  after committing a transaction that modifies backend mailbox in any
   way (instead of just internal index data), such as after changing
   message flags or expunging a message.

-  whenever you want to find out if there are any changes. With IMAP
   protocol this is done every time after running a command.

Initializing
------------

``mailbox_sync_init()`` initializes syncing.

There are some flags that control how much effort is spent on syncing:

-  ``MAILBOX_SYNC_FLAG_FAST`` can be given when you're ready for mailbox
   to be refreshed, but don't care much if it actually is or not. When
   this flag is set, Dovecot still notices all internal changes, but
   external changes are checked only once every few seconds or so.

-  ``MAILBOX_SYNC_FLAG_FULL_READ`` is mainly useful with mboxes. If
   ``mbox_dirty_syncs=yes`` and a new mail gets appended to mbox by an
   external program, Dovecot assumes that the only change was the added
   mail, even though the program may have also modified existing
   messages' flags by rewriting Status: headers. If
   ``mbox_very_dirty_syncs=no``, these changes are noticed after the
   next time mailbox is opened. So when this flag is enabled, it means
   Dovecot should try harder to find out if there were any external
   unexpected changes. It's currently used only with IMAP SELECT and
   CHECK commands and POP3 startup. Probably unnecessary elsewhere.

-  ``MAILBOX_SYNC_FLAG_FULL_WRITE`` is again mainly useful with mboxes.
   If ``mbox_lazy_writes=no``, Dovecot delays writing flag changes to
   mbox file until mailbox is closed or IMAP CHECK command is issued.
   Using this elsewhere is probably unnecessary, except as an
   optimization if mailbox is in any case synced just before closing it,
   you might as well give this flag to it to avoid double-syncing with
   mbox.

-  ``MAILBOX_SYNC_FLAG_FORCE_RESYNC`` is used to force resyncing
   indexes. The only time this should be done is when manually triggered
   by administrator.

Then there are also other syncing flags:

-  ``MAILBOX_SYNC_FLAG_NO_EXPUNGES``: No expunged messages are removed
   from the in-memory mailbox view. Their removal is delayed until
   syncing is done without this flag. Attempting to access the expunged
   messages may or may not work, depending on what information is
   accessed and what storage backend is used.

-  ``MAILBOX_SYNC_FLAG_FIX_INCONSISTENT``: Normally when the internal
   mailbox state can't be consistently updated (typically due to index
   file corruption), the syncing fails. When this flag is set, it means
   that the caller doesn't care about mailbox's previous state and just
   wants to get it accessible again. Typically this is used when the
   mailbox is being opened, but not afterwards.

-  ``MAILBOX_SYNC_FLAG_EXPUNGE`` is mainly intended for virtual plugin
   with IMAP protocol. You probably shouldn't use it.

Reading changes
---------------

While ``mailbox_sync_next()`` returns TRUE, it fills out sync record:

-  seq1, seq2: Message sequence numbers that were affected

-  type: expunge, flag change or modseq change.

Expunge records don't immediately change the view's sequence numbers.
After seeing an expunge record you can still fetch the expunged
messages' flags and possibly other information. Only after syncing is
deinitialized, the sequences change.

Message flag change records don't actually show what the changes were.
You can find the new flags just by fetching them (``mail_get_flags()``,
etc.), they're available immediately. You'll need to create a
`transaction <lib-storage_mailbox_transactions>`__ and a
`mail <lib-storage_mail>`__ for that. For example:

.. code-block:: C

   sync_ctx = mailbox_sync_init(box, flags);
   trans = mailbox_transaction_begin(box, 0);
   mail = mail_alloc(trans, MAIL_FETCH_FLAGS, 0);

If you don't actually care about sync records, you don't necessarily
have to even call ``mailbox_sync_next()``. In that case it's actually
easiest to perform the whole sync using a one-step ``mailbox_sync()``
function. This function also sets ``MAILBOX_SYNC_FLAG_FIX_INCONSISTENT``
flag automatically.

Deinitializing
--------------

``mailbox_sync_deinit()`` finalizes the syncing. If any errors occurred
during sync, it'll return -1.

If ``MAILBOX_SYNC_FLAG_NO_EXPUNGES`` was used and some expunges were
actually delayed, ``status_r->sync_delayed_expunges`` is set to TRUE.

Implementing sync for a storage backend
---------------------------------------

FIXME: talk about mail_index_sync_*() and how to change stuff and how to
update internal state.
