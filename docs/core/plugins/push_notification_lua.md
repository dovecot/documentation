---
layout: doc
title: push-notification-lua
---

# Lua Push Notification (push-notification-lua) Plugin

You can use Lua to write custom push notification handlers.

::: info Note
Lua push notification requires the base push-notification plugin to be
configured.

See [[plugin,push-notification]] for configuration information.
:::

See [[link,lua]] for general information on how Lua is implemented in Dovecot.

## Configuration

Lua push notification handler requires [[plugin,push-notification]],
[[plugin,mail-lua]], and [[plugin,push-notification-lua]] to be loaded.

| Name | Required | Type | Description |
| ---- | -------- | ---- | ----------- |
| `file` | NO | string | The lua file to execute. If no script is specified, [[setting,mail_lua_script]] will be used by default. |

## Example Configuration

```[dovecot.conf]
mail_plugins = $mail_plugins mail_lua notify push_notification push_notification_lua

plugin {
  push_notification_driver = lua:file=/path/to/lua/script
}
```

## API Overview

The Lua driver hooks into all events, and calls matching functions when found
in Lua script.

The driver supports all available
[push notification events](#push-notification-events).

All events are called within a transaction. The event is called with context
and an event table, which contains the event parameters.

All events contain at least:

| Name | Description |
| ---- | ----------- |
| `name` | Name of the event name |
| `user` | Current mail user |

Events are always called after the fact.

There has to be at least one event handler, or the transaction begin and end
functions are never called. This is an optimization to avoid a roundtrip to
Lua when it's not needed.

### Transactions

`dovecot_lua_notify_begin_txn(user)`
:   Start transaction. Return value is used as transaction context and is
    treated as opaque value by Lua driver. The user parameter is `mail_user`
	object.

`dovecot_lua_notify_end_txn(context, success)`
:   End transaction, context is unreferenced.

### Mailbox Events

All mailbox events contain the following parameters:

| Name | Description |
| ---- | ----------- |
| `mailbox` | Name of the affected mailbox |

Functions:

`dovecot_lua_notify_event_mailbox_create(context, {name, mailbox})`
:   Called when mailbox has been created.

`dovecot_lua_notify_event_mailbox_delete(context, {name, mailbox})`
:   Called when mailbox has been deleted.

`dovecot_lua_notify_event_mailbox_rename(context, {name, mailbox, mailbox_old})`
:   Called when mailbox has been renamed, old name is retained in
    `mailbox_old` attribute.

`dovecot_lua_notify_event_mailbox_subscribe(context, {name, mailbox})`
:   Called when mailbox has been subscribed to. The mailbox does not
    necessarily exist.

`dovecot_lua_notify_event_mailbox_unsubscribe(context, {name, mailbox})`
:   Called when mailbox has been unsubscribed from. The mailbox does not
    necessarily exist.

### Message Events

All message events contain following parameters:

| Name | Description |
| ---- | ----------- |
| `mailbox` | Mailbox name |
| `uid` | Message UID |
| `uid_validity` | Mailbox UIDVALIDITY |

Functions:

`dovecot_lua_notify_event_message_new(context, {name, mailbox, uid, uid_validity, date, tz, from, from_address, from_display_name, to, to_address, to_display_name, subject, snippet})`
:   Called when message is delivered.

`dovecot_lua_notify_event_message_append(context, {name, mailbox, uid, uid_validity, from, from_address, from_display_name, to, to_address, to_display_name, subject, snippet})`
:   Called when message is APPENDed to a mailbox (via IMAP).

`dovecot_lua_notify_event_message_read(context, {name, mailbox, uid, uid_validity})`
:   Called when message is marked as `Seen`.

`dovecot_lua_notify_event_message_trash(context, {name, mailbox, uid, uid_validity})`
:   Called when message is marked `Deleted`.

`dovecot_lua_notify_event_message_expunge(context, {name, mailbox, uid, uid_validity})`
:   Called when message is expunged.

`dovecot_lua_notify_event_flags_set(context, {name, mailbox, uid, uid_validity, flags, keywords_set})`
:   Called when message flags or keywords are set. `flags` is a bitmask.
    `keywords_set` is a table of strings of the keywords set by the event.

`dovecot_lua_notify_event_flags_clear(context, {name, mailbox, uid, uid_validity, flags, keywords_clear, keywords_old})`
:   Called when message flags or keywords are removed. `flags` is a bitmask.
    `keywords_clear` contains the keywords cleared, `keywords_old` is the
    table of keywords that were set before the event.

## Example Scripts

::: details Simple example with `dovecot.http.client`
```lua:line-numbers
local url = require 'socket.url'

local client = nil

function script_init()
  client = dovecot.http.client({debug=True, timeout=10000})
end

local function table_get(t, k, d)
  return t[k] or d
end


function dovecot_lua_notify_begin_txn(user)
  return {messages={}, ep=user:plugin_getenv("push_lua_url"), username=user.username}
end


function dovecot_lua_notify_end_txn(ctx, success)
  local i, msg = next(ctx["messages"], nil)
  while i do
    local rq = client:request({url=ctx["ep"], method="POST"})
    rq:set_payload("from=" .. url.escape(table_get(msg, "from", "")) .. "&to=" .. url.escape(table_get(msg, "to", "")) .. "&subject=" .. url.escape(table_get(msg, "subject", "")) .. "&snippet=" .. url.escape(table_get(msg, "snippet", "")) .. "&user=" .. url.escape(ctx["username"]))
    r = rq:submit()
    if r and r:status()/100 ~= 2 then
      dovecot.i_error("lua-push: Remote error " .. tostring(r:reason()) .. " handling push notification")
    end

    i, msg = next(ctx["messages"], i)
  end
end


function dovecot_lua_notify_event_message_append(ctx, event)
  table.insert(ctx["messages"], event)
end


function dovecot_lua_notify_event_message_new(ctx, event)
  table.insert(ctx["messages"], event)
end
```
:::

::: details Example with event code

```lua:line-numbers
-- To use:
--
-- plugin {
--   push_notification_driver = lua:file=/home/example/empty.lua
--   push_lua_url = http://push.notification.server/handler
-- }
--
-- server is sent a POST message to given url with parameters
--

local client = nil
local url = require "socket.url"

function table_get(t, k, d)
  return t[k] or d
end

function script_init()
  client = dovecot.http.client({debug=True, timeout=10000})
end

function dovecot_lua_notify_begin_txn(user)
  return {user=user, event=dovecot.event(), ep=user:plugin_getenv("push_lua_url"), states={}, messages={}}
end

function dovecot_lua_notify_event_message_new(ctx, event)
  -- get mailbox status
  local mbox = ctx.user:mailbox(event.mailbox)
  mbox:sync()
  local status = mbox:status(dovecot.storage.STATUS_RECENT, dovecot.storage.STATUS_UNSEEN, dovecot.storage.STATUS_MESSAGES)
  mbox:free()
  ctx.states[event.mailbox] = status
  table.insert(ctx.messages, {from=event.from,subject=event.subject,mailbox=event.mailbox})
end

function dovecot_lua_notify_event_message_append(ctx, event, user)
  dovecot_lua_notify_event_message_new(ctx, event, user)
end

function dovecot_lua_notify_end_txn(ctx)
  -- report all states
  for i,msg in ipairs(ctx.messages) do
    local e = dovecot.event(ctx.event)
    e:set_name("lua_notify_mail_finished")
    reqbody = "mailbox=" .. url.escape(msg.mailbox) .. "&from=" .. url.escape(table_get(msg, "from", "")) .. "&subject=" .. url.escape(table_get(msg, "subject", ""))
    e:log_debug(ctx.ep .. " - sending " .. reqbody)
    local rq = client:request({url=ctx["ep"], method="POST"})
    rq:set_payload(reqbody)
    rq:add_header("content-type", "application/x-www-form-url.escaped")
    local code = rq:submit():status()
    e:add_int("result_code", code)
    e:log_info("Mail notify status " .. tostring(code))
  end
  for box,state in pairs(ctx.states) do
    local e = dovecot.event()
    e:set_name("lua_notify_mailbox_finished")
    reqbody = "mailbox=" .. url.escape(state.mailbox) .. "&recent=" .. tostring(state.recent) .. "&unseen=" .. tostring(state.unseen) .. "&messages=" .. tostring(state.messages)
    e:log_debug(ctx.ep .. " - sending " .. reqbody)
    local rq = client:request({url=ctx["ep"], method="POST"})
    rq:set_payload(reqbody)
    rq:add_header("content-type", "application/x-www-form-url.escaped")
    local code = rq:submit():status()
    e:add_int("result_code", code)
    e:log_info("Mailbox notify status " .. tostring(code))
  end
end
```
:::
