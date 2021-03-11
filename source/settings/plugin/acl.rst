.. _acl:

====================
Access Control Lists
====================

This page talks mainly about how ACLs work, for more general description of how
shared mailboxes work, see :ref:`SharedMailboxes <shared_mailboxes>`.

Dovecot v1.0 and v1.1 supports administrator-configured ACL files. v1.2+
supports also IMAP ACL extension, which allows users to change ACLs themselves.
The ACL code was written to allow multiple ACL backends, but currently Dovecot
supports only virtual ACL files. Note that using ACLs doesn't grant mail
processes any extra filesystem permissions that they already don't have.
:ref:`You must make sure that the processes have enough permissions
<admin_manual_permissions_in_shared_mailboxes>` to be able to access
the mailboxes. When testing you could first try accessing shared/public
mailboxes without ACL plugin even enabled.

ACLs can be enabled in ``dovecot.conf`` with:

.. code-block:: none

  mail_plugins = acl
    protocol imap {
    mail_plugins = $mail_plugins imap_acl
  }

  plugin {
    # Without global ACLs:
    acl = vfile

    # With global ACL files in /etc/dovecot/dovecot-acls file (v2.2.11+):
    #acl = vfile:/etc/dovecot/dovecot-acl

    # With global ACLs in /etc/dovecot/acls/ directory (obsolete):
    #acl = vfile:/etc/dovecot/acls

    # If enabled, don't try to find dovecot-acl files from mailbox directories.
    # This reduces unnecessary disk I/O when only global ACLs are used. (v2.2.31+)
    #acl_globals_only = yes
  }

ACL groups support works by returning a comma-separated ``acl_groups``
:ref:`authentication-user_database_extra_fields` from userdb, which contains all the groups
the user belongs to. User's UNIX groups have no effect on ACLs (you can
`enable` them by using a special :ref:`post_login_scripting`).

The default ACL for mailboxes is to give the mailbox owner all permissions and
other users none. Mailboxes in public namespaces don't have owners, so by
default no one can access them.

Master users
============

Master users have their own ACLs. They're not the the mailbox owners, so by
default they have no permissions to any of the mailboxes. See
:ref:`ACLs at Master users <authentication-master_users_acls>` for more information.

ACL vfile backend
^^^^^^^^^^^^^^^^^

vfile backend supports per-mailbox ACLs and global ACLs.

Per-mailbox ACLs are stored in ``dovecot-acl`` named file, which exists in:

* maildir: The Maildir's mail directory (eg. ``~/Maildir, ~/Maildir/.folder/``)
* mbox: Control directory. You should explicitly specify ``:CONTROL=<path>`` in
  mail location.
* dbox: dbox's mail directory (eg. ``~/dbox/INBOX/dbox-Mails/``)

ACL Inheritance
^^^^^^^^^^^^^^^

Every time you create a new mailbox, it gets its ACLs from the parent mailbox.
If you're creating a root-level mailbox, it uses the namespace's default ACLs.
There is no actual inheritance, however: If you modify parent's ACLs, the
child's ACLs stay the same. There is currently no support for ACL inheritance.

* Maildir: Namespace's default ACLs are read from `dovecot-acl` file in the
  namespace's mail root directory (e.g. ``/var/public/Maildir``). Note that
  currently these default ACLs are used only when creating new mailboxes, they
  aren't used for mailboxes without ACLs.

* If ``plugin { acl_defaults_from_inbox=yes }`` , the default ACLs for private
  and shared namespaces (but not public namespaces) are taken from the INBOX.
  This means that giving somebody access to your INBOX will give them access to
  all your other mailboxes as well, unless the specific mailboxes' ACLs override
  the INBOX's.

  .. versionadded:: v2.2.2

.. NOTE::

  Currently the default ACLs are merged with the mailbox-specific ACLs. So if a
  default ACL gives access to `user1` and a per-mailbox ACL gives access to
  `user2`, the `user1` still has access to that mailbox.

Global ACLs
^^^^^^^^^^^

Global ACLs can be used to apply ACLs globally to all user's specific
mailboxes. They are used mainly for two purposes:

1. Removing some permissions from users' personal mailboxes. For example each
   user might have an `Invoices` mailbox which will be read-only.
2. Giving permissions to master user logins. See
   :ref:`ACLs at Master users <authentication-master_users_acls>` for more information.

If a mailbox has both global ACLs and the per-mailbox ACL file, both of them
are read and the ACLs are merged. If there are any conflicts, the global ACL
file overrides per-mailbox ACL file. This is because users can modify their own
per-mailbox ACL files via IMAP ACL extension. Global ACLs can only be modified
by administrator, so users shouldn't be able to override them.

Global ACL file
^^^^^^^^^^^^^^^

.. versionadded:: v2.2.11

Global ACL file path is specified as a parameter to vfile backend in ``acl``
setting (``/etc/dovecot/dovecot-acl`` in the above example). The file contains
otherwise the same data as regular per-mailbox ``dovecot-acl`` files, except
each line is prefixed by the mailbox name pattern. The pattern may contain
``*`` and ``?`` wildcards that do the shell-string matching, not stopping
at any boundaries.


Example:

.. code-block:: none

  * user=foo lrw
  Public user=bar lrwstipekxa
  Public/* user=bar lrwstipekxa

The first line shares every mailbox of every user to the user ``foo`` with a
limited set of rights, and the last line shares every folder below ``Public``
of every user to the user ``bar``.

Global ACL directory (obsolete)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Global ACL directory is specified as a parameter to vfile backend in acl
setting (``/etc/dovecot/acls/`` in the above example). They are looked up using
the mailbox's virtual name.

Example:

* INBOX: ``/etc/dovecot/acls/INBOX``
* archives.2007: ``/etc/dovecot/acls/archives.2007``
* archives/2007: ``/etc/dovecot/acls/archives/2007``

The filenames must start with namespace prefix (if it has one). For example
with namespace ``prefix=INBOX/`` containing mailbox `foo` use
``/etc/dovecot/acls/INBOX/foo``.

There is an extra problem with mailbox formats that use '/' as the separator
(e.g. mbox, dbox): For example if you have mailboxes `foo` and `foo/bar` and
you wish to give ACLs to both of them, you can't create both
``/etc/dovecot/acls/foo`` and ``/etc/dovecot/acls/foo/bar`` files. The foo has
to be either a directory or a file, it can't be both. To solve this problem,
you can instead create a .DEFAULT file for `foo`:

* foo: ``/etc/dovecot/acls/foo/.DEFAULT``
* foo/bar: ``/etc/dovecot/acls/foo/bar``

ACL files
^^^^^^^^^

The files themselves are in format:

.. code-block:: none

   <identifier> <ACLs> [:<named ACLs>]

Where **identifier** is one of:

* group-override=**group name**
* user=**user name**
* owner
* group=**group name**
* authenticated
* anyone (or anonymous, which is alias for anyone)

The ACLS are processed in the precedence given above, so for example if you
have given read-access to a group, you can still remove that from specific
users inside the group.

Group-override identifier allows you to override users' ACLs. Probably the most
useful reason to do this is to temporarily disable access for some users. For
example:

.. code-block:: none

  user=timo rw
  group-override=tempdisabled

Now if timo is in tempdisabled group, he has no access to the mailbox. This
wouldn't be possible with a normal group identifier, because the ``user=timo``
would override it.

The currently supported ACLs and their corresponding named ACLs are:

==== =============== ======================================================================================================================================================================================
l     lookup          Mailbox is visible in mailbox list. Mailbox can be subscribed to.
r     read            Mailbox can be opened for reading.
w     write           Message flags and keywords can be changed, except \Seen and \Deleted
s     write-seen      \Seen flag can be changed
t     write-deleted   \Deleted flag can be changed
i     insert          Messages can be written or copied to the mailbox
p     post            Messages can be posted to the mailbox by `LDA <https://wiki.dovecot.org/LDA>`_, e.g. from :ref:`pigeonhole_sieve_interpreter`
e     expunge         Messages can be expunged
k     create          Mailboxes can be created (or renamed) directly under this mailbox (but not necessarily under its children, see ACL Inheritance section above) (renaming also requires delete rights)
x     delete          Mailbox can be deleted
a     admin           Administration rights to the mailbox (currently: ability to change ACLs for mailbox)
==== =============== ======================================================================================================================================================================================

The ACLs are compatible with RFC 4314 (IMAP ACL extension, updated version).

Unknown ACL letters are complained about, but unknown named ACLs are ignored.
Named ACLs are mostly intended for future extensions.

.. Note::

  The file is rather picky about formatting; using a tab (or multiple spaces)
  instead of a space character between fields may not work. If you are having
  problems, make sure to check for tabs, extra spaces and other unwanted
  characters.

Examples
^^^^^^^^

Mailbox owner has all privileges, `timo` has list-read privileges:

.. code-block:: none

  owner lrwstipekxa
  user=timo lr

Allow everyone to list and read a public mailbox (public namespace has no
owner):

.. code-block:: none

  anyone lr

Prevent all users from deleting their Spam folder (notice no x flag)

.. code-block:: none

  INBOX.Spam owner lrwstipeka

List cache
^^^^^^^^^^

``dovecot-acl-list`` file lists all mailboxes that have ``l`` rights assigned.
If you manually add/edit ``dovecot-acl`` files, you may need to delete the
``dovecot-acl-list`` to get the mailboxes visible.

Dictionaries
^^^^^^^^^^^^

In order for an ACL to be fully useful, it has to be communicated to IMAP clients.
For example, if you use ACL to share a mailbox to another user, the client has to
be explicitly told to check out the other user's mailbox too, as that one is shared.
Placing the ACL file makes the ACL effective, but ``dovecot`` doesn't take care of
the user->shared mailboxes mapping out of the box, and as a result, it won't publish
shared mailboxes to clients if this is not set up.
You have to configure this manually by defining an appropriate
`dictionary <https://wiki.dovecot.org/Dictionary>`_ to store the share map.

Certain dictionary backends are writable by ``dovecot``, so when you establish
an ACL using ``doveadm``, a dictionary entry is added along to the ACL.
