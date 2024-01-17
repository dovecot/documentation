.. _system_users:

============
System Users
============

System users are typically defined in ``/etc/passwd`` file, but this
isn't necessary. Using
`NSS <http://en.wikipedia.org/wiki/Name_Service_Switch>`__ you can
configure the lookups to be done from elsewhere (e.g. LDAP). See
:ref:`passwd <authentication-passwd>`
userdb configuration for how to set this up. Especially if you're using
nss_ldap you must set ``blocking=yes``.

System users usually have their own separate user IDs (UIDs). This is
good from a security point of view, because it means that the kernel will
also prevent users from accessing each others' mails.

If the users have direct write access to the mail files (eg. the users
have shell access), they can easily cause all sorts of mailbox
corruptions. That may generate all kinds of error messages to Dovecot's
error logs, so it may be sometimes difficult to tell if there really is
a problem or if the user is doing something stupid.

If users are going to access the mailboxes with other software than
Dovecot, it's important to make sure that their mailbox accesses are
compatible. This mostly means that with mboxes you must make sure that
everyone uses the :ref:`same locking methods in the same order <mbox_mbox_format>`.

Authentication
--------------

Admins often wish to use different passwords for IMAP and POP3 than for
other services (eg. SSH), because IMAP and POP3 clients often send the
password unencrypted over the internet without even bothering to give
users any warnings. Dovecot can easily support non-system passwords for
system users.

If you wish to use system passwords, you'll want to use one of these
passdbs:

-  :ref:`PAM <authentication-pam>`:
   Most commonly used in Linux and BSDs nowadays.

-  :ref:`BSDAuth <authentication-bsdauth>`:
   BSD authentication is used by OpenBSD.

-  :ref:`Passwd <authentication-passwd>`:
   System users (NSS, ``/etc/passwd``, or similar). This may work
   instead of PAM (mostly in some BSDs).

If you wish to use non-system passwords, you can use pretty much any of
the Dovecot's :ref:`password databases <authentication-password_databases>`,
but for simple installations you'll probably want to use
:ref:`passwd-file <authentication-passwd_file>`.

:ref:`User database <authentication-user_database>`
for system users is always :ref:`passwd <authentication-passwd>`.

Mail Location
-------------

Usually UNIX systems are configured by default to deliver mails to
``/var/mail/username`` or ``/var/spool/mail/username`` mboxes. You may
decide to use these, or use the :ref:`maildir <maildir_mbox_format>` format instead.

Dovecot detects the mailbox format and location automatically if
:dovecot_core:ref:`mail_driver` setting isn't set, but it's still a good idea to
explicitly tell Dovecot where to find the mails. This ensures that
Dovecot behaves correctly also when the user's mailbox doesn't exist at
the moment (eg. a new user). If Dovecot can't figure out where the
existing mails are, it will give an error message and quits. It never
tries to create a missing mailbox when autodetection is used.

See :ref:`mail_location_settings` for more information how to configure the mailbox location.
Below are the highlights for mbox and maildir.

mbox
~~~~

The ``/var/mail/username`` mbox is called user's INBOX. IMAP protocol
supports multiple mailboxes however, so Dovecot needs some directory
where to store the other mailboxes. Typically they're stored in
``~/mail/`` or ``~/Mail/`` directory. All of these locations are
included in mailbox location autodetection. You can specify them
manually with:

::

   mail_driver = mbox
   mail_path = ~/mail
   mail_inbox_path = /var/mail/%u

Remember that the first path after ``mbox:`` is the mailbox root
directory, never try to give ``mbox:/var/mail/%u`` because that
isn't going to work (unless you really want to store mails under
``/var/mail/%u/`` directory).

If you're also using other software than Dovecot to access mboxes, you
should try to figure out what locking methods exactly they're using and
update ``mbox_read_locks`` and ``mbox_write_locks`` settings
accordingly. See locking section in :ref:`mbox <mbox_mbox_format>` for
more information.

Maildir
~~~~~~~

Maildir is typically stored in ``~/Maildir`` directory. You can specify
this manually with:

::

   mail_driver = maildir
   mail_path = ~/Maildir

See :ref:`maildir_mbox_format` for more information.

Chrooting
---------

Dovecot, including several other software, allow using "/./" in home
directory path to specify the chroot path. For example ``/home/./user``
would chroot to ``/home``. If you want to enable this for Dovecot, add
the chroot path to ``valid_chroot_dirs`` setting (``/home`` in the
previous example). If this isn't done, Dovecot ignores the "/./".

See :ref:`Chrooting` for more details.
