Upgrading Dovecot v2.0 to v2.1
==============================

v2.1 is mostly compatible with v2.0 configuration, except:

 * 15-mailboxes.conf included in the default configuration now specifies a few default `SPECIAL-USE <http://tools.ietf.org/html/rfc6154>`_ mailboxes. This file assumes that you already have ``namespace inbox { .. }`` specified (in 10-mail.conf). If you don't, you'll get errors about namespaces. Note that the namespace's name must be "inbox" (as well as usually include ``inbox=yes`` setting). The solution is to either make sure that you have such a namespace defined, or you can simply delete the ``15-mailboxes.conf`` if you don't care about ``SPECIAL-USE``.
 * Plugins now use UTF-8 mailbox names rather than mUTF-7: :ref:`acl <plugin-acl>`, :ref:`autocreate`, :ref:`plugin-expire`, :ref:`plugin-trash`, :ref:`plugin-virtual`
 * Usernames in authentication are now lowercased by default. See

   * Non-lowercase usernames in password/user database result in "unknown user" errors
   * To allow mixed case usernames again, set :ref:`auth_username_format= <setting-auth_username_format>` (i.e. to empty)

 * :ref:`plugin-fts-solr` full text search backend changed to use mailbox GUIDs instead of mailbox names, requiring reindexing everything. ``solr_old`` backend can be used with old indexes to avoid reindexing, but it doesn't support some newer features.
 * :ref:`Expire plugin <plugin-expire>`: Only go through users listed by userdb iteration. Delete dict rows for nonexistent users, unless ``expire_keep_nonexistent_users=yes``.
 * ``dsync`` was merged into doveadm. There is still ``dsync`` symlink pointing to ``doveadm``, which you can use the old way for now. The preferred ways to run dsync are ``doveadm sync`` (for old ``dsync mirror``) and ``doveadm backup``.
 * dsync protocol isn't compatible with v2.0's dsync, so you can't dsync between v2.0 and v2.1 servers.
