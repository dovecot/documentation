#### Client Authentication Settings

The credentials that Dovecot uses when it logs into other servers (imapc,
pop3c, passdb imap) are now configured with the generic
[[link,client_auth,client authentication]] settings inside the client's
filter, instead of per-client settings. The old names are renamed
automatically as long as [[setting,dovecot_config_version]] is older than
`2.4.6`, but `doveconf` writes the new names:

| Old setting | New setting |
| ----------- | ----------- |
| `imapc_user`, `imapc_master_user`, `imapc_password` | `imapc { client_auth_authzid, client_auth_authid, client_auth_password }` |
| `imapc_sasl_mechanisms` | Deprecated. Each listed mechanism becomes an `imapc { client_auth <MECHANISM> { } }` block in the listed order. |
| `pop3c_user`, `pop3c_master_user`, `pop3c_password` | `pop3c { client_auth_authzid, client_auth_authid, client_auth_password }` |
| `pop3c_ssl_verify` | `pop3c { ssl_client_require_valid_cert }` |

 * `-o` and userdb overrides use the `imapc/client_auth_password` syntax.
   The old names are still translated in overrides regardless of the config
   version, so for example `doveadm -o imapc_password=secret` keeps working.
 * The pop3c default for the authorization identity changes from `%{user}`
   to `%{owner_user}` with the new config version. This only affects shared
   namespaces.
 * The `SCRAM-SHA-1` and `SCRAM-SHA-256` client mechanisms now use channel
   binding automatically when the server advertises the `-PLUS` variant over
   a TLS connection.
