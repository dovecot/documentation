.. _mbox_settings:

==================
Mbox Configuration
==================

See :ref:`mbox <mbox_mbox_format>` for a technical description of Dovecot's
implementation of the mbox format.

Mail Location Configuration 
^^^^^^^^^^^^^^^^^^^^^^^^^^^

In many systems, the user's mails are by default stored in
``/var/mail/username`` file. This file is called INBOX in IMAP world. Since
IMAP supports multiple mailboxes, you'll need to have a directory for them as
well. Usually ``~/mail`` is a good choice for this.

For an installation such as this, the mail location is specified with:

.. code-block:: none

  # %u is replaced with the username that logs in
  mail_location = mbox:~/mail:INBOX=/var/mail/%u

It's in no way a requirement to have the INBOX in ``/var/mail/`` directory. In
fact, this often just brings problems because Dovecot might not be able to
write dotlock files to the directory (see below). You can avoid this
completely by just keeping everything in ``~/mail/``:

.. code-block:: none

  # INBOX exists in ~/mail/inbox
  mail_location = mbox:~/mail

Default ``mail_location`` Keys
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

For mbox, the default :ref:`mail_location_settings-keys` are:

================ =============================================================
Key              Default Value
================ =============================================================
``FULLDIRNAME``  <empty> (For mbox, this setting specifies the mailbox message
                 file name)
================ =============================================================

Index Files
^^^^^^^^^^^

By default, index files are stored under an ``.imap/`` directory.

See :ref:`mail_location_settings-index_files` for an explanation of how to
change the index path. Example:

.. code-block:: none

  mail_location = mbox:~/mail:INBOX=/var/mail/%u:INDEX=/var/indexes/%u

Locking
^^^^^^^

Make sure that all software accessing the mboxes are using the same locking
methods in the same order. The order is important to prevent deadlocking.
From Dovecot's side you can change these from
:dovecot_core:ref:`mbox_read_locks`
and :dovecot_core:ref:`mbox_write_locks` settings.

See :ref:`mbox_mbox_format_locking` for details on the various locking
strategies.

See :ref:`mbox_locking` for more information on locking strategies that may
be used by other components of the mail delivery process.

/var/mail/ Dotlocks
^^^^^^^^^^^^^^^^^^^

Often mbox write locks include dotlock, which means that Dovecot needs to
create a new ``<mbox>.lock`` file to the directory where the mbox file exists.
If your INBOXes are in ``/var/mail/`` directory, you may have to give Dovecot
write access to the directory. There are two ways the ``/var/mail/``
directory's permissions have traditionally been set up:

 * World-writable with sticky bit set, allowing anyone to create new files
   but not overwrite or delete existing files owned by someone else (i.e.
   same as ``/tmp``). You can do this with ``chmod a+rwxt /var/mail``.
 * Directory owned by a mail group and the directory set to group-writable
   (mode=0770, group=mail)

You can give Dovecot access to mail group by setting:

.. code-block:: none

  mail_privileged_group = mail

NOTE: With :ref:`lda` the :dovecot_core:ref:`mail_privileged_group` setting
unfortunately doesn't work, so you'll have to use the sticky bit, disable
dotlocking completely, or use LMTP server instead.

/var/mail/* Permissions
^^^^^^^^^^^^^^^^^^^^^^^

In some systems the ``/var/mail/$USER`` files have 0660 mode permissions.
This causes Dovecot to try to preserve the file's group, and if it doesn't
have permissions to do so, it'll fail with an error like:

.. code-block:: none

  imap(user): Error: chown(/home/user/mail/.imap/INBOX, -1, 12(mail)) failed: Operation not permitted (egid=1000(user), group based on /var/mail/user)

There is rarely any real need for the files to have 0660 mode, so the best
solution for this problem is to just change the mode to 0600:

.. code-block:: none

  chmod 0600 /var/mail/*

Only /var/mail/ mboxes
^^^^^^^^^^^^^^^^^^^^^^

With POP3 it's been traditional that users have their mails only in the
``/var/mail/`` directory. IMAP however supports having multiple mailboxes, so
each user has to have a private directory where the mailboxes are stored.
Dovecot also needs a directory for its index files unless you disable them
completely.

If you **really** want to use Dovecot as a plain POP3 server without index
files, you can work around not having a per-user directory:

* Set users' home directory in userdb to some empty non-writable directory,
  for example ``/var/empty``
* Modify :dovecot_core:ref:`mail_location` so that the mail root directory is also
  the empty directory and append ``:INDEX=MEMORY`` to it. For example:
  ``mail_location = mbox:/var/empty:INBOX=/var/mail/%u:INDEX=MEMORY``
* Note that if you have IMAP users, they'll see ``/var/empty`` as the
  directory containing other mailboxes than INBOX. If the directory is
  writable, all the users will have their mailboxes shared.

Directory Layout
^^^^^^^^^^^^^^^^

By defaultm Dovecot uses filesystem layout under mbox. This means that mail is
stored in mbox files under hierarchical directories, for example: 

================== =============================================================
File               Description
================== =============================================================
``~/mail/inbox``   mbox file containing mail for INBOX
``~/mail/foo``     mbox file containing mail for mailbox "foo"
``~/mail/bar/baz`` mbox file containing mail for mailbox "bar/baz"
================== =============================================================

One upshot of this is that it is not normally possible to have mailboxes
which are subfolders of mailboxes containing messages.

As an alternative, it is possible to configure Dovecot to store all mailboxes
in a single directory with hierarchical levels separated by a dot. This can
be configured by adding ``:LAYOUT=maildir++`` to the mail location. There
are, however, some further considerations when doing this; see
:ref:`mbox_child_folders` for some examples.

.. _mbox_settings_control_files:

Control Files
^^^^^^^^^^^^^

Under mbox format, Dovecot maintains the subscribed mailboxes list in a file
``.subscriptions`` which by default is stored in the mail location root. So
in the example configuration this would be at ``~/mail/.subscriptions``.

If you want to put this somewhere else, you can change the directory in which
the ``.subscriptions`` file is kept by using the ``CONTROL`` parameter. For
example:

.. code-block:: none

  mail_location = mbox:~/mail:CONTROL=~/mail-control

would store the subscribed mailboxes list at ``~/mail-control/.subscriptions``.

One practical application of the ``CONTROL`` parameter is described at
:ref:`mbox_child_folders`.

.. _mbox_settings_message_filename:

Message Filename
^^^^^^^^^^^^^^^^

By default, Dovecot stores messages for INBOX in an mbox file called "inbox",
and messages for all other mailboxes in an mbox file whose relative path is
equivalent to the name of the mailbox. Under this scheme, it is not possible
to have mailboxes which contain both messages and child mailboxes.

However, the behaviour (for mailboxes other than INBOX) can be changed using
the ``DIRNAME`` parameter. If the ``DIRNAME`` parameter is specified with a
particular value, then Dovecot will store messages in a file with a name of
that value, in a directory with a name equivalent to the mailbox name.

There are, however, some further considerations when doing this; see
:ref:`mbox_child_folders` for an example.

Settings
^^^^^^^^

.. dovecot_core:setting:: mbox_dirty_syncs
   :default: yes
   :values: @boolean

Enable optimized mbox syncing?

For larger mbox files, it can take a long time to determine what has
changed when the file is altered unexpectedly. Since the change in
most cases consists solely of newly appended mail, Dovecot can
operate more quickly if it starts off by simply reading the new
messages, then falls back to reading the entire mbox file if
something elsewhere in it isn't as expected.

Dovecot assumes that external mbox file changes only mean that new messages
were appended to it. Without this setting Dovecot re-reads the whole mbox file
whenever it changes. There are various safeguards in place to make this
setting safe even when other changes than appends were done to the mbox. The
downside to this setting is that external message flag modifications may not
be visible immediately.

When this setting is enabled, Dovecot tries to avoid re-reading the mbox every
time something changes. Whenever the mbox changes (i.e. timestamp or size),
Dovecot first checks if the mailbox's size changed. If it didn't, it most
likely meant that only message flags were changed so it does a full mbox read
to find it. If the mailbox shrunk, it means that mails were expunged and again
Dovecot does a full sync. Usually however the only thing besides Dovecot that
modifies the mbox is the LDA which appends new mails to the mbox. So if the
mbox size was grown, Dovecot first checks if the last known message is still
where it was last time. If it is, Dovecot reads only the newly added messages
and goes into "dirty mode". As long as Dovecot is in dirty mode, it can't be
certain that mails are where it expects them to be, so whenever accessing some
mail, it first verifies that it really is the correct mail by finding its
X-UID header. If the X-UID header is different, it fallbacks to a full sync
to find the mail's correct position. The dirty mode goes away after a full
sync. If :dovecot_core:ref:`mbox_lazy_writes` was enabled and the mail didn't
yet have an X-UID header, Dovecot uses the MD5 sum of a couple of headers to
compare the mails.

.. seealso:: :dovecot_core:ref:`mbox_very_dirty_syncs`


.. dovecot_core:setting:: mbox_dotlock_change_timeout
   :default: 2 mins
   :values: @time

Override a lockfile after this amount of time if a dot-lock exists but the
mailbox hasn't been modified in any way.


.. dovecot_core:setting:: mbox_lazy_writes
   :default: yes
   :values: @boolean

If enabled, mbox headers (e.g., meatadat updates, such as writing X-UID
headers or flag changes) are not written until a full write sync is
performed (triggered via IMAP EXPUNGE or CHECK commands and/or when the
mailbox is closed). mbox rewrites can be costly, so this may avoid a lot of
disk writes.

Enabling this setting is especially useful with POP3, in which clients often
delete all mail messages.

One negative consequence of enabling this setting is that the changes aren't
immediately visible to other MUAs.

C-Client works the same way. The upside of this is that it reduces writes
because multiple flag updates to same message can be grouped, and sometimes
the writes don't have to be done at all if the whole message is expunged. The
downside is that other processes don't notice the changes immediately (but
other Dovecot processes do notice because the changes are in index files).


.. dovecot_core:setting:: mbox_lock_timeout
   :default: 5 mins
   :values: @time

The maximum time to wait for all locks to be released before aborting.


.. dovecot_core:setting:: mbox_md5
   :default: apop3d
   :values: @string

The mail-header selection algorithm to use for MD5 POP3 UIDLs when the
setting :dovecot_core:ref:`pop3_uidl_format` = ``%m`` is applied.

.. seealso:: :dovecot_core:ref:`pop3_uidl_format`

.. todo:: What are the possible values?


.. dovecot_core:setting:: mbox_min_index_size
   :default: 0
   :values: @size

For mboxes smaller than this size, index files are not written.

If an index file already exists, it gets read but not updated.

The default should not be changed for most installations.


.. dovecot_core:setting:: mbox_read_locks
   :default: fcntl
   :values: dotlock, dotlock_try, fcntl, flock, lockf

Specify which locking method(s) to use for locking the mbox files during
reading.

To use multiple values, separate them with spaces.

Descriptions of the locking methods can be found at
:ref:`mbox_mbox_format_locking`.


.. dovecot_core:setting:: mbox_very_dirty_syncs
   :default: no
   :values: @boolean

If enabled, Dovecot performs the optimizations from
:dovecot_core:ref:`mbox_dirty_syncs` also for the IMAP SELECT, EXAMINE,
EXPUNGE, and CHECK commands.

If set, this option overrides :dovecot_core:ref:`mbox_dirty_syncs`.


.. dovecot_core:setting:: mbox_write_locks
   :default: dotlock fcntl
   :values: dotlock, dotlock_try, fcntl, flock, lockf

Specify which locking method(s) to use for locking the mbox files during
writing.

To use multiple values, separate them with spaces.

Descriptions of the locking methods can be found at
:ref:`mbox_mbox_format_locking`.
