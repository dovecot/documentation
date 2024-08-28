---
layout: doc
title: Lua
dovecotlinks:
  auth_lua: Lua authentication database
  auth_lua_initialization:
    hash: initialization
    text: Lua authentication initialization
---

# Lua Authentication Database (`lua`)

You can implement passdb and userdb using [Lua](https://www.lua.org/) script.

## Authentication

When used in authentication, additional module `dovecot.auth` is added, which
contains constants for [[link,passdb]] and [[link,userdb]].

For details about Dovecot Lua, see [[link,lua]].

## Initialization

[[added,lua_auth_init]]

When passdb or userdb is initialized, there will be a lookup for
initialization function.

This is different from `script_init()`, which is called for all Lua
scripts.

For passdb, the function is `auth_passdb_init()` and for userdb, it is called
`auth_userdb_init()`. The function is called with a table containing all
parameters provided in the passdb/userdb args, except file name.

This can be used to pass out initialization parameters from Dovecot.

::: code-group
```[dovecot.conf]
passdb {
  driver = lua
  args = file=/etc/dovecot/auth.lua password={PLAIN}test
}
```

```lua[/etc/dovecot/auth.lua]
local password = nil

function auth_passdb_init(args)
  password = args["password"]
end

function auth_passdb_lookup(req)
  return dovecot.auth.PASSDB_RESULT_OK, { ["password"]=password }
end
```
:::

### Constants

#### `dovecot.auth.PASSDB_RESULT_INTERNAL_FAILURE`
#### `dovecot.auth.PASSDB_RESULT_SCHEME_NOT_AVAILABLE`

Indicates password scheme that cannot be understood.

#### `dovecot.auth.PASSDB_RESULT_USER_UNKNOWN`
#### `dovecot.auth.PASSDB_RESULT_USER_DISABLED`
#### `dovecot.auth.PASSDB_RESULT_PASS_EXPIRED`
#### `dovecot.auth.PASSDB_RESULT_NEXT`

Indicates that this passdb did not authenticate user, next passdb should
do it.

#### `dovecot.auth.PASSDB_RESULT_PASSWORD_MISMATCH`
#### `dovecot.auth.PASSDB_RESULT_OK`
#### `dovecot.auth.USERDB_RESULT_INTERNAL_FAILURE`
#### `dovecot.auth.USERDB_RESULT_USER_UNKNOWN`
#### `dovecot.auth.USERDB_RESULT_OK`

### Auth Request

Auth init registers object `struct auth_request*` which allows access to
various parts of the auth request. You should use the loggers associated with
`auth_request` when possible.

#### Methods

##### `auth_request#log_debug(text)`

Logs debug message (if debug is enabled, noop otherwise).

##### `auth_request#log_error(text)`

Logs error message.

##### `auth_request#log_info(text)`

Logs informational message.

##### `auth_request#log_warning(text)`

Logs warning message.

##### `auth_request#response_from_template(template)`

Takes in `key=value` template and expands it using `var_expand()` and produces
table suitable for passdb result.

##### `auth_request#var_expand(template)`

Performs var expansion on the template using [[variable]].

##### `auth_request#password_verify(crypted_password, plain_password)`

Checks if the plain password matches the crypted or hashed password.

##### `auth_request#event()`

Returns child event for the auth request. Can be used for logging and
other events. Comes with a prefix.

#### Subtables

##### `auth_request#passdb`

##### `auth_request#userdb`

#### Members

See [[variable]] for details.

##### `auth_request#auth_domain`
##### `auth_request#auth_user`
##### `auth_request#auth_username`
##### `auth_request#cert`
##### `auth_request#client_id`
##### `auth_request#domain`
##### `auth_request#domain_first`
##### `auth_request#domain_last`
##### `auth_request#home`
##### `auth_request#lip`
##### `auth_request#local_name`
##### `auth_request#login_domain`
##### `auth_request#login_user`
##### `auth_request#login_username`
##### `auth_request#lport`
##### `auth_request#master_user`
##### `auth_request#mech`
##### `auth_request#orig_domain`
##### `auth_request#orig_user`
##### `auth_request#orig_username`
##### `auth_request#password`
##### `auth_request#pid`
##### `auth_request#real_lip`
##### `auth_request#real_lport`
##### `auth_request#real_rip`
##### `auth_request#real_rport`
##### `auth_request#rip`
##### `auth_request#rport`
##### `auth_request#secured`
##### `auth_request#service`
##### `auth_request#session`
##### `auth_request#session_pid`
##### `auth_request#user`
##### `auth_request#username`

#### Additional Members

##### `skip_password_check`

Set if the password has already been validated by another passdb.

##### `passdbs_seen_user_unknown`

If some previous passdb has not found this user.

##### `passdbs_seen_internal_failure`

If some previous passdb has had internal failure.

##### `userdbs_seen_internal_failure`

If some previous userdb has had internal failure.

## passdb

To configure passdb in dovecot, use:

```[dovecot.conf]
passdb {
  driver = lua
  args = file=/path/to/lua blocking=yes # default is yes
}
```

If `auth_password_verify` is found, it's always used.

By default, dovecot runs Lua scripts in auth-worker processes. If you do not
want this, you can disable blocking, and Lua script will be run in auth
process. This can degrade performance if your script is slow or makes external
lookups.

### Execution Modes

Lua passdb supports two modes of function:

#### Lookup Database

Function signature is `auth_passdb_lookup(request)`.

Function must return a tuple, which contains a return code, and also
additionally a string or table.

Table must be in key-value format, as it will be imported into auth request.

The string must be in `key=value` format, except if return code indicates
internal error, the second parameter can be used as error string.

#### Password Verification Database

Function signature is `auth_password_verify(request, password)`.

Function must return a tuple, which contains a return code, and also
additionally a string or table.

Table must be in key-value format, as it will be imported into auth request.

The string must be in `key=value` format, except if return code indicates
internal error, the second parameter can be used as error string.

## userdb

To configure userdb in dovecot, use:

```[dovecot.conf]
userdb {
  driver = lua
  args = file=/path/to/lua blocking=yes # default is yes
}
```

### Execution Modes

Lua userdb supports both single user lookup and iteration.

#### Single User Lookup

Function signature is `auth_userdb_lookup(request)`.

The function must return a tuple, which contains a return code, and also
additionally a string or table.

Table must be in key-value format, as it will be imported into auth request.

The string must be in key=value format, except if return code indicates
internal error, the second parameter can be used as error string.

#### User Iteration

Function signature is `auth_userdb_iterate()`.

Function returns a table of usernames. Key names are ignored.

::: tip Note
The iteration will hold the whole user database in memory during iteration.
:::

## Examples

```lua:line-numbers
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
```

### Simple Username Password Database

Example: opensmtpd authentication.

The example uses whitespace separated username and password. As a special
caution, the way Lua is used here means you can have multiple user password per
line, instead of just one. This can be extended to more complicated separators
or multiple fields per user.

If you only want to authenticate users, and don't care about user listing, you
can use:

```lua:line-numbers
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
```

If you also want to be able to list users, so that you could use
`doveadm cmd -A`:

```lua:line-numbers
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
```
