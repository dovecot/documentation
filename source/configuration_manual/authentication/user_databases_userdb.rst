.. _authentication-user_database:

=============================
User Databases (userdb)
=============================

Dovecot splits all authentication lookups into two categories:

* passdb and userdb lookup

userdb lookup retrieves post-login information specific to this user. This may
include:

* Mailbox location information
* Quota limit
* Overriding settings for the user (almost any setting can be overridden)

===========================   ================   ===============
Userdb lookups are done by:   Dovecot Director   Dovecot Backend
===========================   ================   ===============
IMAP & POP3 logins            No                 Yes
LMTP mail delivery            No                 Yes
doveadm commands              No                 Yes
===========================   ================   ===============

The user database lookup can return these fields:

* **uid**: User's UID (UNIX user ID), overrides the global
  :dovecot_core:ref:`mail_uid` setting.
* **gid**: User's GID (UNIX group ID), overrides the global
  :dovecot_core:ref:`mail_gid` setting.
* **home**: User's home directory, overrides the global
  :dovecot_core:ref:`mail_home` setting.
  Although not required, it's highly recommended even for virtual users.
* Optional extra fields:

 * **user**: Changes the username (can also be done by the passdb lookup)
 * Overwriting all mail-related settings, for example:

  * **mail**: Mail location, overrides the global
    :dovecot_core:ref:`mail_location` setting.
    See: :ref:`mail_location_settings`
  * **quota_rule** to specify per-user quota limit

 * The extra fields are also passed to post-login scripts. See
   :ref:`post_login_scripting`.

The user and password databases (See :ref:`authentication-password_databases`) may be
the same or they may be different depending on your needs. You can also have
:ref:`multiple databases <authentication-multiple_authentication_databases>`.

Currently supported user databases are:

* **Passwd**: System users (NSS, ``/etc/passwd``, or similar). See
  :ref:`authentication-passwd`.
* **Passwd-file**: ``/etc/passwd``-like file in specified location. See
  :ref:`authentication-passwd_file`.
* **NSS**: Name Service Switch. See :ref:`authentication-nss`.
* **LDAP**: Lightweight Directory Access Protocol. See :ref:`authentication-ldap`
* **SQL**: SQL database (PostgreSQL, MySQL, SQLite). See :ref:`authentication-sql`
* **Dict**: Dict key-value database (Redis, etc.). See :ref:`authentication-dict`.
* **Static**: Userdb information generated from a given template. See :ref:`authentication-static_user_database`.
* **VPopMail**: External software used to handle virtual domains.
* **Prefetch**: This assumes that the passdb already returned also all the
  required user database information. See :ref:`authentication-prefetch_userdb`
* **Lua**: Lua script for authentication. See :ref:`authentication-lua_based_authentication`.

  .. versionadded:: v2.3.0

Userdb settings
================

An example userdb entry might look like this:

.. code-block:: none

  userdb {
    driver = passwd-file
    args = username_format=%n /etc/dovecot/users

    default_fields = uid=vmail gid=vmail
    override_fields =

    # v2.2.10+:
    skip = never
    result_failure = continue
    result_internalfail = continue
    result_success = return-ok

    # v2.2.24+:
    auth_verbose = default
  }

First we have the settings that provide content for the userdb lookup:

* ``driver``: The userdb backend name
* ``args``: Arguments for the userdb backend. The format of this value depends
  on the userdb driver. Each one uses different args.
* ``default_fields``: Userdb fields (and :ref:`authentication-user_database_extra_fields`)
  that are used, unless overwritten by the userdb backend. They are in format
  ``key=value key2=value2 ....`` The values can contain :ref:`config_variables`.
  All %variables used here reflect the state BEFORE the userdb lookup.
* ``override_fields``: Same as default_fields, but instead of providing the
  default values, these values override what the userdb backend returned.
  All %variables used here reflect the state AFTER the userdb lookup.

For example useful with userdb passwd for overriding e.g. home directory or the
``uid`` or ``gid``. See :ref:`authentication-passwd`.

.. versionadded:: v2.2.24

* ``auth_verbose``: If this is explicitly set to yes or no, it overrides the
  global :dovecot_core:ref:`auth_verbose` setting. (However,
  ``auth_debug=yes`` overrides the ``auth_verbose`` setting.)

.. versionadded:: v2.2.10

Then we have the setting which specify when the userdb is used:

* **skip**: Do we sometimes want to skip over this userdb?

 * never
 * found: Skip if an earlier userdb already found the user
 * notfound: Skip if previous userdbs haven't yet found the user

And finally we can control what happens when we're finished with this userdb:

.. versionadded:: v2.2.10

* ``result_success``: What to do if the user was found from the userdb
  (default: return-ok)
* ``result_failure``: What to do if the user wasn't found from the userdb
  (default: continue)
* ``result_internalfail``: What to do if the userdb lookup had an internal
  failure (default: continue). If any of the userdbs had an internal failure
  and the final userdb also returns ``continue``, the lookup will fail with
  ``internal error``.

.. WARNING:: If multiple userdbs are required (results are merged), it's
             important to set ``result_internalfail=return-fail`` to them,
             otherwise the userdb lookup could still succeed but not all the
             intended extra fields are set.

The result values that can be used:

* ``return-ok``: Return success, don't continue to the next userdb.
* ``return-fail``: Return ``user doesn't exist``, don't continue to the next
  userdb.
* ``return``: Return earlier userdb's success or failure, don't continue to the
  next userdb. If this was the first userdb, return ``user doesn't exist``.
* ``continue-ok``: Set the current user existence state to ``found``, and
  continue to the next userdb.
* ``continue-fail``: Set the current user existence state to ``not found``, and
  continue to the next userdb.
* ``continue``: Continue to the next userdb without changing the user existence
  state. The initial state is ``not found``.

Related pages:

* :ref:`system_users_used_by_dovecot`
* :ref:`home_directories_for_virtual_users`
* :ref:`authentication-passwd`
* :ref:`authentication-passwd_file`
* :ref:`authentication-nss`
* :ref:`post_login_scripting`
* :ref:`authentication-user_database_extra_fields`
