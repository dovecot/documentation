You can enable high-security mode with:

```[dovecot.conf]
service imap-login {
  restart_request_count = 1
  #process_min_avail = 0
}

service pop3-login {
  restart_request_count = 1
}
```

It works by using a new imap-login or pop3-login process for each incoming
connection. Since the processes run in a highly restricted chroot, running
each connection in a separate process means that in case there is a
security hole in Dovecot's pre-authentication code or in the SSL library,
the attacker can't see other users' connections and can't really do
anything destructive. The only way out of it is to find and exploit a
kernel security hole.

Since one login process can handle only one connection, the service's
[[setting,service_process_limit]] setting limits the number of users that can
be logging in at the same time (defaults to [[setting,default_process_limit]]).

SSL/TLS proxying processes are also counted here, so if you're using
SSL/TLS you'll need to make sure this count is higher than the maximum
number of users that can be logged in simultaneously.

With TLS/SSL connections, the login process will not terminate, and remains
to perform proxying between imap backend process and the client.

* If the maximum login process count is reached, the oldest process in
  logging-in state (ie. non-proxying) is destroyed.
* To avoid startup latency for new client connections, set
  [[setting,service_process_min_avail]] to higher than zero. That many idling
  processes are always kept around waiting for new connections.
* [[setting,service_vsz_limit]] should be fine at its default value.
