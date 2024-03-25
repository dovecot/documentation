.. _dictmap_cassandra:

=========================
fs-dictmap with Cassandra
=========================

See :ref:`sql-cassandra` for all Cassandra-specific settings.

``dovecot.conf``:

.. code-block:: none

   dict_server {
     dict cassandra {
       driver = sql
       sql_driver = cassandra

       cassandra_hosts = 10.2.3.4 10.3.4.5 10.4.5.6
       cassandra_keyspace = mails

       cassandra_execution_retry_interval = 500ms
       cassandra_execution_retry_times = 3

       !include /etc/dovecot/dovecot-dict-cql.conf.inc
     }
   }

``dovecot-dict-cql.conf.inc``:

The details of how to create the Cassandra tables and the dict mappings that
need to be appended to ``dovecot-dict-cql.conf.inc`` are described in:

 * :ref:`dictmap_cassandra_objectid`
 * :ref:`dictmap_cassandra_path`

The following base tables are always needed by fs-dictmap:

 * ``user_index_objects``
 * ``user_mailbox_index_objects``
 * ``user_mailbox_objects``
 * ``user_mailbox_buckets``
 * ``user_fts_objects``

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

The fs-dictmap :dovecot_plugin:ref:`fs_dictmap_diff_table` setting enables
this behavior.

Diff-table requires these additional tables to exist in Cassandra:

 * ``user_index_diff_objects``
 * ``user_mailbox_index_diff_objects``

.. _dictmap_cassandra_refcounting_table:

Reference Counting table
------------------------

Reference counting allows a single mail object to be stored in multiple
mailboxes, without the need to create a new copy of the message data in object
storage. There are two downsides to it though:

The fs-dictmap :dovecot_plugin:ref:`fs_dictmap_refcounting_table` setting
enables this behavior.

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

   cassandra_read_consistency = local-quorum
   cassandra_write_consistency = local-quorum
   cassandra_delete_consistency = local-quorum

Local-quorum guarantees that reads after writes are always returning the latest
data. Dovecot requires strong consistency within a datacenter.

Quorum within multiple datacenters:

.. code-block:: none

   cassandra_read_consistency = local-quorum
   #cassandra_read_fallback_consistency = quorum
   cassandra_write_consistency = each-quorum
   cassandra_write_fallback_consistency = local-quorum
   cassandra_delete_consistency = each-quorum
   cassandra_delete_fallback_consistency = local-quorum

As long as the datacenters are talking to each other, this uses each-quorum for
writes. If there's a problem, Cassandra nodes fallback to local-quorum and
periodically try to switch back to each-quorum. The main benefit of each-quorum
is that in case the local datacenter suddenly dies and loses data, Dovecot will
not have responded OK to any mail deliveries that weren't already replicated
to the other datacenters. Using local-quorum as fallback ensures that in case
of a network split the local Dovecot cluster still keeps working. Of course,
if the local datacenter dies while the network is also split, there will be
data loss.

Using ``cassandra_read_fallback_consistency=quorum`` allows reads to succeed even in
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
reliably continue operating if Cassandra in the local datacenter no longer
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
was successful to some nodes. If even a single copy was written, Cassandra
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
