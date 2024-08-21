---
layout: doc
title: Postfix
---

# Postfix and Dovecot LMTP

## Basic Configuration

The first step is to enable LMTP in `dovecot.conf`:

```
protocols = imap lmtp
```

## Socket Configuration

The LMTP service can be bound to both INET or Unix sockets.

In this example, a Unix socket is placed inside the Postfix spool with
appropriate permissions set:

```
service lmtp {
  unix_listener /var/spool/postfix/private/dovecot-lmtp {
    group = postfix
    mode = 0600
    user = postfix
  }
}
```

Note that the socket needs to be placed there because Postfix access is
limited to this directory.

## Plugin Support

Plugin support can be enabled at protocol level for [[plugin,quota]] and
[[plugin,sieve]].

```[dovecot.conf]
protocol lmtp {
  # REQUIRED
  postmaster_address = postmaster@domainname
  mail_plugins {
    quota = yes
    sieve = yes
  }
}
```

## Postfix `main.cf` Configuration

The final step is to tell Postfix to use this socket for final delivery,
in this case of a virtual user scenario:

```
virtual_transport = lmtp:unix:private/dovecot-lmtp
```

For a non virtual user setup:

```
mailbox_transport = lmtp:unix:private/dovecot-lmtp
```

## Dynamic Address Verification with LMTP

You can use LMTP and the Postfix setting "reject_unverified_recipient" for
dynamic address verification. It's useful as Postfix doesn't need to query
an external datasource (MySQL, LDAP...). Postfix maintain a local database
with existing/non-existing addresses (you can configure how long
positive/negative results should be cached).

See: [Postfix reject_unverified_recipient](https://www.postfix.org/ADDRESS_VERIFICATION_README.html).

To use LMTP and dynamic address verification, you must first get Dovecot
working. Then you can configure Postfix to use LMTP and set
"reject_unverified_recipient" in the `smtpd_recipient_restrictions`.

On every incoming email, Postfix will probe if the recipient address
exists. You will see entries in your logfile:

```
Recipient address rejected: undeliverable address: host tux.example.com[private/dovecot-lmtp] said: 550 5.1.1 < tzknvtr@example.com > User doesn't exist: tzknvtr@example.com (in reply to RCPT TO command); from=< cnrilrgfclra@spammer.org > to=< tzknvtr@example.com >
```

If the recipient address exists (status=deliverable) Postfix accepts the
mail.

::: info
You cannot use "reject_unverified_recipient" with "pipe", so this doesn't
work with the Dovecot LDA "deliver".
:::
