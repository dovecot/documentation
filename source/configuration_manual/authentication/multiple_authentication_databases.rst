.. _authentication-multiple_authentication_databases:

=================================
Multiple Authentication Databases
=================================

Dovecot supports defining multiple authentication databases, so that if the
password doesn't match in the first database, it checks the next one. This can
be useful if you want to easily support having both local system users in
``/etc/passwd`` and virtual users.

Currently the fallback works only with the PLAIN authentication mechanism.

Often you also want a different mail location for system and virtual users. The
best way to do this would be to always have mails stored below the home
directory (:ref:`virtual users should have a home directory too
<virtual_users-homedir>`):

* System users' mails: /home/user/Maildir
* Virtual users' mails: /var/vmail/domain/user/Maildir

This can be done by simply having both system and virtual userdbs return home
directory properly (i.e. virtual users' ``home=/var/vmail/%d/%n``) and then set
``mail_path = ~/Maildir``.

If it's not possible to have a home directory for virtual users (avoid that if
possible), you can do this by pointing multiple authentication databases
to system users' mail location and have the virtual userdb override it by
returning mail :ref:`authentication-password_database_extra_fields`.

Example with home dirs
======================

* System users' mails: /home/user/Maildir
* Virtual users' mails: /var/vmail/domain/user/Maildir

dovecot.conf:

.. code-block:: none

  # Mail location for both system and virtual users:
  mail_driver = maildir
  mail_path = ~/Maildir

  # try to authenticate using SQL database first
  passdb sql {
    args = /etc/dovecot/dovecot-sql.conf.ext
  }
  # fallback to PAM
  passdb pam {
  }

  # look up users from SQL first (even if authentication was done using PAM!)
  userdb sql {
    args = /etc/dovecot/dovecot-sql.conf.ext
  }
  # if not found, fallback to /etc/passwd
  userdb passwd {
  }

dovecot-sql.conf.ext:

.. code-block:: none

  password_query = SELECT userid as user, password FROM users WHERE userid = '%u'
  user_query = SELECT uid, gid, '/var/vmail/%d/%n' as home FROM users WHERE userid = '%u'
