---
layout: doc
title: Vacation
dovecotlinks:
  sieve_vacation: Sieve vacation extension
---

# Sieve: Vacation Extension

The Sieve vacation extension ([[rfc,5230]]) defines a mechanism
to generate automatic replies to incoming email messages. It takes
various precautions to make sure replies are only sent when appropriate.

Script authors can specify how often replies can be sent to a particular
contact. In the original vacation extension, this interval is specified
in days with a minimum of one day. When more granularity is necessary
and particularly when replies must be sent more frequently than one day,
the vacation-seconds extension ([[rfc,6131]]) can be used. This
allows specifying the minimum reply interval in seconds with a minimum
of zero (a reply is then always sent), depending on administrator
configuration.

## Configuration

The vacation extension is available by default.

In contrast, the vacation-seconds extension - which implies the vacation
extension when used - is not available by default and needs to be enabled
explicitly by adding it to [[setting,sieve_extensions]].

The configuration also needs to be adjusted accordingly to allow a non-reply
period of less than a day.

### Settings

::: warning
Invalid values for these settings will make the Sieve interpreter
log a warning and revert to the default values.
:::

<SettingsComponent tag="sieve-vacation" level="3" />

### Auto-Reply

The vacation extension uses envelope sender and envelope recipient. They're
taken from:

- **Envelope sender**: `-f` parameter to dovecot-lda if given, otherwise
  `Return-Path:` header in the message.

- **Envelope recipient**: `-a` parameter to dovecot-lda if given, otherwise
  `-d` parameter to dovecot-lda. If neither is given (delivering to
  system users), the `$USER` environment is used.

The vacation replies are sent to the envelope sender.

List of autoreplied senders is stored in `.dovecot.lda-dupes` file in
user's home directory.

When you're testing the vacation feature, it's easy to forget that the reply
is sent only once in the number of configured days. If you have problems
getting the vacation reply, try deleting this file. If that didn't help,
make sure the problem isn't related to sending mails in general by trying
the "reject" Sieve command.

The automatic replies aren't sent if any of the following is true:

- The envelope sender is not available (equal to &lt;&gt;)

- The envelope sender and envelope recipient are the same

- The sender recently (within `:days` days; default `7`) got a reply from
  the same vacation command

- The message contains at least one of the mailing list headers
  `list-id`, `list-owner`, `list-subscribe`, `list-post`,
  `list-unsubscribe`, `list-help`, or `list-archive`

- Auto-Submitted: header exists with any value except `no`

- Precedence: header exists with value `junk`, `bulk`, or `list`

- The envelope sender is considered a system address, which either:

  - begins with `MAILER-DAEMON` (case-insensitive),

  -  begins with `LISTSERV` (case-insensitive),

  -  begins with `majordomo` (case-insensitive),

  -  contains the string `-request` anywhere within it (case-sensitive), or

  -  begins with `owner-` (case-sensitive)

- The envelope recipient and alternative addresses specified with the
  vacation command's `:addresses` tag are not found in the message's `To:`,
  `Cc:`, `Bcc:`, `Resent-To:`, `Resent-Cc:`, or `Resent-Bcc:` fields.


### Example

```[dovecot.conf]
plugin {
  # Use vacation-seconds
  sieve_extensions = +vacation-seconds

  # One hour at minimum
  sieve_vacation_min_period = 1h

  # Ten days default
  sieve_vacation_default_period = 10d

  # Thirty days at maximum
  sieve_vacation_max_period = 30d
}
```
