 * Authentication now fails for any username whose `/` or `@` delimited
   component consists only of dots, e.g. `..`, `..@example.com` or
   `user@..`. Such a component escapes its parent directory when the username
   is used in a path, e.g. in [[setting,mail_path]], [[setting,mail_home]] or
   a dict key. The check is independent of [[setting,auth_username_chars]]
   and also applies to usernames returned by a passdb or userdb. Ordinary
   dotted usernames like `first.last@example.com` are unaffected. Accounts
   with such a username can no longer log in or be looked up; none should
   exist, since such names cannot exist as directory names.
 * The same rule applies to the owner part of a shared mailbox name, e.g.
   `shared/../INBOX`. Such a mailbox is reported as nonexistent.
 * After `%variable` expansion, the [[link,settings_types_path_file]] and
   [[link,settings_types_path_dir]] settings, i.e. [[setting,mail_home]],
   [[setting,mail_path]], [[setting,mail_index_path]],
   [[setting,mail_index_private_path]], [[setting,mail_cache_path]],
   [[setting,mail_control_path]], [[setting,mail_alt_path]],
   [[setting,mail_inbox_path]], [[setting,mail_volatile_path]],
   [[setting,mail_ext_attachment_path]] and the rawlog directory settings
   listed above, are normalized (`.` and `..` components are resolved) and
   must still be under the literal part of the setting preceding its first
   variable, e.g. `/var/vmail/%{user | domain}/%{user | username}` must stay
   under `/var/vmail/`. Otherwise the user's settings are invalid and the
   login fails. The directory itself is still inside, so an empty trailing
   variable, e.g. `%{user | domain}` for a user without a domain, yields the
   directory. A value beginning with `~/` or a variable such as `%{home}` has
   no literal part and is only normalized. Values returned by the userdb or
   given with `-o` are not templates and are only normalized. Symbolic links
   are not resolved.
   This matches what [[setting,passwd_file_path]] has done since v2.3.
 * [[setting,mail_home]] is now a [[link,settings_types_path_dir]] setting: a
   trailing `/` in its value is dropped.
