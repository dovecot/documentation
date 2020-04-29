.. _sizing_information:

=========================
Sizing Information
=========================

Per benchmark data, sizing of the Cassandra node can be estimated by assuming 50 bytes/email is required to store each message. Thus, assuming 512 GB total storage per Cassandra node (= 256 GB of usable storage + 256 GB for repairs/rebuilds), this means that each node can store data on up to 5.1 billion emails. 
For high availability, a minimum of three nodes is required for each data center.
