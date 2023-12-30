.. _mail_location_settings:

======================
Mail Location Settings
======================

.. note:: For an overview of Dovecot's supported mailbox formats, see
          :ref:`mailbox_formats`.

The mail locations are generally configured in 3 places:

#. The ``mail_*`` global settings in ``dovecot.conf`` are used if nothing
   else overrides them.

#. The ``mail_*`` settings inside :ref:`namespaces` override the global
   settings. Usually these should be used only for public and shared namespaces.

#. The global or namespace-specific ``mail_*`` settings can be overridden by
   :ref:`authentication-user_database` to provide user-specific locations.

Settings
========

.. dovecot_core:setting:: mail_driver
   :seealso: @mail_location_settings, @mail_path;dovecot_core
   :values: @string

   One of the mailbox formats described at
   :ref:`Mailbox formats <mailbox_formats>`.

   For an empty value or "auto", Dovecot attempts to find the mailboxes
   automatically. See :ref:`mailbox_autodetection`.


.. dovecot_core:setting:: mail_path
   :seealso: @mail_location_settings, @mail_driver;dovecot_core
   :values: @string
   :default: (specific to @mail_driver;dovecot_core)

   Path to a directory where the mail is stored.
   :ref:`Mail user variables <variables-mail_user>` are commonly used here.

   Usually the mails should be stored in a sub-directory under the home
   directory, but not the home directory itself (see
   :ref:`Home vs. mail directory <home_directories_for_virtual_users>`).

   The path must be absolute, not a relative path. Even if relative paths
   appear to work, this usage is deprecated and will likely stop working at
   some point.


.. dovecot_core:setting:: mail_inbox_path
   :seealso: @mail_location_settings
   :values: @string

   Path to the INBOX mailbox. The path doesn't have to be absolute - it is
   relative to the :dovecot_core:ref:`mail_path`.

   This is often used with mbox format where INBOX is in ``/var/mail/`` while
   the rest of the folders are under the user's home directory.

   This can also be used to specify a different INBOX path with Maildir:

   .. code-block:: none

      mail_location = maildir:~/Maildir:INBOX=~/Maildir/.INBOX


.. dovecot_core:setting:: mail_index_path
   :seealso: @mail_location_settings
   :values: @string
   :default: (same as @mail_path)

   Location of :ref:`Dovecot index files <mail_index_file_format>`.
   See :ref:`mail_location_settings-index_files` for details.


.. dovecot_core:setting:: mail_index_private_path
   :seealso: @mail_location_settings
   :values: @string

   The private index files are used with shared mailboxes to provide private
   (per-user) message flags. See :ref:`public_shared_mailboxes` for more
   information.


.. dovecot_core:setting:: mail_cache_path
   :seealso: @mail_location_settings
   :values: @string
   :default: (same as @mail_index_path)

   Place ``dovecot.index.cache`` files to this directory instead of among
   the other index files. This may be used as an optimization to split
   most index files to the fastest (smallest) storage while keeping cache files
   in a slightly slower (larger) storage.


.. dovecot_core:setting:: mail_control_path
   :seealso: @mail_location_settings
   :values: @string

   Location for (mailbox-format specific) control files.

.. dovecot_core:setting:: mail_alt_path
   :seealso: @mail_location_settings
   :values: @string

   Specifies the :ref:`alternate storage <dbox_settings_alt_storage>` path.


.. dovecot_core:setting:: mail_alt_check
   :seealso: @mail_location_settings
   :values: @boolean
   :default: yes

   Whether to perform a sanity check and warn if
   :dovecot_core:ref:`mail_alt_path` changes from the last access. This can
   catch accidentally broken configurations before users start reporting
   missing mails. The downside to this check is some additional disk IO.


.. dovecot_core:setting:: mailbox_list_layout
   :seealso: @mail_location_settings
   :values: @string
   :default: fs (but overridden by some @mail_driver;dovecot_core)

   Directory layout to use:

   ``Maildir++``
       The default used by :ref:`Maildir <maildir_mbox_format>`.

   ``fs``
       The default used by :ref:`mbox <mbox_mbox_format>` and
       :ref:`dbox <dbox_mbox_format>`.

   ``index``
       The default used by :ref:`obox <obox_settings>`.
       Uses mailbox GUIDs as the directory names. The mapping between mailbox
       names and GUIDs exists in ``dovecot.list.index*`` files.


.. dovecot_core:setting:: mailbox_subscriptions_filename
   :seealso: @mail_location_settings
   :values: @string
   :default: subscriptions (but overridden by some @mail_driver;dovecot_core)

   Specifies the filename used for storing mailbox subscriptions. There is
   generally no need to change this.


.. dovecot_core:setting:: mailbox_directory_name
   :seealso: @mail_location_settings, @mailbox_directory_name_legacy;dovecot_core
   :values: @string
   :default: (specific to @mail_driver;dovecot_core)

   Specifies the directory name used for mailbox, index, and control directory
   paths. See the individual mailbox format pages for further information.
   For example ``dbox-Mails`` with dbox.

   With mbox format this works differently. The user-provided mailbox name is
   the directory name, while ``mailbox_directory_name`` is the mbox file.
   For example with ``mailbox_directory_name=mbox``, creating ``foo/bar``
   mailbox name ends up creating ``.../foo/bar/mbox`` file.


.. dovecot_core:setting:: mailbox_directory_name_legacy
   :seealso: @mail_location_settings, @mailbox_directory_name;dovecot_core
   :values: @boolean
   :default: no

   If "no", :dovecot_core:ref:`mailbox_directory_name` applies also to
   index and control directories. The only reason to set this to "yes" is if
   you already have an existing Dovecot installation with the legacy DIRNAME
   (rather than FULLDIRNAME) parameter and don't want to migrate the data.


.. dovecot_core:setting:: mailbox_root_directory_name
   :seealso: @mail_location_settings
   :values: @string
   :default: (specific to @mail_driver;dovecot_core)

   Specifies directory name under which all mailbox directories are stored.
   For example ``mailboxes`` with dbox.


.. dovecot_core:setting:: mail_volatile_path
   :seealso: @mail_location_settings
   :values: @string

   Specifies the location of volatile files. This includes lock files and
   potentially other files that don't need to exist permanently, so it can
   point to an in-memory filesystem (tmpfs). This is
   especially useful to avoid creating lock files to NFS or other remote
   filesystems.


.. dovecot_core:setting:: mailbox_list_index_prefix
   :seealso: @mail_location_settings
   :values: @string
   :default: dovecot.list.index

   Prefix for the mailbox list index filename. It may also optionally include
   a path (relative to :dovecot_core:ref:`mail_index_path`) to place it in a
   different directory.


.. dovecot_core:setting:: mailbox_list_visible_escape_char
   :seealso: @mail_location_settings, @mailbox_list_storage_escape_char;dovecot_core
   :values: @string
   :default: ``~`` with imapc

   Specifies an escape character that is used for broken or otherwise
   inaccessible mailbox names. If mailbox name can't be changed reversibly to
   UTF-8 and back, encode the problematic parts using
   ``<mailbox_list_visible_escape_char><hex>``in
   the user-visible UTF-8 name. The ``mailbox_list_visible_escape_char``
   itself also has to be encoded the same way.

   This can be useful with
   :ref:`imapc_mbox_format` to access mailbox names that aren't valid mUTF-7
   charset from remote servers, or if the remote server uses a different
   hierarchy separator and has folder names containing the local separator.

   Note that it's possible to use the same character here as for
   :dovecot_core:ref:`mailbox_list_storage_escape_char`.

.. dovecot_core:setting:: mailbox_list_storage_escape_char
   :seealso: @mail_location_settings, @mailbox_list_visible_escape_char;dovecot_core
   :values: @string
   :default: ``%%`` with imapc

   Specifies an escape character that it used for encoding special characters
   in the mailbox names in storage. This allows users to use characters in
   mailboxes names that would otherwise be illegal. For example:

   * Maildir++ layout disallows using the ``.`` character, since it's used
     internally as the folder hierarchy separator.
   * The ``~`` character at the beginning of the mailbox name is disallowed,
     because of the possibility that it gets expanded to user's home directory.
   * The ``/`` character can't be used on POSIX filesystems, since it's the
     directory separator.

   The characters are escaped to the mailbox name as
   ``<mailbox_list_storage_escape_char><hex>``.

   Note that it's possible to use the same character here as for
   :dovecot_core:ref:`mailbox_list_visible_escape_char`.


.. dovecot_core:setting:: mailbox_list_drop_noselect
   :seealso: @mail_location_settings
   :values: @boolean
   :default: yes

   Specifies whether to automatically delete ``\NoSelect`` mailboxes that have
   no children. These mailboxes are sometimes confusing to users. Also if a
   ``\NoSelect`` mailbox is attempted to be created with ``CREATE box/``, it's
   created as selectable mailbox instead.

   **Note** that Maildir++ layout does not support ``\NoSelect`` mailboxes, so
   this setting has no effect with it.


.. dovecot_core:setting:: mailbox_list_validate_fs_names
   :seealso: @mail_location_settings, @mail_full_filesystem_access;dovecot_core
   :values: @boolean
   :default: yes

   Specifies whether to disallow mailbox names that might be unsafe to use in
   filesystems or potentially allow bypassing ACL checks:

   * ``/`` character anywhere in the name (except as a hierarchy separator),
     unless mailbox list isn't on a filesystem (e.g. index, imapc)
   * ``/`` as the first character
   * ``~`` as the first character (so it's not confused as home directory)
   * No adjacent ``/`` characters
   * No "." or ".." names between ``/`` characters
   * No :dovecot_core:ref:`mailbox_directory_name` between ``/`` characters
   * No mailbox format-specific internal  directories between ``/`` characters,
     unless :dovecot_core:ref:`mailbox_directory_name` is non-empty. This
     mainly means the Maildir "new", "cur" and "tmp" directories in some
     configurations.

   Enabling :dovecot_core:ref:`mail_full_filesystem_access` enables also this
   setting.


.. dovecot_core:setting:: mailbox_list_iter_from_index_dir
   :seealso: @mail_location_settings
   :values: @boolean
   :default: no

   Perform mailbox listing using the :dovecot_core:ref:`mail_index_path`
   directories instead of the :dovecot_core:ref:`mail_path` directories.
   Mainly useful when the index file storage is on a faster storage.


.. dovecot_core:setting:: mailbox_list_utf8
   :seealso: @mail_location_settings
   :values: @boolean
   :default: no

   Store mailbox names on disk using UTF-8 instead of modified UTF-7 (mUTF-7).


Variables
=========

You can use several variables in the mail location settings.
See :ref:`config_variables` for a full list, but the most commonly used ones
are:

========= ==================================================================
Variable  Description
========= ==================================================================
``%u``    Full username.

``%n``    User part in ``user@domain``; same as ``%u`` if there's no domain.

``%d``    Domain part in ``user@domain``; empty if there's no domain.
========= ==================================================================

Directory Hashing
-----------------

You can use three different kinds of hashes in :ref:`config_variables`.

* ``%N`` is MD5-based "new hash" which works similarly to ``%H`` except it
  gives more uniform results.

  * Example: ``%2.256N`` would return maximum 256 different hashes in range
    ``00..ff``.


* ``%M`` returns a MD5 hash of the string as hex. This can be used for two
  level hashing by getting substrings of the MD5 hash.

  * Example: ``%1Mu/%2.1Mu/%u`` returns directories from ``0/0/user`` to
    ``f/f/user``.

* ``%H`` returns a 32bit hash of the given string as hex.

  * This is the old, deprecated method. ``%N`` should be used instead.


.. _mail_location_settings-index_files:

Index Files
===========

Index files are by default stored under the same directory as mails.

You may want to change the index file location if you're using :ref:`nfs` or
if you're setting up :ref:`shared_mailboxes`.

You can change the index file location with the
:dovecot_core:ref:`mail_index_path` setting.  For example:

.. code-block:: none

   mail_driver = maildir
   mail_path = ~/Maildir
   mail_index_path = /var/indexes/%u

The index directories are created automatically, but note that it requires
that Dovecot has actually access to create the directories. Either make sure
that the index root directory (``/var/indexes`` in the above example) is
writable to the logged in user, or create the user's directory with proper
permissions before the user logs in.

Index files can be disabled completely with ``mail_index_path=MEMORY``. This
is not recommended for production use, as the index files will need to be
generated on every access.

.. _mailbox_autodetection:

Autodetection
=============

By default the :dovecot_core:ref:`mail_driver` and
:dovecot_core:ref:`mail_path` settings are empty, which means
that Dovecot attempts to locate automatically where your mails are. This is
done by looking, in order, at:

* ``~/mdbox/``
* ``~/sdbox/``
* ``~/Maildir/``
* ``~/mail/.imap/``
* ``~/mail/inbox``
* ``~/mail/mbox``
* ``~/Mail/.imap/``
* ``~/Mail/inbox``
* ``~/Mail/mbox``

For autodetection to work, one of the above locations has to be populated;
when autodetection is active, Dovecot will not attempt to create a mail folder.

.. Note::

   ``.imap`` is a directory, and ``inbox`` and ``mbox`` are files.

It's usually a good idea to explicitly specify where the mails are, even if
the autodetection happens to work, in particular to benefit from auto-creation
of the folder for new users.

Custom Autodetection
--------------------

If you need something besides the default autodetection, you can use
:ref:`post_login_scripting`.

Example:

.. code-block:: sh

   #!/bin/sh

   if [ -d $HOME/.maildir ]; then
      export MAIL_DRIVER=maildir
      export MAIL_PATH=$HOME/.maildir
   else
      export MAIL_driver=mbox
      export MAIL_PATH=$HOME/mail
      export MAIL_INBOX_PATH=/var/mail/$USER
   fi
   export USERDB_KEYS="$USERDB_KEYS mail_driver mail_path mail_inbox_path"

   exec "$@"

Mail Storage Autocreation
=========================

If :dovecot_core:ref:`mail_path` is set, the path is automatically created
if any directories are missing. You'll see something like this if you enable
:dovecot_core:ref:`debug logging <mail_debug>` (example for ``mbox`` mailbox
format):

.. code-block:: none

   Debug: Namespace : /home/user/Mail doesn't exist yet, using default permissions
   Debug: Namespace : Using permissions from /home/user/Mail: mode=0700 gid=default

and a ``Mail/.imap`` directory will be present once that process has
concluded. This is the easiest way to ensure a freshly created user is
correctly set up for access via Dovecot.


Home-less Users
---------------

Having a home directory for users is highly recommended. At a minimum, the
:ref:`Pigeonhole Sieve plugin <sieve>` requires a home directory to work. See
:ref:`home_directories_for_virtual_users` for more reasons why it's a good
idea, and how to give Dovecot a home directory even if you don't have a "real
home directory".

If you really don't want to set any home directory, you can use something like:

.. code-block:: none

   mail_driver = maildir
   mail_path = /home/%u/Maildir

Per-User Mail Locations
-----------------------

It's possible to override the default mail location settings for
specific users by making the :ref:`authentication-user_database` return the
settings as extra fields.

Note that ``%h`` doesn't work in the userdb queries or templates. ``~/`` gets
expanded later, so use it instead.

.. Note::

   If you have explicit settings inside :ref:`namespace { .. } <namespaces>`,
   they need to be overridden in userdb with ``namespace/<name>/`` prefix.
   For example ``namespace/inbox/mail_path`` instead of simply ``mail_path``.

SQL
^^^

.. code-block:: none

   user_query = SELECT home, uid, gid, mail_path FROM users WHERE user = '%u'

LDAP
^^^^

.. code-block:: none

   user_attrs = \
     =home=%{ldap:homeDirectory}, \
     =uid=%{ldap:uidNumber}, \
     =gid=%{ldap:gidNumber}, \
     =mail_path=%{ldap:mailLocation}

Passwd-file
^^^^^^^^^^^

.. code-block:: none

   user:{PLAIN}password:1000:1000::/home/user::userdb_mail_driver=mbox userdb_mail_path=~/mail

Mixing Multiple Mailbox Formats
-------------------------------

It's possible to use different mailbox formats same user by configuring
multiple namespaces. See :ref:`namespaces`. Each mailbox format has to live in
a different namespace. Mixing mailbox formats within the same namespace is
not supported.

Custom Namespace Location
-------------------------

If you need to override namespace's mail location settings, first give it a
name (``inbox`` in this example):

.. code-block:: none

   namespace inbox {
   }

Then in the executable script use:

.. code-block:: sh

   #!/bin/sh

   # do the lookup here
   mail_driver=mbox
   mail_path=$HOME/mail

   export USERDB_KEYS="$USERDB_KEYS namespace/inbox/mail_driver namespace/inbox/mail_path"
   exec env "NAMESPACE/INBOX/MAIL_DRIVER=$mail_driver" "NAMESPACE/INBOX/MAIL_PATH=$mail_path" "$@"

See Also
========

.. toctree::
   :maxdepth: 1
   :glob:

   dbox/*
   imapc/*
   Maildir/*
   mbox/*
   obox/index
   pop3c/*
