.. _quorum_configuration:

==========================
Quorum Configuration
==========================

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

Fallback consistency
--------------------

Dovecot normally sends the Cassandra queries with the primary consistency
setting. If a write fails because either

1) there aren't enough nodes available for the consistency level, or
2) Cassandra server timed out connecting to all the necessary nodes,

Dovecot attempts the query again using the fallback consistency. When this
happens, Dovecot also switches all the following queries to use the fallback
consistency for a while. The consistency will be switched back when a query
with the primary consistency level succeeds again.

While fallback consistency is being used, the queries are periodically still
retried with primary consistency level. The initial retry happens after 50 ms
and the retries are doubled until they reach the maximum of 60 seconds.

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
