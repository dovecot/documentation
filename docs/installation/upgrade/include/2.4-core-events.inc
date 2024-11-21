| `auth_client_cache_flush_started` | Event was removed. |
| `auth_client_cache_flush_finished` | Event was removed. |
| [[event,imap_id_received]] | Event was added. |
| [[event,login_aborted]] | Event was added. |
| [[event,mail_metadata_accessed]] | Event was added. |
| [[event,pop3_command_finished]] | Event was added. |

#### Event Fields

| Event | Field | Change |
| ----- | ----- | ------ |
| [[event,dns_worker_request_finished]] | `cached` | Field was added. |
| Mail user events | `service` | Field was added. |
| [[event,proxy_session_finished]] | `error_code` | Field was added. |
| [[event,proxy_session_finished]] | `idle_usecs` | Field was changed from `idle_secs`. |
| [[event,smtp_server_transaction_rcpt_finished]] | `dest_host` | Field was added. |
| [[event,smtp_server_transaction_rcpt_finished]] | `dest_ip` | Field was added. |
| [[event,sql_query_finished]] | `consistency` | Field was added. |
| [[event,sql_query_finished]] | `error_consistency` | Field was added. |
| Various | `net_bytes_in` | Field was changed from `bytes_in`. |
| Various | `net_bytes_out` | Field was changed from `bytes_out`. |
| Various | `transport` | `transport=trusted` was changed to `transport=secured`. See also [[link,secured_connections]]. |
