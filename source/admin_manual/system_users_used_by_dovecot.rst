.. _system_users_used_by_dovecot:

============================
System users used by Dovecot
============================

Dovecot typically requires 3 or more system users:

* `root`: Dovecot is started as root.
* `dovenull`: Dovecot uses an unprivileged dovenull user for untrusted login
  processes.
* `dovecot`: Dovecot uses an unprivileged dovecot user for internal processes.
* `auth user`: Password and user database lookups are done as auth user.
* `mail user(s)`: Mails are accessed using yet another user. The mail user
  should not be dovecot user.

Using multiple users allows privilege separation, which makes it harder for
attackers to compromise the whole system if a security hole is found from one
component. However, if you really want to run everything under a single user,
`it's possible <https://wiki.dovecot.org/HowTo/Rootless>`_.

Dovenull user
=============

`dovenull` user is used internally for processing users' logins. It shouldn't
have access to any files, authentication databases or anything else either. It
should belong to its own private **dovenull** group where no one else belongs
to, and which doesn't have access to any files either (other than what Dovecot
internally creates).

You can change the default `dovenull` user to something else from
``default_login_user`` setting.

Dovecot user
============

`dovecot` user is used internally for unprivileged Dovecot processes. It should
belong to its own private dovecot group. Mail files are not accessed as dovecot
user, so you shouldn't give it access to mails.

You can change the default dovecot user to something else from
``default_internal_user`` setting.

Mail users
==========

You can use one or more system users for accessing users' mails. Most
configurations can be placed to two categories:

1. `System users <https://wiki.dovecot.org/SystemUsers>`_ where each Dovecot
   user has their own system user in ``/etc/passwd``. For system user setups
   you generally don't have to worry about UIDs or GIDs, they are returned by
   the userdb passwd lookup.
2. `Virtual users <https://wiki.dovecot.org/VirtualUsers>`_ where all Dovecot
   users run under a single system user. Typically you'd set this with
   ``mail_uid`` setting (e.g. ``mail_uid=vmail``). Note that you most likely
   don't want the userdb lookup to return any UID/GID, as they override the
   ``mail_uid`` setting.

However it's possible to use a setup that is anything between these two. For
example use a separate system user for each domain. See below for more
information about how UIDs can be used.

UIDs
====

Dovecot's :ref:`authentication-user_database` configuration calls system users UIDs.
There are a few things you should know about them:

* Although UID normally means a numeric ID (as specified by ``/etc/passwd``),
  it's anyway possible to use names as UID values and let Dovecot do the lookup
  (eg. ``uid=vmail``). However depending on where you used it, it may slow down
  the authentication.
* The UIDs don't really have to exist in ``/etc/passwd`` (the kernel doesn't
  care about that). For example you could decide to use UIDs 10000-59999 for
  50000 virtual Dovecot users. You'll then just have to be careful that the
  UIDs aren't used unintentionally elsewhere.
* The important thing to consider with your UID allocation policy is that if
  Dovecot has a security hole in its IMAP or POP3 implementation, the attacker
  can read mails of other people who are using the same UID. So clearly the
  most secure way is to allocate a different UID for each user. It can however
  be a bit of a pain and OSes don't always support more than 65536 UIDs.
* By default Dovecot allows users to log in only with UID numbers 500 and
  above. This check tries to make sure that no-one can ever log in as daemons
  or other system users. If you're using an UID lower than 500, you'll need to
  change the ``first_valid_uid`` setting.

GIDs
====

System groups (GIDs) work very much the same way as UIDs described above: You
can use names instead of numbers for GID values, and the used GIDs don't have
to exist in ``/etc/group``.

System groups are useful for sharing mailboxes between users that have
different UIDs but belong to a same group. Currently Dovecot doesn't try to do
anything special with the groups, so if you're not sure how you should create
them, you might as well place all the users into a single group or create a
separate group for each user.

If you use multiple UIDs and you wish to create :ref:`shared_mailboxes`,
setting up the groups properly
may make your configuration more secure. For example if you have two teams and
their mailboxes are shared only to their team members, you could create a group
for each team and set the shared mailbox's group to the team's group and
permissions to 0660, so neither team can even accidentally see each others'
shared mailboxes.

Currently Dovecot supports specifying only the primary group, but if your
userdb returns ``system_user``
:ref:`extra field <authentication-user_database_extra_fields>`, the
non-primary groups are taken from ``/etc/group`` for that user. In a future
version the whole GID list will be configurable without help from
``/etc/group``.

It's also possible to give all the users access to extra groups with
``mail_access_groups`` setting.

Authentication process user
===========================

Depending on passdb and userdb configuration, the lookups are done either by
auth process or auth worker process. They have different default users:

.. code-block:: none

  service auth {
    user = $default_internal_user
  }
  service auth-worker {
    user = root
  }

The user must have access to your :ref:`authentication-password_databases`
and :ref:`authentication-user_database`. It's not used for anything else. The
default is to use root, because it's guaranteed to have access to all the
password databases. If you don't need this, you should change it to
``$default_internal_user``.

:ref:`authentication-pam` and :ref:`authentication-shadow` passdbs are usually
configured to read ``/etc/shadow`` file. Even this doesn't need root access if
the file is readable by shadow group:

.. code-block:: none

  service auth-worker {
    user = $default_internal_user
    group = shadow
  }
