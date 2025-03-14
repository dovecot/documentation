1. Forward the user-given password (or OAUTH token) to the remote server. This
   is done by returning `pass=%{password}` and `proxy_mech=%{mechanism}` extra
   fields.

    * This doesn't work if any non-cleartext, non-token-based
      [[link,authentication_mechanisms, authentication mechanisms]] are used,
      because they prevent such password forwarding by design.
    * `proxy_mech` is needed only if both OAUTH and cleartext mechanisms
      are enabled.

1. Let Dovecot proxy perform the authentication and login to remote server
   using the proxy's [[link,auth_master_users]]. This allows client
   to use also non-cleartext authentication.
