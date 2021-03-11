.. _admin_manual_permissions_in_shared_mailboxes:

============================================
Filesystem permissions (in shared mailboxes)
============================================

IMAP processes need filesystem level permissions to access shared/public
mailboxes. This means that:

-  If you use more than one :ref:`UNIX UID <system_users_used_by_dovecot>`
   for your mail users (e.g. you use system users), you'll need to make
   sure that all users can access the mailboxes on filesystem level.
   (:ref:`ACL plugin <acl>`  won't help you with this.)

-  You can remove write permissions on purpose from public namespace
   root directory to prevent users from creating new mailboxes under it.

Dovecot never modifies permissions for existing mail files or
directories. When users share mailboxes between each others, the system
must have been set up in a way that filesystem permissions don't get in
the way. The easiest way to do that is to use only a single UID. Another
possibility would be to use one or more groups for all the mail files
that may be shared to other users belonging to the same group. For
example if you host multiple domains, you might create a group for each
domain and allow mailbox sharing (only) between users in the same
domain.

System user UNIX groups
-----------------------

There's no requirement to use UNIX groups (i.e. typically defined in
``/etc/group``) for anything. If you don't care about them, you can
safely ignore this section.

If you use :ref:`authentication-passwd` userdb, the IMAP process has
access to all the UNIX groups defined for that user. You may use these
groups when granting filesystem
permissions. If you wish to use UNIX groups defined in ``/etc/group``
but don't use passwd userdb, you can still do this by returning
``system_groups_user`` :ref:`userdb extra fields
<authentication-user_database_extra_fields>`, which contains the UNIX user
name whose groups are read from the group file.

You can also set up extra UNIX groups by listing them in
``mail_access_groups`` setting. To have per-user UNIX groups, return
``mail_access_groups`` as userdb extra field. The advantage of using
this method is that only Dovecot mail processes have access to the
group, but nothing else, such as user's SSH session. For example a
simple way to set up shared mailbox access for all system users is to
make all mail dirs/files 0770/0660 mode and owned by group "sharedmail"
and then set ``mail_access_groups=sharedmail``. Using more fine grained
groups of course leaks less mail data in case there's a security hole in
Dovecot.

Permissions for new mailboxes
-----------------------------

When creating a new mailbox, Dovecot copies the permissions from the
mailbox root directory. For example with mboxes if you have directories:

::

   drwx--xr-x 8 user group 4096 2009-02-21 18:31 /home/user/mail/
   drwxrwxrwx 2 user group 4096 2009-02-21 18:32 /home/user/mail/foo/

When creating a new foo/bar/ directory, Dovecot gives it permissions:

::

   drwx--xr-x 2 user group 4096 2009-02-21 18:33 /home/user/mail/foo/bar/

As you can see, the file mode was copied from mail/ directory, not
mail/foo/. The group is also preserved. If this causes problems (e.g.
different users having different groups create mailboxes, causing
permission denied errors when trying to preserve the group) you can set
the setgid bit for the root directory:

::

   chmod g+s /home/user/mail

This will cause the group to be automatically copied by the OS for all
created files/directories under it, even if the user doesn't belong to
the group.

Permissions for new files in mailboxes
--------------------------------------

When creating new files inside a mailbox, Dovecot copies the read/write
permissions from the mailbox's directory. For example if you have:

::

   drwx--xr-x 5 user group 4096 2009-02-21 18:53 /home/user/Maildir/.foo/

Dovecot creates files under it with modes:

::

   drwx--xr-x 2 user group 4096 2009-02-21 18:54 cur/
   drwx--xr-x 2 user group 4096 2009-02-21 18:54 new/
   drwx--xr-x 2 user group 4096 2009-02-21 18:54 tmp/
   -rw----r-- 1 user group  156 2009-02-21 18:54 dovecot.index.log
   -rw----r-- 1 user group   17 2009-02-21 18:54 dovecot-uidlist

Note how the g+x gets copied to directories, but for files it's simply
ignored. The group is copied the same way as explained in the previous
section.

When mails are copied between Maildirs, it's usually done by hard
linking. If the source and destination directory permissions are
different, Dovecot create a new file and copies data the slow way so
that it can assign the wanted destination permissions. The source and
destination permission lookups are done only by looking at the mailbox
root directories' permissions, not individual mail files. This may
become a problem if the mail files' permissions aren't as Dovecot
expects.

Permissions to new /domain/user directories
-------------------------------------------

If each user has different UIDs and you have ``/var/mail/domain/user/``
style directories, you run into a bit of trouble. The problem is that
the first user who creates ``/var/mail/domain/`` will create it as 0700
mode, and other users can't create their own user/ directories under it
anymore. The solution is to use a common group for the users and set
``/var/mail/`` directory's permissions properly (group-suid is
required):

::

   chgrp dovemail /var/mail
   chmod 02770 /var/mail # or perhaps 03770 for extra security

and in dovecot.conf:

::

   mail_location = maildir:/var/vmail/%d/%n/Maildir
   mail_access_groups = dovemail

The end result should look like this:

::

   drwxrwsr-x 3 user dovemail 60 Oct 24 12:04 domain.example.com/
   drwx--S--- 3 user user 60 Oct 24 12:04 domain.example.com/user/

Note that this requires that the mail_location setting is in its
explicit format with %variables. Using ``maildir:~/Maildir`` won't work,
because Dovecot can't really know how far down it should copy the
permissions from.

Permissions to new user home directories
----------------------------------------

When mail_location begins with ``%h`` or ``~/``, its permissions are
copied from the first existing parent directory if it has setgid-bit
set. This isn't done when the path contains any other %variables.

Mail Delivery Agent permissions
-------------------------------

When using Dovecot :ref:`LDA <lda>`, it uses all the same configuration
files as IMAP/POP3, so you don't need to worry about it.

When using an external MDA to deliver to a shared mailbox, you need to
make sure that the resulting files have proper permissions. For example
with Procmail + Maildir, set ``UMASK=007`` in ``.procmailrc`` to make
the delivered mail files group-readable. To get the file to use the
proper group, set the group to the Maildir's ``tmp/`` directory and also
set its setgid bit (``chmod g+s``).

Dictionary files
----------------

Created dictionary files (e.g. ``acl_shared_dict = file:...``) also base
their initial permissions on parent directory's permissions. After the
initial creation, the permissions are permanently preserved. So if you
want to use different permissions, just chown/chmod the file.
