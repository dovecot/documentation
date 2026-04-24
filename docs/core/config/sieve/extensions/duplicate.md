---
layout: doc
title: Duplicate
dovecotlinks:
  sieve_duplicate: Sieve duplicate extension
---

# Sieve: Duplicate Extension

The duplicate extension ([[rfc,7352]]) adds a new test command
called `duplicate` to the Sieve language. This test adds the ability
to detect duplications.

The main application for this new test is handling duplicate deliveries
commonly caused by mailing list subscriptions or redirected mail addresses.

The detection is normally performed by matching the message ID to an
internal list of message IDs from previously delivered messages.
For more complex applications, the `duplicate` test can also use the
content of a specific header field or other parts of the message.

::: warning [[changed,sieve_vnd_duplicate]]
`vnd.dovecot.duplicate` extension has been removed in favor of this.
:::

## Configuration

The duplicate extension is available by default.

### Settings

<SettingsComponent tag="sieve-duplicate" level="3" />

### Example

```doveconf[dovecot.conf]
sieve_script personal {
  path = ~/.dovecot.sieve
}

sieve_duplicate_default_period = 1h
sieve_duplicate_max_period = 1d
```

## Sieve Example

```sieve
require ["duplicate"];

if duplicate {
  discard;
  stop;
}
```

This example discards duplicate messages based on the default message ID tracking.

## Advanced Sieve Example

```sieve
require ["duplicate", "fileinto"];

if duplicate :header "Message-ID" {
  fileinto "Duplicates";
  stop;
}

fileinto "Inbox";
```

This example uses the `Message-ID` header explicitly and files duplicate
messages into a dedicated mailbox instead of discarding them.
