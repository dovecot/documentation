#### Settings

| Setting | Notes |
| ------- | ----- |
| `auth_stats` | |
| `dict_db_config` | Berkeley DB is not supported anymore. |
| `imap_id_log` | Replaced by the [[event,imap_id_received]] event. |
| `login_access_sockets` | Use [[link,auth_lua]] instead. Dovecot will fail to start if this setting is present in configuration. |
| `quota_set` | |
| `sieve_dir` | See [[link,sieve_storage]]. |
| `sieve_global_dir` | See [[link,sieve_storage]]. |
| `sieve_global_path` | See [[link,sieve_storage]]. |
| `sieve_editheader_protected` | Replaced by [[setting,sieve_editheader_header_forbid_add]] and [[setting,sieve_editheader_header_forbid_delete]]. |
| `sieve_vacation_max_subject_codepoints` | |
