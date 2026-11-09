 * The ACL plugin replaced `dovecot-acl-list` with `acl-rights.cache`, which
   also caches the mailboxes' `dovecot-acl` file rights. Each user's cache is
   created from the mailboxes' `dovecot-acl` files by the owner's first ACL
   check or change after the upgrade, which also removes the old
   `dovecot-acl-list`. After a downgrade the earlier version recreates
   `dovecot-acl-list` by itself. When the upgraded version finds the list
   again, it rebuilds the cache.
   During a rolling upgrade, ACL changes made by a pre-upgrade backend after
   a user's cache was built are not in that cache, so shared mailbox
   listings can miss them. This ends at the owner's next ACL check on a
   new-version backend, which finds the `dovecot-acl-list` the pre-upgrade
   backend recreated and rebuilds the cache.
   See [[link,acl_rights_cache]].
