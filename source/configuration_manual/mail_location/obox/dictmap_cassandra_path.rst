.. _dictmap_cassandra_path:

=====================================================
fs-dictmap/Cassandra mappings for path based storages
=====================================================

:ref:`dictmap_cassandra_objectid` should always be preferred, since it avoids
most of the Cassandra lookups related to emails. These path-based mappings
mainly exist for legacy reasons and for testing.

Append the following to the ``dovecot-dict-cql.conf.ext`` file as described in
:ref:`dictmap_cassandra`.

.. code-block:: none

   map {
   pattern = shared/dictmap/$user/idx/$object_name
   table = user_index_objects
    value_field = i
 
   fields {
    u = $user
    n = $object_name
   }
   }
 
   map {
   pattern = shared/dictmap/$user/mailboxes/$mailbox_guid/idx/$object_name
   table = user_mailbox_index_objects
   value_field = i
 
  fields {
    u = $user
    g = ${hexblob:mailbox_guid}
    n = $object_name
   }
   }
 
   map {
   pattern = shared/dictmap/$user/mailboxes/$mailbox_guid/$bucket/$object_name
   table = user_mailbox_objects
   value_field = i
 
  fields {
    u = $user
    g = ${hexblob:mailbox_guid}
    b = ${uint:bucket}
    n = ${hexblob:object_name}
   }
   }
 
   map {
   pattern = shared/dictmap/$user/mailboxes/$mailbox_guid/max_bucket
   table = user_mailbox_buckets
   value_field = b
   value_type = uint
 
   fields {
    u = $user
    g = ${hexblob:mailbox_guid}
   }
   }
 
   map {
   pattern = shared/dictmap/$user/fts/$object_name
   table = user_fts_objects
   value_field = i
 
   fields {
    u = $user
    n = $object_name
   }
   }
 
   map {
   pattern = shared/dictdiffmap/$user/idx/$host
   table = user_index_diff_objects
   value_field = m
 
   fields {
    u = $user
    h = $host
   }
   }
   map {
   pattern = shared/dictdiffmap/$user/mailboxes/$mailbox_guid/idx/$host
   table = user_mailbox_index_diff_objects
   value_field = m
 
   fields {
    u = $user
    g = ${hexblob:mailbox_guid}
    h = $host
   }
   }
 
   # For listing folder GUIDs during index rebuild:
   map {
   pattern = shared/dictmap/$user/mailboxes/$mailbox_guid
   table = user_mailbox_index_diff_objects
   value_field = m
 
   fields {
    u = $user
    g = ${hexblob:mailbox_guid}
   }
   }
   map {
   pattern = shared/dictrevmap/$user/mailboxes/$mailbox_guid/$object_id
   table = user_mailbox_objects_reverse
   value_field = n
   value_type = hexblob
 
   fields {
    u = $user
    g = ${hexblob:mailbox_guid}
    i = $object_id
   }
   }
 
   # for reverse unset:
   map {
   pattern = shared/dictrevmap/$object_id/$object_name
   table = user_mailbox_objects_reverse
   value_field = g
   value_type = hexblob
 
   fields {
    i = $object_id
    n = ${hexblob:object_name}
   }
   }