 * URL settings are now parsed when the configuration is read, so a value
   that is not a valid URL is rejected and Dovecot refuses to start, instead
   of failing only when the URL is first used. An empty value still means
   unset: a setting required only by a particular driver is still caught
   only when that driver initializes. [[variable]] in the value are still
   allowed, and are validated after expansion. This applies to the following
   (for the oauth2 token URL settings see below):

   * [[setting,auth_policy_server_url]]
   * `oauth2_grant_url`
   * [[setting,oauth2_openid_configuration_url]]
   * [[setting,http_client_proxy_url]]
   * `push_notification_ox_url`
   * [[setting,fts_solr_url]]
   * [[setting,fts_decoder_tika_url]]
   * [[setting,event_exporter_http_post_url]]
 * If [[setting,oauth2_openid_configuration_url]] has no path, e.g.
   `https://id.example.com`, a trailing `/` is added when the URL is
   returned to clients in OAUTHBEARER and XOAUTH2 failure responses.
 * [[setting,oauth2_tokeninfo_url]] (and [[setting,oauth2_introspection_url]]
   with [[setting,oauth2_introspection_mode]] `get`) are now variable
   templates that must contain `%{access_token}`; the token is no longer
   appended automatically. For example, change `...?access_token=` to
   `...?access_token=%{access_token}`.

   * Only `%{access_token}` and the builtin variable providers (e.g.
     `%{env:..}`) are allowed. `%{access_token}` is the raw token.
   * Every variable expanded into the URL is URL-escaped. A variable that
     provides the scheme, host, port, base URL or several path segments needs
     the `| safe` filter, e.g.
     `%{env:IDP_URL | safe}/tokeninfo?access_token=%{access_token}`. See
     [[link,auth_oauth2_url_variables]].
   * `%{access_token}` must be in the URL path or query. It is rejected in
     the host, userinfo or port, and when appended to a variable as in
     `%{env:TOKENINFO_URL}%{access_token}`; write
     `%{env:TOKENINFO_BASE | safe}?access_token=%{access_token}` instead.
   * Without other variables the URL is validated when the configuration is
     read, otherwise after expansion.
 * `%{token}` in [[setting,oauth2_fields]] is deprecated in favour of
   `%{access_token}`, and logs a warning.
