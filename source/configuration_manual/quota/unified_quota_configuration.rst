.. _unified_quota_configuration:

==================================
 Unified Quota Configuration
==================================

Unified quota plugin is a combined count and dict plugin, which uses quota:count to keep tabs of local quota,
and dict lookups to maintain external usage. When quota usage is looked up, it will count local quota usage
and increment that with the other product(s) in dict.

Required Dovecot Packages:

- ``dovecot-ee-quota-unified-plugin``
- ``dovecot-ee-cassandra-plugin``    (*relies on Dovecot 3rd party repo*)


Casandra Schema:
----------------

Create the unified quota schema:

.. code-block:: bash

        cqlsh < unified_quota_scheme.cql


using ``unified_quota_scheme.cql``:

.. code-block:: none

        CREATE KEYSPACE IF NOT EXISTS quota WITH REPLICATION = {'class': 'SimpleStrategy', 'replication_factor': '1'} AND durable_writes = true;

        USE quota;
        CREATE TABLE quota.quota_usage (
                ox_id text,
                type text,
                count bigint,
                usage bigint,
                PRIMARY KEY (ox_id, type)
        ) WITH CLUSTERING ORDER BY (type ASC)
        AND bloom_filter_fp_chance = 0.01
        AND caching = {'keys':'ALL', 'rows_per_partition':'NONE'}
        AND comment = ''
        AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy'}
        AND compression = {'sstable_compression': 'org.apache.cassandra.io.compress.LZ4Compressor'}
        AND dclocal_read_repair_chance = 0.1
        AND default_time_to_live = 0
        AND gc_grace_seconds = 864000
        AND max_index_interval = 2048
        AND memtable_flush_period_in_ms = 0
        AND min_index_interval = 128
        AND read_repair_chance = 0.0
        AND speculative_retry = '99.0PERCENTILE';

Create a ``dovecot-dict-cql.conf.ext`` file and change the ``host=`` to your Cassandra hosts address. If you named the
keyspace differently also configure it via ``dbname=``.

.. code-block:: none

   connect = host=1.2.3.4  dbname=quota

   map {
           pattern = priv/quota/messages/$product
           table = quota_usage
           username_field = ox_id
           value_field = count
           value_type = uint
           fields {
                type = $product
           }
   }

   map {
           pattern = priv/quota/storage/$product
           table = quota_usage
           username_field = ox_id
           value_field = usage
           value_type = uint
           fields {
           type = $product
           }
   }

In your ``dovecot.conf`` you must enable the ``quota_unified`` plugin and configure the ``dict`` service
with the ``dovecot-dict-cql.conf.ext`` path like below:

.. code-block:: none

   # Valid Dovecot Pro License is required for the quota_unified plugin to work
   #
   license_checksum = </var/lib/dovecot/dovecot-license.txt

   # Add dict-async socket which provides access to cassandra
   #
   service dict-async {
        unix_listener dict-async {
                user = vmail
        }
        vsz_limit = 0
   }

   # Add "service dict" for dovecot-dict-cql.conf.ext integration
   #
   service dict {
        unix_listener dict {
                mode = 0600
                user = vmail
        }
        vsz_limit = 0
   }

   # Add the Cassandra mappings
   #
   dict {
        cassandra = cassandra:/etc/dovecot/dovecot-dict-cql.conf.ext
   }

   # Add "quota_unified" to your mail_plugins
   mail_plugins = $mail_plugins quota_unified

   # Add the unified quota plugin (configured to use Cassandra "dict" driver)
   #
   plugin {
        quota = unified:User quota::no-unset:proxy:dict-async:cassandra
   }
