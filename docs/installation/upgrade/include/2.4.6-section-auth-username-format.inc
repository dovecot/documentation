#### Auth Username Format Validation

A global or protocol-level [[setting,auth_username_format]] must now be empty
or reference `%{user}` or `%{owner_user}`, otherwise Dovecot fails to start.
The result is used as the authentication cache key, so a value without the
username, such as a fixed string or only `%{domain_first}`, made all users
share one cache entry. `auth_username_format` inside a passdb or userdb, such
as a [[link,auth_passwd_file]] lookup key, is not affected.

An empty [[setting,auth_username_format]] inside a passwd-file passdb or
userdb now looks up the username as-is. Previously every lookup failed with
unknown user.
