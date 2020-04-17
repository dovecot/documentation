.. _reference_counted_mapping:

===============================
Reference Counted Mapping
===============================

Reference counting allows a single mail object to be stored in multiple mailboxes, without the need to create a new copy of the message data in object storage. 
The downside to the refcounting method is that it requires an additional Cassandra table.

Object deletion also requires listing objects in Cassandra to find out if we just deleted the last reference or not. Only on the last reference deletion we want to delete the actual object from object storage. 
Reference counting requires these additional tables:

.. code-block:: none

   user_mailbox_objects_reverse


Creation of these tables (and the corresponding dictmap settings required)
are described in :ref:`dictmap_cassandra`, :ref:`scality_sproxyd` or
:ref:`dictmap_cassandra_path` pages respectively.

