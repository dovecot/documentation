.. _unified_quota_configuration:

===========================
Unified Quota Configuration
===========================

Unified quota is only available as part of :ref:`ox_dovecot_pro`.

Unified quota plugin is a combined count and dict plugin, which uses
quota:count to keep tabs of local quota and dict lookups to maintain external
usage. When quota usage is looked up, it will count local quota usage
and increment that with the other product(s) in dict.

Required OX Dovecot Pro Packages:

- ``dovecot-ee-cassandra-plugin``    (*relies on Dovecot 3rd party repo*)
- ``dovecot-ee-quota-unified-plugin``

Cassandra Schema
----------------

Create the unified quota schema:

.. code-block:: bash

  cqlsh < unified_quota_scheme.cql


using ``unified_quota_scheme.cql``:

.. code-block:: none

  CREATE KEYSPACE IF NOT EXISTS quota
    WITH REPLICATION = { 'class': 'SimpleStrategy', 'replication_factor': '1' } 
    AND durable_writes = true;

  USE quota;
  CREATE TABLE quota.quota_usage (
      ox_id text,
      type text,
      count bigint,
      usage bigint,
      PRIMARY KEY (ox_id, type)
    ) WITH CLUSTERING ORDER BY (type ASC)
    AND bloom_filter_fp_chance = 0.01
    AND caching = { 'keys':'ALL', 'rows_per_partition':'NONE' }
    AND comment = ''
    AND compaction = { 'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy' }
    AND compression = { 'sstable_compression': 'org.apache.cassandra.io.compress.LZ4Compressor' }
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99.0PERCENTILE';

In your ``dovecot.conf`` you must enable the ``quota_unified`` plugin and
configure the ``dict`` service:

.. code-block:: none

  # Add dict-async socket which provides access to cassandra
  service dict-async {
    unix_listener dict-async {
      user = vmail
    }
    vsz_limit = 0
  }

  # Add "service dict"
  service dict {
    unix_listener dict {
      mode = 0600
      user = vmail
    }
    vsz_limit = 0
  }

  # Add the Cassandra mappings
  dict_server {
    dict cassandra {
      driver = sql
      sql_driver = cassandra
      cassandra {
        hosts = 1.2.3.4
	keyspace = quota
      }

      dict_map priv/quota/messages/$product {
	sql_table = quota_usage
	username_field = ox_id
	value count {
	  type = uint
	}
	field type {
	  pattern = $product
	}
      }

      dict_map priv/quota/storage/$product {
	sql_table = quota_usage
	username_field = ox_id
	value usage {
	  type = uint
	}
	field type {
	  pattern = $product
	}
      }
    }
  }

  # Add "quota_unified" to your mail_plugins
  mail_plugins {
    quota_unified = yes
  }

  # Add the unified quota plugin (configured to use Cassandra "dict" driver)
  plugin {
    quota = unified:User quota::no-unset:proxy:dict-async:cassandra
  }
