Upgrading Dovecot v1.0 to v1.1
==============================

You can use your old ``dovecot.conf`` from v1.0. It should work without changes, although a couple of deprecated settings have been removed.

Upgrading from Dovecot versions older than v1.0.rc1 directly to v1.1 is not recommended.
v1.0 versions contain some backwards compatibility checks and file format converters that have been removed from v1.1.

If you want to downgrade back after running v1.1, don't downgrade to older versions than v1.0.8 or you'll get crashes.
Especially if you're using maildir, the ``dovecot-uidlist`` file format has changed and Dovecot versions older than v1.0.2 can't read it.

Connections
--------------

 * ``listen = [::]`` listens only for IPv6 connections now in most operating systems. If you want both IPv4 and IPv6 use ``listen = *, [::]``
 * By default the number of connections per-user per-IP is limited to 10. You can change this with the :dovecot_core:ref:`mail_max_userip_connections` setting.

Authentication
--------------

 * :ref:`authentication-passwd_file`: If you use ``%d`` in args, it no longer means that domain isn't looked up from the passwd-file. You'll need to add ``username_format=%n`` prefix to args (e.g. ``args = username_format=%n /etc/virtual.%d``).
 * Empty or NULL password no longer means "any password is valid". You'll also have to return "nopassword" field.
 * :ref:`authentication-pam`: There's no more ``blocking=yes`` setting, it's now always enabled. If you want to limit the number of lookups done by a dovecot-auth worker, change ``auth_worker_max_request_count`` setting. Setting it to 1 makes it work basically the same as the old ``blocking=no``.
 * :ref:`authentication-passwd`: The problem with passwd lookups is that temporary errors (e.g. LDAP server down) are returned as "user doesn't exist" errors. You may want to try the new ``nss`` userdb.
 * :ref:`authentication-sql` and :ref:`authentication-ldap`: ``user_global_uid`` and ``user_global_gid`` fields have been removed from their config files. Instead you can now use :dovecot_core:ref:`mail_uid` and :dovecot_core:ref:`mail_gid` settings in ``dovecot.conf``. This also means that it's no longer a requirement to specify a userdb at all (a dummy :ref:`authentication-static_user_database` is used internally).

Mail handling
-------------

 * In v1.0 :dovecot_core:ref:`mmap_disable=yes <mmap_disable>` might have worked faster. If you had changed this only because of that, it's time to set it back to "no".
 * NFS users should now set :dovecot_core:ref:`mail_nfs_storage=yes <mail_nfs_storage>` and :dovecot_core:ref:`mail_nfs_index=yes <mail_nfs_index>`. Dovecot no longer requires attribute cache to be disabled.
 * :ref:`quota_plugin` plugin has completely new configuration. See :ref:`quota`.
 * Maildir: ``dovecot-uidlist`` file is in a new format. The old format is automatically converted to new one, but if you plan to move back to v1.0 be sure to use at least v1.0.2 which will also understand this new format.
 * Index files have slightly changed as well. Upgrading to v1.1 should go transparently, but moving back to v1.0 might again cause some errors. v1.0.8 fixes some assert-crashes that were caused by reading v1.1-generated index files.
 * :dovecot_core:ref:`dotlock_use_excl=yes <dotlock_use_excl>` is default nowadays. If you're still using an ancient NFSv2 setup, you'll need to set this to "no".
 * mbox: Delete existing dovecot.index.cache files from all mailboxes. Otherwise you may see some errors in logs.
 * ``default_mail_env`` has been renamed to ``mail_location`` (since v1.0.rc11 already).
 * Namespaces:

   * deliver now supports namespaces. If you use namespace prefixes or a non-default separator and you deliver to non-INBOXes, deliver will now have to use the configured prefix and separators.

     * This is especially important for Sieve scripts. For example if you only have "INBOX." namespace prefix and you used to use ``fileinto "box"``, it now has to be instead: ``fileinto "INBOX.box"``

   * ``hidden=yes`` now hides the namespace only from IMAP NAMESPACE reply. You'll also need to set ``list=no`` to truly hide them from clients' mailbox list.

Removed settings
----------------
 * ``mail_read_mmaped``: Mails are never read mmaped anymore. There wasn't much point.
 * ``mmap_no_write``: OpenBSD users will have to settle for mmap_disable=yes for now.

