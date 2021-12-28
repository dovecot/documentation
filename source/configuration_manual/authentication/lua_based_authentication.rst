.. _authentication-lua_based_authentication:

========================
Lua based authentication
========================

.. versionadded:: v2.3.0

You can implement passdb and userdb using `Lua <https://www.lua.org/>`_ script.

.. contents::

Known bugs
^^^^^^^^^^

* Before 2.3.4 when returning a table with values, the table values are
  mistakenly converted into a number if they seem like a number. So if you are
  using values like ``012345``, this would get converted into ``12345``
* Before 2.3.4 returning password without scheme would cause a crash.

Lua based authentication
^^^^^^^^^^^^^^^^^^^^^^^^

When used in authentication, additional module ``dovecot.auth`` is added, which
contains constants for passdb and userdb.

For details about Dovecot Lua, see :ref:`lua`.

When used in authentication, additional module dovecot.auth is added, which
contains constants for passdb and userdb.

List of constants
-------------------

* dovecot.auth.PASSDB_RESULT_INTERNAL_FAILURE
* dovecot.auth.PASSDB_RESULT_SCHEME_NOT_AVAILABLE - indicates password scheme
  that cannot be understood
* dovecot.auth.PASSDB_RESULT_USER_UNKNOWN
* dovecot.auth.PASSDB_RESULT_USER_DISABLED
* dovecot.auth.PASSDB_RESULT_PASS_EXPIRED
* dovecot.auth.PASSDB_RESULT_NEXT - indicates that this passdb did not
  authenticate user, next passdb should do it
* dovecot.auth.PASSDB_RESULT_PASSWORD_MISMATCH
* dovecot.auth.PASSDB_RESULT_OK
* dovecot.auth.USERDB_RESULT_INTERNAL_FAILURE
* dovecot.auth.USERDB_RESULT_USER_UNKNOWN
* dovecot.auth.USERDB_RESULT_OK

Also, it registers object ``struct auth_request*`` which lets access various
parts of the auth request. You should use the loggers associated with
``auth_request`` when possible.

Auth request methods

Functions:

* auth_request#log_debug(text) - logs debug message (if debug is enabled, noop
  otherwise)
* auth_request#log_error(text) - logs error message
* auth_request#log_info(text) - logs informational message
* auth_request#log_warning(text) - logs warning message
* auth_request#response_from_template(template) - takes in key=value template
  and expands it using var_expand and produces table suitable for passdb result
* auth_request#var_expand(template) - performs var expansion on the template
  using :ref:`config_variables`
* auth_request#password_verify(crypted_password, plain_password) - checks if
  the plain password matches the crypted or hashed password
* auth_request#event() - Returns child event for the auth request, can be used
  for logging and other events. Comes with a prefix.

  .. versionadded:: v2.3.7


Subtables:
^^^^^^^^^^

* auth_request#passdb
* auth_request#userdb

Members:
^^^^^^^^

See :ref:`config_variables` for details.

* auth_request#auth_domain
* auth_request#auth_user
* auth_request#auth_username
* auth_request#cert
* auth_request#client_id
* auth_request#domain
* auth_request#domain_first
* auth_request#domain_last
* auth_request#home
* auth_request#lip
* auth_request#local_name
* auth_request#login_domain
* auth_request#login_user
* auth_request#login_username
* auth_request#lport
* auth_request#master_user
* auth_request#mech
* auth_request#orig_domain
* auth_request#orig_user
* auth_request#orig_username
* auth_request#password
* auth_request#pid
* auth_request#real_lip
* auth_request#real_lport
* auth_request#real_rip
* auth_request#real_rport
* auth_request#rip
* auth_request#rport
* auth_request#secured
* auth_request#service
* auth_request#session
* auth_request#session_pid
* auth_request#user
* auth_request#username

Additionally you can access

* skip_password_check - Set if the password has already been validated by
  another passdb
* passdbs_seen_user_unknown - If some previous passdb has not found this user
* passdbs_seen_internal_failure - If some previous passdb has had internal
  failure
* userdbs_seen_internal_failure - If some previous userdb has had internal
  failure

Password database

Lua passdb supports two modes of function. It can behave as lookup database, or
password verification database.

Lookup function signature is **auth_passdb_lookup(request)** and the password
verification signature is **auth_password_verify(request, password)**

Both functions must return a tuple, which contains a return code, and also
additionally string or table. Table must be in key-value format, it will be
imported into auth request. The string must be in key=value format, except if
return code indicates internal error, the second parameter can be used as error
string.

If **auth_password_verify** is found, it's always used.

To configure passdb in dovecot, use

.. code-block:: none

  passdb {
    driver = lua
    args = file=/path/to/lua blocking=yes # default is yes
  }

By default, dovecot runs Lua scripts in auth-worker processes. If you do not
want this, you can disable blocking, and Lua script will be ran in auth
process. This can degrade performance if your script is slow or makes external
lookups.

User database
^^^^^^^^^^^^^

Lua userdb supports both single user lookup and iteration. Note that iteration
will hold the whole user database in memory during iteration.

User lookup function signature is **auth_userdb_lookup(request)**. The function
must return a tuple, which contains a return code, and also additionally string
or table. Table must be in key-value format, it will be imported into auth
request. The string must be in key=value format, except if return code
indicates internal error, the second parameter can be used as error string.

User iteration function signature is **auth_userdb_iterate**, which is expected
to return table of usernames. Key names are ignored.

Lua userdb supports both single user lookup and iteration.

.. Note:: The iteration will hold the whole user database in memory during
          iteration.

To configure userdb in dovecot, use

.. code-block:: none

  userdb {
    driver = lua
    args = file=/path/to/lua blocking=yes # default is yes
  }

Examples
--------

.. code-block:: none

  function auth_passdb_lookup(req)
    if req.user == "testuser1" then
      return dovecot.auth.PASSDB_RESULT_OK, "password=pass"
    end
    return dovecot.auth.PASSDB_RESULT_USER_UNKNOWN, "no such user"
  end

  function auth_userdb_lookup(req)
    if req.user == "testuser1" then
      return dovecot.auth.USERDB_RESULT_OK, "uid=vmail gid=vmail"
    end
    return dovecot.auth.USERDB_RESULT_USER_UNKNOWN, "no such user"
  end

  function script_init()
    return 0
  end

  function script_deinit()
  end

  function auth_userdb_iterate()
    return {"testuser1"}
  end

Simple username password database (such as opensmtpd)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

The example uses whitespace separated username and password. As a special
caution, the way Lua is used here means you can have multiple user password per
line, instead of just one. This can be extended to more complicated separators
or multiple fields per user.

If you only want to authenticate users, and don't care about user listing, you
can use

.. code-block:: none

  function auth_passdb_lookup(req)
     for line in io.lines("/path/to/file") do
         for user, pass in string.gmatch(line, "(%w+)%s(.+)") do
             if (user == req.username) then
                 -- you can add additional information here, like userdb_uid
                 return dovecot.auth.PASSDB_RESULT_OK, "password=" .. pass
             end
         end
     end
     return dovecot.auth.PASSDB_RESULT_USER_UNKNOWN, ""
  end

If you also want to be able to list users, so that you could use doveadm cmd -A

.. code-block:: none

  local database = "/path/to/file"

  function db_lookup(username)
     for line in io.lines(database) do
         for user, pass in string.gmatch(line, "(%w+)%s(.+)") do
             if (user == username) then
                 return {result=0, password=pass}
             end
         end
     end
     return {result=-1}
  end

  function auth_passdb_lookup(req)
     res = db_lookup(req.username)
     if res.result == 0 then
         -- you can add additional information here for passdb
         return dovecot.auth.PASSDB_RESULT_OK, "password=" .. res.password
     end
     return dovecot.auth.PASSDB_RESULT_USER_UNKNOWN, ""
  end

  function auth_userdb_lookup(req)
     res = db_lookup(req.username)
     if res.result == 0 then
         -- you can add additional information here for userdb, like uid or home
         return dovecot.auth.USERDB_RESULT_OK, "uid=vmail gid=vmail"
     end
     return dovecot.auth.USERDB_RESULT_USER_UNKNOWN, ""
  end

  function auth_userdb_iterate()
    users = {}
    for line in io.lines(database) do
         for user in string.gmatch(line, "(%w+)%s.+") do
             table.insert(users, user)
         end
    end
    return users
  end
