===========================
Cassandra Disaster Recovery
===========================

In the (extremely unlikely) case that all Cassandra data is lost, it is possible to recover this information by iterating through all objects stored in the object store. 
A rough overview of the process is as follows (for Scality sproxyd):

Index Objects Recovery
^^^^^^^^^^^^^^^^^^^^^^^^^
1. List index objects in object storage

2. Use HEAD requests to determine the index objects' metadata

3. Add recovered index objects to Cassandra

Mail Objects Recovery
^^^^^^^^^^^^^^^^^^^^^^
1. Read & refresh indices for each user/mailbox

2. Dump index data and add object information to Cassandra

3. (Optional) Look for unattached mail objects and remove them [background process]