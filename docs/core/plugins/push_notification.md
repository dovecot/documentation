---
layout: doc
title: push-notification
dovecotlinks:
  push_notification: Push Notifications
  push_notification_events:
    hash: push-notification-events
    text: Push Notification Events
---

# Push Notification Plugin (`push-notification`)

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
plugins need to be activated by defining them in [[setting,mail_plugins]].

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

A push notification driver is defined by the [[setting,push_notification]]
setting. The configuration value is a named filter for a specified driver, see
the driver for their names and their supported options.

It is possible to specify multiple push notification drivers by giving unique
names to the individual driver configurations. Multiple configuration for a
driver of the same type is useful if, for example, you want to process a single
notification with the same driver but different endpoints.

Example:

```[dovecot.conf]
push_notification ox1 {
  driver = ox
  ox_url = http://example.com/foo
}

push_notification ox2 {
  driver = ox
  ox_url = http://example.com/bar
}
```

The list of drivers shipped with Dovecot core appears below.

### DLOG (Debug log) [`dlog`]

The most simple push notification plugin is the `dlog` plugin. It will write
notifications into the debug log of the process. This driver has no options. To
enable it you will have to define it explicitly, otherwise it is disabled.

| Name | Required | Type | Description |
| ---- | -------- | ---- | ----------- |
| `push_notification_driver` | **YES** | [[link,settings_types_string]] | To identify this settings block the driver should get the value `dlog`. |

#### Example Configuration

```[dovecot.conf]
push_notification dlog {
  driver = dlog
}
```

### OX (Open-Xchange) driver [`ox`]

The OX backend supports sending notifications on MessageNew events (i.e. mail
deliveries, not IMAP APPENDs).

This driver was designed for use with
[OX App Suite Push Notification API][ox-appsuite-push-notification-api] but can
be used by any push endpoint that implements this API, not just OX App Suite.

#### Configuration Options

| Name | Required | Type | Description |
| ---- | -------- | ---- | ----------- |
| `push_notification_driver` | **YES** | [[link,settings_types_string]] | To identify this settings block the driver should get the value `ox`. |
| `push_notification_ox_url` | **YES** | [[link,settings_types_string]] | The HTTP end-point (URL + authentication information) to use is configured in the Dovecot configuration file. Contains authentication information needed for Basic Authentication (if any). Example: `http<s> + "://" + <login> + ":" + <password> + "@" + <host> + ":" + <port> + "/preliminary/http-notify/v1/notify"`<br/>For HTTPS endpoints, system CAs are trusted by default, but internal CAs might need further configuration.<br/>For further details on configuring the App Suite endpoint, see: [OX App Suite Push Notification API#Configuration of Dovecot "http-notify" plugin-in][ox-appsuite-push-notification-api-dovecot-configuration] |
| `push_notification_ox_cache_ttl` | NO | [[link,settings_types_time]] | Cache lifetime for the METADATA entry for a user. (DEFAULT: `60 seconds`) |
| `push_notification_ox_user_from_metadata` | NO | [[link,settings_types_boolean]] | Use the user stored in the METADATA entry instead of the user sent by OX endpoint. (DEFAULT: user returned by endpoint response is used, i.e. `no`) |

#### Example Configuration

```[dovecot.conf]
push_notification ox {
  ox_url = http://login:pass@node1.domain.tld:8009/preliminary/http-notify/v1/notify
  user_from_metadata = yes
  cache_ttl = 10secs
}
```

#### Metadata

The push notifications are enabled separately for each user using METADATA.
Normally [OX App Suite][ox-app-suite] does this internally, but for e.g.
testing purposes you can do this yourself:

```sh
doveadm mailbox metadata set -u user@example.com \
    -s "" /private/vendor/vendor.dovecot/http-notify user=11@3
```

#### Example Payload

Push notification sent in JSON format with the following fields:

| Name | Type | Description |
| ---- | ---- | ----------- |
| `event` | string | [[rfc,5423]] event type (currently only "MessageNew") |
| `folder` | string | Mailbox name |
| `from` | string | [[rfc,2822]] address of the message sender (MIME-encoded), if applicable |
| `imap-uid` | number | UID of the message, if applicable |
| `imap-uidvalidity` | number | [[rfc,3501]] UIDVALIDITY value of the mailbox |
| `snippet` | string | Snippet of the message body (UTF-8), if applicable |
| `subject` | string | Subject of the message (MIME-encoded), if applicable |
| `unseen` | number | [[rfc,3501]] UNSEEN value of the mailbox |
| `user` | string | User identifier |

::: info NOTE
The returned numbers are generally integer values in the range
`0`..`4294967295`.
:::

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

[ox-appsuite]: https://www.open-xchange.com/products/ox-app-suite/
[ox-appsuite-push-notification-api]: https://documentation.open-xchange.com/7.10.5/middleware/mail/dovecot/dovecot_push.html
[ox-appsuite-push-notification-api-dovecot-configuration]: https://documentation.open-xchange.com/latest/middleware/mail/dovecot/dovecot_push.html#configuration-of-dovecot-http-notify-plug-in
