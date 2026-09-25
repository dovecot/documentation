#### Unauthenticated Client Limit

A new [[setting,login_unauthenticated_client_limit]] setting limits the number
of unauthenticated client connections in each login process, separately from
[[setting,service_client_limit]]. When the limit is reached, the oldest
unauthenticated connection is disconnected. This is mainly useful with
[[link,login_processes_high_performance]] mode. The default is unlimited, so
the behavior doesn't change unless the setting is configured.

| Setting | Notes |
| ------- | ----- |
| [[setting,login_unauthenticated_client_limit]] | Setting was added. |
