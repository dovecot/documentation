.. _dictmap_configuration:

========================
fs-dictmap Configuration
========================

Using obox with Cassandra is done via the fs-dictmap wrapper, which translates
internal "lib-fs paths" into dict API. The dict API paths in turn are
translated to SQL/CQL queries via dict-sql.

Cassandra requires installing dovecot-ee-cassandra-plugin package and the
cpp-driver from 3rdparty repository. See :ref:`ox_dovecot_pro_releases`
for further details.

The fs-dictmap syntax is:

  .. code-block:: none

    dictmap:<dict uri> ; <parent fs uri>[ ; <dictmap settings>]

 For <dict uri> you can use any of the Dovecot dict drivers as specified by http://wiki.dovecot.org/Dictionary.

.. Note:: The delimiter between the dictmap configuration components is ‘ ; ‘ (<SPACE><SEMICOLON><SPACE>). The spaces before and after the semicolon are necessary; otherwise Dovecot will emit a syntax error and exit.

.. Note:: Cassandra support is done via SQL dict, because Cassandra CQL is implemented as a lib-sql driver.

Obox should work with Cassandra v2.1, v2.2 or v3.x. A recent v3.x release is recommended.

.. _dictmap_example_configuration:

Cassandra/sproxyd Example Configuration
---------------------------------------

.. code-block:: none

   mail_location = obox:%u:INDEX=~/:CONTROL=~/
   plugin {
     # Without lazy_expunge plugin:
     obox_fs = fscache:512M:/var/cache/mails/%4Nu:dictmap:proxy:dict-async:cassandra ; sproxyd:http://sproxyd.scality.example.com/?class=2&reason_header_max_length=200 ; refcounting-table:lockdir=/tmp:bucket-size=10000:bucket-cache=%h/buckets.cache:nlinks-limit=3:delete-timestamp=+10s:bucket-deleted-days=11
     # With lazy_expunge plugin:
     #obox_fs = fscache:512M:/var/cache/mails/%4Nu:dictmap:proxy:dict-async:cassandra ; sproxyd:http://sproxyd.scality.example.com/?class=2&reason_header_max_length=200 ; refcounting-table:bucket-size=10000:bucket-cache=%h/buckets.cache:nlinks-limit=3:delete-timestamp=+10s:bucket-deleted-days=11

     obox_index_fs = compress:gz:6:dictmap:proxy:dict-async:cassandra ; sproxyd:http://sproxyd.scality.example.com/?class=2&reason_header_max_length=200 ; diff-table
     fts_dovecot_fs = fts-cache:fscache:512M:/var/cache/fts/%4Nu:compress:gz:6:dictmap:proxy:dict-async:cassandra ; sproxyd:http://sproxyd.scality.example.com/?class=1&reason_header_max_length=200 ; dict-prefix=%u/fts/
   }

It's highly recommended to use :ref:`lazy_expunge_plugin` with dictmap.
This allows enabling various optimizations, which otherwise wouldn't be safe.
Note that if autoexpunging is done on the lazy_expunge folder, it must be
larger than any potentially slow object storage operation. For example 15
minutes should be a rather safe minimum.

.. code-block:: none

   mail_plugins = $mail_plugins lazy_expunge
   plugin {
     lazy_expunge = DUMPSTER
   }
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

Dictmap Parameters
------------------

+---------------------------------+------------------------------------------------------------------------------+
| Parameter                       | Description                                                                  |
+---------------------------------+------------------------------------------------------------------------------+
| refcounting-table	          | Enable reference counted objects. Reference counting allows a single mail    |
|                                 | object to be stored in multiple mailboxes, without the need to create a new  |
|                                 | copy of the message data in object storage. See                              |
|                                 | :ref:`dictmap_cassandra_refcounting_table`                                   |
+---------------------------------+------------------------------------------------------------------------------+
| lockdir=<path>                  | If refcounting is enabled, use this directory for creating lock files to     |
|                                 | objects while they're being copied or deleted. This attempts to prevent race |
|                                 | conditions where an object copy and delete runs simultaneously and both      |
|                                 | succeed, but the copied object no longer exists. This can't be fully         |
|                                 | prevented if different servers do this concurrently. If lazy_expunge is used,|
|                                 | this setting isn't really needed, because such race conditions are           |
|                                 | practically nonexistent. Not using the setting will improve performance by   |
|                                 | avoiding a Cassandra SELECT when copying mails.                              |
+---------------------------------+------------------------------------------------------------------------------+
| diff-table	                  | Store diff & self index bundle objects to a separate table. This is a        |
|                                 | Cassandra-backend optimization. See :ref:`dictmap_cassandra_diff_table`      |
+---------------------------------+------------------------------------------------------------------------------+
| delete-dangling-links	          | If an object exists in dict, but not in storage, delete it automatically from|
|                                 | dict when it's noticed. This setting isn't safe to use by default, because   |
|                                 | storage may return "object doesn't exist" errors only temporarily during     |
|                                 | split brain.                                                                 |
+---------------------------------+------------------------------------------------------------------------------+
| bucket-size=<n>	          | Separate email objects into buckets, where each bucket can have a maximum of |
|                                 | <n> emails. This should be set to 10000 with Cassandra to avoid the partition|
|                                 | becoming too large when there are a lot of emails.                           |
+---------------------------------+------------------------------------------------------------------------------+
| bucket-deleted-days=<days>      | Track Cassandra's tombstones in buckets.cache file to avoid creating         |
|                                 | excessively large buckets when a lot of mails are saved and deleted in a     |
|                                 | folder. The <days> should be one day longer than gc_grace_seconds for the    |
|                                 | user_mailbox_objects table.By default this is 10 days, so in that case       |
|                                 | bucket-deleted-days=11 should be used.When determining whether bucket-size is|
|                                 | reached and a new one needs to be created, with this setting the tombstones  |
|                                 | are also taken into account. This tracking is preserved only as long as the  |
|                                 | buckets.cache exists. It's also not attempted to be preserved when moving    |
|                                 | users between backends. This means that it doesn't work perfectly in all     |
|                                 | situations, but it should still be good enough to prevent the worst offenses.|
+---------------------------------+------------------------------------------------------------------------------+
| bucket-cache=<path>	          | Required when bucket-size is set. Bucket counters are cached in this file.   |
|                                 | This path should be located under the obox indexes directory (on the SSD     |
|                                 | backed cache mount point; e.g. %h/buckets.cache)                             |
+---------------------------------+------------------------------------------------------------------------------+
| nlinks-limit=<n>                | Defines the maximum number of results returned from a dictionary iteration   |
|                                 | lookup (i.e. Cassandra CQL query) when checking the number of links to an    |
|                                 | object. Limiting this may improve performance. Currently Dovecot only cares  |
|                                 | whether the link count is 0, 1 or "more than 1" so for a bit of extra safety |
|                                 | we recommend nlinks-limit=3.                                                 |
+---------------------------------+------------------------------------------------------------------------------+
| delete-timestamp=+<:ref:`time`> | Increase Cassandra's DELETE timestamp by this much. This is useful to        |
|                                 | make sure the DELETE isn't ignored because Dovecot backends' times are       |
|                                 | slightly different. Recommendation is to use delete-timestamp=+10s           |
+---------------------------------+------------------------------------------------------------------------------+
| storage-objectid-prefix=<prefix>| Use fake object IDs with object storage that internally uses paths. This     |
|                                 | makes their performance much better, since it allows caching object IDs in   |
|                                 | Dovecot index files and copying them via dict. This works by storing objects |
|                                 | in <prefix>/<objectid>. This setting should be used in obox_fs for storing   |
|                                 | mails under <prefix>. For example storage-objectid-prefix=%u/mails/          |
|                                 |                                                                              |
|                                 | .. versionadded:: v2.3.2.1                                                   |
+---------------------------------+------------------------------------------------------------------------------+
| storage-passthrough-paths=      | Use fake object IDs with object storage that internally uses path. Assume    |
| full|read-only                  | that object ID is the same as the path. Objects can't be copied within the   |
|                                 | dict. This setting should be used for obox_index_fs and fts_dovecot_fs,      |
|                                 | because they don't need to support copying objects.                          |
|                                 |                                                                              |
|                                 | * With "full" the object ID is written to dict as an empty value (because    |
|                                 |   it's not used).                                                            |
|                                 | * The "read-only" can be used for backwards compatibility so that the path   |
|                                 |   is still written to the dict as the object ID, even though it's not used   |
|                                 |   (except potentially by an older Dovecot version).                          |
|                                 |                                                                              |
|                                 | .. versionadded:: v2.3.2.1                                                   |
+---------------------------------+------------------------------------------------------------------------------+
| storage-objectid-migrate        | This is expected to be used with storage-objectid-prefix when adding         |
|                                 | fs-dictmap for an existing installation. The newly created object IDs have   |
|                                 | <storage-objectid-prefix>/<object-id> path while the migrated object IDs     |
|                                 | have <user>/mailboxes/<mailbox-guid>/<oid> path. The newly created object    |
|                                 | IDs can be detected from the 0x80 bit in the object ID's extra-data.         |
|                                 | Migrated object IDs can't be copied directly within dict - they'll be first  |
|                                 | copied to a new object ID using the parent fs.                               |
|                                 |                                                                              |
|                                 | .. versionadded:: v2.3.2.1                                                   |
+---------------------------------+------------------------------------------------------------------------------+
| max-parallel-iter=<n>           | Describes how many parallel dict iterations can be created internally. The   |
|                                 | default value is 1. Parallel iterations can especially help speed up reading |
|                                 | huge folders.                                                                |
|                                 |                                                                              |
|                                 | .. versionadded:: v2.3.10                                                    |
+---------------------------------+------------------------------------------------------------------------------+

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
