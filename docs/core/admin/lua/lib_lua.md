---
layout: doc
title: lib-lua
dovecotlinks:
  lua_lib-lua: lib-lua
---

# Lua: lib-lua

Dovecot provides a lib-lua internal helper as part of libdovecot.so. It has
facilities for loading scripts from various sources, and also helps with
reusing scripts by keeping track of which scripts are loaded. Each script has
it's own memory pool, which is guaranteed to be released when script is
unloaded.

::: danger
Never use `os.exit()` from a Lua script. This will cause the whole process
to exit instead of just the script.
:::

## Initialization

When script is loaded, `script_init()` function is called, if found.

::: warning [[changed,lua_script_init]]
`script_init()` return value is no longer checked. Use error() instead
if necessary.
:::

## De-initialization

When script is being unloaded, `script_deinit()` function is called, if found.

## C API

### `void dlua_dovecot_register(struct dlua_script *script)`

Register dovecot variable. This item can also be extended by context specific
tables, like authentication database adds `dovecot.auth`.

### `void dlua_push_event(struct event *event)`

Pushes an Dovecot Event to stack.

## Lua API

### Base Functions

<LuaFunctionComponent tag="dovecot" level="3" />

### HTTP Functions

<LuaFunctionComponent tag="dovecot.http" level="3" />

#### Object `http_client`

<LuaFunctionComponent tag="http_client" level="4" />

#### Object `http_request`

<LuaFunctionComponent tag="http_request" level="4" />

#### Object `http_response`

<LuaFunctionComponent tag="http_response" level="4" />

#### Example HTTP Client Code

```lua
local json = require "json"
local http_client = dovecot.http.client {
    timeout = 10000;
    max_attempts = 3;
    debug = true;
}

function auth_password_verify(request, password)
    local auth_request = http_client:request {
        url = "https://endpoint/";
        method = "POST";
    }
    local req = {user=request.user, password=password}
    auth_request:set_payload(json.encode(req))
    local auth_response = auth_request:submit()
    local resp_status = auth_response:status()

    if resp_status == 200
    then
        return dovecot.auth.PASSDB_RESULT_OK, ""
    else
        return dovecot.auth.PASSDB_RESULT_PASSWORD_MISMATCH, ""
    end
end
```

### Object `event`

<LuaFunctionComponent tag="event" level="3" />

### Object `event_passthrough`

<LuaFunctionComponent tag="event_passthrough" level="3" />

### Object `dict`

::: tip
Currently, this object cannot be created within the Lua code itself.
:::

<LuaFunctionComponent tag="dict" level="3" />

#### Object `dict.transaction`

<LuaFunctionComponent tag="dict.transaction" level="4" />

### Object `dns_client`

[[added,lua_dns_client]]

::: tip
Currently, this object cannot be created within the Lua code itself.
:::

<LuaFunctionComponent tag="dns_client" level="3" />
