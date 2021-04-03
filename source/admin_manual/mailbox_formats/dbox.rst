.. _dbox_mbox_format:

===================
dbox Mailbox Format
===================

dbox is Dovecot's own high-performance mailbox format. The original version
was introduced in v1.0 alpha4, but since then it has been completely
redesigned in v1.1 series and improved even further in v2.0.

For information on how to configure dbox in Dovecot, see
:ref:`dbox_settings`.

Usage
^^^^^

dbox can be used in two ways:

1. **single-dbox** (``sdbox`` in
   :ref:`mail location <mail_location_settings>`): One message per file,
   similar to :ref:`Maildir <maildir_mbox_format>`. For backwards
   compatibility, ``dbox`` is an alias to ``sdbox`` in
   :ref:`mail location <mail_location_settings>`.
2. **multi-dbox** (``mdbox`` in
   :ref:`mail location <mail_location_settings>`): Multiple messages per file,
   but unlike :ref:`mbox <mbox_mbox_format>` stores multiple files per
   mailbox.

One of the main reasons for dbox's high performance is that it uses Dovecot's
index files as the only storage for message flags and keywords, so the
indexes don't have to be "synchronized". Dovecot trusts that they're always
up-to-date (unless it sees that something is clearly broken). This also means
that **you must not lose the dbox index files, as they can't be regenerated
without data loss**.

dbox has a feature for transparently moving message data to an alternate
storage area. See :ref:`dbox_settings_alt_storage`.

dbox storage is extensible. Single instance attachment storage was already
implemented as such extension.

Layout
^^^^^^

By default, the dbox filesystem layout is as follows.

Data which isn't the actual message content is stored in a layout common to
both ``sdbox`` and ``mdbox``.

In these tables ``<root>`` is shorthand for the mail location root directory
on the filesystem.

Index files can be stored in a different location by using the ``INDEX``
parameter in the mail location specification. If the ``INDEX``
parameter is specified, it will override the mail location root for index files
and the "map index" file (``mdbox only``).

====================================================== =========================
Location                                               Description
====================================================== =========================
``<root>/mailboxes/INBOX/dbox-Mails/dovecot.index*``   Index files for INBOX
``<root>/mailboxes/foo/dbox-Mails/dovecot.index*``     Index files for mailbox
                                                       "foo"
``<root>/mailboxes/foo/bar/dbox-Mails/dovecot.index*`` Index files for mailbox
                                                       "foo/bar"
``<root>/dovecot.mailbox.log*``                        Mailbox changelog
``<root>/subscriptions``                               Subscribed mailboxes
                                                       list
``<root>/dovecot-uidvalidity*``                        IMAP UID validity
====================================================== =========================

Note that with dbox the Index files contain significant data which is held
nowhere else. Index files for both ``sdbox`` and ``mdbox`` contain message
flags and keywords. For ``mdbox``, the index file also contains the map_uids
which link (via the "map index") to the actual message data. This data cannot
be automatically recreated, so it is important that Index files are treated
with the same care as message data files.

Actual message content is stored differently depending on whether it is
``sdbox`` or ``mdbox``.

For ``sdbox``:

=========================================== ====================================
Location                                    Description
=========================================== ====================================
``<root>/mailboxes/INBOX/dbox-Mails/u.*``   Numbered files (``u.1``, ``u.2``,
                                            ...) each containing one message of
                                            INBOX
``<root>/mailboxes/foo/dbox-Mails/u.*``     Files each containing one message
                                            for mailbox "foo"
``<root>/mailboxes/foo/bar/dbox-Mails/u.*`` Files each containing one message
                                            for mailbox "foo/bar"
=========================================== ====================================

For ``mdbox``:

===================================== ==========================================
Location                              Description
===================================== ==========================================
``<root>/storage/dovecot.map.index*`` "Map index" containing a record for each
                                      message stored
``<root>/storage/m.*``                Numbered files (``u.1``, ``u.2``, ...)
                                      each containing one or multiple messages
===================================== ==========================================

mdbox (Multi-dbox)
^^^^^^^^^^^^^^^^^^

The directory layout (under ``~/mdbox/``) is:

====================== =========================================================
Location               Description
====================== =========================================================
``~/mdbox/storage/``   The mail data for all mailboxes
``~/mdbox/mailboxes/`` Directories for mailboxes and their index files
====================== =========================================================

The ``storage`` directory has files:

====================== =========================================================
File                   Description
====================== =========================================================
``dovecot.map.index*`` The "map index"
``m.*``                Mail data. Each m.* file contains one or more messages.
                       :ref:`setting-mdbox_rotate_size` can be used to
                       configure how large the files can grow.
====================== =========================================================

The "map index" contains a record for each message:

======== =======================================================================
Key      Description
======== =======================================================================
map_uid  Unique growing 32 bit number for the message.
refcount 16 bit reference counter for this message. Each time the message is
         copied the refcount is increased.
file_id  File number containing the message. For example if file_id=5, the
         message is in file ``m.5``.
offset   Offset to message within the file.
size     Space used by the message in the file, including all metadata.
======== =======================================================================

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

The purging can be invoked explicitly running `doveadm purge`_.

There are several safety features built into dbox to avoid losing messages or
their state if map index or mailbox index gets corrupted:

* Each message has a 128 bit globally unique identifier (GUID). The GUID is
  saved to message metadata in ``m.*`` files and also to mailbox indexes. This
  allows Dovecot to find messages even if map index gets corrupted.
* Whenever index file is rewritten, the old index is renamed to
  ``dovecot.index.backup``. If the main index becomes corrupted, this backup
  index is used to restore flags and figure out what messages belong to the
  mailbox.
* Initial mailbox where message was saved to is stored in the message
  metadata in ``m.*`` files. So if all indexes get lost, the messages are put
  to their initial mailboxes. This is better than placing everything into a
  single mailbox.

.. _`doveadm purge`: https://wiki.dovecot.org/Tools/Doveadm/Purge

.. _dbox_mbox_format_alt_storage:

Alternate Storage
^^^^^^^^^^^^^^^^^

Unlike Maildir, with dbox the message file names don't change. This makes it
possible to support storing files in multiple directories or mount points.
dbox supports looking up files from "altpath" if they're not found from the
primary path. This means that it's possible to move older mails that are
rarely accessed to cheaper (slower) storage.

To enable this functionality, use the ``ALT`` parameter in the
:ref:`mail location <setting-mail_location>`.
See :ref:`alternate storage configuration <dbox_settings_alt_storage>`.

When messages are moved from primary storage to alternate storage, only the
actual message data (stored in files ``u.*`` under ``sdbox`` and ``m.*``
under ``mdbox``) is moved to alternate storage; everything else remains in
the primary storage.

Message data can be moved from primary storage to alternate storage using
`doveadm altmove`_. (In theory you could also do this with some combination
of cp/mv, but better not to go there unless you really need to. The updates
must be atomic in any case, so cp won't work.)

The granularity at which data is moved to alternate storage is individual
messages. This is true even for ``mdbox`` when multiple messages are stored
in a single ``m.*`` storage file. If individual messages from an ``m.*``
storage file need to be moved to alternate storage, the message data is
written out to a different ``m.*`` storage file (either new or existing) in
the alternate storage area and the "map index" updated accordingly.

Alternate storage is completely transparent at the IMAP/POP level. Users
accessing mail through IMAP or POP cannot normally tell if any given message
is stored in primary storage or alternate storage. Conceivably users might be
able to measure a performance difference; the point is that there is no
IMAP/POP command which could be used to expose this information. It is
entirely possible to have a mail folder which contains a mix of messages
stored in primary storage and alternate storage.

.. _`doveadm altmove`: https://wiki.dovecot.org/Tools/Doveadm/Altmove

dbox and Mail Header Metadata
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Unlike when using :ref:`mbox <mbox_mbox_format>` as
:ref:`mailbox format <mailbox_formats>`, where mail headers (for example
``Status``, ``X-UID``, etc.) are used to determine and store metadata, the
mail headers within dbox files are (usually) **not** used for this purpose by
Dovecot; neither when mails are created/moved/etc. via IMAP nor when dboxes
are placed (e.g. copied or moved in the filesystem) in a mail location (and
then "imported" by Dovecot).

Therefore, it is (usually) **not** necessary, to strip any such mail headers
at the MTA, MDA or LDA (as it is recommended with
:ref:`mbox <mbox_mbox_format>`).

There is one exception: when
:ref:`pop3_reuse_xuidl = yes <setting-pop3_reuse_xuidl>` (which is deprecated).
In this case, the ``X-UIDL`` header is used for the POP3 UIDLs. Therefore,
in this case it is recommended to strip the ``X-UIDL`` mail headers
*case-insensitively* at the MTA, MDA or LDA.

Accessing Expunged Mails with mdbox
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

``mdbox_deleted`` storage can be used to access mdbox's all mails that are
completely deleted (reference count = 0). The ``mdbox_deleted`` parameters
should otherwise be exactly the same as ``mdbox``'s. Then you can use
e.g. `doveadm fetch`_ or `doveadm import`_ commands to access the mails.

For example:

.. code-block:: none

  # If you have mail_location=mdbox:~/mdbox:INDEX=/var/index/%u
  doveadm import mdbox_deleted:~/mdbox:INDEX=/var/index/%u "" subject oops

This finds a deleted mail with subject "oops" and imports it into INBOX.

.. _`doveadm fetch`: https://wiki.dovecot.org/Tools/Doveadm/Fetch
.. _`doveadm import`: https://wiki.dovecot.org/Tools/Doveadm/Import

Mail Delivery
^^^^^^^^^^^^^

Some MTA configurations have the MTA directly dropping mail into Maildirs or
mboxes. Since most MTAs don't understand the dbox format, this option is not
available. Instead, the MTA should use :ref:`LMTP <lmtp_server>` or
:ref:`lda`.
