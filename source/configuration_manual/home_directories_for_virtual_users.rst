.. _home_directories_for_virtual_users:

===================================
Home Directories for Virtual Users
===================================

Home directory is a per-user directory where **Dovecot can save user-specific
files**.

* Dovecot's home directories have nothing to do with system users' home
  directories.
* It's irrelevant if it's under ``/home/`` or ``/var/mail/`` or wherever.
* If you have trouble understanding this, mentally replace all occurrences of
  home directory with mail user's private state directory.

And in particular:

* Never configure your userdb to return the same home directory for multiple
  users!
* Home directory must be an absolute path, don't even try to use relative
  paths!

Some uses for home directory are:

* By default :ref:`Sieve <sieve>` scripts are
  in user's home directory.
* Duplicate mail check database is in user's home directory. Suppression of
  duplicate rejects/vacations won't work if home directory isn't specified.
* Debugging: If an imap or pop3 process crashes, the core file is written to
  the user's home directory.

Home vs. mail directory
=======================

Home directory shouldn't be the same as mail directory with mbox or Maildir
formats (but with dbox/obox it's fine). It's possible to do that, but you might
run into trouble with it sooner or later. Some problems with this are:

* Non-mailbox files may show up as mailboxes.

 * If you see this with Maildir, ``maildir_stat_dirs=yes`` hides them.

* Or user just might not be able to create mailbox with wanted name, because
  there already exists a conflicting file

 * e.g. with Maildir if you have ``.dovecot.sieve`` file, user can't create a
   mailbox called ``dovecot.sieve`` (i.e. dovecot mailbox that has a sieve
   child)

* And vice versa: If user creates ``dovecot.sieve`` mailbox, Dovecot will
  probably start logging all kinds of errors because the mailbox directory
  isn't a valid :ref:`Sieve <sieve>` script.
* If you ever intend to migrate to another mailbox format, it's much easier to
  do if you can have both old and new mail directories under the user's home
  directory.

Ways to set up home directory
=============================

The directory layouts for home and mail directories could look like one of
these (in the preferred order):

1. Mail directory under home, for example: home= ``/var/vmail/domain/user/``
   mail= ``/var/vmail/domain/user/mail/``
2. Completely distinct home and mail directories:
   home= ``/home/virtual/domain/user/`` mail= ``/var/vmail/domain/user/``
3. Home directory under mail, for example:

 * Maildir: home= ``/var/vmail/domain/user/home/``
   mail= ``/var/vmail/domain/user/``
 * mbox: There's really no good and safe way to do it.

4. The home directory is the same as the mail directory.

If for example home= ``/var/vmail/domain/user/``
mail= ``/var/vmail/domain/user/mail/`` , 

set:

.. code-block:: none

  mail_home = /var/vmail/%d/%n
  mail_location = maildir:~/mail

Examples
========

LDAP with relative directory paths
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

If your LDAP database uses e.g. ``mailDirectory=domain/user/``, you can use it
as a base for home directory:

.. code-block:: none

  user_attrs = .., mailDirectory=home=/var/vmail/%$

Then just use ``mail_location=maildir:~/Maildir``.
