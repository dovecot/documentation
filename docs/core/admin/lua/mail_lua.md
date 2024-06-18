---
layout: doc
title: mail-lua
dovecotlinks:
  lua_mail-lua: mail-lua
---

# Lua: mail-lua

mail-lua is a plugin that can be loaded to provide API for mail storage Lua
plugins.

mail-lua provides a common script to be used in mail storage instead
of per-plugin scripts.

See [[plugin,mail-lua]].

## Initialization

When mail user is created, a script is loaded if present as
`mail_lua_script()` and `mail_user_created()` is called if present in script.

## De-initialization

On deinitialization, `mail_user_deinit_pre()` is called first, if present,
followed by `mail_user_deinit()`.

## C API

### `void dlua_register_mail_storage(struct dlua_script *script)`

Parameters:
:   * `script`: `dlua_script` to add mail storage.

Register storage Lua interface to script context.

### `bool mail_lua_plugin_get_script(struct mail_user *user, struct dlua_script **script_r)`

Parameters:
:   * `user`: `mail_user`
    * `script`: `dlua_script`

Returns script context if available. If FALSE is returned, no Lua script has
been loaded, and you should optionally deal this yourself.

### `void dlua_push_mail_user(struct dlua_script *script, struct mail_user *user)`

Parameters:
:   * `script`: `dlua_script`
    * `user`: `mail_user`

Pushes a mail user on top of stack.

### `void dlua_push_mailbox(struct dlua_script *script, struct mailbox *box)`

Parameters:
:   * `script`: `dlua_script`
    * `mailbox`: `mailbox`

Pushes a mailbox on top of stack.

### `void dlua_push_mail(struct dlua_script *script, struct mail* mail)`

Parameters:
:   * `script`: `dlua_script`
    * `mail`: `mail`

Pushes a mail on top of stack.

## Lua API

### Object `dovecot.storage`

<LuaConstantComponent tag="dovecot.storage" level="3" />

### Object `mail_user`

* Has `tostring()`
* Is comparable (by username)

#### Functions

<LuaFunctionComponent tag="mail_user" level="4" />

#### Variables

<LuaVariableComponent tag="mail_user" level="4" />

### Object `mailbox`

* Has `tostring()`
* Is comparable (by full mailbox name)

#### Functions

<LuaFunctionComponent tag="mailbox" level="4" />

#### Variables

<LuaVariableComponent tag="mailbox" level="4" />

##### `mailbox.attribute`

Full mailbox name.

##### `mailbox.name`

Mailbox name.

### Table `mailbox_status`

#### Variables

<LuaVariableComponent tag="mailbox_status" level="4" />

### Object `mail`

* Has `tostring()`
* Is comparable (within same mailbox, by UID)

#### Functions

*None yet.*

#### Variables

<LuaVariableComponent tag="mail" level="4" />
