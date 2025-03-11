---
layout: doc
title: IMAP
dovecotlinks:
  imap_server: IMAP server
  imap_hibernation:
    hash: imap-hibernation
    text: IMAP Hibernation
---

# IMAP Configuration

Dovecot was optimized since the beginning to work as an efficient IMAP server.

## Namespaces

See [[link,namespaces]].

## IMAP Extensions

<!-- @include: include/imap_extensions.inc -->

## IMAP Hibernation

::: warning
This is not supported on kqueue based systems currently, such as FreeBSD.
:::

<!-- @include: include/imap_hibernation_overview.inc -->

### Configuration

[[setting,imap_hibernate_timeout]] specifies the delay before moving users to
`imap-hibernate` process. This requires inter-process communication between
`imap` and `imap-hibernate` process.

```[dovecot.conf]
imap_hibernate_timeout = 5s

service imap {
  # Note that this change will allow any process running as
  # $SET:default_internal_user (dovecot) to access mails as any other user.
  # This may be insecure in some installations, which is why this isn't
  # done by default.
  unix_listener imap-master {
    user = $SET:default_internal_user
  }
}

# The following is the default already
service imap {
  extra_groups = $default_internal_group
}
service imap-hibernate {
  unix_listener imap-hibernate {
    mode = 0660
    group = $default_internal_group
  }
}
```
