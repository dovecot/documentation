.. _user_shared_mailboxes:

=============================
Mailbox sharing between users
=============================

To enable mailbox sharing, you'll need to create a shared namespace. See
:ref:`ACL <acl>` for more information about ACL-specific settings.

::

   # User's private mail location.
   mail_driver = maildir
   mail_path = ~/Maildir

   # When creating any namespaces, you must also have a private namespace:
   namespace {
     type = private
     separator = /
     prefix =
     # use global mail_path
     inbox = yes
   }

   namespace {
     type = shared
     separator = /
     prefix = shared/%%u/
     mail_path = %{owner_home}/Maildir
     mail_index_private_path = ~/Maildir/shared/%{owner_user}
     # If users have direct filesystem level access to their mails, it's safer
     # to not share the index files between users:
     #mail_index_path = ~/Maildir/shared/%{owner_user}
     subscriptions = no
     list = children
   }

   mail_plugins = acl
   protocol imap {
     mail_plugins = $mail_plugins imap_acl
   }

   acl = vfile

This creates a shared/ namespace under which each user's mailboxes are.
If you have multiple domains and allow sharing between them, you might
want to set ``prefix=shared/%%d/%%n/`` instead (although %%u works just
fine too). If you don't, you might want to drop the domain part and
instead use ``prefix=shared/%%n/``.

``list=children`` specifies that if no one has shared mailboxes to the
user, the "shared" directory isn't listed by the LIST command. If you
wish it to be visible always, you can set ``list=yes``.

The sharing user can be accessed with ``%{owner_user}``, ``%{owner_username}``
and ``%{owner_domain}`` variables. The sharing user's home directory can also
be looked up via :ref:`authentication-user_database` using ``%{owner_home}``
variable. These can be used in :ref:`mail_location_settings`.
If the users' mailboxes can be found using a template, it's a bit more
efficient to not use ``%{owner_home}``. For example:

::

     mail_driver = maildir
     mail_path = /var/mail/%{owner_domain}/%{owner_username}/Maildir
     mail_index_private_path = ~/Maildir/shared/%{owner_user}


dbox
----

With dbox the index files are a very important part of the mailboxes.
You must not try to change :dovecot_core:ref:`mail_index_path` to a
user-specific location. This will only result in mailbox corruption.
(:dovecot_core:ref:`mail_index_private_path` can be used though.)

Filesystem permissions
----------------------

Dovecot assumes that it can access the other users' mailboxes. If you
use multiple UNIX UIDs, you may have problems setting up the permissions
so that the mailbox sharing works. Dovecot never modifies existing
files' permissions. See :ref:`admin_manual_permissions_in_shared_mailboxes`
for more information.


.. _user_shared_mailboxes_shared_mailbox_listing:

Shared mailbox listing
----------------------

With the above configuration it's possible to open shared mailboxes if
you know their name, but they won't be visible in the mailbox list. This
is because Dovecot has no way of knowing what users have shared
mailboxes to whom. Iterating through all users and looking inside their
mail directories would be horribly inefficient for more than a couple
users.

To overcome this problem Dovecot needs a dictionary, which contains the
list of users who have shared mailboxes and to whom they have shared. If
the users aren't properly listed in this dictionary, their shared
mailboxes won't be visible. Currently there's no way to automatically
rebuild this dictionary, so make sure it doesn't get lost. If it does,
each user having shared mailboxes must use the IMAP SETACL command (see
below) to get the dictionary updated for themselves.

See :dovecot_plugin:ref:`acl_sharing_map` for plugin setting information.

You could use any dictionary backend, including SQL or Cassandra, but a
simple flat file should work pretty well too:

::

   acl_sharing_map {
     dict_driver = file
     dict_file_path = file:/var/lib/dovecot/db/shared-mailboxes.db
   }

The IMAP processes must be able to write to the ``db/`` directory. If
you're using system users, you probably want to make it mode 0770 and
group ``sharedusers`` and set ``mail_access_groups=sharedusers`` (or
something similar).

If you use multiple domains and don't wish users to share their
mailboxes to users in other domains, you can use separate dict files for
each domain:

::

   acl_sharing_map {
     dict_driver = file
     dict_file_path = file:/var/mail/%d/shared-mailboxes.db
   }

Using SQL dictionary
~~~~~~~~~~~~~~~~~~~~

``dovecot.conf``:

::

   acl_sharing_map {
     dict_driver = proxy
     dict_proxy_name = acl
   }

   dict {
     acl = pgsql:/etc/dovecot/dovecot-dict-sql.conf.ext
   }

See :ref:`dict` for more information, especially about permission issues.

Database tables:

::

   CREATE TABLE user_shares (
     from_user varchar(100) not null,
     to_user varchar(100) not null,
     dummy char(1) DEFAULT '1',    -- always '1' currently
     primary key (from_user, to_user)
   );
   COMMENT ON TABLE user_shares IS 'User from_user shares folders to user to_user.';

   CREATE INDEX to_user
   ON user_shares (to_user); -- because we always search for to_user

   CREATE TABLE anyone_shares (
     from_user varchar(100) not null,
     dummy char(1) DEFAULT '1',    -- always '1' currently
     primary key (from_user)
   );
   COMMENT ON TABLE anyone_shares IS 'User from_user shares folders to anyone.';

``/etc/dovecot/dovecot-dict-sql.conf.ext``:

::

   connect = host=localhost dbname=mails user=sqluser password=sqlpass
   map {
     pattern = shared/shared-boxes/user/$to/$from
     table = user_shares
     value_field = dummy

     fields {
       from_user = $from
       to_user = $to
     }
   }

   map {
     pattern = shared/shared-boxes/anyone/$from
     table = anyone_shares
     value_field = dummy

     fields {
       from_user = $from
     }
   }

Mailbox sharing
---------------

You can use ``doveadm acl`` (see man page for usage details) to share mailboxes
or it can be done using IMAP SETACL command. It is
the only way to update the shared mailbox list dictionary.

Below is a quick introduction to IMAP ACL commands. See :rfc:`4314`
for more details.

-  ``MYRIGHTS <mailbox>``: Returns the user's current rights to the mailbox.

-  ``GETACL <mailbox>``: Returns the mailbox's all ACLs.

-  ``SETACL <mailbox> <id> [+|-]<rights>``: Give <id> the specified rights
   to the mailbox.

-  ``DELETEACL <mailbox> [-]<id>``: Delete <id>'s ACL from the mailbox.
   <id> is one of:

        -  ``anyone``: Matches all users, including anonymous users.

        -  ``authenticated``: Like "anyone", but doesn't match anonymous users.

        -  ``$group``: Matches all users belonging to the group ($ is not part of
           the group name).

        -  ``$!group``: See ``group-override`` in :ref:`acl`
           (Dovecot-specific feature).

        -  ``user``: Matches the given user.

The ``$group`` syntax is not a standard, but it is mentioned in :rfc:`4314`
examples and is also understood by at least Cyrus IMAP. Having '``-``'
before the identifier specifies negative rights.

See :ref:`acl` for list of <rights>.

Sharing Mailboxes to Everyone
-----------------------------

See :dovecot_plugin:ref:`acl_anyone`.

Note that you can also do this only for some users by using the second
table "``anyone_shares``". Every user listed in this table shares his
folders with everyone. See also :ref:`userdb extra
field <authentication-password_database_extra_fields>`.

IMAP ACL examples
-----------------

Let's begin with some simple example that first gives "read" and
"lookup" rights, and later adds "write-seen" right:

::

   1 SETACL Work user@domain rl
   1 OK Setacl complete.

   2 SETACL Work user@domain +s
   2 OK Setacl complete.

   3 GETACL Work
   * ACL "Work" "user@domain" lrs "myself" lrwstipekxacd
   3 OK Getacl completed.

Let's see how negative rights work by testing it on ourself. See how we
initially have "lookup" right, but later we don't:

::

   1 MYRIGHTS Work
   * MYRIGHTS "Work" lrwstipekxacd
   1 OK Myrights completed.

   2 SETACL Work -myself l
   2 OK Setacl complete.

   3 GETACL Work
   * ACL "Work" "-myself" l "user@domain" lr "myself" lrwstipekxacd
   3 OK Getacl completed.

   4 myrights Work
   * MYRIGHTS "Work" rwstipekxacd
   4 OK Myrights completed.

Troubleshooting
---------------

-  Make sure the ``%`` and ``%%`` variables are specified correctly in the
   namespace location. ``mail_debug=yes`` will help you see if Dovecot
   is trying to access correct paths.

-  ``doveadm acl debug -u user@domain shared/user/box`` can be helpful
   in figuring out why a mailbox can't be accessed.
