---
layout: doc
title: push-notification
dovecotlinks:
  push_notification: Push Notifications
---

# Push Notification (push-notification) Plugin

Dovecot's Push Notification plugin implements a framework that exposes
[[rfc,5423]] (Internet Message Store Events) events that occur in Dovecot to
a system that can be used to report these events to external services.

## Push Notification Events

These events (see [[rfc,5423,4.1]] for descriptions) are available
within the notification framework, although a driver may not implement all
of them:

* FlagsClear
* FlagsSet
* MailboxCreate
* MailboxDelete
* MailboxRename
* MailboxSubscribe
* MailboxUnsubscribe
* MessageAppend
* MessageExpunge
* MessageNew
* MessageRead
* MessageTrash

These events are not supported by the notification framework:

* Login (handled by [[link,authentication]])
* Logout (handled by [[link,authentication]])
* QuotaExceed (handled by [[plugin,quota]])
* QuotaWithin (handled by [[plugin,quota]])

## Usage

To use push notifications, both the `notify` and the `push_notification`
plugins need to be activated by defining in [[setting,mail_plugins]].

This can either be set globally or restricted to the protocols where you
want push notifications to be generated.  For example, to restrict to mail
delivery notifications only, this config should be used:

```[dovecot.conf]
protocol lmtp {
  mail_plugins = $mail_plugins notify push_notification
}

# If notifications are also needed for LDA-based delivery, add:
protocol lda {
  mail_plugins = $mail_plugins notify push_notification
}
```

## Settings

<SettingsComponent plugin="push-notification" />

## Drivers

A push notification driver is defined by the
[[setting,push_notification_driver]] setting.

Example:

```[dovecot.conf]
plugin {
  push_notification_driver  = ox:url=http://example.com/foo
  push_notification_driver2 = ox:url=http://example.com/bar

  # This driver will NOT be processed, as it does not appear sequentially
  # with the other configuration options
  push_notification_driver4 = dlog
}
```

The list of drivers shipped with Dovecot core appears below.

### DLOG (Debug log) [`dlog`]

```[dovecot.conf]
plugin {
  push_notification_driver = dlog
}
```

This will cause notifications to end up in your debug log.

### OX (Open-Xchange) driver [`ox`]

The OX backend supports sending notifications on MessageNew events (i.e. mail
deliveries, not IMAP APPENDs).

This driver was designed for use with
[OX App Suite Push Notification API](https://documentation.open-xchange.com/7.10.5/middleware/mail/dovecot/dovecot_push.html),
but can be used by any push endpoint that implements this API, not just OX
App Suite.

#### Configuration Options

| Name | Required | Type | Description |
| ---- | -------- | ---- | ----------- |
| `url` | **YES** | string | The HTTP end-point (URL + authentication information) to use is configured in the Dovecot configuration file. Contains authentication information needed for Basic Authentication (if any). Example: `http<s> + "://" + <login> + ":" + <password> + "@" + <host> + ":" + <port> + "/preliminary/http-notify/v1/notify"`. For HTTPS endpoints, system CAs are trusted by default, but internal CAs might need further configuration. For further details on configuring the App Suite endpoint, see: https://documentation.open-xchange.com/latest/middleware/mail/dovecot/dovecot_push.html#configuration-of-dovecot-http-notify-plug-in |
| `cache_lifetime` | NO | time | Cache lifetime for the METADATA entry for a user. (DEFAULT: `60 seconds`) |
| `max_retries` | NO | unsigned integer | The maximum number of times to retry a connection to the OX endpoint. Setting it to `0` will disable retries. (DEFAULT: `1`) |
| `timeout_msecs` | NO | time (msecs) | Time before HTTP request to OX endpoint will timeout. (DEFAULT: `2000`) |
| `user_from_metadata` | NO | (Existence of setting) | Use the user stored in the METADATA entry instead of the user sent by OX endpoint. Does not require an argument; presence of the option activates the feature. (DEFAULT: user returned by endpoint response is used) |

#### Example Configuration

```[dovecot.conf]
plugin {
  push_notification_driver = ox:url=http://login:pass@node1.domain.tld:8009/preliminary/http-notify/v1/notify user_from_metadata timeout_msecs=10000
}
```

#### Metadata

The push notifications are enabled separately for each user using METADATA.
Normally [OX App Suite](https://www.open-xchange.com/products/ox-app-suite/)
does this internally, but for e.g. testing purposes you can do this yourself:

```console
$ doveadm mailbox metadata set -u user@example.com \
    -s "" /private/vendor/vendor.dovecot/http-notify user=11@3
```

#### Example Payload

Push notification sent in JSON format with the following fields:

| Name | Type | Description |
| ---- | ---- | ----------- |
| `event` | string | [[rfc,5423]] event type (currently only "MessageNew") |
| `folder` | string | Mailbox name |
| `from` | string | [[rfc,2822]] address of the message sender (MIME-encoded), if applicable |
| `imap-uid` | integer | UID of the message, if applicable |
| `imap-uidvalidity` | integer | [[rfc,3501]] UIDVALIDITY value of the mailbox |
| `snippet` | string | Snippet of the message body (UTF-8), if applicable |
| `subject` | string | Subject of the message (MIME-encoded), if applicable |
| `unseen` | integer | [[rfc,3501]] UNSEEN value of the mailbox |
| `user` | string | User identifier |

Example (`Content-Type: application/json; charset=utf-8`):

```json
{
    "user": "4@464646669",
    "imap-uidvalidity": 123412341,
    "imap-uid": 2345,
    "folder": "INBOX",
    "event": "MessageNew",
    "from": "=?utf-8?q?=C3=84?= <alice@barfoo.org>",
    "subject": "Test =?utf-8?q?p=C3=A4iv=C3=A4=C3=A4?=",
    "snippet": "Hey guys\nThis is only a test...",
    "unseen": 2
}
```

### Lua [`lua`]

You can use Lua to write custom push notification handlers.

See [[link,lua]] for general information on how Lua is implemented in Dovecot.

#### Configuration

Lua push notification handler requires [[plugin,mail-lua]] and
[[plugin,push-notification-lua]] plugins to be loaded in addition to the
plugins discussed above.

| Name | Required | Type | Description |
| ---- | -------- | ---- | ----------- |
| `file` | NO | string | The lua file to execute. If no script is specified, [[setting,mail_lua_script]] will be used by default. |

#### Example Configuration

```[dovecot.conf]
mail_plugins = $mail_plugins mail_lua notify push_notification push_notification_lua

plugin {
  push_notification_driver = lua:file=/path/to/lua/script
}
```

#### API Overview

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

##### Transactions

`dovecot_lua_notify_begin_txn(user)`
:   Start transaction. Return value is used as transaction context and is
    treated as opaque value by Lua driver. The user parameter is `mail_user`
	object.

`dovecot_lua_notify_end_txn(context, success)`
:   End transaction, context is unreferenced.

##### Mailbox Events

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

##### Message Events

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

#### Example Scripts

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
