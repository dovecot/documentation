.. _authentication-passwd:

======
Passwd
======

User is looked up using ``getpwnam()`` call, which usually looks into
``/etc/passwd`` file, but depending on the NSS configuration it may also
look up the user from eg. LDAP database.

Most commonly used as a user database.

The lookup is by default done in the auth worker processes. If you have only a
small local passwd file, you can avoid having extra auth worker processes by
disabling it:

.. code-block:: none

  userdb passwd {
    args = blocking=no
  }

Field overriding and extra fields
=================================

It's possible to override fields from passwd and add :ref:`authentication-user_database_extra_fields` with templates, but in
v2.1+ it's done in a better way by using :dovecot_core:ref:`userdb_override_fields`.

For example:

.. code-block:: none

  userdb passwd {
    override_fields {
      home = /var/mail/%u
      mail_driver = maildir
      mail_path = /var/mail/%u/Maildir
    }
  }

This uses the UID and GID fields from passwd, but home directory is overridden.
Also the default :ref:`mail_location_settings`
setting is overridden.

Passwd as a password database
=============================

Many systems use shadow passwords nowadays so passwd doesn't usually work as a
password database. BSDs are an exception to this, they still set the password
field even with shadow passwords.

With FreeBSD, passwd doesn't work as a password database because the password
field is replaced by a ``*``. But you can use :ref:`Passwd-file <authentication-passwd_file>`.

