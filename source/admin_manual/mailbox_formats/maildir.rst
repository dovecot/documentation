.. _maildir_mbox_format:

======================
Maildir Mailbox Format
======================

The Maildir format debuted with the qmail server in the mid-1990s. Each
mailbox folder is a directory and each message a file. This improves
efficiency because individual emails can be modified, deleted and added
without affecting the mailbox or other emails, and makes it safer to use on
networked file systems such as NFS.

For information on how to configure Maildir in Dovecot, see
:ref:`maildir_settings`.

.. Note::

   The Maildir mailbox format is mainly viable for smaller installations.

   It is not supported by :ref:`ox_dovecot_pro` and will be maintained on a
   best-effort basis for :ref:`Dovecot Community Edition
   <dovecot_community_repositories>`, without any prioritization of new
   features or optimizations.

Dovecot Extensions
^^^^^^^^^^^^^^^^^^

Since the `Maildir standard`_ doesn't provide everything needed to fully
support the IMAP protocol, Dovecot had to create some of its own non-standard
extensions. The extensions still keep the Maildir standards compliant, so MUAs
not supporting the extensions can still safely use it as a normal Maildir.

.. _`Maildir standard`: https://cr.yp.to/proto/maildir.html

IMAP UID mapping
----------------

IMAP requires each message to have a permanent unique ID number. Dovecot uses
the ``dovecot-uidlist`` file to keep UID <-> filename mapping. The file is
basically in the same format as Courier IMAP's ``courierimapuiddb`` file,
except for one difference (see below).

The file begins with a header:

.. code-block:: none

  3 V1275660208 N25022 G3085f01b7f11094c501100008c4a11c1

* 3 is the file format version number used by Dovecot v1.1+
* 1275660208 is the IMAP UIDVALIDITY
* 25022 is the UID that will be given to the next added message
* 3085f01b7f11094c501100008c4a11c1 is the 128 bit mailbox global UID in hex
* There may be other fields, and the order of these fields isn't important

Version 1 file format is compatible with Courier. Version 2 was used by a few
Dovecot non-release versions.

After the header comes the list of UID <-> filename mappings:

.. code-block:: none

  25006 :1276528487.M364837P9451.kurkku,S=1355,W=1394:2,
  25017 W2481 :1276533073.M242911P3632.kurkku:2,F

* 25006, 25017 are message UIDs
* 2481 is the second message's virtual size. First message contains it in the
  filename itself, so it's not duplicated.
* There may be more fields before ':' character
* Rest of the line after ':' is the last known filename. This filename doesn't
  necessarily exist currently, because the filename changes every time
  a message's flags change. Dovecot doesn't waste disk I/O by rewriting
  uidlist file every time flags change, but whenever it is rewritten the
  latest filenames are used. This allows Dovecot to try to guess what the
  message's current filename is and if successful, avoid having to scan the
  directory's contents.

The ``dovecot-uidlist`` file doesn't need to be locked for reading. When
writing, ``dovecot-uidlist.lock`` file needs to be created. New lines can be
appended to the end of file, but existing data must never be directly
modified; it can only be replaced with ``rename()`` system call.

``dovecot-uidlist`` is updated lazily to optimize for disk I/O. If a message
is expunged, it may not be removed from ``dovecot-uidlist`` until sometimes
later. This means that if you create a new file using the same file name as
what already exists in ``dovecot-uidlist``, Dovecot thinks you "unexpunged"
message by restoring a message from backup. This causes a warning to be logged
and the file to be renamed.

Note that messages must not be modified once they've been delivered. IMAP (and
Dovecot) requires that messages are immutable. If you wish to modify them in
any way, create a new message instead and expunge the old one.

IMAP Keywords
-------------

All the non-standard message flags are called keywords in IMAP. Some clients
use these automatically for marking spam (eg. ``$Junk``, ``$!NonJunk``,
``$Spam``, ``$!NonSpam`` keywords). Thunderbird uses labels which map to
keywords ``$Label1``, ``$Label2``, etc.

Dovecot stores keywords in the Maildir filename's flags field using letters
``a..z``. This means that only 26 keywords are possible to store in the
Maildir. If more are used, they're still stored in Dovecot's index files. The
mapping from single letters to keyword names is stored in ``dovecot-keywords``
file. The file is in format:

.. code-block:: none

  0 $Junk
  1 $NonJunk

0 means letter ``a`` in the Maildir filename, 1 means ``b``, and so on. The
file doesn't need to be locked for reading, but when writing
``dovecot-uidlist`` file must be locked. The file must not be directly
modified; it can only be replaced with ``rename()`` system call.

For example, a file named

.. code-block:: none

  1234567890.M20046P2137.mailserver,S=4542,W=4642:2,Sb

would be flagged as ``$NonJunk`` with the above keywords.

Maildir Filename Extensions
---------------------------

The standard filename definition is: ``<base filename>:2,<flags>``. Dovecot
has extended the ``<flags>`` field to be ``<flags>[,<non-standard fields>]``.
This means that if Dovecot sees a comma in the ``<flags>`` field while
updating flags in the filename, it doesn't touch anything after the comma.
However other Maildir MUAs may mess them up, so it's still not such a good
idea to do that. Basic ``<flags>`` are described in the `Maildir standard`_.
The ``<non-standard fields>`` isn't used by Dovecot for anything currently.

Dovecot supports reading a few fields from the ``<base filename>``:

* ``,S=<size>``: ``<size>`` contains the file size. Getting the size from the
  filename avoids doing a system ``stat()`` call, which may improve the
  performance. This is especially useful with :ref:`quota_backend_maildir`.
* ``,W=<vsize>``: ``<vsize>`` contains the file's RFC822.SIZE, i.e., the file
  size with linefeeds being CR+LF characters. If the message was stored with
  CR+LF linefeeds, ``<size>`` and ``<vsize>`` are the same. Setting this may
  give a small speedup because now Dovecot doesn't need to calculate the size
  itself.

A Maildir filename with those fields would look something like:

.. code-block:: none

  1035478339.27041_118.foo.org,S=1000,W=1030:2,S

Usage of Timestamps
-------------------

Timestamps of message files:

* ``mtime`` is used as `IMAP INTERNALDATE, RFC 3501 [2.3.3]`_, and must never
  change (see RFC 3501 [2.3.1.1, parenthesis 4]).
* ``ctime`` is used as Dovecot's internal "save/copy date", unless the correct
  value is found from ``dovecot.index.cache``. This is used only by external
  commands, e.g. ``doveadm expunge savedbefore``.
* ``atime`` is not used.

Timestamps of ``cur`` and ``new`` directories:

* ``mtime`` is used to detect changes of the mailbox and may force
  regeneration of `index files`_.
* ``atime`` and ``ctime`` not used.

Filename Examples
-----------------

+---------------------------------------------------------------------------------------------------+----------------------------------------------------------+
| Filename                                                                                          | Explanation                                              |
+===================================================================================================+==========================================================+
| **1491941793**.M41850P8566V0000000000000015I0000000004F3030E_0.mx1.example.com,S=10956:2,STln     | UNIX timestamp of arrival                                |
+---------------------------------------------------------------------------------------------------+----------------------------------------------------------+
| 1491941793.M41850P8566V0000000000000015I0000000004F3030E_0.mx1.example.com,\ **S=10956**\ :2,STln | Size of e-mail                                           |
+---------------------------------------------------------------------------------------------------+----------------------------------------------------------+
| 1491941793.M41850P8566V0000000000000015I0000000004F3030E_0.mx1.example.com,S=10956:2,\ **STln**   | **S** = seen (marked as read)                            |
|                                                                                                   +----------------------------------------------------------+
|                                                                                                   | **T** = trashed                                          |
|                                                                                                   +----------------------------------------------------------+
|                                                                                                   | **l** = IMAP tag #12 (0=a, 1=b, 2=c, etc) as defined in  |
|                                                                                                   | that folder's ``dovecot-keywords`` file.                 |
|                                                                                                   +----------------------------------------------------------+
|                                                                                                   | **n** = IMAP tag #14 (0=a, 1=b, 2=c, etc) as defined in  |
|                                                                                                   | that folder's ``dovecot-keywords`` file.                 |
+---------------------------------------------------------------------------------------------------+----------------------------------------------------------+

.. _`IMAP INTERNALDATE, RFC 3501 [2.3.3]`: https://tools.ietf.org/html/rfc3501#section-2.3.3
.. _`index files`: https://wiki.dovecot.org/IndexFiles

.. _`maildir_and_filesystems`:

Maildir and Filesystems
^^^^^^^^^^^^^^^^^^^^^^^

.. note::

  Information in this section is old/dated. It remains here for
  informational purposes, but it is recommended that newer filesystems
  (e.g. ext4, JFS, ZFS, btrfs, etc.) be evaluated as they may contain
  technical improvements that workaround the limitations discuss below.

General Comparisons of Maildir on Different Filesystems
-------------------------------------------------------

* https://www.thesmbexchange.com/eng/qmail_fs_benchmark.html
* https://www.htiweb.inf.br/benchmark/fsbench.htm (including some graphs)

Linux ext2 / ext3
-----------------

The main disadvantage in using these filesystems is that searching can be
slightly slower, and access to very large mailboxes (thousands of messages)
can get slow with filesystems which don't have directory indexes.

Old versions of ext2 and ext3 on Linux don't support directory indexing (to
speed up access), but newer versions of ext3 do, although you may have to
manually enable it. You can check if the indexing is already enabled with
``tune2fs``:

.. code-block:: none

  tune2fs -l /dev/hda3 | grep features

If you see ``dir_index``, you're all set. If ``dir_index`` is missing, add it
using:

.. code-block:: none

  umount /dev/hda3
  tune2fs -O dir_index /dev/hda3
  e2fsck -fD /dev/hda3
  mount /dev/hda3

XFS
---

XFS performance seems to depend on a lot of factors, also on the system and
the file system parameters.

* There are reports on the Dovecot mailing list which suggest that XFS seems
  quite a lot slower than ext3 or
  ReiserFS: https://dovecot.org/list/dovecot/2007-January/018994.html
* But then again others recommend XFS for the use with Maildir and
  Dovecot: https://dovecot.org/list/dovecot/2006-May/013216.html
* This `Linux.conf.au talk`_ about "Choosing and Tuning Linux File Systems"
  also recommends XFS for Maildir (alternatively ext3 with small blocks and
  high inodetofile ratio)
* Comparisons which suggest XFS as being best choice:

  * https://www.thesmbexchange.com/eng/qmail_fs_benchmark.html
  * https://www.htiweb.inf.br/benchmark/fsbench.htm

.. _`Linux.conf.au talk`: https://mirror.linux.org.au/pub/linux.conf.au/2007/video/talks/348.pdf

Various Tips
############

* Mounting XFS with ``logbufs=8`` option might increase the speed.
* Create the XFS partition with options
  ``-b size=1024 -d su=16k,sw=3 -l logdev=<some_other_device>``
  (Source: https://www.thesmbexchange.com/eng/qmail_fs_benchmark.html)
* Use ``mkfs.xfs -f -l size=32768b,version=2` and `mount.xfs -o noatime,logbufs=8,logbsize=131072``
  (Source: https://www.htiweb.inf.br/benchmark/fsbench.htm)

NFS
---

NFS v3 performance can be adversely affected by readdirplus, which causes the
NFS server to ``stat()`` every file in a directory.  The solution under Linux
is to make sure the NFS filesystem is mounted with the ``nordirplus`` option.

See: https://dovecot.org/list/dovecot/2012-July/066939.html

Directory Structure
^^^^^^^^^^^^^^^^^^^

By default Dovecot uses the `Maildir++ directory layout`_ for organizing
mailbox directories. This means that all the folders are directly
inside ``~/Maildir`` directory:

* ``~/Maildir/new``, ``~/Maildir/cur`` and ``~/Maildir/tmp`` directories
  contain the messages for INBOX. The ``tmp`` directory is used during
  delivery, new messages arrive in ``new``, and read messages are moved to
  ``cur`` by the clients.
* ``~/Maildir/.folder/`` is a mailbox folder.
* ``~/Maildir/.folder.subfolder/`` is a subfolder of a folder (i.e.
  ``folder/subfolder``).

You can also optionally use the ``fs`` layout by appending ``:LAYOUT=fs`` to
:ref:`mail_location <mail_location_settings>`. This makes the folder structure
look like:

* ``~/Maildir/new``, ``~/Maildir/cur`` and ``~/Maildir/tmp`` directories
  contain the messages for INBOX, just like with Maildir++.
* ``~/Maildir/folder/`` is a mailbox folder.
* ``~/Maildir/folder/subfolder/`` is a subfolder of a folder.

.. _`Maildir++ directory layout`: https://www.courier-mta.org/imap/README.maildirquota.html

Filesystem Permissions
----------------------

See :ref:`Shared Mailboxes Permissions <admin_manual_permissions_in_shared_mailboxes>`
for how permissions are set for newly created files and directories.

Issues with the Specification
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Locking
-------

Although Maildir was designed to be lockless, Dovecot locks the Maildir while
doing modifications to it or while looking for new messages in it. This is
required because otherwise Dovecot might temporarily see mails incorrectly
deleted, which would cause trouble. Basically the problem is that if one
process modifies the Maildir (eg. a ``rename()`` to change a message's flag),
another process in the middle of listing files at the same time could skip a
file. The skipping happens because ``readdir()`` system call doesn't guarantee
that all the files are returned if the directory is modified between the calls
to it. This problem exists with all the commonly used filesystems.

Because Dovecot uses its own non-standard locking (``dovecot-uidlist.lock``
dotlock file), other MUAs accessing the Maildir don't support it. This means
that if another MUA is updating message flags or expunging messages, Dovecot
might temporarily lose some message(s). After the next sync when it finds it
again, an error message may be written to log and the message will receive a
new UID.

Delivering mails to ``new/`` directory doesn't have any problems, so there's
no need for LDAs to support any type of locking.

Mail Delivery
-------------

`Qmail's how a message is delivered page`_ suggests to deliver the mail like
this:

1. Create a unique filename (only ``time.pid.host`` here, later Maildir spec
   has been updated to allow more uniqueness identifiers)
2. Do ``stat(tmp/<filename>)``. If the ``stat()`` found a file, wait 2 seconds
   and go back to step 1.
3. Create and write the message to ``tmp/<filename>``.
4. ``link()`` it into ``new/`` directory. Although not mentioned here, the
   ``link()`` could again fail if the mail existed in ``new/`` dir. In that
   case you should probably go back to step 1.

All this trouble is rather pointless. Only the first step is what really
guarantees that the mails won't get overwritten, the rest just sounds nice.
Even though they might catch a problem once in a while, they give no
guaranteed protection and will just as easily pass duplicate filenames through
and overwrite existing mails.

Step 2 is pointless because there's a race condition between steps 2 and 3.
PID/host combination by itself should already guarantee that it never finds
such a file. If it does, something's broken and the ``stat()`` check won't
help since another process might be doing the same thing at the same time, and
you end up writing to the same file in ``tmp/``, causing the mail to get
corrupted.

In step 4 the ``link()`` would fail if an identical file already existed in
the Maildir, right? Wrong. The file may already have been moved to ``cur/``
directory, and since it may contain any number of flags by then you can't
check with a simple ``stat()`` anymore if it exists or not.

Step 2 was pointed out to be useful if clock had moved backwards. However,
this doesn't give any actual safety guarantees because an identical base
filename could already exist in ``cur/``. Besides if the system was just
rebooted, the file in ``tmp/`` could probably be even overwritten safely
(assuming it wasn't already ``link()``\ ed to ``new/``).

So really, all that's important in not getting mails overwritten in your
Maildir is step 1: Always create filenames that are guaranteed to be unique.
Forget about the 2 second waits and such that the Qmail's man page talks
about.

.. _`Qmail's how a message is delivered page`: https://www.qmail.org/man/man5/maildir.html

Maildir and Mail Header Metadata
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Unlike when using :ref:`mbox <mbox_mbox_format>` as
:ref:`mailbox format <mailbox_formats>`, where mail headers (for example
``Status``, ``X-UID``, etc.) are used to determine and store metadata, the
mail headers within Maildir files are (usually) **not** used for this purpose
by Dovecot; neither when mails are created/moved/etc. via IMAP nor when
Maildirs are placed (e.g., copied or moved in the filesystem) in a mail
location (and then "imported" by dovecot).

Therefore, it is (usually) **not** necessary, to strip any such mail headers
at the MTA, MDA, or LDA (as is recommended with
:ref:`mbox <mbox_mbox_format>`).

There is one exception, though, namely when
:dovecot_core:ref:`pop3_reuse_xuidl = yes <pop3_reuse_xuidl>` (which
is however deprecated): in this case ``X-UIDL`` is used for the POP3 UIDLs.
Therefore, in this case, is recommended to strip the ``X-UIDL`` mail headers
*case-insensitively* at the MTA, MDA, or LDA.

Procmail Problems
^^^^^^^^^^^^^^^^^

Maildir format is somewhat compatible with MH format. This is sometimes a
problem when people configure their procmail to deliver mails to
``Maildir/new``. This makes procmail create the messages in MH format, which
basically means that the file is called ``msg.inode_number``. While this
appears to work first, after expunging messages from the Maildir the inodes
are freed and will be reused later. This means that another file with the
same name may come to the Maildir, which makes Dovecot think that an expunged
file reappeared into the mailbox and an error is logged.

The proper way to configure procmail to deliver to a Maildir is to use
``Maildir/`` as the destination.

References
^^^^^^^^^^

* `Wikipedia <https://en.wikipedia.org/wiki/Maildir>`_
