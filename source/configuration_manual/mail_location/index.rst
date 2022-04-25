.. _mail_location_settings:

======================
Mail Location Settings
======================

.. note:: For an overview of Dovecot's supported mailbox formats, see
          :ref:`mailbox_formats`.

There are three different places where the mail location is looked up from:

1. :dovecot_core:ref:`mail_location` in ``dovecot.conf`` is used if nothing
   else overrides it.

2. mail :ref:`authentication-user_database` overrides ``mail_location``
   setting.

3. ``location`` setting inside :ref:`namespaces` overrides everything. Usually
   this should be used only for public and shared namespaces.

Format
======

The format of the mailbox location specification is:

.. code-block:: none

  <mailbox-format> : <path> [ : <key> = <value> [ : <key2> = <value2> ... ] ]

where:

* ``mailbox-format`` is a tag identifying one of the formats described at
  :ref:`Mailbox formats <mailbox_formats>`.

* ``path`` is the path to a directory where the mail is stored. This must be
  an absolute path, not a relative path. Even if relative paths appear to
  work, this usage is deprecated and will likely stop working at some point.
  Do not use the home directory (see
  :ref:`Home vs. mail directory <home_directories_for_virtual_users>`).

* ``key = value`` can appear zero or more times to set various optional
  parameters.

* The colons and equals signs are literal and there are no spaces in an actual
  mailbox location specification.

.. _mail_location_settings-keys:

Keys
----

.. note:: This table is intended as an abstract list of what keys exist; see
          the individual mailbox format pages for further information on how
          to use these keys.

List of available keys:

================== =============================================================
Key                Value Description
================== =============================================================
``INDEX``          Location of
                   :ref:`Dovecot index files <mail_index_file_format>`.

                   * ``ITERINDEX``: Perform mailbox listing using the
                     ``INDEX`` directories instead of the mail root
                     directories. Mainly useful when the ``INDEX`` storage is
                     on a faster storage. It takes no value.

                   .. versionadded:: v2.2.32

``INBOX``          Location of the INBOX path.

``LAYOUT``         Directory layout to use:

                   * ``Maildir++``: The default used by
                     :ref:`Maildir <maildir_mbox_format>`.

                   * ``fs``: The default used by
                     :ref:`mbox <mbox_mbox_format>` and
                     :ref:`dbox <dbox_mbox_format>`.

                   * ``index``: Uses mailbox GUIDs as the directory names.
                     The mapping between mailbox names and GUIDs exists in
                     ``dovecot.list.index*`` files.

``NO-NOSELECT``    Automatically delete any ``\NoSelect`` mailboxes that have
                   no children. These mailboxes are sometimes confusing to
                   users. Also if a ``\NoSelect`` mailbox is attempted to be
                   created with ``CREATE box/``, it's created as selectable
                   mailbox instead. (``LAYOUT=Maildir++`` always behaves this
                   same way.)

                   .. versionadded:: v2.2.32

                   .. versionchanged:: v2.3.19 Add support for using ``NO-NOSELECT``
                                       with LAYOUT=index
``UTF-8``          Store mailbox names on disk using UTF-8 instead of
                   modified UTF-7 (mUTF-7).

``BROKENCHAR``     Specifies an escape character that is used for broken or
                   otherwise inaccessible mailbox names. If mailbox name
                   can't be changed reversibly to UTF-8 and back, encode the
                   problematic parts using ``<broken_char><hex>`` in the
                   user-visible UTF-8 name. The broken_char itself also has
                   to be encoded the same way. This can be useful with
                   :ref:`imapc_mbox_format` to access mailbox names that
                   aren't valid mUTF-7 charset from remote servers, or if the
                   remote server uses a different hierarchy separator and has
                   folder names containing the local separator.

                   .. versionadded:: v2.2.32

                   .. versionchanged:: v2.3.14 Conflicting separators are
                                       also escaped.

``CONTROL``        Specifies the location of control files.

``VOLATILEDIR``    Specifies the location of volatile files. This includes
                   lock files and potentially other files that don't need to
                   exist permanently. This is especially useful to avoid
                   creating lock files to NFS or other remote filesystems.

                   .. versionadded:: v2.2.32

``SUBSCRIPTIONS``  Specifies the filename used for storing subscriptions. The
                   default is ``subscriptions``. If you're trying to avoid
                   name collisions with a mailbox named ``subscriptions``,
                   then also consider setting ``MAILBOXDIR``.

``MAILBOXDIR``     Specifies directory name under which all mailbox
                   directories are stored. The default is empty unless
                   otherwise described in the mailbox format pages.

``DIRNAME``        Specifies the directory name used for mailbox directories,
                   or in the case of mbox specifies the mailbox message file
                   name.

                   The :ref:`sdbox and mdbox <dbox_settings>` formats use
                   ``DIRNAME=dbox-Mails`` by default.

                   .. note:: ``DIRNAME`` is not used for index or control
                             directories, consider using ``FULLDIRNAME``
                             instead.

``FULLDIRNAME``    Specifies the directory name used for mailbox, index, and
                   control directory paths. See the individual mailbox format
                   pages for further information.

                   .. note:: Bug: Before v2.3.19 folder renaming was broken
                             when using ``FULLDIRNAME`` together with
                             ``INDEX``, ``INDEXPVT``, ``INDEXCACHE`` or
                             ``CONTROL``. Renaming a parent folder lost the
                             index/control files for all of its child folders,
                             which with some mailbox formats lost the mails
                             until force-resync was used.

                   .. versionadded:: v2.2.8

``ALT``            Specifies the
                   :ref:`alternate storage <dbox_settings_alt_storage>` path.
================== =============================================================

Variables
---------

You can use several variables in the :dovecot_core:ref:`mail_location` setting.
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
^^^^^^^^^^^^^^^^^

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
-----------

Index files are by default stored under the same directory as mails.

You may want to change the index file location if you're using :ref:`nfs` or
if you're setting up :ref:`shared_mailboxes`.

You can change the index file location by adding ``:INDEX=<path>`` to mail_location. For example:

.. code-block:: none

   mail_location = maildir:~/Maildir:INDEX=/var/indexes/%u

The index directories are created automatically, but note that it requires
that Dovecot has actually access to create the directories. Either make sure
that the index root directory (``/var/indexes`` in the above example) is
writable to the logged in user, or create the user's directory with proper
permissions before the user logs in.

Index files can be disabled completely by appending ``:INDEX=MEMORY``. This
is not recommended for production use, as the index files will need to be
generated on every access.

Private Index Files
^^^^^^^^^^^^^^^^^^^

.. versionadded:: v2.2

The recommended way to enable private flags for shared mailboxes is to create
private indexes with ``:INDEXPVT=<path>``. See :ref:`public_shared_mailboxes`
for more information.

INBOX Path
----------

INBOX path can be specified to exist elsewhere than the rest of the mailboxes.

Example:

.. code-block:: none

   mail_location = maildir:~/Maildir:INBOX=~/Maildir/.INBOX

Autodetection
=============

By default the :dovecot_core:ref:`mail_location` setting is empty, which means
that Dovecot attempts to locate automatically where your mails are. This is
done by looking, in order, at:

* ~/mdbox/
* ~/sdbox/
* ~/Maildir/
* ~/mail/.imap/
* ~/mail/inbox
* ~/mail/mbox
* ~/Mail/.imap/
* ~/Mail/inbox
* ~/Mail/mbox

For autodetection to work, one of the above locations has to be populated;
when autodetection is active, Dovecot will not attempt to create a mail folder.

.. Note::

   .imap is a directory, and inbox and mbox are files.

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
      export MAIL=maildir:$HOME/.maildir
   else
      export MAIL=mbox:$HOME/mail:INBOX=/var/mail/$USER
   fi
   export USERDB_KEYS="$USERDB_KEYS mail"

   exec "$@"

Mailbox Autocreation
====================

Autocreation is only triggered if :dovecot_core:ref:`mail_location` is
correctly set. You'll see something like this if you enable
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

   mail_location = maildir:/home/%u/Maildir 

Per-User Mail Locations
-----------------------

It's possible to override the default :dovecot_core:ref:`mail_location` for
specific users by making the :ref:`authentication-user_database` return
``mail`` extra field.

Note that ``%h`` doesn't work in the userdb queries or templates. ``~/`` gets
expanded later, so use it instead.

.. Note::

   Since a location specified within a :ref:`namespaces` overrides
   :dovecot_core:ref:`mail_location`, in case you specified that parameter
   you'll have to override in in the user database, specifying
   ``namespace/inbox/location`` extra field instead of mail.

SQL
^^^

.. code-block:: none

   user_query = SELECT home, uid, gid, mail FROM users WHERE user = '%u' 

LDAP
^^^^

.. code-block:: none

   user_attrs = homeDirectory=home, uidNumber=uid, gidNumber=gid, mailLocation=mail

Passwd-file
^^^^^^^^^^^

.. code-block:: none

   user:{PLAIN}password:1000:1000::/home/user::userdb_mail=mbox:~/mail:INBOX=/var/mail/%u 

Mixing Multiple Mailbox Formats
-------------------------------

It's possible to use different mailbox formats same user by configuring
multiple namespaces. See :ref:`namespaces`. Each mailbox format has to live in
a different namespace. Mixing mailbox formats within the same namespace is
not supported.

Custom Namespace Location
-------------------------

If you need to override namespace's location, first give it a name (``inbox``
in this example):

.. code-block:: none

   namespace inbox {
   }

Then in the executable script use:

.. code-block:: sh

   #!/bin/sh

   # do the lookup here
   location=mbox:$HOME/mail

   export USERDB_KEYS="$USERDB_KEYS namespace/inbox/location"
   exec env "NAMESPACE/INBOX/LOCATION=$location" "$@"

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
