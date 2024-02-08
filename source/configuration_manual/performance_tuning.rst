==================
Performance tuning
==================

Disk I/O optimization
---------------------

Usually heavily loaded IMAP and POP3 servers don't use much CPU, but
they use all the disk I/O they can get. So reducing disk I/O is probably
the most useful optimization you can do.

-  See :ref:`mbox_mbox_format`
   for mbox-specific optimizations.

-  See :ref:`maildir_mbox_format`
   for Maildir-specific optimizations.

-  See :ref:`dbox_mbox_format`
   for Dovecot's own high-performance mailbox format. It usually gives
   much better performance than mbox/Maildir.

-  See :ref:`full text search indexes <fts>`
   for optimizing IMAP SEARCH command.

-  See :ref:`pop3_server` for POP3 optimizations, especially 
   :dovecot_core:ref:`pop3_no_flag_updates=yes <pop3_no_flag_updates>`

-  :dovecot_core:ref:`mailbox_list_index=yes <mailbox_list_index>` can help a lot by replying to IMAP STATUS
   (and similar) lookups from a single index without having to open each
   mailbox index separately. This is the default in v2.3+.

   -  Also :dovecot_core:ref:`mailbox_list_index_very_dirty_syncs=yes <mailbox_list_index_very_dirty_syncs>` makes Dovecot
      assume that the list index is up-to-date.

-  :dovecot_core:ref:`mail_prefetch_count` setting may be helpful with some mailbox
   formats

-  :dovecot_core:ref:`mail_volatile_path` ``= /tmp/dovecot-volatile/%2.256Nu/%u``
   moves e.g. lock files to the volatile directory. This is helpful
   especially if mail location otherwise points to a remote filesystem
   like NFS. (v2.2.32+)

-  If the acl plugin is used, but only global ACLs are needed, set
   :dovecot_plugin:ref:`acl_globals_only=yes <acl_globals_only>` (v2.2.31+)

CPU usage optimization
----------------------

-  See :ref:`login_processes`
   for optimizing CPU usage caused by logins

-  See :dovecot_core:ref:`auth_cache_size` setting for caching passdb and userdb lookups

   -  To distribute password hash calculations to multiple CPU cores
      (via auth-worker processes), set
      :dovecot_core:ref:`auth_cache_verify_password_with_worker=yes <auth_cache_verify_password_with_worker>`. (v2.2.34+)

-  Services having :dovecot_core:ref:`service_client_limit` > 1
   and :dovecot_core:ref:`service_process_limit` > 1, set
   :dovecot_core:ref:`service_process_min_avail` to the number of CPU cores.

-  To reduce forks by reusing existing processes for new requests
   increase :dovecot_core:ref:`service_restart_request_count` from 1 to higher (e.g. 100)
   for imap and pop3 services. It's better not to set it too high or
   unlimited (0), because different users use different amounts of
   memory, and it's wasteful when a lot of processes end up having a lot
   of "free" memory.

Memory usage optimization
-------------------------

There aren't many settings which affect Dovecot's memory usage. In
general Dovecot uses as much memory as it needs, which is usually quite
little.

-  :dovecot_core:ref:`auth_cache_size` controls maximum memory size for caching
   passdb/userdb lookups

-  :ref:`High-performance mode for login processes <login_processes_high_performance>`.

-  :dovecot_core:ref:`imap_hibernate_timeout` controls when to move IDLEing IMAP
   connections to wait for changes in a shared imap-hibernate process.
   This frees up the imap process.

Note that these settings do not directly affect the memory usage:

-  :dovecot_core:ref:`service_vsz_limit`: These are simply safe guards against
   potential memory leaks. If the process's virtual size reaches the
   limit, the process is killed by the kernel.

-  :dovecot_core:ref:`service_process_limit` and
   :dovecot_core:ref:`service_client_limit`: These are mostly to
   avoid DoS attacks using up all your memory.
