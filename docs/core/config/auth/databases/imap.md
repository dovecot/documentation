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

[[changed,settings_imapc_credentials_renamed]]: The `imapc_user`,
`imapc_master_user` and `imapc_password` settings are now the
[[link,client_auth]] settings inside the [[setting,imapc]] filter. The passdb
sets [[setting,client_auth_password]] automatically to the password given by
the user, and [[setting,client_auth_authzid]] defaults to the username, so
normally none of them need to be set.

<SettingsComponent tag="imapc-auth" />

## Example

Authenticates users against remote IMAP server in IP address 192.168.1.123:

```doveconf[dovecot.conf]
passdb imap {
  imapc_host = 192.168.1.123
  imapc_port = 143
  imapc_rawlog_dir = /tmp/imapc_rawlog/
  imapc_ssl = starttls

  ssl_client_require_valid_cert = no
}
```

To log in with a different username than what the user gave, e.g. without
the domain:

```doveconf[dovecot.conf]
passdb imap {
  imapc_host = 192.168.1.123
  imapc {
    client_auth_authzid = %{user | username}
  }
}
```
