---
layout: doct
title: Exim and Dovecot SASL
dovecotlinks:
  howto_exim_and_dovecot_sasl: Exim and Dovecot SASL
---

# Exim and Dovecot SASL

Exim v4.64+ users can use Dovecot [[link,sasl]] instead of Cyrus SASL for
authenticating SMTP clients.

## Configuration Example

::: code-group
```[dovecot.conf]
auth_mechanisms = plain login

service auth {
  ...
  # SASL
  unix_listener auth-client {
    mode = 0660
    user = mail
  }
  ...
}
```

```[exim.conf]
dovecot_login:
  driver = dovecot
  public_name = LOGIN
  server_socket = /var/run/dovecot/auth-client
  # setting server_set_id might break several headers in mails sent by
  # authenticated smtp. So be careful.
  server_set_id = $auth1

dovecot_plain:
  driver = dovecot
  public_name = PLAIN
  server_socket = /var/run/dovecot/auth-client
  server_set_id = $auth1
```
:::

If you are having problems with this not working, ensure that you are using
version 4.72 or greater of exim. Previous versions of exim have trouble with
the version of the protocol used in Dovecot v2.x.
