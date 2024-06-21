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

See [[plugin,push-notification-lua]] for configuration information.
