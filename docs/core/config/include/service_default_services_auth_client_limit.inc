* [[setting_text,service_client_limit,client_limit]] should be large enough to
  handle all the simultaneous connections.

  Dovecot attempts to verify that the limit is high enough at startup.
  If it's not, it logs a warning such as:

    * Warning: service auth { client_limit=1000 } is lower than required under max. load (1328)

      This is calculated by counting the [[setting,service_process_limit]] of
      every service that is enabled with the
      [[setting_text,service_protocol,protocol]] setting (e.g. imap, pop3,
      lmtp). Only services with the [[setting,service_restart_request_count]]
      setting being `!= 1` are counted, because they have persistent
      connections to auth, while [[setting,service_restart_request_count,1]]
      processes only do short-lived auth connections.

