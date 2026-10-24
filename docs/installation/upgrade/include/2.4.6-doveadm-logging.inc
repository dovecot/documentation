#### Doveadm Logging Changes

`doveadm-server` no longer writes the Apache-style access log line for each
[[link,doveadm_http_api]] request. The same information is now available from
events: [[event,doveadm_command_finished]] for the command, the user and the
exit code, and [[event,http_server_request_finished]] for the HTTP status and
the transferred byte counts. Both are debug level events, so use
[[link,event_export]] to record them. Note that the format differs from the
old log line.

[[event,doveadm_command_finished]] is emitted for command line and
doveadm server protocol invocations as well, not just for the HTTP API.

Some [[link,doveadm_http_api]] log lines also changed level:

| Log line | Old Level | New Level |
| -------- | --------- | --------- |
| `Executing command`, `Executing command as '<user>'` | info | debug |
| `Error writing output in command <cmd>: <error>` | info | error |
| `read(<stream>) failed: <error>` | info | error |
| `error writing output: <error>` | info | error |
