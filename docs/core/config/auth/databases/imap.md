---
layout: doc
title: IMAP
dovecotlinks:
  auth_imap: remote IMAP authentication database
---

# Authentication via Remote IMAP Server (`imap`)

## Settings

[[removed,auth_imap_arg_configuration_removed]]: The arg-based driver settings
have been removed in favor of using the standard `imapc_*` settings.

[[removed,settings_ssl_imapc_removed]]: The `ssl_ca_file`, `ssl_ca_dir` and
`allow_invalid_cert` settings have been removed. The standard `ssl_*` settings
can be used instead (also inside `passdb { ... }` if wanted).

<SettingsComponent tag="imapc-auth" />

## Example

Authenticates users against remote IMAP server in IP address 192.168.1.123:

```[dovecot.conf]
passdb imap {
  imapc_host = 192.168.1.123
  imapc_port = 143
  imapc_user = %{owner_user}
  imapc_rawlog_dir = /tmp/imapc_rawlog/
  imapc_ssl = starttls

  ssl_client_require_valid_cert = no
}
```
