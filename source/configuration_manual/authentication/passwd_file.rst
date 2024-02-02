.. _authentication-passwd_file:

===========
Passwd-file
===========

This file is compatible with a normal ``/etc/passwd`` file, and a password file
used by libpam-pwdfile :ref:`PAM <authentication-pam>`
plugin. It's in the following format:

.. code-block:: none

  user:password:uid:gid:(gecos):home:(shell):extra_fields

For a password database it's enough to have only the user and password fields.
For a user database, you need to set also uid, gid and preferably also home
(see :ref:`virtual_users`). (gecos) and (shell) fields are unused by Dovecot.

The password field can be in four formats:

* ``password``: Assume :dovecot_core:ref:`passdb_default_password_scheme`
  (CRYPT) password scheme. See :ref:`authentication-password_schemes`.
* ``{SCHEME}password``: The password is in the given scheme. See
  :ref:`authentication-password_schemes`.
* ``password[13]``: libpam-passwd file compatible format for CRYPT scheme. See
  :ref:`authentication-password_schemes`.
* ``password[34]``: libpam-passwd file compatible format for MD5 scheme. See
  :ref:`authentication-password_schemes`.

extra_fields is a space-separated list of ``key=value`` pairs which can be used
to set various :ref:`passdb settings <authentication-password_database_extra_fields>` and :ref:`userdb settings <authentication-user_database_extra_fields>`.
Keys which begin with a
``userdb_ prefix`` are used for userdb, others are used for passdb. So for
example if you wish to override :dovecot_core:ref:`mail_path`
setting for one user, use
``userdb_mail_path=~/mail``. :ref:`Variable <config_variables>`
expansion is done for extra_fields.

Empty lines and lines beginning with ``#`` character are ignored.

Multiple passwd files
=====================

You can use all the :ref:`Variable <config_variables>` in the
passwd-file filenames, for example:

.. code-block:: none

  passdb db1 {
    driver = passwd-file
    # Each domain has a separate passwd-file:
    passwd_file_path = /etc/auth/%d/passwd
  }

Settings
========

.. dovecot_core:setting:: passwd_file_path
   :values: @string

   Path to the passwd-file.

Also global settings that are commonly overridden inside the passdb filter:

 * :dovecot_core:ref:`passdb_default_password_scheme` specifies the default
   password scheme to be used in the passwd-files.
 * :dovecot_core:ref:`auth_username_format` changes the username that is
   looked up from the passwd-file. For example ``auth_username_format = %{protocol}``
   can be used to lookup the current protocol instead of the username.

Examples
========

.. code-block:: none

  passdb db1 {
    driver = passwd-file
    passdb_default_password_scheme = plain-md5
    auth_username_format = %n
    passwd_file_path = /etc/imap.passwd
  }
  userdb db1 {
    driver = passwd-file
    auth_username_format = %n
    passwd_file_path = /etc/imap.passwd
    default_fields {
      uid = vmail
      gid = vmail
      home = /home/vmail/%u
    }
  }

* The :dovecot_core:ref:`userdb_default_fields` is explained in :ref:`authentication-user_database`. They can be used
  to provide default userdb fields based on templates in case they're not
  specified for everyone in the passwd file. If you leave any of the standard
  userdb fields (uid, gid, home) empty, these defaults will be used.

This file can be used as a passdb:

.. code-block:: none

  user:{plain}password
  user2:{plain}password2

passdb with extra fields:

.. code-block:: none

  user:{plain}password::::::allow_nets=192.168.0.0/24

This file can be used as both a passwd and a userdb:

.. code-block:: none

  user:{plain}pass:1000:1000::/home/user::userdb_mail_path=~/Maildir allow_nets=192.168.0.0/24
  user2:{plain}pass2:1001:1001::/home/user2

FreeBSD /etc/master.passwd as passdb and userdb
===============================================

On FreeBSD, ``/etc/passwd`` doesn't work as a password database because the
password field is replaced by a ``*. /etc/master.passwd`` can be converted into
a format usable by passwd-file. As :ref:`PAM <authentication-pam>`
can access the system-wide
credentials on FreeBSD, what follows is generally needed only if the mail
accounts are different from the system accounts.

If only using the result for ``name:password:uid:gid`` and not using
:ref:`authentication-password_database_extra_fields` you may be able to
use the extract directly. However, the Linux-style passwd file has fewer fields
than that used by FreeBSD and it will need to be edited if any fields past the
first four are needed.

In particular, it will fail if used directly as a ``userdb`` as the field used
for ``home`` is not in the same place as expected by the Dovecot parser. The
``:class:change:expire`` stanza in each line should be removed to be consistent
with the Linux-style format. While that stanza often is ``::0:0`` use of
``cut`` is likely much safer than sed or other blind substitution.

In ``/etc/master.passwd``, a password of ``* `` indicates that password
authentication is disabled for that user and the token ``*LOCKED*`` prevents
all login authentication, so you might as well exclude those:

.. code-block:: none

  # fgrep -v '*' /etc/master.passwd | cut -d : -f 1-4,8-10 > /path/to/file-with-encrypted-passwords
  # chmod 640 /path/to/file-with-encrypted-passwords
  # chown root:dovecot /path/to/file-with-encrypted-passwords

or permissions and ownership that may be more appropriate for your install and
security needs.

The following will work in many situations, after disabling the inclusion of
other ``userdb`` and ``passdb`` sections

.. code-block:: none

  passdb db1 {
    driver = passwd-file
    auth_username_format = %n
    passwd_file_path = /path/to/file-with-encrypted-passwords
  }
  userdb db1 {
    driver = passwd-file
    auth_username_format = %n
    passwd_file_path = /path/to/file-with-encrypted-passwords
  }
