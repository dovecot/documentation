.. _cassandra_replication_factor:

=========================
Replication Factor
=========================

NetworkTopologyStrategy (Create keyspace) Define Replication Factor
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

For multiple data centers the replication NetworkTopologyStrategy is
recommended for production environments.

When the ``mails`` keyspace is created, set replication to
NetworkTopologyStrategy. The example below sets replication factor to 3 in each
data center.

.. code-block:: none

  CREATE KEYSPACE 'mails' IF NOT EXIST WITH REPLICATION = { 'class' : 'NetworkTopologyStrategy', 'dc1_name' : 3, 'dc2_name' : 3 }

GossipingPropertyFileSnitch (Edit cassandra-rackdc.properties file
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. Note:: Every node will only define itself

A snitch determines which data centers and racks nodes belong to. The
replication (in this case NetworkTopologyStrategy) places the replicas based on
snitch information.

The GossipingPropertyFileSnitch uses Cassandra's gossip protocol to
automatically update snitch information when adding new nodes. This is the
recommended snitch for production.

Configure GossipingPropertyFileSnitch on each node with only localhost
information. Cassandra discovers all the nodes in the ring via Gossip protocol
on start up.

Examples: (Example names Only)

Node1, dc1_name
cassandra-rackdc.properties files content:

.. code-block:: none

  DC=dc1_name
  RAC=rack1

Node 2, dc1_name
cassandra-rackdc.properties files content:

.. code-block:: none

  DC=dc1_name
  RAC=rack2

Node 1, dc2_name
cassandra-rackdc.properties files content:

.. code-block:: none

  DC=dc2_name
  RAC=rack1

Endpoint_Snitch (Cassandra.yaml)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Modify the cassandra.yaml file "endpoint_snitch" to use
"GossipingPropertyFileSnitch".

.. code-block:: none

  endpoint_snitch: GossipingPropertyFileSnitch
