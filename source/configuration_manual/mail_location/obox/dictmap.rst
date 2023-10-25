.. _dictmap_configuration:

========================
fs-dictmap Configuration
========================

Using obox with Cassandra is done via the fs-dictmap wrapper, which translates
internal "lib-fs paths" into dict API. The dict API paths in turn are
translated to SQL/CQL queries via dict-sql.

Cassandra requires installing dovecot-ee-cassandra-plugin package and the
cpp-driver from 3rdparty repository. See :ref:`ox_dovecot_pro` for further
details.

The fs-dictmap syntax is:

  .. code-block:: none

    dictmap:<dict uri> ; <parent fs uri>[ ; <dictmap settings>]

For <dict uri> you can use any of the Dovecot :ref:`dictionary <dict>` drivers.

.. Note:: The delimiter between the dictmap configuration components is ‘ ; ‘ (<SPACE><SEMICOLON><SPACE>). The spaces before and after the semicolon are necessary; otherwise Dovecot will emit a syntax error and exit.

.. Note:: Cassandra support is done via SQL dict, because Cassandra CQL is implemented as a lib-sql driver.

Obox should work with Cassandra v2.1, v2.2 or v3.x. A recent v3.x release is recommended.

.. _dictmap_example_configuration:

Cassandra/sproxyd Example Configuration
---------------------------------------

.. code-block:: none

   mail_location = obox:%u:INDEX=~/:CONTROL=~/

   fs_sproxyd_url = http://sproxyd.scality.example.com/
   fs_sproxyd_class = 2
   fs_http_reason_header_max_length = 200
   fs_compress_write_method = zstd
   obox {
     fs_driver = fscache
     fs_fscache_size = 512M
     fs_fscache_path = /var/cache/mails/%4Nu
     fs_parent {
       fs_driver = dictmap
       dict_driver = proxy
       dict_proxy_name = cassandra
       dict_proxy_socket_path = dict-async
       #fs_dictmap_lock_path = /tmp # Set only without lazy_expunge plugin
       fs_parent {
	 fs_driver = sproxyd
       }
     }
   }
   metacache {
     fs_driver = compress
     fs_parent {
       fs_driver = dictmap
       dict_driver = proxy
       dict_proxy_name = cassandra
       dict_proxy_socket_path = dict-async
       fs_parent {
         fs_driver = sproxyd
       }
     }
   }
   fts_dovecot {
     fs_driver = fts-cache
     fs_parent {
       fs_driver = fscache
       fs_fscache_size = 512M
       fs_fscache_path = /var/cache/fts/%4Nu
       fs_driver = compress
       fs_parent {
	 fs_driver = dictmap
	 dict_driver = proxy
	 dict_proxy_name = cassandra
	 dict_proxy_socket_path = dict-async
	 fs_dictmap_dict_prefix = %u/fts/
	 fs_parent {
	   fs_driver = sproxyd
	   fs_sproxyd_class = 1
	 }
       }
     }
   }

It's highly recommended to use :ref:`lazy_expunge_plugin` with dictmap.
This allows enabling various optimizations, which otherwise wouldn't be safe.
Note that if autoexpunging is done on the lazy_expunge folder, it must be
larger than any potentially slow object storage operation. For example 15
minutes should be a rather safe minimum.

.. code-block:: none

   mail_plugins = $mail_plugins lazy_expunge
   lazy_expunge_mailbox = DUMPSTER
   namespace inbox {
     mailbox DUMPSTER {
       autoexpunge = 7 days
     }
   }

If lazy_expunge is enabled, Dovecot can avoid Cassandra SELECTs when expunging
mails by using:

.. code-block:: none

   plugin {
     # Enable only if lazy_expunge is enabled:
     obox_track_copy_flags = yes
   }

The Cassandra cpp-driver library requires a lot of VSZ memory. Make sure dict
process doesn't immediately die out of memory (it may also be visible as
strange crashes at startup) by disabling VSZ limits:

.. code-block:: none

   service dict-async {
     vsz_limit = 0
   }

Usually there should be only a single dict-async process running, because each
process creates its own connections to the Cassandra cluster increasing its
load. The Cassandra cpp-driver can use multiple IO threads as well. This is
controlled by the num_threads parameter in the connect setting in
``dovecot-dict-cql.conf.ext``. Each IO thread can handle 32k requests
simultaneously, so usually 1 IO thread is enough. Note that each IO thread
creates more connections to Cassandra, so again it's better not to creates too
many threads unnecessarily. If all the IO threads are full of pending requests,
queries start failing with "All connections on all I/O threads are busy" error.

.. _dictmap_configuration_parameters:

.. _fs-dictmap:

FS-dictmap Settings
-------------------

.. dovecot_plugin:setting:: fs_dictmap_bucket_cache_path
   :plugin: obox
   :values: @string
   :default: <empty>, :dovecot_plugin:ref:`obox` { %{home}/buckets.cache }

   Required when bucket-size is set. Bucket counters are cached in this file.
   This path should be located under the obox indexes directory (on the SSD
   backed cache mount point; e.g. ``%h/buckets.cache``).


.. dovecot_plugin:setting:: fs_dictmap_dict_prefix
   :plugin: obox
   :values: @string

   Prefix that is added to all dict keys.


.. dovecot_plugin:setting:: fs_dictmap_lock_path
   :plugin: obox
   :values: @string

   If :dovecot_plugin:ref:`fs_dictmap_refcounting_table` is enabled, use this directory
   for creating lock files to objects while they're being copied or deleted.
   This attempts to prevent race conditions where an object copy and delete
   runs simultaneously and both succeed, but the copied object no longer
   exists. This can't be fully prevented if different servers do this
   concurrently. If lazy_expunge is used, this setting isn't really needed,
   because such race conditions are practically nonexistent. Not using the
   setting will improve performance by avoiding a Cassandra SELECT when
   copying mails.


.. dovecot_plugin:setting:: fs_dictmap_storage_objectid_prefix
   :plugin: obox
   :values: @string
   :seealso: fs_dictmap_storage_passthrough_paths;obox

   Use fake object IDs with object storage that internally uses paths. This
   makes their performance much better, since it allows caching object IDs in
   Dovecot index files and copying them via dict. This works by storing objects
   in ``<prefix>/<objectid>``. This setting should be used inside
   :dovecot_plugin:ref:`obox` named filter for storing mails under ``<prefix>``
   (but not for metacache or fts). For example
   ``fs_dictmap_storage_objectid_prefix = %u/mails/``


.. dovecot_plugin:setting:: fs_dictmap_storage_objectid_migrate
   :plugin: obox
   :values: @boolean
   :default: no

   This is expected to be used with storage-objectid-prefix when adding
   fs-dictmap for an existing installation. The newly created object IDs have
   ``<storage-objectid-prefix>/<object-id>`` path while the migrated object IDs
   have ``<user>/mailboxes/<mailbox-guid>/<oid>`` path. The newly created object
   IDs can be detected from the 0x80 bit in the object ID's extra-data.
   Migrated object IDs can't be copied directly within dict - they'll be first
   copied to a new object ID using the parent fs.


.. dovecot_plugin:setting:: fs_dictmap_storage_passthrough_paths
   :plugin: obox
   :values: none, full, read-only
   :default: none
   :seealso: fs_dictmap_storage_objectid_prefix;obox

   Use fake object IDs with object storage that internally uses path. Assume
   that object ID is the same as the path. Objects can't be copied within the
   dict. This setting should be used inside :dovecot_plugin:ref:`metacache` and
   :dovecot_plugin:ref:`fts_dovecot` named filters, because they don't need to support
   copying objects. For mails, use
   :dovecot_plugin:ref:`fs_dictmap_storage_objectid_prefix` instead.

   * With "full" the object ID is written to dict as an empty value (because
     it's not used).
   * The "read-only" can be used for backwards compatibility so that the path
     is still written to the dict as the object ID, even though it's not used
     (except potentially by an older Dovecot version).


.. dovecot_plugin:setting:: fs_dictmap_delete_timestamp
   :plugin: obox
   :values: @time_msecs
   :default: 10s

   Increase Cassandra's DELETE timestamp by this much. This is useful to
   make sure the DELETE isn't ignored because Dovecot backends' times are
   slightly different.


.. dovecot_plugin:setting:: fs_dictmap_bucket_size
   :plugin: obox
   :values: @uint
   :default: 0, :dovecot_plugin:ref:`obox` { 10000 }

   Separate email objects into buckets, where each bucket can have a maximum of
   this many emails. This should be set to 10000 with Cassandra to avoid the
   partition becoming too large when there are a lot of emails.


.. dovecot_plugin:setting:: fs_dictmap_bucket_deleted_days
   :plugin: obox
   :values: @uint
   :default: 0, :dovecot_plugin:ref:`obox` { 11 }

   Track Cassandra's tombstones in ``buckets.cache`` file to avoid creating
   excessively large buckets when a lot of mails are saved and deleted in a
   folder. The value should be one day longer than ``gc_grace_seconds`` for the
   ``user_mailbox_objects`` table. By default this is 10 days, so in that case
   ``fs_dictmap_bucket_deleted_days = 11`` should be used. When determining
   whether :dovecot_plugin:ref:`fs_dictmap_bucket_size` is reached and a new one needs to
   be created, with this setting the tombstones are also taken into account.
   This tracking is preserved only as long as the ``buckets.cache`` exists.


.. dovecot_plugin:setting:: fs_dictmap_nlinks_limit
   :plugin: obox
   :values: @uint
   :default: 0, :dovecot_plugin:ref:`obox` { 3 }

   Defines the maximum number of results returned from a dictionary iteration
   lookup (i.e. Cassandra CQL query) when checking the number of links to an
   object. Limiting this may improve performance. Currently Dovecot only cares
   whether the link count is 0, 1 or "more than 1" so for a bit of extra safety
   we recommend setting it to 3.


.. dovecot_plugin:setting:: fs_dictmap_max_parallel_iter
   :plugin: obox
   :values: @uint
   :default: 10
   :changed: 3.0.0 Increased default from 1 to 10.

   Describes how many parallel dict iterations can be created internally. The
   default value is 10. Parallel iterations can especially help speed up
   reading huge folders.


.. dovecot_plugin:setting:: fs_dictmap_refcounting_index
   :plugin: obox
   :values: @boolean
   :seealso: fs_dictmap_refcounting_table;obox
   :default: no

   Similar to the :dovecot_plugin:ref:`fs_dictmap_refcounting_table` setting, but
   instead of using a reverse table to track the references, assume that the
   database has a reverse index set up.


.. dovecot_plugin:setting:: fs_dictmap_refcounting_table
   :plugin: obox
   :values: @boolean
   :default: no, :dovecot_plugin:ref:`obox` { yes }

   Enable reference counted objects. Reference counting allows a single mail
   object to be stored in multiple mailboxes, without the need to create a new
   copy of the message data in object storage. See
   :ref:`dictmap_cassandra_refcounting_table`


.. dovecot_plugin:setting:: fs_dictmap_diff_table
   :plugin: obox
   :values: @boolean
   :default: no, :dovecot_plugin:ref:`metacache` { yes }

   Store diff & self index bundle objects to a separate table. This is a
   Cassandra-backend optimization. See :ref:`dictmap_cassandra_diff_table`


.. dovecot_plugin:setting:: fs_dictmap_delete_dangling_links
   :plugin: obox
   :values: @boolean
   :default: no

   If an object exists in dict, but not in storage, delete it automatically from
   dict when it's noticed. This setting isn't safe to use by default, because
   storage may return "object doesn't exist" errors only temporarily during
   split brain.


.. dovecot_plugin:setting:: fs_dictmap_cleanup_uncertain
   :plugin: obox
   :values: @boolean
   :default: yes

   If a write to Cassandra fails with uncertainty
   (:ref:`dictmap_cassandra_uncertain_writes`) Dovecot attempts to clean it up.


Dict paths
----------

The fs-dictmap uses the following dict paths:

shared/dictmap/<path>: This is the main access

If refcounting-table is used:

* shared/dictrevmap/<user>/mailboxes/<folder guid>/<object id>: For adding new references.

* shared/dictrevmap/<object id>/<object name>: For deleting

* shared/dictrevmap/<object id>: For lookups if any object references exist after deletion.

If diff-table is used:

* shared/dictdiffmap/<user>/idx/<host>: Latest self/diff bundle for the user created by the <host>

* shared/dictdiffmap/<user>/mailboxes/<folder guid>/idx/<host>: Latest self/diff bundle for the folder created by the <host>

.. toctree::
   :maxdepth: 1

   dictmap_cassandra
