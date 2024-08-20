---
layout: doc
title: imapc
dovecotlinks:
  imapc: imapc
---

# Imapc Mailbox Format

The imapc storage accesses a remote IMAP server as if it were a regular
(local) Dovecot mailbox format. Dovecot can treat it as a dummy storage or
optionally a more capable storage.

## Settings

<SettingsComponent tag="imapc" />

## Configuration Example

Do a regular IMAP LOGIN, using STARTTLS, to imap.example.com:

```[dovecot.conf]
# In-memory index files:
mail_driver = imapc
mail_path =

# OR, Store index files locally:
#mail_path = ~/imapc

imapc_host = imap.example.com
imapc_password = secret
imapc_port = 143
imapc_ssl = starttls
imapc_user = user@example.com
```

## Quota

Using the `imapc` quota backend allows asking for the quota from remote
IMAP server. By default it uses `GETQUOTAROOT INBOX` to retrieve the quota.

There are two parameters that can be used to control how the quota is looked
up:

* `box = <mailbox>`: Use `GETQUOTAROOT <mailbox>`
* `root = <name>`: Use `GETQUOTA <name>`

Example:

```
plugin {
  quota = imapc:root=User Quota
}
```
