.. _sql-cassandra:

=====================
SQL Driver: Cassandra
=====================

Driver name ``cassandra``.

Driver for Apache Cassandra CQL server.

To compile support for this driver, you need to have DataStax C/C++ driver and headers installed.

Supported Options
=================

.. dovecot_core:setting:: cassandra_connect_timeout
   :default: 5s
   :domain: sql-cassandra
   :values: @time_msecs

   Connection timeout.


.. dovecot_core:setting:: cassandra_debug_queries
   :default: no
   :domain: sql-cassandra
   :values: @boolean

   Whether to log CQL queries.

.. dovecot_core:setting:: cassandra_delete_consistency
   :default: local-quorum
   :domain: sql-cassandra
   :seealso: @dictmap_cassandra_quorum_configuration
   :values: !:ref:`cassandra_consistency`

   Write consistency when deleting from the database.


.. dovecot_core:setting:: cassandra_delete_fallback_consistency
   :default: local-quorum
   :domain: sql-cassandra
   :seealso: @dictmap_cassandra_fallback_consistency
   :values: !:ref:`cassandra_consistency`

   Write consistency when deleting from the database fails with primary
   consistency.


.. dovecot_core:setting:: cassandra_execution_retry_interval
   :default: 0
   :domain: sql-cassandra
   :seealso: !https://docs.datastax.com/en/developer/java-driver/4.13/manual/core/speculative_execution/
   :values: @time_msecs

   If the driver supports speculative execution policy, configures constant
   speculative execution policy.


.. dovecot_core:setting:: cassandra_execution_retry_times
   :default: 0
   :domain: sql-cassandra
   :seealso: !https://docs.datastax.com/en/developer/java-driver/4.13/manual/core/speculative_execution/
   :values: @time_msecs

   If the driver supports speculative execution policy, configures constant
   speculative execution policy.


.. dovecot_core:setting:: cassandra_heartbeat_interval
   :default: 30s
   :domain: sql-cassandra
   :values: @time

   How often to send keepalive packets to cassandra nodes.


.. dovecot_core:setting:: cassandra_hosts
   :domain: sql-cassandra
   :values: @boollist

   List of hosts or IP addresses to connect.


.. dovecot_core:setting:: cassandra_idle_timeout
   :default: 0
   :domain: sql-cassandra
   :values: @time_msecs

   How long to idle before disconnecting.


.. dovecot_core:setting:: cassandra_keyspace
   :domain: sql-cassandra
   :values: @string

   Specifies the keyspace name to use.


.. dovecot_core:setting:: cassandra_latency_aware_routing
   :default: no
   :domain: sql-cassandra
   :values: @boolean

   When turned on, latency-aware routing tracks the latency of queries to
   avoid sending new queries to poorly performing Cassandra nodes.

.. dovecot_core:setting:: cassandra_log_level
   :default: warn
   :domain: sql-cassandra
   :values: critical, error, warn, info, debug, trace

   Driver log level.


.. dovecot_core:setting:: cassandra_metrics_path
   :domain: sql-cassandra
   :seealso: @cassandra_metrics_json_output
   :values: string

   Path where to write JSON metrics.


.. dovecot_core:setting:: cassandra_io_thread_count
   :default: !<driver dependent>
   :domain: sql-cassandra
   :values: @uint

   Set number of IO threads to handle query requests.


.. dovecot_core:setting:: cassandra_page_size
   :default: 0
   :domain: sql-cassandra
   :values: @uint

   When a query returns many rows, it can be sometimes inefficient to return
   them as a single response message. Instead, the driver can break the
   results into pages which get returned as they are needed.

   This setting controls the size of each page.

   Set to ``0`` to disable.


.. dovecot_core:setting:: cassandra_password
   :domain: sql-cassandra
   :values: @string

   Password for authentication.


.. dovecot_core:setting:: cassandra_port
   :default: 9042
   :domain: sql-cassandra
   :values: @uint

   CQL port to use.


.. dovecot_core:setting:: cassandra_read_consistency
   :default: local-quorum
   :domain: sql-cassandra
   :seealso: @dictmap_cassandra_quorum_configuration
   :values: !:ref:`cassandra_consistency`

   Read consistency.


.. dovecot_core:setting:: cassandra_read_fallback_consistency
   :default: local-quorum
   :domain: sql-cassandra
   :seealso: @dictmap_cassandra_fallback_consistency
   :values: !:ref:`cassandra_consistency`

   Read consistency if primary consistency fails.


.. dovecot_core:setting:: cassandra_request_timeout
   :default: 60s
   :domain: sql-cassandra
   :values: @time_msecs

   How long to wait for a query to finish.


.. dovecot_core:setting:: cassandra_ssl
   :default: no
   :domain: sql-cassandra
   :values: @boolean

   Whether to use SSL when connecting to Cassandra. Configure it using the
   ``ssl_client_*`` settings.


.. dovecot_core:setting:: cassandra_user
   :domain: sql-cassandra
   :values: @string

   Username for authentication.


.. dovecot_core:setting:: cassandra_protocol_version
   :default: !Depends on driver version.
   :domain: sql-cassandra
   :values: 3, 4, 5

   Cassandra protocol version to use. It is good idea to specify this to avoid
   warnings about version handshake if the driver supports a higher protocol
   version than the server.

   .. note:: If you want to use server-side prepared statements, you need to
             use at least ``4``.


.. dovecot_core:setting:: cassandra_warn_timeout
   :default: 5s
   :domain: sql-cassandra
   :values: @time_msecs

   Emit warning if query takes longer than this.


.. dovecot_core:setting:: cassandra_write_consistency
   :default: local-quorum
   :domain: sql-cassandra
   :seealso: @dictmap_cassandra_quorum_configuration
   :values: !:ref:`cassandra_consistency`

   Write consistency when updating or inserting to the database.


.. dovecot_core:setting:: cassandra_write_fallback_consistency
   :default: local-quorum
   :domain: sql-cassandra
   :seealso: @dictmap_cassandra_fallback_consistency
   :values: !:ref:`cassandra_consistency`

   Write consistency when updating or inserting to the database fails with
   primary consistency.


.. _cassandra_consistency:

Cassandra Consistency Values
============================

Consistency levels in Cassandra can be configured to manage availability versus data accuracy.

Read Consistency
----------------

For read consistency the following values are supported:

``any``
  Not supported for reads.

``local-serial``
  Allows reading the current (and possibly uncommitted) state of data without proposing a new addition or update.
  If a ``SERIAL`` read finds an uncommitted transaction in progress, it will commit the transaction as part of the read.
  Local serial is confined to datacenter.

``serial``
  Allows reading the current (and possibly uncommitted) state of data without proposing a new addition or update.
  If a ``SERIAL`` read finds an uncommitted transaction in progress, it will commit the transaction as part of the read.

``one``
  Returns a response from the closest replica, as determined by the snitch.

``two``
  Returns the most recent data from two of the closest replicas.

``three``
  Returns the most recent data from three of the closest replicas.

``local-quorum``
  Returns the record after a quorum of replicas in the current datacenter as the coordinator has reported.

``quorum``
  Returns the record after a quorum of replicas from all datacenters has responded.

``each-quorum``
  Not supported for reads.

``all``
  Returns the record after all replicas have responded. The read operation will fail if a replica does not respond.

Write/Delete Consistency
------------------------

For write and delete consistency the following values are supported:

``any``
  At least one node must succeed in the operation.

``local-serial``
  Not supported for writes.

``serial``
  Not supported for writes.

``one``
  Operation must be at least in commit log and one memory table of one replica.

``two``
  Operation must be at least in commit log and one memory table of two replicas.

``three``
  Operation must be at least in commit log and one memory table of three replicas.

``local-quorum``
  A write must be written to the commit log and memory table on a quorum of replica nodes in the same datacenter as the coordinator.

``quorum``
  A write must be written to the commit log and memory table on a quorum of replica nodes across all datacenters.

``each-quorum``
  A write must be written to the commit log and memory table on a quorum of replica nodes in each datacenter.

``all``
  A write must be written to the commit log and memtable on all replica nodes in the cluster for that partition.
