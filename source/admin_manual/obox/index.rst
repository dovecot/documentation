.. _object_storage_mailbox_format_administration:

=============================================
Object Storage Mailbox Format Administration
=============================================

The object storage plugin administration is mainly related to making sure that the mail cache and the index cache perform efficiently and they don't take up all the disk space.

Service Stop and Restart
^^^^^^^^^^^^^^^^^^^^^^^^
When the dovecot service is stopped, it flushes all pending changes. Or in more details:

* ``doveadm metacache flushall -i`` is first run to flush all pending important changes.

 * Since the important changes are usually flushed every 5 minutes, the flushes aren't expected to take excessively long.

* All new imap, pop3, managesieve, submission and lmtp connections are stopped.

* ``doveadm kick '*'`` is used to kick all the existing imap, pop3 and managesieve connections.

.. Note:: LMTP connections can't be kicked. However, they're assumed to finish rather quickly.

* ``doveadm metacache flushall -i`` is run again to flush the important changes

* Wait 1 second

* ``doveadm kick '*'`` is run again - just in case there were a few more clients that managed to log in

* The final ``doveadm metacache flushall -i`` is run.

* The ``service dovecot stop`` is finished and exits

This flushing isn't performed when restarting the service or when doing upgrade with yum/apt. There's also metacache-flush.service that can be manually stopped if the flushall isn't wanted to be run.

Simple Upgrade
^^^^^^^^^^^^^^^

The simplest way to upgrade Dovecot backend is to simply run ``yum upgrade`` or ``apt-get upgrade``. This causes very little downtime on that server, so most clients can successfully reconnect back to the server after getting disconnected. This method also has the advantage that all the caches are filled up for the users.

Complex Upgrade
^^^^^^^^^^^^^^^^

Sometimes in-place upgrades aren't wanted. Instead the backends are upgraded by first shutting down the backend, upgrading, and then bringing the server back up. See below for problems related to this.

Problems with Backend Shutdown
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

* Users are moved to new backends with empty caches. Filling the caches causes temporary object storage IO spikes.

* "Unimportant changes" are changes that can be regenerated in case of a backend crash. This most importantly means data added to dovecot.index.cache file. Usually these get flushed while the indexes get flushed for other reasons, for example every 10th new mail delivery. Indexes with only unimportant changes are automatically flushed to object storage only when metacache disk space runs out and metacache process decides to clean up some disk space. It flushes the indexes before deleting them so nothing is lost. However, if there is enough available disk space in metacache this may mean that after shutting down Dovecot there may be a lot of indexes in metacache with unimportant changes. This has two problems:

 * When user is moved to a new backend, these missing unimportant changes may need to be regenerated. Usually this means reading a maximum of 9 mails per folder (obox_max_rescan_mail_count=10), but in some rare situations the cache may have just had huge changes. These changes will need to be re-done on the new backend, which may be expensive.

 * Metacache directories with unimportant changes are left lying around.

  * Normally this shouldn't actually cause problems, because:

    * Eventually they may become cleaned up to free up disk space, which normally causes them to be flushed to object storage. However, the flushing isn't performed when another server has already changed the indexes. So an obsolete index bundle won't actually be written to object storage.

    * When opening an obsolete metacache directory with only unimportant changes, it's not used if there's already a newer index bundle. The obsolete directory just gets deleted. Only if there are important changes it performs dsync-merging.

  * However, dsync-merging still seems to happen rather commonly and can cause problems with UID renumbering or losing data in dovecot.index.cache. This has been fixed with v2 merging algorithm.

There are some things that can be done to help problems caused by these:

* Run ``doveadm metacache flushall`` every night. This way there won't be highly out-of-date indexes lying around.

* Delete really old obsolete indexes from all backends before shutting down backends. Ideally only when the user isn't assigned to the backend before the shutdown - otherwise it could unnecessarily delete indexes for users who simply haven't been accessed for a while but don't have any newer indexes anywhere.

  * When starting up a backend also delete rather old (e.g. >1 day) indexes from metacache.

  * Use the ``last-access(0)`` timestamp in ``doveadm metacache list`` output to determine the user's last access timestamp.

   * If the user isn't found from the list at all, then it's definitely an old index that hasn't so far been accessed in this backend since Dovecot was started up.

.. Note:: You can't currently use ``doveadm metacache clean`` to delete changed indexes. The only alternative is to just forcibly "rm -rf" the directory. However, if the user happens to be accessed during the "rm -rf" this can cause index corruption, which can have rather bad consequences (like redownloading all mails). This is why it should verify whether director currently points the user to this backend, and only rm -rf users whose backend is elsewhere.

Backend Crashes
^^^^^^^^^^^^^^^^

Dovecot doesn't use metacache for users that were accessed before the backend crashed the last time. This is done using /var/lib/dovecot/reboots file. When starting up, Dovecot gets /proc's ctime and adds it to the reboots file. At a clean dovecot service shutdown this timestamp is marked to be "clean". Each .state file in metacache directories contains the /proc ctime when it was last modified. If opening metacache finds that there's been a crash since the last metacache write, the metacache directory is assumed to be corrupted and is deleted. Normally this works as expected and admin doesn't need to worry about this.

Mail Fscache
^^^^^^^^^^^^^

The mail cache size is specified in the plugin { obox_fs } setting as the parameter to fscache, which is commonly set to 1-2 GB. See 4.1 fscache for more details how to configure it properly.

If fscache runs out of disk space, most operations won't return user-visible failures (although errors are still logged). Currently the "mail prefetching" can't transparently handle such failures though, so these errors can result in user-visible failures.

If fscache runs out of disk space, it's usually because one of:

* fscache.log doesn't match the actual disk space usage. Maybe due to a bug, or maybe due to crashes.

* Users are accessing/saving too large emails. See quota_max_mail_size setting.

* Mail files are being kept open for a long time, resulting in already deleted files reserving disk space on the filesystem. For example because a client is downloading a large mail with a slow internet connection.

Generally the problem goes away by syncing fscache.log with reality by running:

.. code-block:: none

   doveadm fscache rescan

This will update the fscache.log to contain the correct size. It also prints whether the current size was correct or not. It's possible also to manually delete files from fscache by using the rm command. The doveadm fscache rescan must be then run afterwards.

Many of our customers are running the doveadm fscache rescan command in a cronjob every hour. This makes sure that the fscache won't be wrong for too long.

Index Metacache
^^^^^^^^^^^^^^^^

The metacache index size is specified in the metacache_max_size setting. This should ideally be as large as possible to reduce both object storage GETs for the indexes and also local filesystem writes when the indexes are unpacked to local cache. Metacache is the most complicated part of the obox mailbox format.

.. todo:: When or if the troubleshooting page is available publicly, add back this text: "which also means various things can go wrong with it. See Troubleshooting for a list of problems and their workarounds."

Metacache is rarely large enough to contain indexes for all the users in the backend. This is why it also supports priorities, which attempts to keep the most useful information in the metacache longest to reduce the object storage IO. For example INBOX and Junk folders are usually accessed more often than other folders (due to mail deliveries), so they're prioritized higher than other folders. User's root indexes are prioritized the highest, mainly because they're always required whenever a user is accessed, but also because they're small enough that they can be cheaply kept in metacache for a long time. See 4. Obox Settings for more details about the priorities and their configuration. The metacache performance can be monitored by looking at the number of index GET and PUT requests. Metacache cleans are also logged by metacache-worker.

To list all users currently known to be in metacache, run:

.. code-block:: none

   doveadm metacache list

The output will have fields:

* username : The primary username

* user_* : Alternative usernames, if configured by returning user_* extra fields from userdb

* upload-within : This corresponds to the :dovecot_plugin:ref:`metacache_upload_interval` setting.

* dev-major dev-minor : Filesystem device where the user is located in. Filesystems are separately tracked by metacache, although currently support for multiple filesystems doesn't work as well as it could. Mainly the problem is that metacache_max_space globally applies to all the filesystems.

* bytes-used(priority) : Disk space used by index files of this priority in metacache.

* last-access(priority) : UNIX timestamp of when the the index files of this priority were last accessed in metacache.

 * changes : "none" means the index files have no changes done locally since they were downloaded. "unimportant" means there are some changes, but nothing that couldn't be regenerated if the server crashed. "important" means that there are changes that would be lost in case of a server crash. Currently the only important change is flag changes.

   * New mail deliveries aren't important, because the mail is immediately saved to object storage. In case of a crash the mails are listed in object storage and missing mails are added back to Dovecot indexes. The obox plugin also guarantees that the IMAP UID will be preserved in case of a crash. However, if a new mail delivery also sets a message flag (e.g. via Sieve script), then the change will be marked as important. An exception is the $HasAttachment and $HasNoAttachment flags, which are stored in the obox OID directly so they can be cheaply restored after a crash.

 * last-service : Last service that accessed this user. However, metacache clean and flush operations (via metacache-worker or doveadm) won't update this field.

 * cleanup-weight : Currently calculated weight when these indexes are cleaned up. Smaller numbers are cleaned up before larger numbers. Sorting the list output (with ``|sort -n``) by this field will show the order in which the indexes would be cleaned. The cleanup weights are recalculated whenever the indexes are being accessed.


There are 4 priorities for index files:

 * 0 = User root indexes (highest priority)

 * 1 = FTS indexes

 * 2 = INBOX and \Junk folder indexes

 * 3 = other folders' indexes (lowest priority)

You can also manually clean some older indexes from cache by running:

.. code-block:: none

   doveadm metacache clean -u user@domain

If the indexes aren't fully uploaded to the object storage, the clean will fail instead.

You can manually upload indexes to object storage with:

.. code-block:: none

   doveadm metacache flush -u user@domain

   doveadm metacache flushall

It's also possible to flush only indexes with specified priority (and below) with the -p parameter.

If a user no longer actually exists on filesystem, it can be removed from metacache process with:

.. code-block:: none

   doveadm metacache remove user@domain

This command also supports wildcards, so you can remove e.g. "testuser*" or even "*" for everyone.

If multiple backends do changes to the same mailbox at the same time, Dovecot will eventually perform a dsync-merge for the indexes. Due to dsync being quite a complicated algorithm there's a chance that the merging may trigger a bug/crash that won't fix itself automatically. If this happens, the bug should be reported to get it properly fixed, but a quick workaround is to run:

.. code-block:: none

   doveadm metacache pull -u user@domain --latest-only --clean 10.0.0.5

:added: v2.4;v3.0


To allow easier migration of users and to support the new needs brought up with
the :ref:`hacluster architecture <setting-hacluster>` the `doveadm metacache pull`
command was implemented. This command allows to pull the metacache for specific
users(s) from another backend.

.. code-block:: none

   doveadm -o plugin/metacache_index_merging=none force-resync -u user@domain INBOX

.. toctree::
   :maxdepth: 1

   design
   user_delete
   backend_restart
   storage_side_metadata
   data_access_patterns
   disaster_recovery
   fs_dictmap_mapping
   scality_key_format
   sizing_information
   s3_object_id_format
   s3_api_url_calls
