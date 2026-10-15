#### OAuth2 Username Translations

With the OAUTHBEARER and XOAUTH2 mechanisms and the oauth2 passdb, the token's
username now goes through the same [[setting,auth_username_chars]],
[[setting,auth_username_translation]], [[setting,auth_default_domain]] and
[[setting,auth_username_format]] processing as the login username, after
[[setting,oauth2_username_validation_format]]. Previously only the login
username was processed, so e.g. with the default
[[setting,auth_username_format]] a token with an upper-case username failed to
log in.

 * Token usernames that differ only by these translations (e.g. by case) now
   map to the same Dovecot user, the same as with all other login methods.
 * If [[setting,oauth2_username_validation_format]] repeated these
   translations for the token's username, it keeps working as long as
   applying them twice gives the same result (e.g. lower-casing). Otherwise
   remove them from [[setting,oauth2_username_validation_format]].
