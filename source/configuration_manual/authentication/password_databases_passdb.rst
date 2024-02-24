.. _authentication-password_databases:

===========================
Password databases (passdb)
===========================

Dovecot splits all authentication lookups into two categories:

* passdb lookup and
* userdb lookup

passdb lookup most importantly authenticates the user. They also provide any
other pre-login information needed for users, such as:

 * Which server user is proxied to.
 * If user should be allowed to log in at all (temporarily or permanently).

============================   ===================   =================
Passdb lookups are done by:      Dovecot Proxy        Dovecot Backend
============================   ===================   =================
IMAP & POP3 logins                   Yes                  Yes
LMTP mail delivery                   Yes                  Yes
doveadm commands                     Yes                  Yes
============================   ===================   =================

See also :ref:`authentication-user_database`.

Passwords
=========

The password can be in any format that Dovecot supports, but you need to tell
the format to Dovecot because it won't try to guess it. The SQL and LDAP
configuration files have the ``default_pass_scheme`` setting for this. If you
have passwords in multiple formats, or the passdb doesn't have such a setting,
you'll need to prefix each password with ``{<scheme>}``,

.. code-block:: none

  {PLAIN}cleartext-password or {PLAIN-MD5}1a1dc91c907325c69271ddf0c944bc72


Dovecot authenticates users against password databases. It can also be used to
configure things like  :ref:`authentication-proxies`.

You can use multiple databases, so if the password doesn't match in the first
database, Dovecot checks the next one. This can be useful if you want to easily
support having both virtual users and also local system users (see
:ref:`authentication-multiple_authentication_databases`).

Success/failure database
========================

These **databases** simply verify if the given password is correct for the
user. Dovecot doesn't get the correct password from the database, it only gets
a ``success`` or a ``failure`` reply. This means that these databases can't be used
with non-cleartext :ref:`authentication-authentication_mechanisms`.

Databases that belong to this category are:

* **PAM**: Pluggable Authentication Modules. See :ref:`authentication-pam`.
* **IMAP**: Authenticate against remote IMAP server. See :ref:`imap`.
* **OAuth2**: Authenticate against oauth2 provider. See :ref:`authentication-oauth2`.
* **BSDAuth**: BSD authentication (deprecated, unsupported). See :ref:`authentication-bsdauth`.

  .. dovecotadded:: 2.2.29


Lookup database
===============

Dovecot does a lookup based on the username and possibly other information
(e.g. IP address) and verifies the password validity itself. Fields that the
lookup can return:

* **password**: User's password. See :ref:`authentication-password_schemes`.

 * **password_noscheme**: Like ``password``, but if a password begins with
   ``{``, assume it belongs to the password itself instead of treating it as a
   :ref:`authentication-password_schemes` prefix. This is usually needed only if you use
   cleartext passwords.

* **user**: Returning a user field can be used to change the username.
  Typically used only for case changes (e.g. ``UseR`` -> ``user``). See
  :ref:`authentication-user_extra_field`.

 * **username**: Like user, but doesn't drop existing domain name (e.g.
   ``username=foo`` for ``user@domain`` gives ``foo@domain``).
 * **domain**: Updates the domain part of the username.

* Other special :ref:`authentication-password_database_extra_fields`.

**Databases** that support looking up only passwords, but no user or extra fields:

* **Passwd-file**: ``/etc/passwd``-like file in specified location. See
  :ref:`authentication-passwd`.
* **Passwd**: System users (NSS, ``/etc/passwd``, or similar). See
  :ref:`authentication-password_schemes`.

 * Dovecot supports reading all :ref:`authentication-password_schemes` from passwd and shadow
   databases (if prefix is specified), but that is of course incompatible with
   all other tools using/modifying the passwords.

**Databases** that support looking up everything:

* **Passwd-file**: ``/etc/passwd``-like file in specified location. See
  :ref:`authentication-passwd_file`.
* **LDAP**: Lightweight Directory Access Protocol. See :ref:`authentication-ldap`.
* **SQL**: SQL database (PostgreSQL, MySQL, SQLite). See :ref:`authentication-sql`.
* **Dict**: Dict key-value database (Redis, etc.) See :ref:`authentication-dict`.
* **Static**: Static passdb for simple configurations. See
  :ref:`authentication-static_password_database`.
* **Lua**: Lua script for authentication. See: :ref:`authentication-lua_based_authentication`.

  .. dovecotadded:: 2.3.0


See :ref:`authentication-static_password_database`.

Passdb setting
==============

.. dovecot_core:setting:: passdb
   :values: @named_list_filter

   Creates a new :ref:`authentication-password_databases`. The filter name
   refers to the :dovecot_core:ref:`passdb_name` setting. The
   :dovecot_core:ref:`passdb_driver` setting is required to be set inside this
   filter.


.. dovecot_core:setting:: passdb_name
   :values: @string

   Name of the passdb. This is used only in configuration - it's not visible
   to users.  The :dovecot_core:ref:`passdb` filter name refers to this
   setting.


.. dovecot_core:setting:: passdb_driver
   :values: @string

   The driver used for this password database. See above for the list of
   available drivers.


.. dovecot_core:setting:: passdb_args
   :values: @string

   Arguments for the passdb backend. The format of this value depends
   on the passdb driver. Each one uses different args.


.. dovecot_core:setting:: passdb_default_fields
   :values: @strlist
   :seealso: @passdb_override_fields;dovecot_core

   Passdb fields (and :ref:`authentication-password_database_extra_fields`)
   that are used, unless overwritten by the passdb driver. The values can
   contain :ref:`%variables <config_variables>`. All %variables used here
   reflect the state **before** the current passdb lookup, and can refer to
   fields returned by previous passdb lookups.


.. dovecot_core:setting:: passdb_override_fields
   :values: @strlist

   Same as :dovecot_core:ref:`passdb_default_fields`, but instead of providing
   the default values, these values override what the passdb backend returned.
   All :ref:`%variables <config_variables>` used here reflect the state **after** the passdb lookup, and can
   refer to fields returned by the current (and previous) passdb lookups.


.. dovecot_core:setting:: passdb_fields
   :values: @strlist

   Passdb fields (and :ref:`authentication-password_database_extra_fields`).
   The values can contain :ref:`%variables <config_variables>`. All %variables
   used here reflect the state **after** the current passdb lookup, and can
   refer to fields returned by previous passdb lookups. Depending on the passdb
   driver, it can also refer to variable fields returned by it (e.g.
   ``%{ldap:fieldName}``). Example:

   .. code-block:: none

      passdb ldap {
	fields {
	  user = %{ldap:userId}
	  proxy = yes
	  host = %{ldap:proxyHost}
	}
      }

.. dovecot_core:setting:: passdb_default_password_scheme
   :values: @string
   :default: PLAIN (but overridden by some passdbs)

   The scheme that passwords are in the passdb, unless overridden by the
   passdb entry (typically by prefixing with ``{SCHEME}``).


.. dovecot_core:setting:: passdb_mechanisms
   :values: @boollist
   :added: 2.2.30

   Skip the passdb, if non-empty and the current auth mechanism is not listed
   here. If the value contains ``none``, it matches for non-authenticating
   passdb lookups. Example:

   .. code-block:: none

      passdb passwd-file {
	driver = passwd-file
	mechanisms = PLAIN LOGIN
	# ...
      }

.. dovecot_core:setting:: passdb_username_filter
   :values: @string
   :added: 2.2.30

   Skip the passdb, if non-empty and the username doesn't match the filter.
   This is mainly used to assign specific passdbs to specific domains.
   Space or comma-separated list of username filters that can have ``*`` or
   ``?`` wildcards. If any of the filters matches, the filter succeeds. However,
   there can also be negative matches preceded by ``!``. If any of the negative
   filters matches, the filter won't succeed.

   Example: If the filter is
   ``*@example.com *@example2.com !user@example.com``, then ``any@example.com``
   or ``user@example2.com`` matches, but ``user@example.com`` won't match.


.. dovecot_core:setting:: passdb_skip
   :values: never, authenticated, unauthenticated
   :default: never

   Do we sometimes want to skip over this passdb?

   * never
   * authenticated: Skip if an earlier passdb already authenticated the user
     successfully.
   * unauthenticated: Skip if user hasn't yet been successfully authenticated
     by the previous passdbs.


.. dovecot_core:setting:: passdb_result_success
   :values: return-ok, return, return-fail, continue, continue-ok, continue-fail
   :default: return-ok

   What to do after the passdb authentication succeeded.
   See :ref:`passdb_results`.

   This is commonly used together with master passdb to specify that even after
   a successful master user authentication, the authentication should continue
   to the actual non-master passdb to lookup the user.


.. dovecot_core:setting:: passdb_result_failure
   :values: return-ok, return, return-fail, continue, continue-ok, continue-fail
   :default: continue

   What to do after the passdb authentication failed.
   See :ref:`passdb_results`.

.. dovecot_core:setting:: passdb_result_internalfail
   :values: return-ok, return, return-fail, continue, continue-ok, continue-fail
   :default: continue

   What to do after the passdb authentication failed due to an internal error.
   See :ref:`passdb_results`. If any of the passdbs had an internal failure
   and the final passdb also returns ``continue``, the authentication will fail
   with ``internal error``.


.. dovecot_core:setting:: passdb_deny
   :values: @boolean
   :default: no

   If ``yes``, used to provide "denied users database". If the user is found
   from the passdb, the authentication will fail.


.. dovecot_core:setting:: passdb_master
   :values: @boolean
   :default: no

   If ``yes``, used to provide :ref:`authentication-master_users`. The users
   listed in the master passdb can log in as other users.


.. dovecot_core:setting:: passdb_use_worker
   :values: @boolean
   :default: no (but overridden by some passdbs)

   If ``yes``, run the passdb lookup in auth-worker process instead of the
   main auth process.


.. _passdb_results:

Passdb Results
^^^^^^^^^^^^^^

.. WARNING::

  If multiple passdbs are required (results are merged), it's important to set
  ``result_internalfail=return-fail`` to them, otherwise the authentication
  could still succeed but not all the intended extra fields are set.

The result values that can be used:

* **return-ok:** Return success, don't continue to the next passdb.
* **return-fail**: Return failure, don't continue to the next passdb.
* **return**: Return earlier passdb's success or failure, don't continue to the
  next passdb. If this was the first passdb, return failure.
* **continue-ok**: Set the current authentication state to success, and
  continue to the next passdb. The following passdbs will skip password
  verification.
* **continue-fail**: Set the current authentication state to failure, and
  continue to the next passdb. The following passdbs will still verify the
  password.
* **continue**: Continue to the next passdb without changing the authentication
  state. The initial state is failure. If this was set in
  :dovecot_core:ref:`passdb_result_success`,
  the following passdbs will skip password verification.

.. NOTE:: When using ``continue*`` values on a master passdb (master = yes),
          execution will jump to the first non-master passdb instead of
          continuing with the next master passdb.


.. toctree::
  :maxdepth: 1

  password_database_extra_fields
  proxies
  multiple_authentication_databases
  authentication_mechanisms
  pam
  bsdauth
  authentication_via_remote_imap_server
  oauth2
  static_password_database
  password_schemes
  user_extra_field
  passwd_file
  ldap
  sql
  dict
  lua_based_authentication
  passwd
