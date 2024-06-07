---
layout: doc
title: Lua
dovecotlinks:
  lua: Lua
---

# Dovecot Lua Support

Dovecot supports Lua scripting in several configuration areas.

See:

* [[link,auth_lua]]
* [[plugin,push-notification]]

::: tip Info
**Dovecot supports Lua 5.1 and Lua 5.3.**
:::

## lib-lua

Dovecot provides a lib-lua internal helper as part of libdovecot.so. It has
facilities for loading scripts from various sources, and also helps with
reusing scripts by keeping track of which scripts are loaded. Each script has
it's own memory pool, which is guaranteed to be released when script is
unloaded.

When script is loaded, `script_init()` function is called, if found.

::: warning [[changed,lua_script_init]]
`script_init()` return value is no longer checked. Use error() instead
if necessary.
:::

When script is being unloaded, `script_deinit()` function is called, if found.

## C API

### `void dlua_dovecot_register(struct dlua_script *script)`

Register dovecot variable. This item can also be extended by context specific
tables, like authentication database adds `dovecot.auth`.

### `void dlua_push_event(struct event *event)`

Pushes an Dovecot Event to stack.

## Lua API

::: danger
Never use `os.exit()` from a Lua script. This will cause the whole process
to exit instead of just the script.
:::

### Base Functions

<LuaFunctionComponent tag="base" level="3" />

### HTTP Functions

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

::: tip Note
Object `event_passthrough` has the same API, except the `passthrough_event`
method is not present.
:::

<LuaFunctionComponent tag="event" level="3" />

### Object `dict`

::: tip Note
Currently, this object cannot be created within the Lua code itself.
:::

<LuaFunctionComponent tag="dict" level="3" />

#### Object `dict.transaction`

<LuaFunctionComponent tag="dict_transaction" level="4" />

### Object `dns_client`

[[added,lua_dns_client]]

::: tip Note
Currently, this object cannot be created within the Lua code itself.
:::

<LuaFunctionComponent tag="dns_client" level="3" />

## mail-lua

mail-lua is a plugin that can be loaded to provide API for mail storage Lua
plugins. Mail-lua provides a common script to be used in mail storage instead
of per-plugin scripts.

See [[plugin,mail-lua]].

### C API

#### `void dlua_register_mail_storage(struct dlua_script *script)`

Parameters:
:   * `script`: `dlua_script` to add mail storage.

Register storage Lua interface to script context.

#### `bool mail_lua_plugin_get_script(struct mail_user *user, struct dlua_script **script_r)`

Parameters:
:   * `user`: `mail_user`
    * `script`: `dlua_script`

Returns script context if available. If FALSE is returned, no Lua script has
been loaded, and you should optionally deal this yourself.


#### `void dlua_push_mail_user(struct dlua_script *script, struct mail_user *user)`

Parameters:
:   * `script`: `dlua_script`
    * `user`: `mail_user`

Pushes a mail user on top of stack.

#### `void dlua_push_mailbox(struct dlua_script *script, struct mailbox *box)`

Parameters:
:   * `script`: `dlua_script`
    * `mailbox`: `mailbox`

Pushes a mailbox on top of stack.

#### `void dlua_push_mail(struct dlua_script *script, struct mail* mail)`

Parameters:
:   * `script`: `dlua_script`
    * `mail`: `mail`

Pushes a mail on top of stack.

### Lua API

When mail user is created, a script is loaded if present as
`mail_lua_script()` and `mail_user_created()` is called if present in script.

On deinitialization, `mail_user_deinit_pre()` is called first, if present,
followed by `mail_user_deinit()`.

### `dovecot.storage`

The following constants are specified:

#### enum `STATUS_MESSAGES`

#### enum `STATUS_RECENT`

#### enum `STATUS_UIDNEXT`

#### enum `STATUS_UIDVALIDITY`

#### enum `STATUS_UNSEEN`

#### enum `STATUS_FIRST_UNSEEN_SEQ`

#### enum `STATUS_KEYWORDS`

#### enum `STATUS_HIGHESTMODSEQ`

#### enum `STATUS_PERMANENT_FLAGS`

#### enum `STATUS_FIRST_RECENT_UID`

#### enum `STATUS_HIGHESTPVTMODSEQ`

#### enum `MAILBOX_FLAG_READONLY`

#### enum `MAILBOX_FLAG_SAVEONLY`

#### enum `MAILBOX_FLAG_DROP_RECENT`

#### enum `MAILBOX_FLAG_NO_INDEX_FILES`

#### enum `MAILBOX_FLAG_KEEP_LOCKED`

#### enum `MAILBOX_FLAG_IGNORE_ACLS`

#### enum `MAILBOX_FLAG_AUTO_CREATE`

#### enum `MAILBOX_FLAG_AUTO_SUBSCRIBE`

#### enum `MAILBOX_SYNC_FLAG_FULL_READ`

#### enum `MAILBOX_SYNC_FLAG_FULL_WRITE`

#### enum `MAILBOX_SYNC_FLAG_FAST`

#### enum `MAILBOX_SYNC_FLAG_NO_EXPUNGES`

#### enum `MAILBOX_SYNC_FLAG_FIX_INCONSISTENT`

#### enum `MAILBOX_SYNC_FLAG_EXPUNGE`

#### enum `MAILBOX_SYNC_FLAG_FORCE_RESYNC`

#### enum `MAILBOX_ATTRIBUTE_PREFIX_DOVECOT`

String constant `vendor/vendor.dovecot/`

#### enum `MAILBOX_ATTRIBUTE_PREFIX_DOVECOT_PVT`

String constant `vendor/vendor.dovecot/pvt/`

#### enum `MAILBOX_ATTRIBUTE_PREFIX_DOVECOT_PVT_SERVER`

String constant `vendor/vendor.dovecot/pvt/server/`

### Object `mail_user`

#### Meta

* has tostring()
* is comparable (by username)

#### Functions

<LuaFunctionComponent tag="mail_user" level="4" />

#### Variables

##### `mail_user.home`

Home directory (if available).

##### `mail_user.username`

User's name.

##### `mail_user.uid`

System uid.

##### `mail_user.gid`

System gid.

##### `mail_user.service`

IMAP/POP3/LMTP/LDA/...

##### `mail_user.session_id`

Current session ID.

##### `mail_user.session_create_time`

When session was created.

##### `mail_user.nonexistent`

If user does not really exist.

##### `mail_user.anonymous`

If user is anonymous.

##### `mail_user.autocreated`

If user was automatically created internally for some operation.

##### `mail_user.mail_debug`

If debugging is turned on.

##### `mail_user.fuzzy_search`

TODO

##### `mail_user.dsyncing`

If user is being dsync'd.

### Object `mailbox`

#### Meta

* has tostring()
* is comparable (by full mailbox name)

#### Functions

<LuaFunctionComponent tag="mailbox" level="4" />

#### Variables

##### `mailbox.attribute`

Full mailbox name.

##### `mailbox.name`

Mailbox name.

### Table `mailbox_status`

#### Variables

##### `mailbox_status.mailbox`

Full name of mailbox.

##### `mailbox_status.messages`

Number of messages.

##### `mailbox_status.recent`

Number of \Recent messages.

##### `mailbox_status.unseen`

Number of \Unseen messages.

##### `mailbox_status.uidvalidity`

Current UID validity.

##### `mailbox_status.uidnext`

Next UID.

##### `mailbox_status.first_unseen_seq`

First seqno of unseen mail.

##### `mailbox_status.first_recent_uid`

First UID of unseen mail.

##### `mailbox_status.highest_modseq`

Highest modification sequence.

##### `mailbox_status.highest_pvt_modseq`

Highest private modification sequence.

##### `mailbox_status.permanent_flags`

Supported permanent flags as a bitmask.

##### `mailbox_status.flags`

Supported flags as a bitmask.

##### `mailbox_status.permanent_keywords`

If permanent keywords are supported.

##### `mailbox_status.allow_new_keywords`

If new keywords can be added.

##### `mailbox_status.nonpermanent_modseqs`

Whether non-permanent keywords are allowed.

##### `mailbox_status.no_modseq_tracking`

No modification sequence tracking.

##### `mailbox_status.have_guids`

Whether GUIDs exist.

##### `mailbox_status.have_save_guids`

Whether GUIDs can be saved.

##### `mailbox_status.have_only_guid128`

Whether GUIDs are 128 bit always.

##### `mailbox_status.keywords`

Table of current keywords.

### Object `mail`

#### Meta

* has tostring()
* is comparable (within same mailbox, by UID)

#### Functions

*None yet.*

#### Variables

##### `mail.mailbox`

Mailbox object.

##### `mail.seq`

Sequence number (can change).

##### `mail.uid`

UID (immutable).
