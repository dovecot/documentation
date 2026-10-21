#### SMTP Client Settings

The outgoing SMTP and LMTP connections (submission relay, mail submission from
LDA/LMTP/Sieve, LMTP proxying) are now configured with the generic
`smtp_client_*` and `lmtp_client_*` settings inside filters, together with the
[[link,client_auth,client authentication]] and `ssl_client_*` settings. The
old names are renamed automatically as long as
[[setting,dovecot_config_version]] is older than `2.4.6`, but `doveconf` writes
the new names:

| Old setting | New setting |
| ----------- | ----------- |
| `submission_relay_host`, `submission_relay_port`, `submission_relay_ssl`, `submission_relay_rawlog_dir`, `submission_relay_connect_timeout`, `submission_relay_command_timeout` | `submission_relay { smtp_client_host, smtp_client_port, smtp_client_ssl, smtp_client_rawlog_dir, smtp_client_connect_timeout, smtp_client_command_timeout }` |
| `submission_relay_trusted` | `submission_relay { smtp_client_peer_trusted }` |
| `submission_relay_user`, `submission_relay_master_user`, `submission_relay_password` | `submission_relay { client_auth_authzid, client_auth_authid, client_auth_password }` |
| `submission_relay_ssl_verify` | `submission_relay { ssl_client_require_valid_cert }` |
| `submission_relay_max_idle_time` | Deprecated. It never had any effect. |
| `submission_host`, `submission_ssl` | `mail_submit { smtp_client_host, smtp_client_port, smtp_client_ssl }`. The `host:port` syntax is no longer supported, the port must be set separately. |
| `submission_timeout` | `mail_submit_timeout` |
| `sendmail_path` | Deprecated. The sendmail binary is now an `execute sendmail { }` block inside `mail_submit { }`. |
| `lmtp_proxy` | `lmtp_proxy_enabled`, since `lmtp_proxy { }` is now a filter. |
| `lmtp_proxy_rawlog_dir` | `lmtp_proxy { lmtp_client_rawlog_dir }` |

 * The submission relay and the `mail_submit` SMTP connection can now use any
   [[link,client_auth,client authentication]] mechanism, not only PLAIN and
   LOGIN.
 * A new `lmtp_local { }` filter scopes settings to local LMTP deliveries.
