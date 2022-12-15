.. _cassandra:

==========
Cassandra
==========

Pre-install deployment check list

1. Turn off swap on every Cassandra node.

2. Open Cassandra ports in firewall.

3. Configure system limits.

4. Implement Network Time Protocol ``(NTP)`` daemon.

5. Install latest ``Java JVM`` with ``G1`` garbage collector.

6. Implement the Dovecot Pro ``dictmap`` fs driver on every Dovecot backend server.


Cassandra Administration
=========================

``nodetool repair``

``Apache Cassandra`` is a distributed database with tunable consistency.  Normally our Dovecot configuration implements ``quorum`` consistency.
Quorum provides strong consistency with failure toleration.
With a ``replication factor of 3``, ``quorum`` is :math:`2*((sum\_of\_replication/2)+1)`.
This means it is entirely possible for the data to be inconsistent on one node.

Cassandra ``nodetool repair`` is the ``AntEntropy`` service that uses Merkle trees to detect and repair inconsistencies in data between replicas.

Another important element is ``gc_grace_seconds`` (``10 days`` by default) which is the tombstone time to live marker.

If a node is missing the tombstone after the ``gc_grace_seconds`` period, the deleted data will be resurrected.
In the Dovecot Pro log file, if you start seeing ``Object exists in dict, but not in storage`` errors, then you most likely have resurrected deleted data.
Resurrected deleted data will have to be manually deleted.

To prevent Cassandra data resurrection, you must regularly run ``nodetool repair`` within ``gc_grace_seconds`` via cron for the entire cluster.

Reducing Tombstones
===================

Dovecot attempts to prevent creating too many tombstones within the same
cluster key. Sometimes it may not have worked properly though, and Cassandra
queries start failing (timing out) towards a specific cluster key due to too
many tombstones. This can be repaired by getting rid of the tombstones:

 * Run Cassandra repair to make sure all tombstones are replicated.
 * Change ``gc_grace_seconds`` to a smaller value that includes the tombstones
   (e.g. 1 day).
 * Run Cassandra compact.
 * Change ``gc_grace_seconds`` back to the original value (10 days).

Other potential changes that may help:

 * Enable ``page_size=1000`` in ``dovecot-dict-cql.conf.ext`` connect setting
   so large results would be paged into multiple queries.
 * Increase Cassandra's request timeout.
 * Increase Cassandra's ``tombstone_failure_threshold``.
