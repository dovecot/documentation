.. _dictmap_cassandra_path:

=====================================================
fs-dictmap/Cassandra mappings for path based storages
=====================================================

:ref:`dictmap_cassandra_objectid` should always be preferred, since it avoids
most of the Cassandra lookups related to emails. These path-based mappings
mainly exist for legacy reasons and for testing.

Cassandra keyspace
------------------

.. code-block:: none

   create keyspace if not exists mails
   with replication = {
     'class': 'SimpleStrategy',
     'replication_factor': 3
   };

   use mails;
   create table user_index_objects (u text, n text, i text, primary key (u, n));
   create table user_mailbox_index_objects (u text, g blob, n text, i text, primary key ((u, g), n));
   create table user_mailbox_objects (u text, g blob, b int, n blob, i text, primary key ((u, g, b), n));
   create table user_mailbox_buckets (u text, g blob, b int, primary key ((u, g)));
   create table user_fts_objects (u text, n text, i text, primary key (u, n));
   create table user_index_diff_objects (u text, h text, m text, primary key (u, h));
   create table user_mailbox_index_diff_objects (u text, g blob, h text, m text, primary key (u, g, h));
   create table user_mailbox_objects_reverse (u text, g blob, n blob, i text, primary key (i, n));

Mapping
-------

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