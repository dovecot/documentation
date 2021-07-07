.. _maildir_settings:

=====================
Maildir Configuration
=====================

See :ref:`Maildir <maildir_mbox_format>` for a technical description of how
Dovecot has implemented Maildir support.

Mail Location
^^^^^^^^^^^^^

Maildir exists almost always in ``~/Maildir`` directory. The mail location is
specified with:

.. code-block:: none

  mail_location = maildir:~/Maildir

Directory Layout
^^^^^^^^^^^^^^^^

By default, Dovecot uses Maildir++ directory layout. This means that all
mailboxes are stored in a single directory and prefixed with a dot. For
example:

* Maildir/.folder/
* Maildir/.folder.subfolder/

If you want Maildirs to use hierarchical directories, such as:

* Maildir/folder/
* Maildir/folder/subfolder/

you'll need to enable fs layout:

.. code-block:: none

  mail_location = maildir:~/Maildir:LAYOUT=fs

.. _maildir_settings_control_files:

Control Files
^^^^^^^^^^^^^

Dovecot stores some Maildir metadata into two control files:

* ``dovecot-uidlist`` file contains IMAP UID <-> Maildir filename mapping
* ``dovecot-keywords`` file contains Maildir filename flag (a..z = 0..25) <->
  keyword name mapping

Both of these files are described fully in :ref:`maildir_mbox_format`. The
important thing to remember about them is that they shouldn't be treated the
same way as index files. Index files can be deleted and rebuilt without any
side effects, but if you delete control files you'll cause messages to get
new UIDs and possibly lose keyword names.

If the messages get new UIDs, the IMAP clients will invalidate their local
cache and download the messages all over again. If you do this for all the
users, you could cause huge disk I/O bursts to your server.

Dovecot cannot currently handle not being able to write the control files, so
it will cause problems with :ref:`filesystem quota <quota_backend_fs>`. To
avoid problems with this,
you should place control files into a partition where quota isn't checked. You
can specify this by adding ``:CONTROL=<path>`` to ``mail_location``:

.. code-block:: none

  mail_location = maildir:~/Maildir:CONTROL=/var/no-quota/%u

Index Files
^^^^^^^^^^^

See :ref:`Mail Location Index Files` for a full explanation of how to change
the index path. Example:

.. code-block:: none

  mail_location = maildir:~/Maildir:INDEX=/var/indexes/%u

Optimizations
^^^^^^^^^^^^^

* :ref:`maildir_copy_with_hardlinks = yes <setting-maildir_copy_with_hardlinks>`
* :ref:`maildir_stat_dirs = no <setting-maildir_stat_dirs>`
* :ref:`maildir_very_dirty_syncs = yes <setting-maildir_very_dirty_syncs>`

Filesystem Optimizations
------------------------

See :ref:`maildir_and_filesystems`.

.. _maildir_settings_mailbox_directory_name:

Mailbox Directory Name
^^^^^^^^^^^^^^^^^^^^^^

When using ``LAYOUT=fs``, there is a potential for naming collisions between
Maildir's ``new/``, ``cur/``, and ``tmp/`` subdirectories, and mail folders
of the same names.

For example, consider a mail folder ``foo/bar``. Under ``LAYOUT=fs``, data
for this mail folder will be stored under Maildir's usual three directories
``~/Maildir/foo/bar/{new,cur,tmp}/``. If the user then tries to create a mail
folder ``foo/bar/new``, this would then imply that data should be stored in
Maildir's three directories ``~/Maildir/foo/bar/new/{new,cur,tmp}/``. But
this would overlap Maildir's ``new/`` subdirectory of mail folder ``foo/bar``.

This may not be a problem in many installations, but if a risk of collisions
with Maildir's three subdirectory names is perceived, then the ``DIRNAME``
parameter can be used. For example, if we specify mail location as:

.. code-block:: none

  mail_location = maildir:~/Maildir:LAYOUT=fs:DIRNAME=mAildir

then this will push Maildir's ``new/``, ``cur/``, and ``tmp/`` subdirectories
down into a subdirectory ``mAildir/``, so a mail folder ``foo/bar`` would be
stored at ``~/Maildir/foo/bar/mAildir/{new,cur,tmp}/``. A mail folder
``foo/bar/new`` would be stored at
``~/Maildir/foo/bar/new/mAildir/{new,cur,tmp}/``, which would then have no
overlap with the mail folder ``foo/bar``.

``DIRNAME`` affects INBOX slightly differently. Without ``DIRNAME``, INBOX
will be stored at ``~/Maildir/{new,cur,tmp}/``, but when ``DIRNAME`` is
specified, we get an extra path component ``INBOX/`` immediately prior to the
``DIRNAME`` value, so in the example above INBOX would be stored at
``~/Maildir/INBOX/mAildir/{new,cur,tmp}/``.

The value for ``DIRNAME`` should be chosen carefully so as to minimise the chances of clashing with mail folder names. In the example here, unusual upper/lower casing has been used.

Settings
^^^^^^^^

.. _setting-maildir_broken_filename_sizes:

``maildir_broken_filename_sizes``
---------------------------------

- Default: ``no``
- Values: :ref:`boolean`

If enabled, do not obtain a mail message's physical size from the
``S=<size>`` data in the Maildir filename except when recalculating the
Maildir++ quota.


.. _setting-maildir_copy_with_hardlinks:

``maildir_copy_with_hardlinks``
-------------------------------

- Default: ``yes``
- Values: :ref:`boolean`

If enabled, copying of a message is done with hard links whenever possible.

This makes the performance much better, and it's unlikely to have any side
effects. The only reason to disable this is if you're using a filesystem
where hard links are slow (e.g. HFS+).


.. _setting-maildir_empty_new:

``maildir_empty_new``
---------------------

- Default: ``no``
- Values: :ref:`boolean`

Should mail messages always be moved from the ``new/`` directory to ``cur/``,
even when the ``\Recent`` flags aren't being reset?


.. _setting-maildir_stat_dirs:

``maildir_stat_dirs``
---------------------

- Default: ``no``
- Values: :ref:`boolean`

If enabled, don't include directories in a LIST response that begin with a
dot.  Thus, if disabled, Dovecot assumes that all the files beginning with
a dot in the Maildir are Maildirs.

You shouldn't have any non-directory files beginning with a dot in the
Maildirs, but if you do you may need to set this to ``yes``, in which case
Dovecot needs to ``stat()`` each directory entry, which degrades the
performance. Some filesystems provide the directory/non-directory status for
free without having to ``stat()``. In those filesystems this setting is
ignored.


.. _setting-maildir_very_dirty_syncs:

``maildir_very_dirty_syncs``
----------------------------

- Default: ``no``
- Values: :ref:`boolean`

If enabled (``yes``), Dovecot is assumed to be the only MUA that accesses
Maildir directly, so the ``cur/`` directory is scanned only when its mtime
changes unexpectedly or when the mail cannot otherwise be found.

If enabled and another process (or a Dovecot process which doesn't update
index files) does changes to ``cur/`` while the mailbox is simultaneously
being modified by Dovecot, Dovecot may not notice those external changes. It
is still safe to deliver new mails to ``new/`` using non-Dovecot software
(except with ``mailbox_list_index = yes``, changes aren't noticed outside
INBOX).
