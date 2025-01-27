#### Converted Settings

| Setting | Notes |
| ------- | ----- |
| `acl` | Replaced by [[setting,acl_driver]]. |
| `acl_anyone` | Renamed to [[setting,imap_acl_allow_anyone]]. |
| `auth_debug` | Use [[setting,log_debug]] filter instead. Example: `log_debug=category=auth`. |
| `auth_default_realm` | Replaced by [[setting,auth_default_domain]]. |
| `auth_policy_server_timeout_msecs` | Replaced by [[setting,http_client_request_timeout]] inside [[setting,auth_policy]] named filter. |
| `auth_worker_max_count` | Use [[link,service_configuration,service-specific process limit]]. |
| `default_idle_kill` | Renamed to [[setting,default_idle_kill_interval]]. |
| `disable_plaintext_auth` | Replaced by [[setting,auth_allow_cleartext]]. |
| `doveadm_http_rawlog_dir` | Replaced by [[setting,http_client_rawlog_dir]] inside [[setting,doveadm_server]] named filter. |
| `event_exporter_format_args` | Replaced by [[setting,event_exporter_time_format]]. |
| `event_exporter_transport` | Renamed to [[setting,event_exporter_driver]]. |
| `event_exporter_transport_args` | Split off to driver-specific settings, see [[link,event_export]]. |
| `event_exporter_transport_timeout` | Replaced by [[setting,http_client_request_timeout]] and [[setting,event_exporter_unix_connect_timeout]]. |
| `push_notification_backend` | Use [[setting,push_notification_driver]] instead. |
| `mail_crypt_require_encrypted_user_key` | Replaced by [[setting,crypt_user_key_require_encrypted]], [[setting,crypt_user_key_password]] and [[setting,crypt_user_key_encryption_key]]. |
| `verbose_ssl` | Use [[setting,log_debug,category=ssl]] instead. |
| `mail_attachment_dir` | Renamed to [[setting,mail_ext_attachment_path]]. |
| `mail_attachment_fs` | Use [[setting,fs]] inside [[setting,mail_ext_attachment]] named filter. |
| `mail_attachment_hash` | Renamed to [[setting,mail_ext_attachment_hash]]. |
| `mail_attachment_min_size` | Renamed to [[setting,mail_ext_attachment_min_size]]. |
| `mail_attribute_dict` | Use [[setting,dict]] inside [[setting,mail_attribute]] named filter. |
| `mail_location` setting & `mail` userdb field | Split into multiple [[link,mail_location,mail_*]] settings. |
| `namespace { location }` setting | Use [[link,mail_location,mail_*]] settings inside [[setting,namespace]] named list filter. |
| `notify_status_dict` | Use [[setting,dict]] inside [[setting,notify_status]] named filter. |
| `notify_status_mailbox` | Use [[setting,mailbox_notify_status]] inside [[setting,mailbox]] named list filters. |
| `fts` | Replaced by [[setting,fts]] named filter. |
| `fts_autoindex_exclude` | Replaced by boolean property [[setting,fts_autoindex]], nested inside [[setting,mailbox]] blocks. Note that the values are inverted as compared to those in the old `fts_autoindex_exclude`. |
| `fts_decoder` | Replaced by [[setting,fts_decoder_driver]] and [[setting,fts_decoder_script_socket_path]]. |
| `fts_enforced` | Replaced by [[setting,fts_search_add_missing]] and [[setting,fts_search_read_fallback]] |
| `fts_index_timeout` | Renamed to [[setting,fts_search_timeout]]. The default value is set to `30 secs`. |
| `fts_solr` | Replaced by [[setting,fts_solr_url]], [[setting,fts_solr_batch_size]], [[setting,fts_solr_soft_commit]], and [[setting,http_client_rawlog_dir]] settings. |
| `fts_tika` | Replaced by [[setting,fts_decoder_driver]] and [[setting,fts_decoder_tika_url]]. |
| `fts_language_config` | Renamed to [[setting,textcat_config_path]]. |
| `fts_languages` | Converted into [[setting,language]] blocks. |
| `fts_filters` | Split into [[setting,language_filters]], [[setting,language_filter_normalizer_icu_id]], [[setting,language_filter_stopwords_dir]]. |
| `fts_tokenizers` | Split into [[setting,language_tokenizers]], [[setting,language_tokenizer_address_token_maxlen]], [[setting,language_tokenizer_generic_algorithm]], [[setting,language_tokenizer_generic_token_maxlen]], [[setting,language_tokenizer_generic_wb5a]], [[setting,language_tokenizer_kuromoji_icu_id]], [[setting,language_tokenizer_kuromoji_split_compounds]], [[setting,language_tokenizer_kuromoji_token_maxlen]]. |
| `lazy_expunge` | Renamed to [[setting,lazy_expunge_mailbox]]. |
| `service { idle_kill }` | Renamed to [[setting,service_idle_kill_interval]]. |
| `service { service_count }` | Renamed to [[setting,service_restart_request_count]]. The default value is set to `unlimited`. Value `0` is now a configuration error. |
| oauth2 `username_format` | Renamed to [[setting,oauth2_username_validation_format]]. |
| oauth2 `pass_attrs` | Replaced by [[setting,oauth2_fields]]. |
| oauth2 `local_validation_key_dict` | Replaced by [[setting,dict]] inside [[setting,oauth2_local_validation]] named filter. |
| oauth2 `timeout_msecs`, `max_idle_time_msecs`, `max_parallel_connections`, `max_pipelined_requests`, `rawlog_dir` | Replaced by `http_client_*` settings inside [[setting,oauth2]] named filter. |
| oauth2 `tls_*` | Replaced by `ssl_client_*` settings inside [[setting,oauth2]] named filter. |
| oauth2 `debug` | Use [[setting,log_debug]] filter instead. Example: `log_debug=category=oauth2`. |
| oauth `use_grant_password` | Replaced by [[link,auth_oauth2,passdb oauth2]] `
| passdb/userdb `:protected` | Renamed to `:default` |
| `passdb { default_fields`, `override_fields` } | Replaced by [[setting,passdb_fields]] |
| `userdb { default_fields`, `override_fields` } | Replaced by [[setting,userdb_fields]] |
| `plugin` | All plugin settings are now global settings. |
| `quota`, `quota_rule` | Split into separate [[plugin,quota,quota settings]]. |
| `quota_grace` | Renamed to [[setting,quota_storage_grace]]. |
| `quota_over_flag` | Renamed to [[setting,quota_over_status_current]]. |
| `quota_over_flag_lazy_check` | Renamed to [[setting,quota_over_status_lazy_check]]. |
| `quota_over_flag_value` | Renamed to [[setting,quota_over_status_mask]]. |
| `quota_over_script` | Replaced by [[setting,quota_over_status]] named filter with [[setting,execute]]. |
| `quota_max_mail_size` | Renamed to [[setting,quota_mail_size]]. The default value is set to `unlimited`. |
| `ssl_alt_cert` | Renamed to [[setting,ssl_server_alt_cert_file]]. |
| `ssl_alt_key` | Renamed to [[setting,ssl_server_alt_key_file]]. |
| `ssl_ca` | Split to [[setting,ssl_server_ca_file]] and [[setting,ssl_client_ca_file]]. |
| `ssl_ca_dir` | Renamed to [[setting,ssl_client_ca_dir]]. |
| `ssl_ca_file` | Renamed to [[setting,ssl_client_ca_file]]. |
| `ssl_cert` | Renamed to [[setting,ssl_server_cert_file]]. |
| `ssl_cert_username_field` | Renamed to [[setting,ssl_server_cert_username_field]]. |
| `ssl_client_cert` | Renamed to [[setting,ssl_client_cert_file]]. |
| `ssl_client_key` | Renamed to [[setting,ssl_client_key_file]]. |
| `ssl_dh` | Renamed to [[setting,ssl_server_dh_file]]. |
| `ssl_key` | Renamed to [[setting,ssl_server_key_file]]. |
| `ssl_key_password` | Renamed to [[setting,ssl_server_key_password]]. |
| `ssl_prefer_server_ciphers` | Replaced by [[setting,ssl_server_prefer_ciphers]]. |
| `ssl_require_crl` | Renamed to [[setting,ssl_server_require_crl]]. |
| `ssl_verify_client_cert` | Renamed to [[setting,ssl_server_request_client_cert]]. |
| `stats_http_rawlog_dir` | Replaced by [[setting,http_client_rawlog_dir]] inside [[setting,stats_server]] named filter. |
