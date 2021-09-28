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
   # Existence of setting = yes; absence of setting = no
   # See: http://datastax.github.io/cpp-driver/topics/configuration/#latency-aware-routing
   # latency_aware_routing \
   
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
   # Existence of setting = yes; absence of setting = no
   # debug_queries \
   
   # DEBUG: Output internal metrics in JSON format to this file.
   # Format of data can be found at the end of this document.
   # metrics=/tmp/dovecot-cassandra.metrics.%{pid} \
   
   # TLS settings (setting any of these will enable TLS)
   # You should use at least driver version 2.15 for reliable TLS support.
   
   # Trusted CA certificates
   # ssl_ca=/path/to/ca-certificate \
   
   # Level of verification:
   #  * none = don't verify
   #  * cert = verify certificate
   #  * cert-ip = verify IP from CN or SubjectAltName
   #  * cert-dns = verify hostname from CN or SubjectAltName as determined by reverse lookup of the IP.
   # ssl_verify=none
   
   # TLS client certificate
   # ssl_cert=<path>
   
   # TLS client private key
   # ssl_key=<path>
   
   # TLS client private key password
   # ssl_key_password=<string>


The details of how to create the Cassandra tables and the dict mappings that
need to be appended to ``dovecot-dict-cql.conf.ext`` are described in:

 * :ref:`dictmap_cassandra_objectid`
 * :ref:`dictmap_cassandra_path`

The connect string is described in more detail in :ref:`sql-cassandra`.

The following base tables are always needed by fs-dictmap:

 * user_index_objects
 * user_mailbox_index_objects
 * user_mailbox_objects
 * user_mailbox_buckets
 * user_fts_objects

For more Cassandra details, see:

 * :ref:`cassandra`
 * :ref:`cassandra_replication_factor`

.. _dictmap_cassandra_diff_table:

Optimize Index Diff & Self-bundle Updates
-----------------------------------------

Cassandra doesn't handle row deletions very efficiently. The more rows are
deleted, the larger number of tombstones and the longer it takes to do lookups
from the same partition.

Most of the deletions Dovecot does are index diff & self-bundle updates.

Each Dovecot Backend server always writes only a single such object per folder,
which allows storing them with (user, folder, host) primary key and updating
the rows on changes, instead of inserting & deleting the rows.

The fs-dictmap ``diff-table`` parameter enables this behavior.

Diff-table requires these additional tables to exist in Cassandra:

 * user_index_diff_objects
 * user_mailbox_index_diff_objects

.. _dictmap_cassandra_refcounting_table:

Reference Counting table
------------------------

Reference counting allows a single mail object to be stored in multiple
mailboxes, without the need to create a new copy of the message data in object
storage. There are two downsides to it though:

The fs-dictmap ``refcounting-table`` parameter enables this behavior.

 * It requires an additional large Cassandra table that keeps track of the
   references.
 * It requires listing objects in Cassandra to find out if we just deleted the
   last reference or not. Only on the last reference deletion we want to delete
   the actual object from object storage.

Reference counting requires an additional table:

 * user_mailbox_objects_reverse

.. _dictmap_cassandra_quorum_configuration:

Quorum Configuration
--------------------

There are only two configurations that are currently recommended:

Quorum within a single datacenter (default):

.. code-block:: none

  connect = \
    # ...other connect parameters... \
    read_consistency=local-quorum \
    write_consistency=local-quorum \
    delete_consistency=local-quorum

Local-quorum guarantees that reads after writes are always returning the latest
data. Dovecot requires strong consistency within a datacenter.

Quorum within multiple datacenters:

.. code-block:: none

  connect = \
    # ...other connect parameters... \
    read_consistency=local-quorum \
    #read_fallback_consistency=quorum \
    write_consistency=each-quorum \
    write_fallback_consistency=local-quorum \
    delete_consistency=each-quorum \
    delete_fallback_consistency=local-quorum

As long as the datacenters are talking to each other, this uses each-quorum for
writes. If there's a problem, Cassandra nodes fallback to local-quorum and
periodically try to switch back to each-quorum. The main benefit of each-quorum
is that in case the local datacenter suddenly dies and loses data, Dovecot will
not have responded OK to any mail deliveries that weren't already replicated
to the other datacenters. Using local-quorum as fallback ensures that in case
of a network split the local Dovecot cluster still keeps working. Of course,
if the local datacenter dies while the network is also split, there will be
data loss.

Using ``read_fallback_consistency=quorum`` allows reads to succeed even in
cases when multiple Cassandra nodes have failed in the local datacenter.
For example:

 * 2 datacenters, each having a replica count of 3
 * This means a total replica count of 6, so quorum requires 4 replicas
 * Local datacenter 2 two Cassandra nodes
 * If a read finds 3 replicas from the remote datacenter and 1 replica from
   local datacenter, the read will still succeed.

Note that if there are only a total of 3 Cassandra nodes per datacenter and 2
of them are lost, writes can't succeed with either each-quorum or local-quorum.
In this kind of a configuration having read_fallback_consistency=quorum is not
very useful.

Also note that there are no consistency settings that allow Dovecot to
realiably continue operating if Cassandra in the local datacenter no longer
has quorum, i.e. at least half of its nodes have gone down. In this case
writes will always fail. If this happens, all users should be moved to be
processed by another datacenter.

.. _dictmap_cassandra_fallback_consistency:

Fallback consistency
--------------------

Dovecot normally sends the Cassandra queries with the primary consistency
setting. If a write fails because either

#. there aren't enough nodes available for the consistency level, or
#. Cassandra server timed out connecting to all the necessary nodes,

Dovecot attempts the query again using the fallback consistency. When this
happens, Dovecot also switches all the following queries to use the fallback
consistency for a while. The consistency will be switched back when a query
with the primary consistency level succeeds again.

While fallback consistency is being used, the queries are periodically still
retried with primary consistency level. The initial retry happens after 50 ms
and the retries are doubled until they reach the maximum of 60 seconds.

.. _dictmap_cassandra_uncertain_writes:

Uncertain writes
----------------

Cassandra doesn't perform any rollbacks to writes. When Cassandra reports a
write as failed, it only means that it wasn't able to verify that the required
consistency level was reached yet. It's still likely/possible that the write
was succcessful to some nodes. If even a single copy was written, Cassandra
will eventually be consistent after hinted handoffs or repairs. This means
that even though a write may initially have looked like it failed, the data
can become visible sooner or later.

This is why when a write fails, Dovecot usually logs it as "write is uncertain"
and doesn't delete the object from object storage. Although this means that
either the object becomes undeleted at some point (possibly leading to
duplicate mails) or the object becomes leaked in the object storage. Currently
to avoid these situations an external tool has to be monitoring the logs and
fixing up these uncertain writes when Cassandra is again working normally.

See also
--------

 * :ref:`cassandra_administration`
