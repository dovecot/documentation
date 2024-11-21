
### Doveadm HTTP API

#### Boolean Request Values

The doveadm HTTP API now requires valid boolean values. Providing invalid
boolean values will result in a 400 response.

### Lua Authentication

Lua passdb/userdb now passes all args key/values to an initialization function.
See [[link,auth_lua_initialization]].
