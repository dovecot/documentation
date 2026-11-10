#### Per-PID auth-master Socket

Each auth process now listens also on its own `auth-master-pid/<pid>` socket.
The post-login processes (e.g. imap and pop3) finish the login via this socket
when the login was authenticated by a different auth process than the one
behind [[setting,auth_master_socket_path]]. This happens when a login is in
progress while the configuration is reloaded: the unix sockets reach only the
new auth process after the reload, which doesn't know about the logins that
the old auth process authenticated. Previously these logins failed with
"Master requested auth for nonexistent client".

 * The new `service auth { unix_listener auth-master-pid/%{pid} { .. } }`
   listener copies its `user`, `group` and `mode` from the `auth-master`
   listener by default, so configurations that changed the `auth-master`
   permissions for post-login processes that don't run as root keep working.
 * The per-PID socket path is [[setting,auth_master_socket_path]] followed by
   `-pid/<pid>`. A configuration that points
   [[setting,auth_master_socket_path]] to another auth service listener needs
   a matching per-PID listener in the same auth service, e.g.
   `unix_listener my-auth-master-pid/%{pid} { type = master }`. Without it the
   logins that are in progress during a reload can still fail the same way as
   before.
 * This doesn't help when [[setting,auth_master_socket_path]] points to a
   process that proxies the auth connections instead of to the auth process
   itself. The proxy's old process exits at reload, and the old auth process
   then forgets the logins that were authenticated through it, so these
   logins can still fail during a reload.
