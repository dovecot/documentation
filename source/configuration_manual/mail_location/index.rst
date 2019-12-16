.. _mail_location_settings:

=======================
Mail Location Settings
=======================

.. toctree::
   :maxdepth: 1
   :glob:

   mbox/*
   obox/index

* For Maildir-specific settings, see `MailLocation/Maildir <https://wiki.dovecot.org/MailLocation/Maildir>`_

* For dbox-specific settings, see `MailLocation/dbox mailbox format <https://wiki.dovecot.org/MailLocation/dbox>`_

There are three different places where the mail location is looked up from:

1. mail_location setting in dovecot.conf is used if nothing else overrides it.

2. mail :ref:`authentication-user_database` overrides mail_location setting.

3. location setting inside namespaces overrides everything. Usually this should be used only for public and shared namespaces.

Autodetection
^^^^^^^^^^^^^^
By default the `ref`:`setting-mail_location` setting is empty, which means that Dovecot attempts to locate automatically where your mails are. This is done by looking, in order, at:

* ~/mdbox/

* ~/sdbox/

* ~/Maildir/

* ~/mail/.imap/

* ~/mail/inbox

* ~/mail/mbox

* ~/Mail/.imap/

* ~/Mail/inbox

* ~/Mail/mbox

For autodetection to work, one of the above locations has to be populated; when autodetection is active, Dovecot will not attempt to create a mail folder. 

.. Note:: 

   .imap is a directory, and inbox and mbox are files.

It's usually a good idea to explicitly specify where the mails are, even if the autodetection happens to work, in particular to benefit from auto-creation of the folder for new users.

Mailbox autocreation
^^^^^^^^^^^^^^^^^^^^^^
Dovecot in the ``1.x`` era created mailboxes automatically regardless of whether ``mail_location`` was set. In ``2.x`` autocreation only gets triggered if ``mail_location`` is correctly set. You'll see something like this if you enable debug logging:

.. code-block:: none

   Debug: Namespace : /home/user/Mail doesn't exist yet, using default permissions
   Debug: Namespace : Using permissions from /home/user/Mail: mode=0700 gid=default

and a ``Mail/.imap`` directory will be present once that process has concluded. This is the easiest way to ensure a freshly created user is correctly set up for access via Dovecot.

Format
^^^^^^^
The format of the mailbox location specification is as follows:

`mailbox-format <https://wiki.dovecot.org/MailboxFormat>`_ : path [ : key = value … ]

where:

* mailbox-format is a tag identifying one of the formats described at `Mailbox formats <https://wiki.dovecot.org/MailboxFormat>`_ 

* path is the path to a directory where the mail is stored. This must be an absolute path, not a relative path. Even if relative paths appear to work, this usage is deprecated and will likely stop working at some point. Do not use the home directory, for reasons see `Home vs. mail directory <https://wiki.dovecot.org/VirtualUsers/Home>`_

* key = value can appear zero or more times to set various optional parameters. Possible values for key are:

================= ==============================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================
INDEX               specifies the location of `Index files`_.

                    * ITERINDEX: Perform mailbox listing using the INDEX directories instead of the mail root directories. Mainly useful when the INDEX storage is on a faster storage. It takes no value. (v2.2.32+)

INBOX               specifies the location of the `INBOX path`_.

LAYOUT              specifies the directory layout to use:

                    * Maildir++: The default used by Maildir format

                    * fs: The default used by mbox and dbox formats

                    * index: Uses mailbox GUIDs as the directory names. The mapping between mailbox names and GUIDs exists in ``dovecot.list.index*`` files.

NO-NOSELECT         Automatically delete any ``\NoSelect`` mailboxes that have no children. These mailboxes are sometimes confusing to users. Also if a \NoSelect mailbox is attempted to be created with ``CREATE box/``, it's created as selectable mailbox instead. (``LAYOUT=Maildir++`` always behaves this same way.) (v2.2.32+)

UTF-8               Store mailbox names on disk using UTF-8 instead of modified UTF-7.

BROKENCHAR          Specifies an escape character that is used for broken mailbox names. If mailbox name can't be changed reversibly to UTF-8 and back, encode the problematic parts using ``<broken_char><hex>`` in the user-visible UTF-8 name. The broken_char itself also has to be encoded the same way. This can be useful with imapc to access mailbox names that aren't valid mUTF-7 charset from remote servers. (v2.2.32+)

CONTROL             Specifies the location of control files under the `mbox <https://wiki.dovecot.org/MailLocation/mbox#Control_files>`__ or `Maildir formats <https://wiki.dovecot.org/MailLocation/Maildir#Control_files>`_

VOLATILEDIR         Specifies the location of volatile files. This includes lock files and potentially other files that don't need to exist permanently. This is especially useful to avoid creating lock files to NFS or other remote filesystems. (v2.2.32+)

SUBSCRIPTIONS       Specifies the file used for storing subscriptions. The default is `subscriptions`. If you're trying to avoid name collisions with a mailbox named `subscriptions`, then also consider setting ``MAILBOXDIR``.

MAILBOXDIR          Specifies directory name under which all mailbox directories are stored. With `dbox formats <https://wiki.dovecot.org/MailboxFormat/dbox>`_ the default is ``mailboxes/`` while with other mailbox formats the default is empty. Typically this should be changed only for :ref:`lazy_expunge` and :ref:`namespaces` with mdbox.

DIRNAME             Specifies the directory name used for mailbox directories, or in the case of mbox specifies the mailbox message file name. With `dbox formats <https://wiki.dovecot.org/MailboxFormat/dbox>`_ the default is ``dbox-Mails/`` while with other mailbox formats the default is empty. Can be used under either `mbox <https://wiki.dovecot.org/MailLocation/mbox#Message_file_name>`__ , `Maildir <https://wiki.dovecot.org/MailLocation/Maildir#Mailbox_directory_name>`_ , or `dbox <https://wiki.dovecot.org/MailLocation/dbox#Mailbox_directory_name>`__ formats. 

FULLDIRNAME         Same as ``DIRNAME``, but use the directory name also for index and control directory paths. This should be used instead of ``DIRNAME`` for new installations. (v2.2.8+)

ALT                 specifies the `Alternate storage <https://wiki.dovecot.org/MailLocation/dbox#Alternate_storage>`_ path for dbox formats.
================= ==============================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================

* The colons and equals signs are literal and there are no spaces in an actual mailbox location specification.

Variables
^^^^^^^^^^
You can use several variables in the ``mail_location`` setting. See :ref:`config_variables` for a full list, but the most commonly used ones are:

======= =====================================================================
   %u     Full username.

   %n     User part in ``user@domain``, same as ``%u`` if there's no domain.
   
   %d    Domain part in ``user@domain``, empty if there's no domain.
======= =====================================================================


Typical settings
^^^^^^^^^^^^^^^^^^
Typically with Maildir it would be set to:

.. code-block:: none

   mail_location = maildir:~/Maildir

with mbox:

.. code-block:: none

   mail_location = mbox:~/mail:INBOX=/var/mail/%u

or if you'd like to use the `dbox <https://wiki.dovecot.org/MailboxFormat/dbox>`_ format:

.. code-block:: none

   # single-dbox
   mail_location = sdbox:~/dbox

or:

.. code-block:: none

   # multi-dbox
   mail_location = mdbox:~/mdbox

Use only absolute paths. Even if relative paths would appear to work, they might just as well break some day.

Directory hashing
^^^^^^^^^^^^^^^^^^^
You can use two different kinds of hashes in :ref:`config_variables` :

* %H modifiers returns a 32bit hash of the given string as hex. 

Example:

.. code-block:: none

   %2.256H would return max. 256 different hashes in range 00 .. ff.

* %M returns a MD5 hash of the string as hex. This can be used for two level hashing by getting substrings of the MD5 hash. 

Example:

.. code-block:: none

   %1Mu/%2.1Mu/%u returns directories from 0/0/user to f/f/user.

Index files
^^^^^^^^^^^^^^
Index files are by default stored under the same directory as mails. With maildir they are stored in the actual maildirs, with mbox they are stored under ``.imap/`` directory. You may want to change the index file location if you're using `NFS <https://wiki.dovecot.org/NFS>`_ or if you're setting up `shared mailboxes <https://wiki.dovecot.org/SharedMailboxes>`_.

You can change the index file location by adding ``:INDEX=<path>`` to mail_location. For example:

.. code-block:: none

   mail_location = maildir:~/Maildir:INDEX=/var/indexes/%u

The index directories are created automatically, but note that it requires that Dovecot has actually access to create the directories. Either make sure that the index root directory (``/var/indexes`` in the above example) is writable to the logged in user, or create the user's directory with proper permissions before the user logs in.

If you really want to, you can also disable the index files completely by appending ``:INDEX=MEMORY``.

Private index files
^^^^^^^^^^^^^^^^^^^^

.. versionadded:: v2.2

Since v2.2 the recommended way to enable private flags for shared mailboxes is to create private indexes with ``:INDEXPVT=<path>``. See `SharedMailboxes/Public <https://wiki.dovecot.org/SharedMailboxes/Public>`_ for more information.

INBOX path
^^^^^^^^^^^
INBOX path can be specified to exist elsewhere than the rest of the mailboxes, 

Example:

.. code-block:: none

   mail_location = mbox:~/mail:INBOX=/var/mail/%u
   mail_location = maildir:~/Maildir:INBOX=~/Maildir/.INBOX

.. Note:: It's still not possible to mix maildir and mbox formats this way. 
          You need to use :ref:`namespaces`. for that.

Homeless users
^^^^^^^^^^^^^^^
Having a home directory for users is highly recommended. The `Pigeonhole <https://wiki.dovecot.org/Pigeonhole>`_ `Sieve plugin <https://wiki.dovecot.org/Pigeonhole/Sieve>`_ already requires a home directory to work, and it probably won't be the last feature to require a home. See `VirtualUsers#homedirs <https://wiki.dovecot.org/VirtualUsers#homedirs>`_ for more reasons why it's a good idea, and how to give Dovecot a home directory even if you don't have a "real home directory".

If you really don't want to set any home directory, you can use something like:

.. code-block:: none

   mail_location = maildir:/home/%u/Maildir 

Per-user mail locations
^^^^^^^^^^^^^^^^^^^^^^^^
It's possible to override the default ``mail_location`` for specific users by making the :ref:`authentication-user_database` return ``mail`` extra field. See the :ref:`authentication-user_database` page for the specific userdb you're using for more information how to do this. Below are however a couple of examples.

Note that ``%h`` doesn't work in the userdb queries or templates. ``~/`` gets expanded later, so use it instead.

.. Note::

   Since location specified within a :ref:`namespaces` overrides ``mail_location setting``, in case you specified that parameter, you'll have to override in in the user database, specifying ``namespace/inbox/location`` extra field instead of mail.

SQL
^^^^
.. code-block:: none

   user_query = SELECT home, uid, gid, mail FROM users WHERE user = '%u' 

LDAP
^^^^^
.. code-block:: none

   user_attrs = homeDirectory=home, uidNumber=uid, gidNumber=gid, mailLocation=mail

Passwd-file
^^^^^^^^^^^^
.. code-block:: none

   user:{PLAIN}password:1000:1000::/home/user::userdb_mail=mbox:~/mail:INBOX=/var/mail/%u 

Mixing mbox and maildir
^^^^^^^^^^^^^^^^^^^^^^^^
It's possible to use both mboxes and maildirs for the same user by configuring multiple namespaces. See :ref:`namespaces`.

Having both mboxes and maildirs mixed within the same namespace isn't currently supported.


Custom mailbox location detection
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
Dovecot by default detects the mailboxes in this order:

   1. maildir: ~/Maildir
   2. mbox: ~/mail, and /var/mail/%u if it exists
   3. mbox: ~/Mail, and /var/mail/%u if it exists

If you need something else, you can override the mail_executable setting to run a script, which sets the MAIL environment properly.

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

Custom namespace location
^^^^^^^^^^^^^^^^^^^^^^^^^^
If you need to override namespace's location, first give it a name ("inbox" below):

.. code-block:: none

   namespace inbox {
      ..
   }

Then in the script use:

.. code-block:: sh

   #!/bin/sh

   # do the lookup here
   location=mbox:$HOME/mail

   export USERDB_KEYS="$USERDB_KEYS namespace/inbox/location"
   exec env "NAMESPACE/INBOX/LOCATION=$location" "$@"
