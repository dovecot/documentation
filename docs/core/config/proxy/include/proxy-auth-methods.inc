1. Forward the user-given password (or OAUTH token) to the remote server. This
   is done by returning `pass=%{password}` and `proxy_mech=%{mechanism}` extra
   fields.

    * This doesn't work if any non-cleartext, non-token-based
      [[link,authentication_mechanisms, authentication mechanisms]] are used,
      because they prevent such password forwarding by design.
    * `proxy_mech` is needed only if both OAUTH and cleartext mechanisms
      are enabled.

1. Login to the remote server using a [[link,auth_master_passwords,master
   password]]. This is done by returning `pass=master_secret` extra field. This
   allows client to use also non-cleartext authentication.
