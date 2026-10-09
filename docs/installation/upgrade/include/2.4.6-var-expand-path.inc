 * %variables in [[link,settings_types_path_file]],
   [[link,settings_types_path_dir]] and [[link,settings_types_file]] settings
   are now expanded so that the result can't escape its base path, i.e. the
   path that the beginning of the value expands to. For example
   `%{home}/../shared/%{user}` now fails the settings lookup, while
   `%{home}/sub/../mail` still works. See [[link,settings_types_path_file]].
 * [[setting,passwd_file_path]] starting with a variable, e.g.
   `%{env:PREFIX}/%{user | domain}/passwd`, is now also kept inside the
   variable's expanded value. A lookup whose path escapes it still fails as an
   unknown user, and the log message now shows the resolved path.
 * More settings now use the path setting types. A leading `~/` in their value
   is now expanded to the user's home directory, or fails if no user home is
   available:

   * [[setting,base_dir]], [[setting,state_dir]], [[setting,libexec_dir]]
   * [[setting,log_path]], [[setting,info_log_path]], [[setting,debug_log_path]]
   * [[setting,mail_plugin_dir]], [[setting,mail_temp_dir]],
     [[setting,login_plugin_dir]]
   * [[setting,lmtp_rawlog_dir]], [[setting,lmtp_proxy_rawlog_dir]],
     [[setting,login_proxy_rawlog_dir]]
   * the `*_socket_path` settings, [[setting,execute_fork_path]],
     [[setting,login_proxy_notify_path]], [[setting,auth_winbind_helper_path]]
   * [[setting,dict_file_path]], `cdb_path`, [[setting,sqlite_path]],
     [[setting,mysql_option_file]], [[setting,cassandra_metrics_path]]
   * [[setting,event_exporter_file_path]], [[setting,event_exporter_unix_path]]
   * [[setting,ssl_client_ca_dir]], [[setting,quota_fs_mount_path]],
     [[setting,language_filter_stopwords_dir]], [[setting,textcat_config_path]],
     [[setting,fts_decoder_script_socket_path]]
   * [[setting,sieve_script_path]], [[setting,sieve_script_active_path]],
     [[setting,sieve_user_log_path]], [[setting,sieve_trace_dir]], and the
     sieve-extprograms `*_bin_dir` and `*_socket_dir` settings
