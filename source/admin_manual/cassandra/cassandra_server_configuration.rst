.. _cassandra_server_configuration:

===========================
Server Configuration
===========================

Cassandra Server layout
^^^^^^^^^^^^^^^^^^^^^^^^

Cassandra nodes should have at least 2 disk and 2 network interfaces.  

One disk is for the commit log which should be fast enough to receive all writes as sequential I/O.  The size of the commit log is controlled by "commit log_total_space_in_mb" setting in cassandra.yaml file. 

The other disk is for data which should be fast enough to satisfy both read and write I/O.  The recommendation is to limit space utilization to more than 50% of the total disk size for repair and compaction operations. 

File System Layout
^^^^^^^^^^^^^^^^^^^^^^^^

Ideally there is a separate set of mirrored OS disk and a separate disk for the Cassandra commit log.  

If you are sharing the OS disk with Cassandra commit log, use the following paths:

  .. code-block:: none

   /var/lib/cassandra/commitlog
   /var/lib/cassandra/saved_caches
   /var/lib/cassandra/hints_directory

If you have a dedicated disk for Cassandra commit log, you should create a mount point named ``/var/lib/cassandra`` and use the path names above.

The Cassandra data disk should be a dedicated SSD drive. You should create the mount point ``/var/lib/cassandra/data``.

  .. code-block:: none

   /var/lib/cassandra/data

Note Cassandra configuration files are normally located in ``/etc/cassandra`` and logs are located in ``/var/log/cassandra``.

The path names above are the default values in the ``cassandra.yaml`` file.

  .. code-block:: none

   # Directory where Cassandra should store hints.
   # If not set, the default directory is $CASSANDRA_HOME/data/hints.
   hints_directory: /var/lib/cassandra/hints
 
   # Directories where Cassandra should store data on disk.  Cassandra
   # will spread data evenly across them, subject to the granularity of
   # the configured compaction strategy.
   # If not set, the default directory is $CASSANDRA_HOME/data/data.
   data_file_directories:
    - /var/lib/cassandra/data

   # commit log.  when running on magnetic HDD, this should be a
   # separate spindle than the data directories.
   # If not set, the default directory is $CASSANDRA_HOME/data/commitlog.
   commitlog_directory: /var/lib/cassandra/commitlog

   # saved caches
   # If not set, the default directory is $CASSANDRA_HOME/data/saved_caches.
   saved_caches_directory: /var/lib/cassandra/saved_caches

Network
^^^^^^^^

Cassandra gives you the ability to segregate inter-node from client traffic. Most deployments go with a single IP address for both Cassandra inter-node and client communication.

In Cassandra the ``listen_address: / listen_interface:`` are used for inter-node cluster communication. Cassandra replication, repair, gossip, and compaction can generate significant traffic from time to time. Isolating cluster traffic onto its own IP address range (cluster vlan), if possible, can improve network performance / reduce network latency within the Cassandra cluster.  In the case of multi-site, you may need a vlan over wan solution.

The Cassandra ``rpc_address: / rpc_interface:`` are for client communication. This would be the IP address (client access vlan) that Dovecot backends would be configured to use. 

Ports
^^^^^^^

Inter-node (default) ports

=====    ==================
Port     Service
=====    ==================
7000     Inter-node
7001     Inter-node (ssl)
7199     JMK
=====    ==================

Client (default) ports

=====    ==============
Port     Service
=====    ==============
9042     client port
9160     thrift
9142     native
=====    ==============

Memory
^^^^^^^

Cassandra runs inside JAVA JVM. The JVM settings are defined in "cassandra-env.sh" (older) or jvm.options file in /etc/cassandra configuration directory.  The run settings are computed during startup based on system resources. Recommendation is to use default settings and monitor the system.
