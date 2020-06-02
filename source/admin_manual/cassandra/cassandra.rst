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
With a ``replication factor of 3``, ``quorum`` is :math:`2*((sum_of_replication/2)+1)`.
This means it is entirely possible for the data to be inconsistent on one node.

Cassandra ``nodetool repair`` is the ``AntEntropy`` service that uses Merkle trees to detect and repair inconsistencies in data between replicas.

Another important element is ``gc_grace_seconds`` (``10 days`` by default) which is the tombstone time to live marker.

If a node is missing the tombstone after the ``gc_grace_seconds`` period, the deleted data will be resurrected.
In the Dovecot Pro log file, if you start seeing ``Object exists in dict, but not in storage`` errors, then you most likely have resurrected deleted data.
Resurrected deleted data will have to be manually deleted.

To prevent Cassandra data resurrection, you must regularly run ``nodetool repair`` within ``gc_grace_seconds`` via cron for the entire cluster.
