.. _dictmap_cassandra_configuration:

==================================
fs-dictmap/Cassandra Configuration
==================================

To use obox with Cassandra, the dovecot-ee-cassandra-plugin package must be installed. This package relies on several dependent packages stored in the Dovecot 3rd party repository, so that repository must be available. See :ref:`ox_dovecot_pro_releases` for further details.

The username part in mail_location must not use any username hashing or the dict mapping doesn't work correctly. So use:

.. code-block:: none
   
   mail_location = obox:%u:INDEX=~/:CONTROL=~/

Reference counting should be enabled for emails, but it's not needed for index/FTS objects. For use with Scality sproxyd, dovecot.conf would look something like:

.. code-block:: none

   plugin {
     obox_fs = fscache:1G:/var/cache/mails:dictmap:proxy:dict-async:cassandra ; sproxyd:http://sproxyd.scality.example.com/?class=2 ; refcounting-table:lockdir=/tmp:bucket-size=10000:bucket-cache=%h/buckets.cache:nlinks-limit=3
     obox_index_fs = compress:gz:6:dictmap:proxy:dict-async:cassandra ; sproxyd:http://sproxyd.scality.example.com/?class=2 ; diff-table
     fts_dovecot_fs = fts-cache:fscache:1G:/var/cache/mails:compress:gz:6:dictmap:proxy:dict-async:cassandra ; sproxyd:http://sproxyd.scality.example.com/?class=1 ; dict-prefix=%u/fts/
   }

The nlinks-limit setting defines the maximum number of results returned from a dictionary iteration lookup (e.g. Cassandra CQL query) when checking the number of links to an object. Limiting this may improve performance. Currently Dovecot only cares whether the link count is 0, 1 or "more than 1" so for a bit of extra safety we recommend 3.

The Cassandra cpp-driver library requires a lot of VSZ memory. Make sure dict process doesn't immediately die out of memory (it may also be visible as strange crashes at startup) by disabling VSZ limits.

.. code-block:: none
   
   service dict {
     vsz_limit = 0
   }
   service dict-async {
     vsz_limit = 0
   }

The number of dict-async processes depends on how heavily the system is being used. For maximum scalability the number of dict-async processes could be equal to the number of CPU cores in the system. However, this uses up more memory and creates more connections towards Cassandra, which increases Cassandra's load. It's likely enough to use just a single dict-async process, but if its CPU usage grows too much it may be necessary to increase the number of processes. Note that dict-async uses multiple threads and only the CPU usage in the main thread should be tracked for the purpose of increasing the number of processes. The other threads are IO threads created by the Cassandra library and their number is controlled by the num_threads parameter in the connect setting in dovecot-dict-cql.conf.ext. The default number of IO threads is 1 where each one can handle 32k requests simultaneously. Each IO thread creates more connections to Cassandra, so again it's better not to creates too many threads unnecessarily. If all the IO threads are full of pending requests, queries start failing with "All connections on all I/O threads are busy" error.

.. code-block:: none

   service dict-async {
     process_min_avail = 1 # Increase this only if a single process becomes a bottleneck
   }
