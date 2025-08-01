/* This file tracks update (added/changed/deprecated/removed) tags, so that
 * the core documentation can be used with multiple release branches.
 *
 * These tags can be used with the Dovecot markdown extensions (added,
 * changed, deprecated, removed), e.g., "[[added,tag_name]]".
 *
 * Keys are the tags used to identify the change, values are the version
 * number. */

export const updates = {

	/* Tags used in pages. */

	argon_2i_schemes: '2.4.0',
	argon2_password_scheme_added: '2.4.0',
	auth_mechanism_scram_sha_added: '2.4.0',
	cassandra_log_retries_added: '2.4.0',
	crypt_des_md5_schemes: '2.4.0',
	auth_client_common_secured: '2.4.0',
	auth_imap_arg_configuration_removed: '2.4.0',
	auth_lua_string_response_removed: '2.4.1',
	auth_oauth2_no_passdb_changed: '2.4.0',
	auth_policy_fail_type: '2.4.0',
	auth_policy_reject: '2.4.0',
	auth_protocol_handshake_changed: '2.4.0',
	auth_server_common_secured: '2.4.0',
	auth_sql_workers_changed: '2.4.1',
	config_design_changed: '2.4.0',
	dcrypt_same_cipher_algo_added: '2.4.0',
	dict_protocol_v4: '2.4.0',
	doveadm_ex_expired_code: '2.4.0',
	doveadm_mailbox_commands_user: '2.4.0',
	extra_fields_default: '2.4.0',
	extra_fields_empty: '2.4.0',
	event_export_drivers_file_unix_added: '2.4.0',
	event_set_forced_debug_added: '2.4.1',
	fs_crypt_require_encryption_keys: '2.4.0',
	fts_flatcurve: '2.4.0',
	imapc_features_no_acl: '2.4.0',
	imapc_features_no_delay_login: '2.4.0',
	imapc_features_no_fetch_bodystructure: '2.4.0',
	imapc_features_no_fetch_headers: '2.4.0',
	imapc_features_no_fetch_size: '2.4.0',
	imapc_features_no_modseq: '2.4.0',
	imapc_features_no_qresync: '2.4.0',
	imapc_features_no_search: '2.4.0',
	imapsieve_filters: '2.4.0',
	ja3_identifier: '2.4.0',
	ldap_multi_added: '2.4.0',
	lmtp_nologin_added: '2.4.0',
	lua_auth_init: '2.4.0',
	lua_dns_client: '2.4.0',
	lua_script_init: '2.4.0',
	mail_cache_fields_changed: '2.4.1',
	mail_crypt_eddsa: '2.4.0',
	mail_crypt_fs_maybe: '2.4.0',
	mail_location_keep_noselect: '2.4.0',
	mail_location_no_noselect: '2.4.0',
	metric_group_by_discrete_modifiers_added: '2.4.0',
	migration_imapc_features: '2.4.0',
	namespace_prefix_shared_variables_changed: '2.4.0',
	pbkdf2_hashing: '2.4.0',
	passwd_file_iteration: '2.4.0',
	process_title_imap_process: '2.4.0',
	process_title_initializing: '2.4.0',
	process_title_mail_processes: '2.4.0',
	quota_maildir_driver_removed: '2.4.0',
	service_auth_listener_type: '2.4.0',
	service_dict_expire: '2.4.0',
	service_listener_type: '2.4.0',
	settings_syntax_named_filters_added: '2.4.0',
	sieve_ext_imapflags: '2.4.0',
	sieve_ext_notify: '2.4.0',
	sieve_vnd_duplicate: '2.4.0',
	sqlite_filename: '2.4.0',
	ssl_sni_settings_reload_added: '2.4.0',
	weak_password_schemes: '2.4.0',
	variables_auth_variables_protocol: '2.4.0',
	variables_login_variables_protocol: '2.4.0',
	variables_owner_user_added: '2.4.0',
	var_expand: '2.4.0',

	/* Tags used in doveadm.js */

	doveadm_proxy_kick_args: '2.4.0',
	doveadm_proxy_list_args_added: '2.4.0',
	doveadm_proxy_list_response_changed: '2.4.0',
	doveadm_save_args_added: '2.4.0',

	/* Tags used in events.js */

	events_auth_client_common_protocol_added: '2.4.0',
	events_auth_client_common_service_removed: '2.4.0',
	events_auth_server_common_protocol_added: '2.4.0',
	events_auth_server_common_service_removed: '2.4.0',
	events_auth_server_passdb_passdb_changed: '2.4.0',
	events_auth_server_passdb_passdb_driver_added: '2.4.0',
	events_auth_server_passdb_passdb_name_removed: '2.4.0',
	events_auth_server_userdb_userdb_changed: '2.4.0',
	events_auth_server_userdb_userdb_driver_added: '2.4.0',
	events_auth_server_userdb_userdb_name_removed: '2.4.0',
	events_dns_worker_request_finished_cached_added: '2.4.0',
	events_imap_id_received_added: '2.4.0',
	events_login_aborted_added: '2.4.0',
	events_mail_storage_service_user_service_added: '2.4.0',
	events_mail_metadata_accessed_added: '2.4.0',
	events_net_in_bytes_changed: '2.4.0',
	events_net_out_bytes_changed: '2.4.0',
	events_pop3_command_finished_added: '2.4.0',
	events_proxy_session_finished_error_code_added: '2.4.0',
	events_proxy_session_finished_idle_usecs_changed: '2.4.0',
	events_smtp_server_transaction_rcpt_finished_dest_host_added: '2.4.0',
	events_smtp_server_transaction_rcpt_finished_dest_ip_added: '2.4.0',
	events_sql_query_finished_consistency_added: '2.4.0',
	events_pre_login_client_local_name_added: '2.4.0',
	events_pre_login_client_protocol_added: '2.4.0',
	events_pre_login_client_service_removed: '2.4.0',

	/* Tags used in settings.js. */

	settings_acl_global_settings_added: '2.4.0',
	settings_auth_allow_cleartext_added: '2.4.0',
	settings_auth_allow_weak_schemes_added: '2.4.0',
	settings_auth_debug_deprecated: '2.4.0',
	settings_auth_default_domain_added: '2.4.0',
	settings_auth_internal_failure_delay_added: '2.4.0',
	settings_auth_policy_added: '2.4.0',
	settings_auth_policy_request_attributes_changed: '2.4.0',
	settings_dovecot_config_version_added: '2.4.0',
	settings_dovecot_storage_version_added: '2.4.0',
	settings_fifo_listener_type_added: '2.4.0',
	settings_fts_decoder_tika_url_changed: '2.4.0',
	settings_fts_decoder_script_socket_path_changed: '2.4.0',
	settings_fts_message_max_size_added: '2.4.0',
	settings_fts_tika_changed_auth: '2.4.0',
	settings_http_client_settings_added: '2.4.0',
	settings_http_server_settings_added: '2.4.0',
	settings_imapc_features_changed: '2.4.0',
	settings_imapc_ssl_verify_removed: '2.4.0',
	settings_inet_listener_type_added: '2.4.0',
	settings_login_socket_path_added: '2.4.0',
	settings_lmtp_user_concurrency_limit_changed: '2.4.1',
	settings_mail_attachment_sis_option_changed: '2.4.0',
	settings_mail_cache_max_headers_count_added: '2.4.0',
	settings_mail_cache_max_header_name_length_added: '2.4.0',
	settings_mail_lua_added: '2.4.0',
	settings_mailbox_directory_name_legacy_deprecated: '2.4.2',
	settings_mailbox_special_use_changed: '2.4.0',
	settings_metric_fields_changed: '2.4.0',
	settings_passdb_mechanisms_filter_added: '2.4.0',
	settings_passdb_static_password_added: '2.4.0',
	settings_ssl_client_ca_added: '2.4.0',
	settings_ssl_imapc_removed: '2.4.0',
	settings_ssl_request_client_cert_changed: '2.4.0',
	settings_unix_listener_type_added: '2.4.0',
	settings_userdb_static_allow_all_users_added: '2.4.0',
	settings_quota_clone_added: '2.4.0',
	settings_quota_clone_unset_added: '2.4.0',
	settings_quota_mailbox_count_added: '2.4.0',
	settings_quota_mailbox_message_count_added: '2.4.0',
	settings_submission_add_received_header_added: '2.4.0',
	settings_verbose_ssl_removed: '2.4.0',

}
