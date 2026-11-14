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
   With obox, the first rebuild fetches the shared mailboxes that
   `dovecot-acl-list` names and whose ACL file isn't locally available -
   expect that one-time fetch.
   Without a `dovecot-acl-list` it asks the sharing dictionary whether the
   user has shares, which reads the whole dictionary unless
   [[setting,acl_dict_index]] is enabled - with a large dictionary consider
   enabling it. During a rolling upgrade a new-version backend serves the
   cached rights of the mailboxes whose ACL file isn't locally available,
   including rights that a pre-upgrade backend revoked, until the mailbox is
   opened or the cache is rebuilt.
   See [[link,acl_rights_cache]].
