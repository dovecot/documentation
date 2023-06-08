.. _obox_settings_advanced:

======================
Obox Advanced Settings
======================

.. seealso:: :ref:`plugin-obox`

.. warning:: These are advanced obox settings that should normally not be
             changed.

Settings
========

.. dovecot_plugin:setting:: metacache_bg_root_uploads
   :default: no
   :plugin: obox
   :values: @boolean

   By default, doing changes to folders (e.g. creating or renaming) uploads
   changes immediately to object storage. If this setting is enabled, the
   upload happens sometimes later (within
   :dovecot_plugin:ref:`metacache_upload_interval`).


.. dovecot_plugin:setting:: metacache_disable_bundle_list_cache
   :default: no
   :plugin: obox
   :values: @boolean

   Disable caching bundle list.


.. dovecot_plugin:setting:: metacache_disable_merging
   :default: no
   :plugin: obox
   :removed: v3.0.0
   :seealso: @metacache_index_merging;dovecot_plugin
   :values: @boolean

   .. note:: Use ``metacache_index_merging=none`` instead.

   Disable index merging when opening root or mailbox indexes. This can be
   used to work around bugs in the merging code that cause crashes. Usually
   this setting isn't set in dovecot.conf, but set via doveadm call:

   .. code-block:: none

     doveadm -o plugin/metacache_disable_merging=yes force-resync -u user@example '*'


.. dovecot_plugin:setting:: metacache_disable_secondary_indexes
   :added: 2.3.17
   :default: no
   :plugin: obox
   :values: @boolean

   Disable including secondary indexes into the user root bundle when using
   the virtual or virtual-attachments plugin (see
   :ref:`virtual plugin <virtual_plugin_obox_secondary_indexes>` and
   :ref:`virtual-attachments plugin <virtual_attachments_plugin_obox_secondary_indexes>`).

   This setting can be used to exclude the virtual and virtual-attachments
   folders from the user root bundle in case any problems are encountered.


.. dovecot_plugin:setting:: metacache_index_merging
   :added: 2.3.6
   :changed: 2.4.0,3.0.0 Removed ``v1`` option
   :default: v2
   :plugin: obox
   :values: @string

   Specifies the algorithm to use when merging folder indexes.

   ========== ===============================================================
   Algorithm  Description
   ========== ===============================================================
   ``none``   Alias for :dovecot_plugin:ref:`metacache_disable_merging`
   ``v1``     The old dsync-based algorithm, which can cause very inefficient
              behavior in some situations.
   ``v2``     The new algorithm designed specifically for this purpose of
              merging two indexes. This is the recommended setting.
   ========== ===============================================================


.. dovecot_plugin:setting:: metacache_max_parallel_requests
   :default: 10
   :plugin: obox
   :values: @uint

   Maximum number of metacache read/write operations to do in parallel.


.. dovecot_plugin:setting:: metacache_merge_max_uid_renumbers
   :default: 100
   :plugin: obox
   :values: @uint

   This is used only with
   :dovecot_plugin:ref:`metacache_index_merging` = ``v2``.

   If the merging detects that there are more than this many UIDs that are
   conflicting and would have to be renumbered, don't renumber any of them.
   This situation isn't expected to happen normally, and renumbering too many
   UIDs can cause unnecessary extra disk I/O.

   The downside is that a caching IMAP client might become confused if it had
   previously seen different UIDs.


.. dovecot_plugin:setting:: metacache_priority_weights
   :plugin: obox

   See :dovecot_plugin:ref:`metacache_size_weights`.


.. dovecot_plugin:setting:: metacache_size_weights
   :plugin: obox

   .. code-block:: none

      plugin {
        metacache_priority_weights = 10% +1d 10% +1d 50% +1h 100% 0
        metacache_size_weights = 2M +30 1G +120
      }

   Whenever metacache notices that ``metacache_max_space`` has been reached, it
   needs to delete some older index files to make space for new ones. This is
   done by calculating cleanup weights.

   The simplest cleanup weight is to just use the user's last access UNIX
   timestamp as the weight. The lowest weight gets deleted first.

   It's possible to enable using only simple weights by explicitly setting
   ``metacache_priority_weights`` and ``metacache_size_weights`` to empty
   values. However, by default priorities are taken into account when
   calculating the weight.

   The ``metacache_priority_weights`` setting can be used to fine tune how
   metacache adjusts the cleanup weights for different index priorities. There
   are 4 major priorities (these are also visible in e.g. ``doveadm metacache
   list`` output):

     * 0 = User root indexes (highest priority)
     * 1 = FTS indexes
     * 2 = INBOX and \Junk folder indexes ("special" folders)
     * 3 = Non-special folder indexes (lowest priority)

   The ``metacache_priority_weights`` contains ``<percentage> <weight
   adjustment>`` pairs for each of these priorities. So, for example, the
   first ``10% +1d`` applies to the user root priority and the last ``100% 0``
   applies to other folders' priority.

   The weight calculation is then done by:

     * Initial weight is the user's last access UNIX timestamp
     * ``metacache_priority_weights`` is next looked up for the given priority
       indexes
     * If the total disk space used by the indexes is equal or less than the
       ``<percentage>``, add ``<weight adjustment>`` to weight. So, for
       example, with ``10% +1d`` if the disk space used by index files of this
       priority type take <= 10% of ``metacache_max_space``, increase the
       weight by ``1d = 60*60*24 = 86400``.
     * Because the initial weight is based on UNIX timestamp, the weight
       adjustment is also given as time. This practically means that e.g.
       ``+1d`` typically gives 1 extra day for the index files to exist
       compared to index files that don't have the weight boost.
     * ``<percentage>`` exists so that the weight boost doesn't cause some
       index files to dominate too much. For example, if root indexes' weights
       weren't limited, it could be possible that the system would be full of
       only root indexes and active users' other indexes would be cleaned
       almost immediately.

   The ``metacache_size_weights`` setting is used to do final adjustments
   depending on the disk space used by this user's indexes of the specific
   priority. The setting is in format
   ``<low size> <low weight adjustment> <max size> <high weight adjustment>``.

   The weight adjustment calculation is:

     * If disk space is equal or less than ``<low size>``, increase weight by
       ``(<low size> - <disk space>) * <low weight adjustment> / <low size>``
     * Otherwise, cap the ``<disk space>`` to ``<max size>`` and increase
       weight by ``(<disk space> - <low size>) * <high weight adjustment> /
       (<max size> - <low size>)``
     * The idea here is to give extra weight boost for

       * Small indexes, because they're small enough that it won't matter if
         they live longer than most, AND
       * Very large indexes, because it's so expensive to keep
         uploading/downloading them in object storage

     * With the default ``2M +30 1G +120`` value the priority adjustments will
       look like:

       * 0 kB: ``+30``
       * 500 kB: ``+23``
       * 1 MB: ``+15``
       * 1,5 MB: ``+8``
       * 2 MB: ``0``
       * 10 MB: ``+1``
       * 50 MB: ``+6``
       * 100 MB: ``+12``
       * 258 MB: ``+30``
       * 500 MB: ``+60``
       * >=1 GB: ``+120``


.. dovecot_plugin:setting:: metacache_socket_path
   :default: metacache
   :plugin: obox
   :values: @string

   Path to communicate with metacache process.


.. dovecot_plugin:setting:: metacache_userdb
   :default: metacache/metacache-users.db
   :plugin: obox
   :values: @string

   Path to a database which metacache process periodically writes to.

   This database is read by metacache at startup to get the latest state.

   The path is relative to :dovecot_core:ref:`state_dir`.


.. dovecot_plugin:setting:: obox_allow_inconsistency
   :default: no
   :plugin: obox
   :removed: v3.0.0
   :values: @boolean

   .. warning::
      The setting has been removed, because it could have caused various
      problems with indexing. Most importantly if the root index bundles weren't
      accessible, it could have created whole new INBOX and other folders.
      In general it was also possible for FTS indexes to become desynchronized,
      which required rebuilding them. Even if everything had worked properly,
      performance could have been rather bad if many mails were missing from
      the local indexes.

   Even in case of object storage errors, try to allow accessing the emails as
   well as possible. This especially means that if the local metacache already
   has a copy of the indexes, they can be used to provide access to user's
   emails even if the object storage is unavailable.


.. dovecot_plugin:setting:: obox_allow_nonreproducible_uids
   :added: 2.3.6
   :default: no
   :plugin: obox
   :values: @boolean


   Normally Dovecot attempts to make sure that IMAP UIDs aren't lost even if
   a backend crashes (or if user is moved to another backend without indexes
   first being uploaded). This requires uploading index bundles whenever
   expunging recently saved mails. Setting this to "yes" avoids this extra
   index bundle upload at the cost of potentially changing IMAP UIDs. This
   could cause caching IMAP clients to become confused, possibly even causing
   it to delete wrong mails.  Also FTS indexes may become inconsistent since
   they also rely on UIDs.


.. dovecot_plugin:setting:: obox_autofix_storage
   :default: no
   :plugin: obox
   :values: @boolean

   If activated, when an unexpected 404 is found when retrieving a message
   from object storage, Dovecot will rescan the mailbox by listing its
   objects. If the 404-object is still listed in this query, Dovecot issues a
   HEAD to determine if the message actually exists. If this HEAD request
   returns a 404, the message is dropped from the index. The message object is
   not removed from the object storage.


.. dovecot_plugin:setting:: obox_avoid_cached_vsize
   :default: no
   :plugin: obox
   :values: @boolean

   Avoid getting the email's size from the cache whenever the email body is
   opened anyway. This avoid unnecessary errors if a lot of the vsizes are
   wrong. The vsize in dovecot.index is also automatically updated to the
   fixed value with or without this setting.

   This setting was mainly useful due to earlier bugs that caused the vsize to
   be wrong in many cases.


.. dovecot_plugin:setting:: obox_disable_fast_copy
   :default: no
   :plugin: obox
   :values: @boolean

   Workaround for object storages with a broken copy operation. Instead
   perform copying by reading and writing the full object.


.. dovecot_plugin:setting:: obox_dont_use_object_ids
   :added: 2.3.0
   :default: no
   :plugin: obox
   :values: @boolean

   This is the reverse of :dovecot_plugin:ref:`obox_use_object_ids` with
   newer Dovecot versions. See its description for more details.


.. dovecot_plugin:setting:: obox_fetch_lost_mails_as_empty
   :default: no
   :plugin: obox
   :seealso: @storage_workarounds
   :values: @boolean

   Cassandra: `Object exists in dict, but not in storage` errors will be
   handled by returning empty emails to the IMAP client. The tagged FETCH
   response will be ``OK`` instead of ``NO``.


.. dovecot_plugin:setting:: obox_fetch_lost_mailbox_prefix
   :default: recovered-lost-folder-
   :plugin: obox
   :values: @string

   If folder name is lost entirely due to lost index files, generate a name
   for the folder using this prefix.


.. dovecot_plugin:setting:: obox_max_rescan_mail_count
   :default: 10
   :plugin: obox
   :values: @uint

   Upload indexes after this many mails have been saved since the last upload.
   A higher value reduces the number of uploads, but increases the number of
   mail downloads to fill the caches after a backend crash.


.. dovecot_plugin:setting:: obox_no_pop3_backend_uidls
   :default: no
   :plugin: obox
   :values: @boolean

   Enable if there are no migrated POP3 UIDLs.  If enabled, don't try to look
   up UIDLs in any situation.


.. dovecot_plugin:setting:: obox_size_missing_action
   :default: warn-read
   :plugin: obox
   :values: read, stat, warn-read

   This setting controls what should be done when the mail object is missing
   the size metadata.

   Options:

   ============== ============================================================
   Value          Description
   ============== ============================================================
   ``read``       Same as ``warn-read``, but doesn't log a warning.
   ``stat``       Use fs_stat() to get the size, which is the fastest but
                  doesn't work if mails are compressed or encrypted.
   ``warn-read``  Log a warning and fallback to reading the email to calculate
                  its size.
   ============== ============================================================


.. dovecot_plugin:setting:: obox_use_object_ids
   :default: no
   :plugin: obox
   :removed: v2.3.0
   :values: @boolean

   Access objects directly via their IDs instead of by paths, if possible.
   This can bypass index lookups with Scality CDMI and fs-dictmap/Cassandra.

   This setting was removed from v2.3 and made the default. (Although there is
   :dovecot_plugin:ref:`obox_dont_use_object_ids` to disable it if really
   needed.)


.. dovecot_plugin:setting:: obox_username
   :default: @mail_location;dovecot_core
   :plugin: obox
   :values: @string

   Overrides the obox username in storage.
