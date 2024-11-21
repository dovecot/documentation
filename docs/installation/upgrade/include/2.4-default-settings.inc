| [[setting,imapc_features]] | Features "delay-login", "search", "fetch-headers", "fetch-bodystructure", "fetch-size" by default. Enable "acl" and "modseq" by default, if the remote server supports it. |
| [[setting,mail_cache_max_headers_count]] | unlimited | 100 | New feature, explicitly set to `0` for the old behavior. |
| [[setting,mail_cache_max_header_name_length]] | unlimited | 100 | New feature, explicitly set to `0` for the old behavior. |
| [[setting,mail_log_prefix]] | `%s(%u)<%{pid}><%{session}>:` | `%{protocol}(%{user})<%{process:pid}><%{session}>:` | New variable expansion syntax. |
| [[setting,mailbox_list_drop_noselect]] | `no` | `yes` | `\NoSelect` folders are now dropped by default. |
| `service/anvil/chroot` | empty | \<no value\> | Anvil is no longer chrooted. |
| `service/anvil/user` | $default_internal_user | \<no value\> | Anvil runs as root. |
| `service/auth-worker/process_limit` | 1 | 30 | |
