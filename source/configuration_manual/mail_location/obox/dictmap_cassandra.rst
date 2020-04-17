.. _dictmap_cassandra:

=========================
fs-dictmap with Cassandra
=========================

dovecot.conf:

.. code-block:: none

   dict {
    cassandra = cassandra:/etc/dovecot/dovecot-dict-cql.conf.ext
   }

dovecot-dict-cql.conf.ext:

.. code-block:: none

   # Location of Cassandra Server(s)
   # ALL local Cassandra nodes should be added; the Cassandra driver code uses this list internally to find the initial list of Cassandra nodes.
   # Cassandra will perform load balancing internally among all the local Cassandra nodes (including ones not specified here).
   connect = host=10.2.3.4 \
   host=10.3.4.5 \
   host=10.4.5.6 \
   keyspace=mails \
 
   # Cassandra connection port
   # port=9042 \
 
 
   # User/password authentication
   # user=cassandra_user \
   # password=cassandra_pass \
 
 
   # If this error is seen: "Host x.x.x.x received invalid protocol response Invalid or unsupported protocol version: 4"
   # Add this parameter to force Cassandra protocol downgrade to version 3
   # version=3 \
 
   # For multi-DC consistency on normal operation (see below), add:
   # write_consistency=each-quorum \
   # write_fallback_consistency=local-quorum \
   # delete_consistency=each-quorum \
   # delete_fallback_consistency=local-quorum \
 
   # (v2.2.24+) Connection/Request timeouts
   # connect_timeout=5 \
   # request_timeout=5 \
 
   # (v2.2.24+) Define the number of Cassandra access threads to use
   # num_threads=4 \
 
   # (v2.2.26+) Use latency-aware routing
   # See: http://datastax.github.io/cpp-driver/topics/configuration/#latency-aware-routing
   # latency_aware_routing=y \
 
   # DEBUG: (v2.2.25+) Warning timeouts; if request takes longer than this amount of seconds, log query at WARN level
   # warn_timeout=5 \
 
   # (v2.2.27.2+) Interval between heartbeats to Cassandra server
   # heartbeat_interval=30s \
 
 
   # (v2.2.27.2+) If heartbeat hasn't been received for this long, reconnect to Cassandra.
   # idle_timeout=1min \
 
   # (v2.2.28+) Automatically retry Cassandra queries. By default
   # nothing is currently retried, so these settings should be enabled.
   # how many times and in which intervals the execution is retried on top of the original request sent
   execution_retry_interval=500ms \
   execution_retry_times=3 \
 
   # (v2.2.32+) Cassandra query result paging:  Add page_size=n to dovecot-dict-cql.conf.ext's connect setting.
   # can also add log_level=debug so it logs about each pageful.
   # page_size=500 \
 
   # DEBUG: Set log level
   # log_level=2 \
 
 
   # DEBUG: Output all Cassandra queries to log at DEBUG level
   # debug_queries=y \
 
   # DEBUG: Output internal metrics in JSON format to this file.
   # Format of data can be found at the end of this document.
   # metrics=/tmp/dovecot-cassandra.metrics.%{pid}

The details of how to create the Cassandra tables and the dict mappings that
need to be appended to ``dovecot-dict-cql.conf.ext`` are described in:

 * :ref:`dictmap_cassandra_objectid`
 * :ref:`dictmap_cassandra_path`

The following base tables are always needed by fs-dictmap:

 * user_index_objects
 * user_mailbox_index_objects
 * user_mailbox_objects
 * user_mailbox_buckets
 * user_fts_objects

For more Cassandra details, see:

 * :ref:`cassandra`
 * :ref:`cassandra_replication_factor`
