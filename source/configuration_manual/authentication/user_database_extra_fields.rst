.. _authentication-user_database_extra_fields:

==========================
User database extra fields
==========================

A user database lookup typically returns uid, gid and home fields. See
:ref:`authentication-user_database`, as per traditional ``/etc/passwd`` lookups.
Other fields may also be stored in the userdb, and these are called 'extra
fields'. Possibilities are:

* ``mail`` :ref:`mail_location_settings`, overrides
  the global :dovecot_core:ref:`mail_location` setting.
* ``nice``: Set the mail process's priority to be the given value.
* ``chroot``: Chroot to given directory. Overrides
  :dovecot_core:ref:`mail_chroot` setting in ``dovecot.conf``.
* ``system_groups_user``: Specifies the username whose groups are read from
  ``/etc/group`` (or wherever NSS is configured to taken them from). The logged
  in user has access to those groups. This may be useful for shared mailboxes.
* ``userdb_import``: This allows returning multiple extra fields in one
  TAB-separated field. It's useful for userdbs which are a bit less flexible
  for returning a variable number of fields (e.g. SQL).
* ``uidgid_file``: Get uid and gid for user based on the given filename.

It's possible to override settings from ``dovecot.conf`` (most commonly
quota_rule to set per-user quota limits or also plugin-settings).

* ``user``: User can be overridden (normally set in passdb, see
  :ref:`authentication-password_databases`).
* ``noreplicate``: See :ref:`replication_configuration`.

The extra fields are also passed to :ref:`post_login_scripting`.

The following suffixes added to a field name are handled specially:

* ``:protected``: Set this field only if it hasn't been set before.
* ``:remove``: Remove this field entirely.

These fields can be returned the exact same way as uid, gid, and home fields.
Below are examples for some user databases.

Overriding settings
===================

Most commonly settings are overridden from plugin section. For example if your
plugin section has ``quota_rule=*:storage=100M`` value and the userdb lookup
returns ``quota_rule=*:storage=200M``, the original quota setting gets
overridden. In fact if the lookup always returns a ``quota_rule`` field,
there's no point in having the ``quota_rule`` setting in the plugin section at
all, because it always gets overridden anyway.

To understand how imap and pop3 processes see their settings, it may be helpful
to know how Dovecot internally passes them:

1. First all actual settings are first read into memory.
2. Next all the extra fields returned by userdb lookup are used to override the
   settings. Any unknown setting is placed into the plugin {} section (e.g.
   ``foo=bar`` will be parsed as if it were ``plugin { foo=bar }``).
3. Last, if :ref:`post_login_scripting` is used, it may modify the settings if
   wanted.

If you want to override settings inside sections, you can separate the section
name and key with ``/``. For example:

.. code-block:: none

  namespace default {
    inbox = yes
    separator = .
    location = maildir:~/Maildir
  }

The separator setting can be overridden by returning
``namespace/default/separator=.`` extra field.

Examples
========

SQL
^^^

dovecot-sql.conf:

.. code-block:: none

  user_query = SELECT home, uid, gid, \
    CONCAT('*:bytes=', quota_bytes) AS quota_rule, \
    separator AS "namespace/default/separator" \
    FROM users WHERE username = '%n' and domain = '%d'

LDAP
^^^^

dovecot-ldap.conf:

.. code-block:: none

  user_attrs = \
    =home=%{ldap:homeDirectory}, \
    =uid=%{ldap:uidNumber},
    =gid=%{ldap:gidNumber},
    =quota_rule=*:bytes=%{ldap:quotaBytes},
    =namespace/default/separator=%{ldap:mailSeparator}

passwd-file
^^^^^^^^^^^

Below are examples that show how to give two userdb extra fields (``mail`` and
``quota``). Note that all userdb extra fields must be prefixed with ``userdb_``,
otherwise they're treated as passdb extra fields.

.. code-block:: none

  user:{plain}pass:1000:1000::/home/user::userdb_mail=mbox:~/mail userdb_quota_rule=*:storage=100M userdb_namespace/default/separator=/
  user2:{plain}pass2:1001:1001::/home/user2::userdb_mail=maildir:~/Maildir userdb_quota_rule=*:storage=200M
