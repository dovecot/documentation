
### Exim Authentication

Dovecot authentication protocol changed slightly, which is now causing Exim's
Dovecot authentication to hang. Use the `auth-legacy` listener type to work
around it until Exim supports the updated protocol:

::: code-group
```[dovecot.conf]
service auth {
  unix_listener auth-exim {
    type = auth-legacy
  }
}
```

```[exim.conf]
dovecot_plain:
  server_socket = /var/run/dovecot/auth-exim
  ...
:::
