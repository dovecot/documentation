.. _authentication-user_database:

=======================
User Databases (userdb)
=======================

Dovecot splits all authentication lookups into two categories:

* passdb and userdb lookup

userdb lookup retrieves post-login information specific to this user. This may
include:

* Mailbox location information
* Quota limit
* Overriding settings for the user (almost any setting can be overridden)

===========================   ================   ===============
Userdb lookups are done by:   Dovecot Proxy      Dovecot Backend
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
* Optional :ref:`authentication-user_database_extra_fields`:

 * **user**: Changes the username (can also be done by the passdb lookup)
 * Overwriting all mail-related settings, for example:

 * The extra fields are also passed to post-login scripts. See
   :ref:`post_login_scripting`.
 * Overriding settings in ``dovecot.conf``

The user and password databases (See :ref:`authentication-password_databases`) may be
the same or they may be different depending on your needs. You can also have
:ref:`multiple databases <authentication-multiple_authentication_databases>`.

Currently supported user databases are:

* **Passwd**: System users (NSS, ``/etc/passwd``, or similar). See
  :ref:`authentication-passwd`.
* **Passwd-file**: ``/etc/passwd``-like file in specified location. See
  :ref:`authentication-passwd_file`.
* **LDAP**: Lightweight Directory Access Protocol. See :ref:`authentication-ldap`
* **SQL**: SQL database (PostgreSQL, MySQL, SQLite). See :ref:`authentication-sql`
* **Dict**: Dict key-value database (Redis, etc.). See :ref:`authentication-dict`.
* **Static**: Userdb information generated from a given template. See :ref:`authentication-static_user_database`.
* **Prefetch**: This assumes that the passdb already returned also all the
  required user database information. See :ref:`authentication-prefetch_userdb`
* **Lua**: Lua script for authentication. See :ref:`authentication-lua_based_authentication`.

  .. dovecotadded:: 2.3.0

Userdb settings
===============

.. dovecot_core:setting:: userdb
   :values: @named_list_filter

   Creates a new :ref:`authentication-password_databases`. The filter name
   refers to the :dovecot_core:ref:`userdb_name` setting.


.. dovecot_core:setting:: userdb_name
   :values: @string

   Name of the userdb. The :dovecot_core:ref:`userdb` filter name refers to
   this setting. If the :dovecot_core:ref:`userdb_driver` setting is empty,
   the userdb_name is used as the driver. This allows doing e.g.:

   .. code-block::

      userdb passwd-file {
	passwd_file_path = /etc/dovecot/passwd
      }


.. dovecot_core:setting:: userdb_driver
   :values: @string

   The driver used for this password database. If empty, defaults to
   :dovecot_core:ref:`userdb_name`. See above for the list of available drivers.


.. dovecot_core:setting:: userdb_args
   :values: @string

   Arguments for the userdb backend. The format of this value depends
   on the userdb driver. Each one uses different args.


.. dovecot_core:setting:: userdb_default_fields
   :values: @strlist
   :seealso: @userdb_override_fields;dovecot_core

   Userdb fields (and :ref:`authentication-user_database_extra_fields`)
   that are used, unless overwritten by the userdb driver. The values can
   contain :ref:`%variables <config_variables>`. All %variables used here
   reflect the state **before** the current userdb lookup, and can refer to
   fields returned by previous userdb lookups.


.. dovecot_core:setting:: userdb_override_fields
   :values: @strlist

   Same as :dovecot_core:ref:`userdb_default_fields`, but instead of providing
   the default values, these values override what the userdb backend returned.
   All :ref:`%variables <config_variables>` used here reflect the state **after** the userdb lookup, and can
   refer to fields returned by the current (and previous) userdb lookups.

   For example useful with userdb passwd for overriding e.g. home directory or
   the ``uid`` or ``gid``. See :ref:`authentication-passwd`.


.. dovecot_core:setting:: userdb_fields
   :values: @strlist

   Userdb fields (and :ref:`authentication-user_database_extra_fields`).
   The values can contain :ref:`%variables <config_variables>`. All %variables
   used here reflect the state **after** the current userdb lookup, and can
   refer to fields returned by previous userdb lookups. Depending on the userdb
   driver, it can also refer to variable fields returned by it (e.g.
   ``%{ldap:fieldName}``). Example:

   .. code-block:: none

      userdb ldap {
	fields {
	  user = %{ldap:userId}
	  home = /home/%{ldap:mailboxPath}
	  uid = vmail
	  gid = vmail
	}
      }

.. dovecot_core:setting:: userdb_skip
   :values: never, found, notfound
   :default: never

   Do we sometimes want to skip over this userdb?

   * never
   * found: Skip if an earlier userdb already found the user.
   * notfound: Skip if previous userdbs haven't yet found the user.

.. dovecot_core:setting:: userdb_result_success
   :values: return-ok, return, return-fail, continue, continue-ok, continue-fail
   :default: return-ok

   What to do if the user was successfully found from the userdb.
   See :ref:`userdb_results`.


.. dovecot_core:setting:: userdb_result_failure
   :values: return-ok, return, return-fail, continue, continue-ok, continue-fail
   :default: continue

   What to do if the user wasn't found from the userdb.
   See :ref:`userdb_results`.

.. dovecot_core:setting:: userdb_result_internalfail
   :values: return-ok, return, return-fail, continue, continue-ok, continue-fail
   :default: continue

   What to do after the userdb lookup failed due to an internal error.
   See :ref:`userdb_results`. If any of the userdbs had an internal failure
   and the final userdb also returns ``continue``, the authentication will fail
   with ``internal error``.


.. dovecot_core:setting:: userdb_use_worker
   :values: @boolean
   :default: no (but overridden by some userdbs)

   If ``yes``, run the userdb lookup in auth-worker process instead of the
   main auth process.


.. _userdb_results:

Userdb Results
^^^^^^^^^^^^^^

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

Related pages
=============

* :ref:`system_users_used_by_dovecot`
* :ref:`home_directories_for_virtual_users`
* :ref:`authentication-passwd`
* :ref:`authentication-passwd_file`
* :ref:`post_login_scripting`
* :ref:`authentication-user_database_extra_fields`
