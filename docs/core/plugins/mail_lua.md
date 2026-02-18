---
layout: doc
title: mail-lua
dovecotlinks:
  var_expand_lua: Variable expansion functions
---

# Mail Lua Plugin (`mail-lua`)

mail-lua is a plugin that can be loaded to provide API for mail storage
Lua plugins.

See [[link,lua]].

## Settings

<SettingsComponent plugin="mail-lua" />

## Variable expansion functions

This component registers two providers. Note that these providers have very
limited functionality at this moment.

### `%{lua_file(<path>,<function>,...)}`

Executes the script at given path, and if it's successful, use the string
result. If values are provided after function name, they are passed to
the Lua function as parameters. Pipeline value is always added last, if present.

Example:
```[dovecot.conf]
mail_plugins {
   mail_lua = yes
}

mail_home = %{user|lua_file("/etc/dovecot/get_home.lua","get_home")}
```

```[get_home.lua]
# This is not a good way to do this, provided here for example
# purposes only. Do not use this.

local function get_home(user)
  return "/home/" .. user
end
```

### `%{lua_call(<function>,...)}`

Executes Lua function in the mail lua script file, and  it's successful, use the string
result. If values are provided after function name, they are passed to
the Lua function as parameters. Pipeline value is always added last, if present.

Example:
```[dovecot.conf]
mail_plugins {
   mail_lua = yes
}

mail_lua_file = /etc/dovecot/mail.lua
mail_home = %{user|lua_call("get_home")}
```

```[mail.lua]
# This is not a good way to do this, provided here for example
# purposes only. Do not use this.

local function get_home(user)
  return "/home/" .. user
end
```
