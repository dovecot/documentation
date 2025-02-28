You can enable high-performance mode with:

```[dovecot.conf]
service imap-login {
  restart_request_count = unlimited
  process_min_avail = %{system:cpu_count}
  vsz_limit = 1G
}

service pop3-login {
  restart_request_count = unlimited
}
```

It works by using a number of long running login processes, each handling a
number of connections. This loses much of the security benefits of the login
process design, because in case of a security hole (in Dovecot or SSL library)
the attacker is now able to see other users logging in and steal their
passwords, read their mails, etc.

* [[setting,service_process_min_avail]] should be set to be at least the number
  of CPU cores in the system, so that all of them will be used. You can use
  `%{system:cpu_count}`, which expands to this automatically.
* Otherwise new processes are created only once an existing one's connection
  count reaches [[setting,service_client_limit]].
* Default [[setting,service_client_limit]] * [[setting,service_process_limit]] =
  1000 * 100 = 100k connections.
* [[setting,service_vsz_limit]] should be increased to avoid out of memory
  errors, especially if you're using SSL/TLS.
