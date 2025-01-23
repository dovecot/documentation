#### Converted Settings

| Setting | Notes |
| ------- | ----- |
| `auth_debug` | Use [[setting,log_debug]] filter instead. Example: `log_debug=category=auth`. |
| `auth_default_realm` | Replaced by [[setting,auth_default_domain]]. |
| `auth_worker_max_count` | Use [[link,service_configuration,service-specific process limit]]. |
| `disable_plaintext_auth` | Replaced by [[setting,auth_allow_cleartext]]. |
| `push_notification_backend` | Use [[setting,push_notification_driver]] instead. |
| `auth_policy_server_timeout_msecs` | See: [[link,auth_policy_configuration]]. |
| `mail_crypt_require_encrypted_user_key` | Replaced by [[setting,crypt_user_key_require_encrypted]], [[setting,crypt_user_key_password]] and [[setting,crypt_user_key_encryption_key]]. |
| `verbose_ssl` | Use [[setting,log_debug,category=ssl]] instead. |
| `mail_location` setting & `mail` userdb field | Split into multiple [[link,mail_location,mail_*]] settings. |
| `fts` | Replaced by [[setting,fts]] named filter. |
| `fts_autoindex_exclude` | Replaced by boolean property [[setting,fts_autoindex]], nested inside [[setting,mailbox]] blocks. Note that the values are inverted as compared to those in the old `fts_autoindex_exclude`. |
| `fts_decoder` | Replaced by [[setting,fts_decoder_driver]] and [[setting,fts_decoder_script_socket_path]]. |
| `fts_solr` | Replaced by [[setting,fts_solr_url]], [[setting,fts_solr_batch_size]], [[setting,fts_solr_soft_commit]], and [[setting,http_client_rawlog_dir]] settings. |
| `fts_tika` | Replaced by [[setting,fts_decoder_driver]] and [[setting,fts_decoder_tika_url]]. |
| `fts_language_config` | Renamed to [[setting,textcat_config_path]]. |
| `fts_languages` | Converted into [[setting,language]] blocks. |
| `fts_filters` | Split into [[setting,language_filters]], [[setting,language_filter_normalizer_icu_id]], [[setting,language_filter_stopwords_dir]]. |
| `fts_tokenizers` | Split into [[setting,language_tokenizers]], [[setting,language_tokenizer_address_token_maxlen]], [[setting,language_tokenizer_generic_algorithm]], [[setting,language_tokenizer_generic_token_maxlen]], [[setting,language_tokenizer_generic_wb5a]], [[setting,language_tokenizer_kuromoji_icu_id]], [[setting,language_tokenizer_kuromoji_split_compounds]], [[setting,language_tokenizer_kuromoji_token_maxlen]]. |
| `service_count` | Renamed to [[setting,service_restart_request_count]]. The default value is set to `unlimited`. Value `0` is now a configuration error. |
| passdb/userdb `:protected` | Renamed to `:default` |
| `passdb { default_fields`, `override_fields` } | Replaced by [[setting,passdb_fields]] |
| `userdb { default_fields`, `override_fields` } | Replaced by [[setting,userdb_fields]] |
| `quota`, `quota_rule` | Split into separate [[plugin,quota,quota settings]]. |
| `quota_grace` | Renamed to [[setting,quota_storage_grace]]. |
| `quota_over_flag` | Renamed to [[setting,quota_over_status_current]]. |
| `quota_over_flag_lazy_check` | Renamed to [[setting,quota_over_status_lazy_check]]. |
| `quota_over_flag_value` | Renamed to [[setting,quota_over_status_mask]]. |
| `quota_over_script` | Replaced by [[setting,quota_over_status]] named filter with [[setting,execute]]. |
| `quota_max_mail_size` | Renamed to [[setting,quota_mail_size]]. The default value is set to `unlimited`. |
| `fts_index_timeout` | Renamed to [[setting,fts_search_timeout]]. The default value is set to `30 secs`. |
| `namespace/alias_for` | Renamed to [[setting,namespace_alias_for]]. |
| `namespace/disabled` | Renamed to [[setting,namespace_disabled]]. |
| `namespace/hidden` | Renamed to [[setting,namespace_hidden]]. |
| `namespace/ignore_on_failure` | Renamed to [[setting,namespace_ignore_on_failure]]. |
| `namespace/inbox` | Renamed to [[setting,namespace_inbox]]. |
| `namespace/list` | Renamed to [[setting,namespace_list]]. |
| `namespace/order` | Renamed to [[setting,namespace_order]]. |
| `namespace/separator` | Renamed to [[setting,namespace_separator]]. |
| `namespace/subscriptions` | Renamed to [[setting,namespace_subscriptions]]. |
| `namespace/type` | Renamed to [[setting,namespace_type]]. |
| `namespace/mailbox/auto` | Renamed to [[setting,mailbox_auto]]. |
| `namespace/mailbox/autoexpunge` | Renamed to [[setting,mailbox_autoexpunge]]. |
| `namespace/mailbox/autoexpunge_max_mails` | Renamed to [[setting,mailbox_autoexpunge_max_mails]]. |
| `namespace/mailbox/special_use` | Renamed to [[setting,mailbox_special_use]]. |
