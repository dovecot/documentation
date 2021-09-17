.. _sql-cassandra:

====================
SQL Driver Cassandra
====================

Driver name ``cassandra``.

Driver for Apache Cassandra CQL server.

To compile support for this driver, you need to have DataStax C/C++ driver and headers installed.

Supported options
=================

``host``
--------
- Default: <empty>
- Values: :ref:`string`

Host or IP address to connect. Can appear multiple times.

``port``
--------
- Default: ``9042``
- Values: :ref:`uint`

CQL port to use.

``keyspace``
------------
- Default: <empty>
- Values: :ref:`string`

Specifies the keyspace name to use.

``dbname``
----------

Alias for ``keyspace``.

``version``
-----------
- Default: Depends on driver version.
- Values: ``v3``, ``v4``, ``v5`` (refer to cassandra manual).

Cassandra driver version to use. It is good idea to specify this to avoid warnings about version handshake.
If you want to use server-side prepared statements, you need to use at least ``v4``.

``user``
--------
- Default: <empty>
- Values: :ref:`string`

Username for authentication.

``password``
------------
- Default: <empty>
- Values: :ref:`string`

Password for authentication.

``ssl_ca``
----------
- Default: <empty>
- Values: :ref:`string`

Path to SSL certificate authority file to use to validate peer certificate.

``ssl_cert_file``
-----------------
- Default: <empty>
- Values: :ref:`string`

Path to a certificate file to use for authenticating against the remote server.

``ssl_private_key_file``
------------------------
- Default: <empty>
- Values: :ref:`string`

Path to private key matching ``ssl_cert_file`` to use for authenticating against the remote server.

``ssl_verify``
---------------
- Default: ``none``
- Values: ``none``, ``cert``, ``cert-ip``, ``cert-dns``

Configure the peer certificate validation method.

``none``
  Disables validation

``cert``
  Validate that the certificate is valid.

``cert-ip``
  Validate that the certificate is valid and has Common Name or Subject Alternate Name for the IP address.

``cert-dns``
   Validate that the certificate is valid and has Common Name or Subject Alternate Name that matches PTR resource record for the server's IP address.

``log_level``
--------------
- Default: ``warn``
- Values: ``critical``, ``error``, ``warn``, ``info``, ``debug``, ``trace``

Driver log level.

``debug_queries``
-----------------
- Default: no
- Values: :ref:`boolean`

Whether to log CQL queries. Note that this setting behaves differently than other boolean settings.
The feature is enabled by presence of the keyword in connect string, so to disable this feature,
you must remove the keyword completely.

``metrics``
-----------
- Default: <empty>
- Values: :ref:`string`

Path where to write JSON metrics.

.. seealso:: :ref:`cassandra_metrics_json_output`

``num_threads``
----------------
- Default: <driver dependent>
- Values: :ref:`uint`

Set number of IO threads to handle query requests.

``page_size``
-------------
- Default: -1
- Values: :ref:`uint`, ``-1`` to disable.

When a query returns many rows, it can be sometimes inefficient to return them as a single response message.
Instead, the driver can break the results into pages which get returned as they are needed.
This setting controls the size of each page.

``read_consistency``
--------------------
- Default: ``local-quorum``
- Values: :ref:`cassandra_consistency`

Read consistency.

.. seealso:: :ref:`dictmap_cassandra_quorum_configuration`.

``read_fallback_consistency``
-----------------------------
- Default: ``local-quorum``
- Values: :ref:`cassandra_consistency`

Read consistency if primary consistency fails.

.. seealso:: :ref:`dictmap_cassandra_fallback_consistency`

``write_consistency``
---------------------
- Default: ``local-quorum``
- Values: :ref:`cassandra_consistency`

Write consistency when updating or inserting to the database.

.. seealso:: :ref:`dictmap_cassandra_quorum_configuration`.

``write_fallback_consistency``
------------------------------
- Default: ``local-quorum``
- Values: :ref:`cassandra_consistency`

Write consistency when updating or inserting to the database fails with primary consistency.

.. seealso:: :ref:`dictmap_cassandra_fallback_consistency`

``delete_consistency``
----------------------
- Default: ``local-quorum``
- Values: :ref:`cassandra_consistency`

Write consistency when deleting from the database.

.. seealso:: :ref:`dictmap_cassandra_quorum_configuration`.

``delete_fallback_consistency``
-------------------------------
- Default: ``local-quorum``
- Values: :ref:`cassandra_consistency`

Write consistency when deleting from the database fails with primary consistency.

.. seealso:: :ref:`dictmap_cassandra_fallback_consistency`

``latency_aware_routing``
-------------------------
- Default: no
- Values: :ref:`boolean`

When turned on, latency-aware routing tracks the latency of queries to avoid sending new queries to poorly performing Cassandra nodes.
The feature is enabled by presence of the keyword in connect string, so to disable this feature,
you must remove the keyword completely.

``idle_timeout``
----------------
- Default: 0
- Values: :ref:`time_msecs`

How long to idle before disconnecting.

``connect_timeout``
-------------------
- Default: 5s
- Values: :ref:`time_msecs`

Connection timeout.

``request_timeout``
-------------------
- Default: 60s
- Values: :ref:`time_msecs`

How long to wait for a query to finish.

``warn_timeout``
----------------
- Default: 5s
- Values: :ref:`time_msecs`

Emit warning if query takes longer than this.

``heartbeat_interval``
----------------------
- Default: 5s
- Values: :ref:`time`

How often to send keepalive packets to cassandra nodes.

``execution_retry_interval``
----------------------------
- Default: 0
- Values: :ref:`time_msecs`

If the driver supports speculative execution policy, configures constant speculative execution policy.

.. seealso:: https://docs.datastax.com/en/developer/java-driver/4.13/manual/core/speculative_execution/

``execution_retry_times``
-------------------------
- Default: 0
- Values: :ref:`time_msecs`

If the driver supports speculative execution policy, configures constant speculative execution policy

.. seealso:: https://docs.datastax.com/en/developer/java-driver/4.13/manual/core/speculative_execution/

.. _cassandra_consistency:

Cassandra consistency values
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
