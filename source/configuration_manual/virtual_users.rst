.. _virtual_users:

=============
Virtual Users
=============

There are many ways to configure Dovecot to use virtual users. If you
have no idea how you want your users to be configured, select some
:ref:`HOWTO <howto_virtual_users>` and follow its
instructions.

Users are often categorized as being either system users (in
``/etc/passwd``) or virtual users (not in ``/etc/passwd``). However from
Dovecot's point of view there isn't much of a difference between them.
If a :ref:`passwd <authentication-passwd>` lookup and a
:ref:`SQL <authentication-sql>` lookup return the same
:ref:`userdb <authentication-user_database>` information,
Dovecot's behavior is identical.

Password and user databases
===========================

Dovecot supports many different :ref:`password databases <authentication-password_databases>`
and :ref:`user databases <authentication-user_database>`. With virtual users the
most commonly used ones are :ref:`LDAP <authentication-ldap>`,
:ref:`SQL <authentication-sql>` and :ref:`passwd-file <authentication-passwd_file>`.
The databases usually contain the following information:

-  Username

-  Password

-  UNIX User ID (UID) and primary UNIX Group ID (GID)

-  Home directory and/or mail location

Usernames and domains
---------------------

Dovecot doesn't care much about domains in usernames. IMAP and POP3
protocols currently have no concept of "domain", so the username is just
something that shows up in your logs and maybe in some configuration,
but they have no direct functionality.

So although Dovecot makes it easier to handle "user@domain" style
usernames (eg. ``%n`` and ``%d`` :ref:`variables <config_variables>`),
nothing breaks if you use for example ``domain%user`` style usernames
instead. However some :ref:`authentication mechanisms <authentication-authentication_mechanisms>`
do have an explicit support for realms (pretty much the same as
domains). If those mechanisms are used, the username is changed to be
``user@realm``.

And of course there's no need to have domains at all in the usernames.

Passwords
---------

The password can be in :ref:`any format that Dovecot supports <authentication-password_schemes>`,
but you need to tell the format to Dovecot because it won't try to guess
it. The SQL and LDAP configuration files have the
``default_pass_scheme`` setting for this. If you have passwords in
multiple formats, or the passdb doesn't have such a setting, you'll need
to prefix each password with ``{<scheme>}``, for example
``{PLAIN}plaintext-password`` or
``{PLAIN-MD5}1a1dc91c907325c69271ddf0c944bc72``.

UNIX UIDs
---------

The most important thing you need to understand is that **Dovecot
doesn't access the users' mails as the dovecot user**! So **do not** put
*dovecot* into the *mail* group, and don't make mails owned by the
*dovecot* user. That will only make your Dovecot installation less
secure.

So, if not the *dovecot* user, what then? You can decide that yourself.
You can create, for example, one *vmail* user which owns all the mails,
or you can assign a separate UID for each user. See
:ref:`system_users_used_by_dovecot`
for more information about different ways to allocate UIDs for users.

UNIX GIDs
---------

Unless you're using :ref:`shared mailboxes <shared_mailboxes>`
and multiple UIDs, it doesn't really matter what GIDs you use. You can,
for example, use a single GID for all users, or create a separate GID
for each user. See :ref:`system_users_used_by_dovecot` for more information.

.. _virtual_users-homedir:

Home directories
----------------

Home directory is a per-user directory where **Dovecot can save
user-specific files**.

-  Dovecot's home directories have nothing to do with system users' home
   directories.

-  It's irrelevant if it's under ``/home/`` or ``/var/mail/`` or
   wherever.

-  If you have trouble understanding this, mentally replace all
   occurrences of "home directory" with "mail user's private state
   directory".

And in particular:

-  Never configure your userdb to return the same home directory for
   multiple users, this will break things.

-  Home directory must be an absolute path, don't even try to use
   relative paths, these do not work.

Some uses for home directory are:

-  By default :ref:`Sieve <sieve>` scripts are in a user's home directory.

-  The Duplicate mail check database is in a user's home directory.
   Suppression of duplicate rejects/vacations won't work if home
   directory isn't specified.

-  Debugging: If an imap or pop3 process crashes, the core file is
   written to the user's home directory.

Home vs. mail directory
~~~~~~~~~~~~~~~~~~~~~~~

Home directory shouldn't be the same as mail directory with mbox or
Maildir formats (but with dbox/obox it's fine). It's possible to do
that, but you might run into trouble with it sooner or later. Some
problems with this are:

-  Non-mailbox files may show up as mailboxes.

   -  If you see this with Maildir, :dovecot_core:ref:`maildir_stat_dirs=yes <maildir_stat_dirs>` hides
      them.

-  Or a user might not be able to create mailbox with some wanted name,
   because there already exists a conflicting file or directory.

   -  e.g. with Maildir if you have ``.dovecot.sieve`` file, user can't
      create a mailbox called "dovecot.sieve" (i.e. "dovecot" mailbox
      that has a "sieve" child)

-  And vice versa: If user creates "dovecot.sieve" mailbox, Dovecot will
   probably start logging all kinds of errors because the mailbox
   directory isn't a valid :ref:`Sieve <sieve>`  script.

-  If you ever intend to migrate to another mailbox format, it's much
   easier to do if you can have both old and new mail directories under
   the user's home directory.

Ways to set up home directory
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The directory layouts for home and mail directories could look like one
of these (in the preferred order):

1. Mail directory under home, for example:

 -  ``home=/var/vmail/domain/user/``
 -  ``mail=/var/vmail/domain/user/mail/``

2. Completely distinct home and mail directories:

 - ``home=/home/virtual/domain/user/``
 - ``mail=/var/vmail/domain/user/``

3. Home directory under mail, for example:

   -  Maildir:
      - ``home=/var/vmail/domain/user/home/``
      - ``mail=/var/vmail/domain/user/``

   -  mbox: There's really no good and safe way to do it.

4. The home directory is the same as the mail directory.

If for example ``home=/var/vmail/domain/user/`` and ``mail=/var/vmail/domain/user/mail/``, set:

::

   mail_home = /var/vmail/%d/%n
   mail_driver = maildir
   mail_path = ~/mail


LDAP with relative directory paths
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

If your LDAP database uses e.g. ``mailDirectory = domain/user/``, you
can use it as a base for home directory:

::

   user_attrs = .., mailDirectory=home=/var/vmail/%$

Then just use ``mail_path = ~/Maildir``.



Mail location
~~~~~~~~~~~~~

If your users have varying locations for mail location, which cannot be represented by
templating, userdb can return the :ref:`mail_path field <authentication-user_database_extra_fields>` to
override the default :dovecot_core:ref:`mail_path` setting. Normally this is not
needed, and it is sufficient to have the setting in config file.


Dynamic passwd-file locations
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

In the following example users are expected to log in as ``user@domain``.
Their mail is kept in their home directory at
``/home/<domain>/<username>/Maildir``.

The usernames in the passwd and shadow files are expected to contain
only the user part, no domain. This is because the path itself already
contained %d to specify the domain. If you want the files to contain
full ``user@domain`` names, you can change username_format to %u or
leave it out.

Note that the default :dovecot_core:ref:`auth_username_format` is ``%Lu``.

::

   mail_driver = maildir
   mail_path = /home/%d/%n/Maildir
   passdb {
     driver = passwd-file
     args = username_format=%n /home/%d/etc/shadow
   }
   userdb {
     driver = passwd-file
     args = username_format=%n /home/%d/etc/passwd
   }

static userdb
~~~~~~~~~~~~~

Many people store only usernames and passwords in their database and
don't want to deal with UIDs or GIDs. In that case the easiest way to
get Dovecot running is to use the :ref:`static userdb <authentication-static_user_database>`:

::

   mail_driver = maildir
   mail_path = ~/Maildir
   passdb {
     driver = pam
   }
   userdb {
     driver = static
     args = uid=vmail gid=vmail home=/var/mail/virtual/%d/%n
   }

This makes Dovecot look up the mails from
``/var/mail/virtual/<domain>/<user>/Maildir/`` directory, which should
be owned by vmail user and vmail group.
