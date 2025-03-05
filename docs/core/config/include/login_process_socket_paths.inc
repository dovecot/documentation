## Configuring Socket Paths for Login Processes

The authentication UNIX socket is "login" by default.

[[setting,login_socket_path]] allows to configure this path for all login
processes. For individual processes this can be overridden by supplying
a parameter to the appropriate service's executable.

This example sets up the global socket "general-login-socket" but
overrides this for the imap-login process individually (in `dovecot.conf`):

```[dovecot.conf]
login_socket_path = general-login-socket

service imap-login {
  executable = imap-login specific-login-socket
}
```
