#### Proxy Host Name Resolution

The auth process no longer resolves the proxy `host` field to `hostip`. Login
processes, LMTP and doveadm now resolve it themselves, see [[link,proxy_host]].
Login processes use the `login/dns-client` listener of the `dns-client`
service, so don't remove it. DNS lookup failures are visible in the
[[event,proxy_session_finished]] event with the new
`proxy_dest_host_not_found` and `proxy_dest_host_temp_failed` error codes.

#### Removed Proxy Features

| Feature | Notes |
| ------- | ----- |
| `proxy_maybe` passdb field | Returning this field now fails the authentication with an internal error. Return the `proxy` field only for the users that need to be proxied instead, e.g. with a different passdb query or passdb conditions. |
| `auth_proxy_self` setting | The setting was used only with `proxy_maybe`. Dovecot fails to start if it is present. |
