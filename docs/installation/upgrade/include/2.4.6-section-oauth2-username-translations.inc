#### OAuth2 Username Translations

With the OAUTHBEARER and XOAUTH2 mechanisms and the oauth2 passdb, the token's
username now goes through the same [[setting,auth_username_chars]],
[[setting,auth_username_translation]], [[setting,auth_default_domain]] and
[[setting,auth_username_format]] processing as the login username, after
[[setting,oauth2_username_validation_format]]. Previously only the login
username was processed, so e.g. with the default
[[setting,auth_username_format]] a token with an upper-case username failed to
log in. A passdb-specific [[setting,auth_username_format]] is not used for the
token's username, only the global or protocol-specific value.

 * Token usernames that differ only by these translations (e.g. by case) now
   map to the same Dovecot user, the same as with all other login methods.
   A format that drops the domain, e.g. `%{user | username}`, also maps
   tokens for the same username in different domains to the same user.
 * A token username with characters that [[setting,auth_username_chars]]
   doesn't allow now fails to log in. Previously only the login username was
   checked.
 * If [[setting,oauth2_username_validation_format]] repeated these
   translations for the token's username, they are now applied twice. This
   keeps working only if applying them twice gives the same result (e.g.
   lower-casing). Otherwise, e.g. with a format that adds a prefix or a
   domain, remove them from [[setting,oauth2_username_validation_format]].
