#### OAuth2 Master Logins

 * With the OAUTHBEARER and XOAUTH2 mechanisms, a token for a different user
   than the requested login user is now handled as a master login, if master
   passdbs exist: the token's user is the master user, and the master passdbs
   decide whether it may log in as the requested user. Previously the login
   always failed. Any user that the master passdbs accept can now log in as
   other users with its own token. The same was already possible with
   [[setting,auth_master_user_separator]]. See
   [[link,auth_master_users_oauth2]].
 * An OAUTHBEARER or XOAUTH2 master login, also one using
   [[setting,auth_master_user_separator]], now fails if no master passdb
   accepts the master user. Previously the master user was logged in as
   itself instead.
