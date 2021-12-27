.. _lib-storage_mailbox:

=======
Mailbox
=======

``src/lib-storage/mail-storage.h`` and ``mail-storage-private.h``
describes mailbox API, among others. Mailbox life cycle often goes like:

-  ``mailbox_alloc()`` allocates memory for the mailbox and initializes
   some internal settings, but doesn't actually try to open it.

-  ``mailbox_open()`` opens the mailbox. Instead of opening a mailbox,
   you can also create it with ``mailbox_create()``.

   -  If you're immediately syncing the mailbox, you don't need to open
      it, because it's done implicitly. This reduces your code and error
      handling a bit.

-  ``mailbox_close()`` closes the mailbox, so that it needs to be opened
   again if it's wanted to be accessed. This is rarely needed.

-  ``mailbox_free()`` closes and frees the mailbox.

There are a lot of functions to deal with mailboxes. The most important
ones are:

-  ``mailbox_get_status()`` to get a summary of mailbox, such as number
   of messages in it.

-  ``mailbox_get_metadata()`` to various kinds of metadata of a mailbox,
   such as the sum of the message sizes inside the mailbox.

-  :ref:`Syncing <lib-storage_mailbox_sync>`:
   ``mailbox_sync_*()`` to synchronize changes from the backend to
   memory.

-  :ref:`Transactions <lib-storage_mailbox_transactions>`:
   ``mailbox_transaction_*()`` for transaction handling. All message
   reads and writes are done in a transaction.

-  :ref:`Searching <lib-storage_mailbox_searching>`:
   ``mailbox_search_*()`` is used for searching messages. Even simple
   operations like "get all messages" go through this API by creating a
   "search all" query.

-  :ref:`Saving <lib-storage_mailbox_saving>`:
   ``mailbox_save_*()`` and ``mailbox_copy()`` is used for
   saving/copying new messages to mailbox.
