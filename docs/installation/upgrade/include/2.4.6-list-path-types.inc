 * New [[link,settings_types_path_file]] and [[link,settings_types_path_dir]]
   setting types: a leading `~/` in the value is expanded to the user's home
   directory, and directory paths also drop a trailing `/`. The mail location
   `*_path` settings and the rawlog directory settings use these types now.
   The following settings previously used a `~/` prefix literally; it is now
   expanded (or fails, if no user home is available):

   * [[setting,rawlog_dir]] (imap, pop3, submission and managesieve)
   * [[setting,http_client_rawlog_dir]]
   * [[setting,http_server_rawlog_dir]]
 * `doveconf` output no longer drops a trailing `/` from [[setting,mail_path]]
   and the other directory path settings; the value is shown as written in the
   configuration.
