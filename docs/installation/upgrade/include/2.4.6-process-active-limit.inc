#### Process Active Limit

The retired processes, i.e. processes that reached
[[setting,service_restart_request_count]] with
[[setting,service_client_limit]] > 1, are again counted towards
[[setting,service_process_limit]]. This makes it a strict limit for the total
number of processes. Once it is reached, new connections wait until a retired
process dies. With [[setting,service_reuse_port,yes]] the oldest retired
process is killed instead to make room for the new process.

A new [[setting,service_process_active_limit]] setting limits the number of
active (non-retired) processes. When it is lower than
[[setting,service_process_limit]], the oldest retired process is killed when
[[setting,service_process_limit]] is reached and a new process is needed.

To keep the previous behavior, where the number of retired processes is not
limited, set [[setting,service_process_limit]] to `unlimited` and
[[setting,service_process_active_limit]] to the previous
[[setting,service_process_limit]] value.

::: warning
With [[setting,service_reuse_port,yes]], [[setting,service_process_min_avail]]
must be the same as the active process limit. With the default
[[setting,service_process_active_limit]] that is
[[setting,service_process_limit]], so the process limit is always full. If
[[setting,service_restart_request_count]] is limited, every process retirement
then kills the oldest retired process, disconnecting its remaining clients.
Set [[setting,service_process_active_limit]] to the
[[setting,service_process_min_avail]] value and
[[setting,service_process_limit]] higher than it, so the retired processes
have room to finish their connections.
:::

| Setting | Notes |
| ------- | ----- |
| [[setting,service_process_limit]] | Retired processes are counted towards the limit again. |
| [[setting,service_process_active_limit]] | Setting was added. |
| [[doveadm,service status]] `process_active_limit` and `process_retired` columns | Fields were added. |
