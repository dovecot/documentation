.. _authentication-password_databases:

===========================
Password databases (passdb)
===========================

Dovecot splits all authentication lookups into two categories:

* passdb and userdb lookup

passdb lookup most importantly authenticate the user. They also provide any
other pre-login information needed for users, such as:

 * Which server user is proxied to.
 * If user should be allowed to log in at all (temporarily or permanently).

============================   ===================   =================
Passdb lookups are done by:      Dovecot Director     Dovecot Backend
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

  {PLAIN}plaintext-password or {PLAIN-MD5}1a1dc91c907325c69271ddf0c944bc72


Dovecot authenticates users against password databases. It can also be used to
configure things like  :ref:`authentication-proxies`.

You can use multiple databases, so if the password doesn't match in the first
database, Dovecot checks the next one. This can be useful if you want to easily
support having both virtual users and also local system users (see
:ref:`authentication-multiple_authentication_databases`).

Success/failure database
=========================

These **databases** simply verify if the given password is correct for the
user. Dovecot doesn't get the correct password from the database, it only gets
a ``success`` or a ``failure`` reply. This means that these databases can't be used
with non-plaintext :ref:`authentication-authentication_mechanisms`.

Databases that belong to this category are:

* **PAM**: Pluggable Authentication Modules. See :ref:`authentication-pam`.
* **BSDAuth**: BSD authentication. See :ref:`authentication-bsdauth`.
* **CheckPassword**: External checkpassword program without Dovecot extensions.
  See :ref:`authentication-checkpassword`.
* **IMAP**: Authenticate against remote IMAP server. See :ref:`imap`.
* **OAuth2**: Authenticate against oauth2 provider. See :ref:`authentication-oauth2`.

  .. versionadded:: v2.2.29


Lookup database
=================

Dovecot does a lookup based on the username and possibly other information
(e.g. IP address) and verifies the password validity itself. Fields that the
lookup can return:

* **password**: User's password. See :ref:`authentication-password_schemes`.

 * **password_noscheme**: Like ``password``, but if a password begins with
   ``{``, assume it belongs to the password itself instead of treating it as a
   :ref:`authentication-password_schemes` prefix. This is usually needed only if you use
   plaintext passwords.

* **user**: Returning a user field can be used to change the username.
  Typically used only for case changes (e.g. ``UseR`` -> ``user``). See
  :ref:`authentication-user_extra_field`.

 * **username**: Like user, but doesn't drop existing domain name (e.g.
   ``username=foo`` for ``user@domain`` gives ``foo@domain``).
 * **domain**: Updates the domain part of the username.

* Other special :ref:`authentication-password_database_extra_fields`.

**Databases** that support looking up only passwords, but no user or extra fields:

* **Passwd-file**: ``/etc/passwd-like`` file in specified location. See
  :ref:`authentication-passwd`.
* **Passwd**: System users (NSS, ``/etc/passwd``, or similar). See
  :ref:`authentication-password_schemes`.
* **Shadow**: Shadow passwords for system users (NSS, ``/etc/shadow`` or
  similar). See :ref:`authentication-shadow`.

 * Dovecot supports reading all :ref:`authentication-password_schemes` from passwd and shadow
   databases (if prefix is specified), but that is of course incompatible with
   all other tools using/modifying the passwords.

**Databases** that support looking up everything:

* **Passwd-file**: ``/etc/passwd``-like file in specified location. See
  :ref:`authentication-passwd_file`.
* **LDAP**: Lightweight Directory Access Protocol. See :ref:`authentication-ldap`.
* **SQL**: SQL database (PostgreSQL, MySQL, SQLite). See :ref:`authentication-sql`.
* **Dict**: Dict key-value database (Redis, memcached, etc.) See :ref:`authentication-dict`.
* **CheckPassword**: External checkpassword program when used with Dovecot
  extensions. See :ref:`authentication-checkpassword`.
* **Static**: Static passdb for simple configurations. See
  :ref:`authentication-static_password_database`.
* **Lua**: Lua script for authentication. See: :ref:`authentication-lua_based_authentication`.

  .. versionadded:: v2.3.0


See :ref:`authentication-static_password_database`.

Passdb setting
================

An example passdb passwd-file with its default settings:

.. code-block:: none

  passdb {
    driver = passwd-file
    args = scheme=ssha256 /usr/local/etc/passwd.replica
    default_fields =
    override_fields =

    deny = no
    master = no
    pass = no
    skip = never
    mechanisms =
    username_filter =

    result_failure = continue
    result_internalfail = continue
    result_success = return-ok

    # v2.2.24+
    auth_verbose = default
  }


First we have the settings that provide content for the passdb lookup:

* **driver**: The passdb backend name
* **args**: Arguments for the passdb backend. The format of this value depends
  on the passdb driver. Each one uses different args.
* **default_fields**: Passdb fields (and :ref:`authentication-password_database_extra_fields`
  ) that are used, unless overwritten by the passdb backend. They are in format
  ``key=value key2=value2 ....`` The values can contain :ref:`%variables
  <config_variables>`. All %variables used here reflect the state BEFORE the
  passdb lookup.
* **override_fields**: Same as default_fields, but instead of providing the
  default values, these values override what the passdb backend returned.
  All %variables used here reflect the state AFTER the passdb lookup.
* **auth_verbose**: If this is explicitly set to yes or no, it overrides the
  :dovecot_core:ref:`auth_verbose` setting. (However, ``auth_debug=yes``
  overrides :dovecot_core:ref:`auth_verbose`.)

  .. versionadded:: v2.2.24


Then we have the settings which specify when the passdb is used:

* **deny**: If ``yes``, used to provide ``denied users database``. If the user
  is found from the passdb, the authentication will fail.
* **master**: If ``yes``, used to provide :ref:`authentication-master_users`. The users listed in
  the master passdb can log in as other users.

 * **pass**: This is an alias for ``result_success=continue`` as described
   below. This was commonly used together with master passdb to specify that
   even after a successful master user authentication, the authentication
   should continue to the actual non-master passdb to lookup the user.

* **skip**: Do we sometimes want to skip over this passdb?

 * never
 * authenticated: Skip if an earlier passdb already authenticated the user
   successfully.
 * unauthenticated: Skip if user hasn't yet been successfully authenticated by
   the previous passdbs.

* **mechanisms**: Skip, if non-empty and the current auth mechanism is not
  listed here. Space or comma-separated list of auth mechanisms (e.g. ``PLAIN
  LOGIN``). Also ``none`` can be used to match for a non-authenticating passdb
  lookup.

  .. versionadded:: v2.2.30

* **username_filter**: Skip, if non-empty and the username doesn't match the
  filter. This is mainly used to assign specific passdbs to specific domains.
  Space or comma-separated list of username filters that can have ``*`` or
  ``?`` wildcards. If any of the filters matches, the filter succeeds. However,
  there can also be negative matches preceded by ``!``. If any of the negative
  filters matches, the filter won't succeed.

  .. versionadded:: v2.2.30

Example:

.. code-block:: none

  If the filter is *@example.com *@example2.com !user@example.com, any@example.com or user@example2.com matches but user@example.com won't match.


And finally we can control what happens when we're finished with this passdb:

* **result_success**: What to do if the authentication succeeded (default:
  return-ok)
* **result_failure**: What to do if authentication failed (default: continue)
* **result_internalfail**: What to do if the passdb lookup had an internal
  failure (default: continue). If any of the passdbs had an internal failure
  and the final passdb also returns ``continue``, the authentication will fail
  with ``internal error``.

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
  state. The initial state is failure. If this was set in ``result_success``,
  the following passdbs will skip password verification.

.. NOTE:: when using ``continue*`` values on a master passdb (master = yes),
          execution will jump to the first non-master passdb instead of
          continuing with the next master passdb (verified at lest up to
          v2.2.27).

.. toctree::
  :maxdepth: 1

  proxies
  multiple_authentication_databases
  authentication_mechanisms
  pam
  bsdauth
  checkpassword
  authentication_via_remote_imap_server
  oauth2
  static_password_database
  password_schemes
  user_extra_field
  shadow
  passwd_file
  ldap
  sql
  dict
  lua_based_authentication
  passwd
