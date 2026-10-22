#### LDAP Client

Dovecot has its own LDAP client instead of the OpenLDAP libraries, so
OpenLDAP is no longer needed to build or run `ldap` passdb, userdb, dict and
the Sieve `ldap` storage. `/etc/ldap/ldap.conf` and the `LDAP*` environment
variables are not read anymore.

The settings were renamed. The old names are still accepted when
[[setting,dovecot_config_version]] is older than this release.

| Old Setting | New Setting |
| ----------- | ----------- |
| [[setting,ldap_uris]] | [[setting,ldap_client_uris]] |
| [[setting,ldap_starttls]] | [[setting,ldap_client_starttls]] |
| [[setting,ldap_timeout]] | [[setting,ldap_client_request_timeout]] |
| [[setting,ldap_max_idle_time]] | [[setting,ldap_client_max_idle_time]] |
| [[setting,ldap_auth_dn]] | [[setting,client_auth_authid]] in [[setting,ldap_client]] |
| [[setting,ldap_auth_dn_password]] | [[setting,client_auth_password]] in [[setting,ldap_client]] |
| [[setting,ldap_auth_sasl_authz_id]] | [[setting,client_auth_authzid]] in [[setting,ldap_client]] |
| [[setting,ldap_auth_sasl_mechanisms]] | [[setting,client_auth_mechanism]] in [[setting,ldap_client]] |

Other changes:

 * `0` meant no timeout in [[setting,ldap_timeout]] and no disconnecting in
   [[setting,ldap_max_idle_time]]. Use `infinite` for that in the new
   settings. With the new settings `0` is not allowed for the request
   timeout, and for the idle time it disconnects as soon as the connection has
   no requests.
 * [[setting,client_auth_mechanism]] accepts only one SASL mechanism. A list
   in [[setting,ldap_auth_sasl_mechanisms]] is now a configuration error.
 * Mechanisms that were available only via Cyrus SASL, such as `NTLM`, are no
   longer available. Dovecot's own SASL client mechanisms are used, including
   `EXTERNAL`, `PLAIN`, `SCRAM-SHA-256`, `OAUTHBEARER`, `GSSAPI` and
   `GSS-SPNEGO`.
 * The connection never has a SASL security layer. Use TLS
   ([[setting,ldap_client_starttls]] or `ldaps://`), which Active Directory
   requires anyway.
 * [[setting,ldap_client_uris]] (and the old [[setting,ldap_uris]]) no longer
   accepts a path, query or fragment. A base DN in the URI, which OpenLDAP
   ignored, makes Dovecot fail to start. Move it to [[setting,ldap_base]].
 * `ldap_version`, `ldap_debug_level` and `ldap_auth_sasl_realm` have no effect
   anymore. Remove them from the configuration.
 * Requests that fail because of a lost connection or a timeout are retried,
   see [[setting,ldap_client_max_request_retries]]. A request fails after
   [[setting,ldap_client_request_absolute_timeout]] (60 seconds by default).
 * `passdb ldap` and `userdb ldap` use [[setting,ldap_client_request_timeout]]
   `20s` and [[setting,ldap_client_max_outstanding_requests]] `8` by default.

For plugin authors and packagers: `dovecot-config` no longer has
`DOVECOT_LDAP_LIBS`. Link with `LIBDOVECOT_LDAP`, which now provides the LDAP
client. It uses the new `libdovecot-asn1` shared library (`LIBDOVECOT_ASN1`).
The `asn1-compile.py` generator is installed in the Dovecot library directory.

See [[link,auth_ldap]].
