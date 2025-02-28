You can enable high-performance mode with:

```[dovecot.conf]
service imap-login {
  restart_request_count = unlimited
  process_min_avail = 4 # number of CPU cores
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

* `process_min_avail` should be set to be at least the number of CPU cores in
  the system, so that all of them will be used.
* Otherwise new processes are created only once an existing one's connection
  count reaches [[setting,service_client_limit]].
* Default `client_limit * process_limit = 1000*100 = 100k` connections.
* `vsz_limit` should be increased to avoid out of memory errors, especially
  if you're using SSL/TLS.
