#### OAuth2 Nested Claim Names

With [[setting,oauth2_introspection_mode]] `local`, a nested JWT claim is now
named by joining its path segments with `;` instead of `_`. For example, the
Keycloak claim `realm_access.roles` changes from `realm_access_roles` to
`realm_access;roles`. See [[link,auth_oauth2_jwt_claims]].

**A configuration that still uses a nested claim's old name makes every
local-JWT login fail.** Rewrite the reference, e.g.
`%{oauth2:realm_access_roles}` in [[setting,oauth2_fields]] becomes
`%{oauth2:realm_access;roles}`, and the same for
[[setting,oauth2_username_attribute]] and [[setting,oauth2_active_attribute]].
Configurations that reference only top-level claims, such as
`preferred_username`, `email` or `given_name`, need no change.

 * Inside a segment, `;` is now written as `%3b` and `%` as `%25`. A
   top-level claim name containing either character is renamed the same way,
   and can't be used in `%{oauth2:..}` because `%` is not valid in a variable
   name. [[setting,oauth2_username_attribute]] still accepts it.
 * An array of objects now gives one field with the values joined with tabs,
   the same as an array of scalars. Previously `"a":[{"b":"x"},{"b":"y"}]`
   gave two fields named `a_b`, and only the last was visible.
 * A token with a duplicate member name in its header or claims set no longer
   validates.
 * A token with an ASCII control character in a claim name no longer
   validates.
