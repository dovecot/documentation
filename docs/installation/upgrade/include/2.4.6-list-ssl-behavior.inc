 * The certificate username ([[setting,ssl_server_cert_username_field]]) is
   now the UTF-8 conversion of the certificate's DN entry. A BMPString,
   UniversalString or T61String value used to give its raw bytes, and a value
   that can't be converted, including a UTF8String that isn't valid UTF-8,
   now gives no username.
 * A client that selects a [[link,settings_connection_filters,local_name]]
   with [[setting,ssl,no]] through SNI now fails the TLS handshake, instead of
   switching to the TLS settings of that scope.
 * A doveadm, HTTP or SMTP server connection that starts TLS in a scope with
   [[setting,ssl,no]] now fails instead of starting TLS with the settings of
   that scope.
