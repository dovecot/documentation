.. _cassandra.yaml:

======================
cassandra.yaml
======================

Cluster Name

.. code-block:: none

   # The name of the cluster. This is mainly used to prevent machines in
   # one logical cluster from joining another.
   cluster_name: cluster1

Seed Nodes

Configure the first and fourth nodes in each data center to be your seed nodes: (Example IP's Only)

.. code-block:: none

   - seeds: "172.16.0.1,172.16.0.4,172.16.1.1,172.16.1.4"


concurrent_* 
Configure the following Concurrent_* values:

.. code-block:: none

   # For workloads with more data than can fit in memory, Cassandra's
   # bottleneck will be reads that need to fetch data from
   # disk. "concurrent_reads" should be set to (16 * number_of_drives) in
   # order to allow the operations to enqueue low enough in the stack
   # that the OS and drives can reorder them. Same applies to
   # "concurrent_counter_writes", since counter writes read the current
   # values before incrementing and writing them back.
   #
   # On the other hand, since writes are almost never IO bound, the ideal
   # number of "concurrent_writes" is dependent on the number of cores in
   # your system; (8 * number_of_cores) is a good rule of thumb.
   concurrent_reads: 32 ← 1 SSD set to 16
   concurrent_writes: 32  ← 8 cores set to 64
   concurrent_counter_writes: 32

concurrent_compactors 
Configure the concurrent_compactors values:

.. code-block:: none

   # concurrent_compactors defaults to the smaller of (number of disks,
   # number of cores), with a minimum of 2 and a maximum of 8.
   #
   # If your data directories are backed by SSD, you should increase this
   # to the number of cores.
   concurrent_compactors: 1 ← 8 cores set to 8

compaction_throughput_mb_per_sec 
Adjust based on actual sstable monitoring ratios:

.. code-block:: none

   # Throttles compaction to the given total throughput across the entire
   # system. The faster you insert data, the faster you need to compact in
   # order to keep the sstable count down, but in general, setting this to
   # 16 to 32 times the rate you are inserting data is more than sufficient.
   # Setting this to 0 disables throttling. Note that this account for all types
   # of compaction, including validation compaction.
   compaction_throughput_mb_per_sec: 16

inter_dc_stream_throughput_magabits_per_sec
Adjust based on wan capacity: 

.. code-block:: none

   # Throttles all streaming file transfer between the datacenters,
   # this setting allows users to throttle inter dc stream throughput in addition
   # to throttling all network stream traffic as configured with
   # stream_throughput_outbound_megabits_per_sec
   # When unset, the default is 200 Mbps or 25 MB/s
   # inter_dc_stream_throughput_outbound_megabits_per_sec: 200


'*'_timeout
Adjust timeouts:

.. code-block:: none

   read_request_timeout_in_ms: 5000
   range_request_timeout_in_ms: 10000
   write_request_timeout_in_ms: 2000
   counter_write_request_timeout_in_ms: 5000
   cas_contention_timeout_in_ms: 1000
   truncate_request_timeout_in_ms: 60000
   request_timeout_in_ms: 10000
   slow_query_log_timeout_in_ms: 500


internode_compression

.. code-block:: none

   # internode_compression controls whether traffic between nodes is compressed.
   # Can be:
   #
   # all
   #   all traffic is compressed
   #
   # dc
   #   traffic between different datacenters is compressed
   #
   # none
   #   nothing is compressed.
   internode_compression: dc


gc_warn_threshold_in_ms
Long stop the world gc pauses are bad, may want to adjust:

.. code-block:: none

   # GC Pauses greater than gc_warn_threshold_in_ms will be logged at WARN level
   # Adjust the threshold based on your application throughput requirement
   # By default, Cassandra logs GC Pauses greater than 200 ms at INFO level
   gc_warn_threshold_in_ms: 1000