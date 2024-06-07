---
layout: doc
title: IMAP
dovecotlinks:
  imap_server: IMAP server
---

# IMAP Configuration

Dovecot was optimized since the beginning to work as an efficient IMAP server.

## Namespaces

See [[link,namespaces]].

## IMAP Extensions

Dovecot supports many [IMAP extensions](https://imapwiki.org/Specs).

### COMPRESS

Dovecot supports the IMAP COMPRESS ([[rfc,4978]]) extension.

It allows an IMAP client to dynamically enable stream compression for an
IMAP session.

The extension is enabled by default and configured with the default
compression level for the available mechanism.

### SEARCH=FUZZY

IMAP provides SEARCH as part of the core protocol, so it is useful to activate
a Full Text Search indexing backend to handle these searches.

See [[plugin,fts]].

### METADATA

Dovecot supports the IMAP METADATA extension ([[rfc,5464]]), which allows
per-mailbox, per-user data to be stored and accessed via IMAP commands.

See [[setting,imap_metadata]].

### SPECIAL-USE

TODO

### PREVIEW

Dovecot supports the PREVIEW extension ([[rfc,8970]]), retrieved
via the IMAP FETCH command.

The extension is enabled by default. Preview text is generated during
message delivery and is stored in the Dovecot index files.

### NOTIFY

Set [[setting,mailbox_list_index,yes]].

### URLAUTH:

Set [[setting,imap_urlauth_host]] and [[setting,mail_attribute_dict]].

## IMAP Hibernation

::: warning
This is not supported on kqueue based systems currently, such as FreeBSD.
:::

Dovecot supports moving connections that have issued IDLE to a special holding
process, called imap-hibernate. This process is responsible for holding the
idle processes until they need to be thawed.

### Configuration

[[setting,imap_hibernate_timeout]] specifies the delay before moving users to
`imap-hibernate` process. This requires inter-process communication between
`imap` and `imap-hibernate` process.

```[dovecot.conf]
imap_hibernate_timeout = 5s

service imap {
  # Note that this change will allow any process running as
  # $default_internal_user (dovecot) to access mails as any other user.
  # This may be insecure in some installations, which is why this isn't
  # done by default.
  unix_listener imap-master {
    user = $default_internal_user
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

### How it Works

When client issues IDLE, the connection socket is moved to the hibernation
process. This process is responsible for keeping all connections that are
idling, until they issue some command that requires them to be thawed into a
imap process. This way, memory and CPU resources are saved, since there is only
one hibernation process.
