 * A [[link,passdb]] lookup returning an empty password now fails
   authentication instead of allowing login with an empty password. Passdb
   entries intended to have no fixed password should return the `nopassword`
   [[link,passdb_extra_fields,extra field]] (e.g. `user:::::::nopassword=yes`
   in a passwd-file) instead of an empty password field; any non-empty client
   password is then accepted.
 * An empty client-supplied password is now always rejected before the passdb
   lookup, for all passdb drivers. Previously only LDAP auth binds rejected
   it. `nopassword` does not allow an empty client password either; only
   mechanisms that authenticate without a password (EXTERNAL via client
   certificate, OAuth2) are unaffected.
 * The EXTERNAL SASL mechanism now treats the client certificate as the
   authentication and no longer verifies any passdb password. Existing
   client-certificate setups (e.g. passwd-file entries with an empty password
   field) keep working. Passdbs that verify the password themselves no longer
   reject EXTERNAL logins either: e.g. an LDAP auth bind passdb attempts no
   bind - the lookup succeeds without verifying anything and only provides
   the extra fields, since the certificate already authenticated the user.
   For EXTERNAL logins`passdb { skip = authenticated }` passdbs are now
   skipped and `skip = unauthenticated` passdbs run; if all passdbs are
   skipped, the login fails.
