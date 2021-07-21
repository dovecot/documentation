.. _push_notification:

===========================
Push Notification Framework
===========================

Introduction
============

Dovecot's Push Notification framework exposes `RFC 5423 (Internet Message Store
Events) <https://tools.ietf.org/html/rfc5423>`_ events that occur in Dovecot to
a system that can be used to report these events to external services.

These events (see https://datatracker.ietf.org/doc/html/rfc5423#section-4.1
for descriptions) are available within the notification framework, although a
driver may not implement all of them:

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

* Login (handled by :ref:`authentication-authentication`)
* Logout (handled by :ref:`authentication-authentication`)
* QuotaExceed (handled by :ref:`quota`)
* QuotaWithin (handled by :ref:`quota`)

Usage
=====

To use push notifications, both the ``notify`` and the ``push_notification``
plugins need to be activated by defining in :ref:`setting-mail_plugins`.

This can either be set globally or restricted to the protocols where you
want push notifications to be generated.  For example, to restrict to mail
delivery notifications only, this config should be used:

.. code-block:: none

  protocol lmtp {
    mail_plugins = $mail_plugins notify push_notification
  }

  # If notifications are also needed for LDA-based delivery, add:
  protocol lda {
    mail_plugins = $mail_plugins notify push_notification
  }


Drivers
=======

DLOG (Debug log)
^^^^^^^^^^^^^^^^

.. code-block:: none

  plugin {
    push_notification_driver = dlog
  }

This will cause notifications to end up in your debug log.

OX (Open-Xchange) driver
^^^^^^^^^^^^^^^^^^^^^^^^

The OX backend supports sending notifications on MessageNew events (i.e. mail
deliveries, not IMAP APPENDs).

The HTTP end-point (URL + authentication information) to use is configured in
the Dovecot configuration file. The appropriate configuration options will
contain the HTTP URL denoting the end-point to connect to as well as the
authentication information for Basic Authentication as configured by properties
``com.openexchange.rest.services.basic-auth.login`` and
``com.openexchange.rest.services.basic-auth.password``. The URL to configure in
Dovecot configuration follows this pattern.

.. code-block:: none

  <http|https> + "://" + <login> + ":" + <password> + "@" + <host> + ":" + <port> + "/preliminary/http-notify/v1/notify"

E.g.

.. code-block:: none

  plugin {
    push_notification_driver = ox:url=http://login:pass@node1.domain.tld:8009/preliminary/http-notify/v1/notify
  }

For HTTPS endpoints, system CAs are trusted by default, but internal CAs might
need further configuration.

Furthermore, it is also possible to specify more than one HTTP end-point to
connect to if a new message delivery occurs. Thus the configuration section
mentioned above may be extended by additional ``push_notification_driver``
entries; e.g. ``push_notification_driver2``, ``push_notification_driver3``,
etc.

Please note that the path ``/preliminary/http-notify/v1/notify`` denotes the
internal REST API of the Open-Xchange Middleware, which is not publicly
accessible. The administrator can decide whether to add that path to the Apache
configuration (see also ``AppSuite:Apache_Configuration and AppSuite:Grizzly``)
through a Location/ProxyPass directive:

.. code-block:: none

  <Location /preliminary>
    Order Deny,Allow
    Deny from all
    # Only allow access from servers within the network. Do not expose this
    # location outside of your network. In case you use a load balancing service in front
    # of your Apache infrastructure you should make sure that access to /preliminary will
    # be blocked from the internet / outside clients. Examples:
    # Allow from 192.168.0.1
    # Allow from 192.168.1.1 192.168.1.2
    # Allow from 192.168.0.
    ProxyPass /preliminary balancer://oxcluster/preliminary
  </Location>

In case the ``user=`` sent by OX in the push_notification_driver url data does
not match the IMAP login of a user, Dovecot ignores it. This can be overridden
by defining ``user_from_metadata`` in the ``push_notification_driver`` url,
e.g.

.. code-block:: none

  push_notification_driver = ox:url=http://example.com/ user_from_metadata

Metadata
--------

The push notifications are enabled separately for each user using METADATA.
Normally `AppSuite <https://wiki.dovecot.org/AppSuite>`_ does this internally,
but for e.g. testing purposes you can do this yourself:

.. code-block:: none

  doveadm mailbox metadata set -u user@example.com -s "" /private/vendor/vendor.dovecot/http-notify user=11@3

Example Payload
---------------

See
https://github.com/dovecot/core/blob/master/src/plugins/push-notification/push-notification-driver-ox.c.

Push notification sent in JSON format with the following fields:

* **user**: User identifier (string)
* **event**: RFC 5423 event type (string; currently only "MessageNew")
* **folder**: Mailbox name (string)
* **imap-uidvalidity**: RFC 3501 UIDVALIDITY value of the mailbox (integer)
* **imap-uid**: UID of the message, if applicable (integer)
* **from**: RFC 2822 address of the message sender (MIME-encoded), if applicable (string)
* **subject**: Subject of the message (MIME-encoded), if applicable (string)
* **snippet**: Snippet of the message body (UTF-8), if applicable (string)
* **unseen**: RFC 3501 UNSEEN value of the mailbox (integer)

.. code-block:: none

  Content-Type: application/json; charset=utf-8

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


.. _lua_push_notifications:

Lua
^^^

.. versionadded:: v2.3.4

You can use Lua to write custom push notification handlers. See Design/Lua for
general information about `Lua <https://wiki.dovecot.org/Design/Lua>`_ in
Dovecot. If you have ``mail_lua_script`` (a global script for storage) it will
be used if no script is specified.

Configuration
-------------

.. code-block:: none

  mail_plugins = $mail_plugins mail_lua notify push_notification push_notification_lua

  plugin {
    push_notification_driver = lua:file=/path/to/lua/script
    # you can omit the script name if you want to use mail_lua_script script instead
    #mail_lua_script=/path/to/common/script.lua
  }

Example Scripts
---------------

Simple example:

.. code-block:: none

  1  -- To use
  2  --
  3  -- plugin {
  4  --  push_notification_driver = lua:file=/home/cmouse/empty.lua
  5  --  push_lua_url = http://push.notification.server/handler
  6  -- }
  7  --
  8  -- server is sent a POST message to given url with parameters
  9  --
  10
  11 local http = require("socket.http")
  12 local url = require("socket.url")
  13
  14 function table_get(t, k, d)
  15   return t[k] or d
  16 end
  17
  18 function dovecot_lua_notify_begin_txn(user)
  19   return {messages={}, ep=user:plugin_getenv("push_lua_url"), username=user.username}
  20 end
  21
  22 function dovecot_lua_notify_end_txn(ctx, success)
  23   local i, msg = next(ctx["messages"], nil)
  24   while i do
  25     local r, c = http.request(ctx["ep"], "from=" .. url.escape(table_get(msg, "from", "")) .. "&to=" .. url.escape(table_get(msg, "to", "")) .. "&subject=" .. url.escape(table_get(msg, "subject", "")) .. "&snippet=" .. url.escape(table_get(msg, "snippet", "")) .. "&user=" .. url.escape(ctx["username"]))
  26     if r and c/100 ~= 2 then
  27       dovecot.i_error("lua-push: Remote error " .. tostring(c) .. " handling push notication")
  28     end
  29     if r == nil then
  30       dovecot.i_error("lua-push: " .. c)
  31     end
  32     i, msg = next(ctx["messages"], i)
  33   end
  34 end
  35
  36 function dovecot_lua_notify_event_message_append(ctx, event)
  37   table.insert(ctx["messages"], event)
  38 end
  39
  40 function dovecot_lua_notify_event_message_new(ctx, event)
  41   table.insert(ctx["messages"], event)
  42 end

.. versionadded:: v2.3.4

Example with event code:

.. code-block:: none

  1  -- To use
  2  --
  3  -- plugin {
  4  --  push_notification_driver = lua:file=/home/cmouse/empty.lua
  5  --  push_lua_url = http://push.notification.server/handler
  6  -- }
  7  --
  8  -- server is sent a POST message to given url with parameters
  9  --
  10
  11 local http = require "socket.http"
  12 local ltn12 = require "ltn12"
  13 local url = require "socket.url"
  14
  15 function table_get(t, k, d)
  16   return t[k] or d
  17 end
  18
  19 function script_init()
  20   return 0
  21 end
  22
  23 function dovecot_lua_notify_begin_txn(user)
  24   return {user=user, event=dovecot.event(), ep=user:plugin_getenv("push_lua_url"), states={}, messages={}}
  25 end
  26
  27 function dovecot_lua_notify_event_message_new(ctx, event)
  28   -- get mailbox status
  29   local mbox = ctx.user:mailbox(event.mailbox)
  30   mbox:sync()
  31   local status = mbox:status(dovecot.storage.STATUS_RECENT, dovecot.storage.STATUS_UNSEEN, dovecot.storage.STATUS_MESSAGES)
  32   mbox:free()
  33   ctx.states[event.mailbox] = status
  34   table.insert(ctx.messages, {from=event.from,subject=event.subject,mailbox=event.mailbox})
  35 end
  36
  37 function dovecot_lua_notify_event_message_append(ctx, event, user)
  38   dovecot_lua_notify_event_message_new(ctx, event, user)
  39 end
  40
  41 function dovecot_lua_notify_end_txn(ctx)
  42   -- report all states
  43   for i,msg in ipairs(ctx.messages) do
  44     local e = dovecot.event(ctx.event)
  45     e:set_name("lua_notify_mail_finished")
  46     reqbody = "mailbox=" .. url.escape(msg.mailbox) .. "&from=" .. url.escape(table_get(msg, "from", "")) .. "&subject=" .. url.escape(table_get(msg, "subject", ""))
  47     e:log_debug(ctx.ep .. " - sending " .. reqbody)
  48     res, code = http.request({method="POST",
  49                   url=ctx.ep,
  50                   source=ltn12.source.string(reqbody),
  51                   headers={
  52                     ["content-type"] = "application/x-www-form-url.escaped",
  53                     ["content-length"] = tostring(#reqbody)
  54                   }
  55                  })
  56     e:add_int("result_code", code)
  57     e:log_info("Mail notify status " .. tostring(code))
  58   end
  59   for box,state in pairs(ctx.states) do
  60     local e = dovecot.event()
  61     e:set_name("lua_notify_mailbox_finished")
  62     reqbody = "mailbox=" .. url.escape(state.mailbox) .. "&recent=" .. tostring(state.recent) .. "&unseen=" .. tostring(state.unseen) .. "&messages=" .. tostring(state.messages)
  63     e:log_debug(ctx.ep .. " - sending " .. reqbody)
  64     res, code = http.request({method="POST",
  65                   url=ctx.ep,
  66                   source=ltn12.source.string(reqbody),
  67                   headers={
  68                     ["content-type"] = "application/x-www-form-url.escaped",
  69                     ["content-length"] = tostring(#reqbody)
  70                   }
  71                  })
  72     e:add_int("result_code", code)
  73     e:log_info("Mailbox notify status " .. tostring(code))
  74   end
  75 end

Overview
--------

The Lua driver hooks into all events, and calls matching functions when found
in Lua script.

Currently it supports

* mailbox create, delete, rename, subscribe and unsubscribe
* message new, append, expunge, read and trash, flags set, flags clear

All events are called within a transaction. The event is called with context
and an event table, which contains the event parameters. All events contain at
least

* name - name of the event
* user - current mail user

Events are always called after the fact.

There has to be at least one event handler, or the transaction begin and end
functions are never called. This is optimization to avoid roundtrip to Lua when
it's not needed.

Transactions
------------

* dovecot_lua_notify_begin_txn(user)

Start transaction. Return value is used as transaction context and is treated
as opaque value by Lua driver. The user parameter is ``mail_user`` object.

* dovecot_lua_notify_end_txn(context, success)

End transaction, context is unreferenced.

Mailbox events
--------------

All mailbox events contain `mailbox` parameter, which is the name of the
affected mailbox.

* dovecot_lua_notify_event_mailbox_create(context, {name, mailbox})

Called when mailbox has been created.

* dovecot_lua_notify_event_mailbox_delete(context, {name, mailbox})

Called when mailbox has been deleted.

* dovecot_lua_notify_event_mailbox_rename(context, {name, mailbox,
  mailbox_old})

Called when mailbox has been renamed, old name is retained in mailbox_old
attribute.

* dovecot_lua_notify_event_mailbox_subscribe(context, {name, mailbox})

Called when mailbox has been subscribed to. The mailbox does not necessarily
exist.

* dovecot_lua_notify_event_mailbox_unsubscribe(context, {name, mailbox})

Called when mailbox has been unsubscribed from. The mailbox does not
necessarily exist.

Message events
--------------

All message events contain following parameters

==============   ========================
mailbox            Mailbox name
uid                Message UID
uid_validity       Mailbox UID validity
==============   ========================

* dovecot_lua_notify_event_message_new(context, {name, mailbox, uid,
  uid_validity, date, tz, from, from_address, from_display_name,
  to, to_address, to_display_name, subject, snippet})

Called when message is delivered.

* dovecot_lua_notify_event_message_append(context, {name, mailbox, uid,
  uid_validity, from, from_address, from_display_name,
  to, to_address, to_display_name, subject, snippet})

Called when message is APPENDed to a mailbox.

* dovecot_lua_notify_event_message_read(context, {name, mailbox, uid,
  uid_validity})

Called when message is marked as Seen.

* dovecot_lua_notify_event_message_trash(context, {name, mailbox, uid,
  uid_validity})

Called when message is marked Deleted.

* dovecot_lua_notify_event_message_expunge(context, {name, mailbox, uid,
  uid_validity})

Called when message is EXPUNGEd.

* dovecot_lua_notify_event_flags_set(context, {name, mailbox, uid,
  uid_validity, flags, keywords_set})

Called when message flags or keywords are set. flags is a bitmask. keywords_set
is a table of strings of the keywords set by the event.

* dovecot_lua_notify_event_flags_clear(context, {name, mailbox, uid,
  uid_validity, flags, keywords_clear, keywords_old})

Called when message flags or keywords are removed. flags is a bitmask.
keywords_clear contains the keywords cleared, keywords_old is the table of
keywords that were set before the event.
