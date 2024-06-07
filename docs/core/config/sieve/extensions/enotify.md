---
layout: doc
title: Notifications
dovecotlinks:
  sieve_enotify: Sieve notifications extensions
---

# Sieve: Extension for Notifications

The Sieve enotify extension ([[rfc,5435]]) adds the `notify` action to
the Sieve language.

## Configuration

### Settings

<SettingsComponent tag="sieve-enotify" level="3" />

### Examples

#### Send Notifications with Different Importance Levels

```
require ["enotify", "fileinto", "variables"];

if header :contains "from" "boss@example.org" {
    notify :importance "1"
        :message "This is probably very important"
        "mailto:alm@example.com";
    # Don't send any further notifications
    stop;
}

if header :contains "to" "sievemailinglist@example.org" {
    # :matches is used to get the value of the Subject header
    if header :matches "Subject" "*" {
        set "subject" "${1}";
    }

    # :matches is used to get the value of the From header
    if header :matches "From" "*" {
        set "from" "${1}";
    }

    notify :importance "3"
        :message "[SIEVE] ${from}: ${subject}"
        "mailto:alm@example.com";
    fileinto "INBOX.sieve";
}
```

#### Send Notification if we Receive Mail From Domain

```
require ["enotify", "fileinto", "variables", "envelope"];

if header :matches "from" "*@*.example.org" {
    # :matches is used to get the MAIL FROM address
    if envelope :all :matches "from" "*" {
        set "env_from" " [really: ${1}]";
    }

    # :matches is used to get the value of the Subject header
    if header :matches "Subject" "*" {
        set "subject" "${1}";
    }

    # :matches is used to get the address from the From header
    if address :matches :all "from" "*" {
        set "from_addr" "${1}";
    }

    notify :message "${from_addr}${env_from}: ${subject}"
        "mailto:alm@example.com";
}
```
