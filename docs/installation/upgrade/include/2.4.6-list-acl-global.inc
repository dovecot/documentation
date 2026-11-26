 * [[changed,settings_acl_global_settings_changed]] ACL entries configured with
   the [[setting,acl]] filter are now global ACLs, the same as the entries in
   the removed global ACL file. Previously they were handled like the rights in
   a per-mailbox `dovecot-acl` file. This changes the behavior in several ways:

   * A `dovecot-acl` entry for the same identifier no longer adds to the
     configured rights; the configured rights override it.
   * Configured `anyone` and `authenticated` rights now apply also to the
     mailbox owner, who previously always kept their default rights.
   * Negative rights in a `dovecot-acl` file are reset by the first configured
     entry that matches the user. Note that an [[setting,acl]] filter at the
     top level of the configuration matches every mailbox of every namespace.
   * Updating a mailbox's ACLs no longer writes the configured rights into its
     `dovecot-acl` file, and creating a child mailbox no longer copies them
     into the child's file. Configuration changes now always take effect,
     also for mailboxes whose ACLs have been updated.
   * dsync no longer exports the configured rights as mailbox attributes.
