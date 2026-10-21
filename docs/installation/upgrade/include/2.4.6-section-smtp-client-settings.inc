#### SMTP Client Settings

The outgoing SMTP and LMTP connections (submission relay, mail submission from
LDA/LMTP/Sieve, LMTP proxying) are now configured with the generic
`smtp_client_*` and `lmtp_client_*` settings inside filters, together with the
[[link,client_auth,client authentication]] and `ssl_client_*` settings. The
old names are renamed automatically as long as
[[setting,dovecot_config_version]] is older than this release, but `doveconf`
writes the new names:

| Old setting | New setting |
| ----------- | ----------- |
| `submission_relay_host`, `submission_relay_port`, `submission_relay_ssl`, `submission_relay_rawlog_dir`, `submission_relay_connect_timeout`, `submission_relay_command_timeout` | `submission_relay { smtp_client_host, smtp_client_port, smtp_client_ssl, smtp_client_rawlog_dir, smtp_client_connect_timeout, smtp_client_command_timeout }` |
| `submission_relay_trusted` | `submission_relay { smtp_client_peer_trusted }` |
| `submission_relay_user`, `submission_relay_master_user`, `submission_relay_password` | `submission_relay { client_auth_authzid, client_auth_authid, client_auth_password }` |
| `submission_relay_ssl_verify` | `submission_relay { ssl_client_require_valid_cert }` |
| `submission_relay_max_idle_time` | Deprecated. It never had any effect. |
| `submission_host` | Deprecated. Use `mail_submit { smtp_client_host, smtp_client_port }`. With an older config version the `host:port` value is still split into those two settings. |
| `submission_ssl` | `mail_submit { smtp_client_ssl }` |
| `submission_timeout` | `mail_submit_timeout` |
| `sendmail_path` | Deprecated. The sendmail binary is now an `execute sendmail { }` block inside `mail_submit { }`. With an older config version the old value is still translated into that block. |
| `lmtp_proxy_rawlog_dir` | `lmtp_client_rawlog_dir` |

 * The submission relay and the `mail_submit` SMTP connection can now use any
   [[link,client_auth,client authentication]] mechanism, not only PLAIN and
   LOGIN.
 * LMTP log messages about a recipient now have a `local: ` or `proxy: `
   prefix after the `rcpt <address>: ` part, and the messages of the proxy's
   backend connections have a `proxy: ` prefix before `lmtp-client: `. Log
   parsers that match the old format need updating.
