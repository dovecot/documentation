.. _mbox_mbox_format:

===================
Mbox Mailbox Format
===================

For information on how to configure mbox in Dovecot, see :ref:`mbox_settings`.

.. warning::

  Mbox format is deprecated and should not be used in production setups at all.

  Mbox is no longer being maintained for write fixes, for any new or advanced
  features, nor for optimization improvements.

  It still exists solely to read old mail storages, and for backwards utility
  purposes (specifically for archival purposes, as mbox allows multiple
  messages to be natively stored in a single file).

  In a production system, a more modern mailbox format should be used, e.g.,
  :ref:`dbox_mbox_format` (or :ref:`maildir_mbox_format`).

Overview
^^^^^^^^

Usually UNIX systems are configured by default to deliver mails to
``/var/mail/username`` or ``/var/spool/mail/username`` mboxes. In the IMAP
world, these files are called INBOX mailboxes. IMAP protocol supports multiple
mailboxes , so there needs to be a place for them as well. Typically they're
stored in ``~/mail/`` or ``~/Mail/`` directories.

The mbox file contains all the messages of a single mailbox. Because of this,
the mbox format is typically thought of as a slow format. However with
Dovecot's indexing this isn't true. Only expunging messages from the
beginning of a large mbox file is slow with Dovecot, most other operations
should be fast. Also because all the mails are in a single file, searching
is much faster than with :ref:`maildir_mbox_format`.

Modifications to mbox may require moving data around within the file, so
interruptions (eg. power failures) can cause the mbox to break more or less
badly. Although Dovecot tries to minimize the damage by moving the data in a
way that data should never get lost (only duplicated), mboxes still aren't
recommended to be used for important data.

History
^^^^^^^

The history of mbox format, and a discussion of its historical use and
generally agreed-upon conventions, can be found in `RFC 4155`_.

Additionally, the `mbox Wikipedia`_ page also is a good resource.

.. _`RFC 4155`: https://tools.ietf.org/html/rfc4155
.. _`mbox Wikipedia`: https://en.wikipedia.org/wiki/Mbox

.. _mbox_mbox_format_locking:

Locking
^^^^^^^

Locking is a mess with mboxes. There are multiple different ways to lock a
mbox, and software often uses incompatible locking. See :ref:`mbox_locking`
for how to check what locking methods some commonly used programs use.

There are at least four different ways to lock a mbox:

=========== ====================================================================
Method      Description
=========== ====================================================================
**dotlock** ``mailboxname.lock`` file created by almost all software when
            writing to mboxes. This grants the writer an exclusive lock over
            the mbox, so it's usually not used while reading the mbox so that
            other processes can also read it at the same time. So while using
            a dotlock typically prevents actual mailbox corruption, it doesn't
            protect against read errors if mailbox is modified while a process
            is reading.

**flock**   ``flock()`` system call is quite commonly used for both read and
            write locking. The read lock allows multiple processes to obtain a
            read lock for the mbox, so it works well for reading as well. The
            downside is that it doesn't work if mailboxes are stored in NFS.

**fcntl**   Very similar to flock, also commonly used by software. In some
            systems this ``fcntl()`` system call is compatible with
            ``flock()``, but in other systems it's not, so you shouldn't rely
            on it. fcntl works with NFS if you're using lockd daemon in both
            NFS server and client.

**lockf**   POSIX ``lockf()`` locking. Because it allows creating only
            exclusive locks, it's somewhat useless so Dovecot doesn't support
            it. With Linux ``lockf()`` is internally compatible with
            ``fcntl()`` locks, but again you shouldn't rely on this.
=========== ====================================================================

Dotlock
^^^^^^^

Another problem with dotlocks is that if the mailboxes exist in
``/var/mail/``, the user may not have write access to the directory, so the
dotlock file can't be created. There are a couple of ways to work around this:

* Give a mail group write access to the directory and then make sure that all
  software requiring access to the directory runs with the group's privileges.
  This may mean making the binary itself setgid-mail, or using a separate
  dotlock helper program which is setgid-mail. With Dovecot this can be done
  by setting
  :dovecot_core:ref:`mail_privileged_group = mail <mail_privileged_group>`.

* Set sticky bit to the directory (``chmod +t /var/mail``). This makes it
  somewhat safe to use, because users can't delete each others mailboxes, but
  they can still create new files (the dotlock files). The downside to this is
  that users can create whatever files they wish in there, such as a mbox for
  newly created user who hadn't yet received mail.

Deadlocks
^^^^^^^^^

If multiple lock methods are used, which is usually the case since dotlocks
aren't typically used for read locking, the order in which the locking is done
is important. Consider if two programs were running at the same time, both use
dotlock and fcntl locking but in different order:

* Program A: fcntl locks the mbox
* Program B at the same time: dotlocks the mbox
* Program A continues: tries to dotlock the mbox, but since it's already
  dotlocked by B, it starts waiting
* Program B continues: tries to fcntl lock the mbox, but since it's already
  fcntl locked by A, it starts waiting

Now both of them are waiting for each others locks. Finally after a couple of
minutes they time out and fail the operation.

Directory Structure
^^^^^^^^^^^^^^^^^^^

By default, when listing mailboxes, Dovecot simply assumes that all files it
sees are mboxes and all directories mean that they contain sub-mailboxes.
There are two special cases however which aren't listed:

* ``.subscriptions`` file contains IMAP's mailbox subscriptions.
* ``.imap/`` directory contains Dovecot's index files.

Because it's not possible to have a file which is also a directory, it's not
normally possible to create a mailbox and child mailboxes under it.

However if you really want to be able to have mailboxes containing both
messages and child mailboxes under mbox, then Dovecot can be configured to do
this, subject to certain provisos; see :ref:`mbox_child_folders`.

Dovecot's Metadata
^^^^^^^^^^^^^^^^^^

Dovecot uses c-Client (ie. UW-IMAP, Pine) compatible headers in mbox messages
to store metadata. These headers are:

============== =================================================================
Header         Description
============== =================================================================
X-IMAPbase     Contains UIDVALIDITY, last used UID, and list of used keywords
X-IMAP         Same as X-IMAPbase but also specifies that the message is a
               "pseudo-message"
X-UID          Message's allocated UID
Status         **R** (\Seen) and **O** (non-\Recent) flags
X-Status       **A** (\Answered), **F** (\Flagged), **T** (\Draft), and **D**
               (\Deleted) flags
X-Keywords     Message's keywords
Content-Length Length of the message body in bytes
============== =================================================================

Whenever any of these headers exist, Dovecot treats them as its own private
metadata. It does sanity checks for them, so the headers may also be modified
or removed completely. None of these headers are sent to IMAP/POP3 clients
when they read the mail.

**The MTA, MDA or LDA should strip all these headers case-insensitively before
writing the mail to the mbox.**

Only the first message contains the X-IMAP or X-IMAPbase header. The
difference is that when all the messages are deleted from mbox file, a pseudo
message is written to the mbox which contains X-IMAP header.

This is the ``DON'T DELETE THIS MESSAGE -- FOLDER INTERNAL DATA`` message
which you hate seeing when using non-C-client and non-Dovecot software. This
is however important to prevent abuse, otherwise the first mail which is
received could contain faked X-IMAPbase header which could cause trouble.

If message contains X-Keywords header, it contains a space-separated list of
keywords for the mail. Since the same header can come from the mail's sender,
only the keywords are listed in X-IMAP header are used.

The UID for a new message is calculated from last used UID in X-IMAP header +
1. This is done always, so fake X-UID headers don't really matter. This is
also why the pseudo-message is important. Otherwise the UIDs could easily
grow over 231 which some clients start treating as negative numbers, which
then cause all kinds of problems. Also when 232 is exceeded, Dovecot will also
start having some problems.

Content-Length is used as long as another valid mail starts after that many
bytes. Because the byte count must be exact, it's quite unlikely that
abusing it can cause messages to be skipped (or rather appended to the
previous message's body).

Status and X-Status headers are trusted completely, so it's pretty good idea
to filter them in LDA if possible.

Dovecot's Speed Optimizations
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Updating messages' flags and keywords can be a slow operation since you may
have to insert a new header (Status, X-Status, X-Keywords) or at least insert
data in the header's value. Some mbox MUAs do this simply by rewriting all of
the mbox after the inserted data. If the mbox is large, this can be very slow.
Dovecot optimizes this by always leaving some space characters after some of
its internal headers. It can use this space to move only minimal amount of
data necessary to get the necessary data inserted. Also if data is removed, it
just grows these spaces areas.

There are several configuration options that can be used that will affect
optimization:

* :dovecot_core:ref:`mbox_dirty_syncs`
* :dovecot_core:ref:`mbox_lazy_writes`
* :dovecot_core:ref:`mbox_very_dirty_syncs`

From Escaping
^^^^^^^^^^^^^

In mboxes a new mail always begins with a "From " line, commonly referred to
as ``From_``-line. To avoid confusion, lines beginning with "From " in message
bodies are usually prefixed with '>' character while the message is being
written to in mbox.

Dovecot doesn't currently do this escaping however. Instead it prevents this
confusion by adding Content-Length headers so it knows later where the next
message begins. Dovecot also doesn't remove the '>' characters before
sending the data to clients.

Mbox Variants
^^^^^^^^^^^^^

There are a few minor variants of this format:

=========== ====================================================================
Name        Description
=========== ====================================================================
**mboxo**   An original mbox format originated with Unix System V. Messages are
            stored in a single file, with each message beginning with a line
            containing "From SENDER DATE". If "From " (case-sensitive, with
            the space) occurs at the beginning of a line anywhere in the
            email, it is escaped with a greater-than sign (to ">From ").
            Lines already quoted as such, for example ">From " or ">>>From "
            are not quoted again, which leads to irrecoverable corruption of
            the message content.

**mboxrd**  Named for Raul Dhesi in June 1995, though several people came up
            with the same idea around the same time. An issue with the mboxo
            format was that if the text ">From " appeared in the body of an
            email (such as from a reply quote), it was not possible to
            distinguish this from the mailbox format's quoted ">From ".
            mboxrd fixes this by always quoting already quoted "From " lines
            (e.g. ">From ", ">>From ", ">>>From ", etc.) as well, so readers
            can just remove the first ">" character. This format is used by
            qmail and getmail (>=4.35.0).

**mboxcl**  Originated with Unix System V Release 4 mail tools. It adds a
            Content-Length field which indicates the number of bytes in the
            message. This is used to determine message boundaries. It still
            quotes "From " as the original mboxo format does (and not as
            mboxrd does it).

**mboxcl2** Like mboxcl but does away with the "From " quoting. Dovecot uses
            this format internally.

**MMDF**    (Multi-channel Memorandum Distribution Facility mailbox format)
            originated with the MMDF daemon. The format surrounds each
            message with lines containing four control-A's. This eliminates
            the need to escape From: lines.
=========== ====================================================================

How a message is read stored in mbox extension
----------------------------------------------

* An email client reader scans throughout mbox file looking for ``From_``
  lines.
* Any ``From_`` line marks the beginning of a message.
* Once the reader finds a message, it extracts a (possibly corrupted) envelope
  sender and delivery date out of the ``From_`` line.
* It then reads until the next ``From_`` line or scans till the end of file,
  whenever ``From_`` comes first.
* It removes the last blank line and deletes the quoting of ``>From_`` lines
  and ``>>From_`` lines and so on.
