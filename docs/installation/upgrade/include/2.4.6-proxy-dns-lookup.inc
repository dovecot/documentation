#### Proxy Host Name Resolution

The auth process no longer resolves the proxy `host` field to `hostip`. If
`host` is a host name and `hostip` isn't returned, the process doing the
proxying resolves it:

 * Login processes do an asynchronous DNS lookup via the `login/dns-client`
   socket of the `dns-client` service. Don't remove this listener. Each login
   process caches the results for 10 seconds.
 * LMTP resolves the host via the `dns-client` service.
 * doveadm resolves the host itself.

If the host resolves to multiple IPs, login processes now try the next IP
when reconnecting (see [[setting,login_proxy_max_reconnects]]).

DNS lookup failures in login processes are now visible in the
[[event,proxy_session_finished]] event with the new error codes:

| Error Code | Notes |
| ---------- | ----- |
| `proxy_dest_host_not_found` | DNS lookup of the destination host returned "host not found". |
| `proxy_dest_host_temp_failed` | DNS lookup of the destination host failed temporarily. |

If the destination host needs to be resolved, the
[[event,proxy_session_started]] event is sent only after the DNS lookup
succeeds.

#### Removed Proxy Features

| Feature | Notes |
| ------- | ----- |
| `proxy_maybe` passdb field | Returning this field now fails the authentication with an internal error. Return the `proxy` field only for the users that need to be proxied instead, e.g. with a different passdb query or passdb conditions. A proxy connecting to itself fails with `Proxying loops to itself` error. |
| `auth_proxy_self` setting | The setting was used only with `proxy_maybe`. Remove it from the configuration, since Dovecot fails to start if it is present. |
