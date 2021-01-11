.. _dictmap_cassandra_objectid:

==========================================================
fs-dictmap/Cassandra mappings for Object ID based storages
==========================================================

These mappings can be used with:
 * :ref:`scality_sproxyd`
 * Any other object storage when using "storage-objectid-prefix" option

Cassandra keyspace
------------------

.. code-block:: none

   create keyspace if not exists mails
   with replication = {
     'class': 'SimpleStrategy',
     'replication_factor': 3
   };

   use mails;
   create table if not exists user_index_objects (u text,n text,i blob,primary key (u, n));
   create table if not exists user_mailbox_index_objects (u text,g blob,n text,i blob,primary key ((u, g), n));
   create table if not exists user_mailbox_objects (u text,g blob,b int,n blob,i blob,primary key ((u, g, b), n));
   create table if not exists user_mailbox_buckets (u text,g blob,b int,primary key ((u, g)));
   create table if not exists user_fts_objects (u text,n text,i blob,primary key (u, n));
   create table if not exists user_index_diff_objects (u text,h text,m text,primary key (u, h));
   create table if not exists user_mailbox_index_diff_objects (u text,g blob,h text,m text,primary key (u, g, h));
   create table if not exists user_mailbox_objects_reverse (u text,g blob,n blob,i blob,primary key (i, n));

Mapping
-------

Append the following to the ``dovecot-dict-cql.conf.ext`` file as described in
:ref:`dictmap_cassandra`.

.. code-block:: none

  # WARNING: The order of the map {} sections is important here.
  # Do NOT reorder them or the end result may not work.
  map {
    pattern = shared/dictmap/$user/idx/$object_name
    table = user_index_objects
    value_field = i
    value_type = hexblob
    fields {
      u = $user
      n = $object_name
    }
  }
  map {
    pattern = shared/dictmap/$user/mailboxes/$mailbox_guid/idx/$object_name
    table = user_mailbox_index_objects
    value_field = i
    value_type = hexblob
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
    value_type = hexblob
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
    #value_field = b # for v2.3.13 and older
    value_field = b,writetime(b) # for v2.3.14 and newer
    #value_type = uint # for v2.3.13 and older
    value_type = uint,uint # for v2.3.14 and newer
    fields {
      u = $user
      g = ${hexblob:mailbox_guid}
    }
  }
  map {
    pattern = shared/dictmap/$user/fts/$object_name
    table = user_fts_objects
    value_field = i
    value_hexblob = yes
    fields {
      u = $user
      n = $object_name
    }
  }
  ### diff-table Settings ###
  map {
    pattern = shared/dictdiffmap/$user/idx/$host
    table = user_index_diff_objects
    value_field = m,writetime(m)
    value_type = string,string
    fields {
      u = $user
      h = $host
    }
  }
  map {
    pattern = shared/dictdiffmap/$user/mailboxes/$mailbox_guid/idx/$host
    table = user_mailbox_index_diff_objects
    value_field = m,writetime(m)
    value_type = string,string
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
  # Use ONLY if you don’t enable “diff-table” parameter.
  #map {
  #  pattern = shared/dictmap/$user/mailboxes/$mailbox_guid
  #  table = user_mailbox_index_objects
  #  value_field = i
  #  value_type = hexblob
  #
  #  fields {
  #    u = $user
  #    g = ${hexblob:mailbox_guid}
  #  }
  #}
  ### Reference Counting Settings ###
  # For reverse set:
  map {
    pattern = shared/dictrevmap/$user/mailboxes/$mailbox_guid/$object_id
    table = user_mailbox_objects_reverse
    value_field = n
    value_type = hexblob
    fields {
      u = $user
      g = ${hexblob:mailbox_guid}
      i = ${hexblob:object_id}
    }
  }
  # For reverse unset and iteration:
  map {
    pattern = shared/dictrevmap/$object_id/$object_name
    table = user_mailbox_objects_reverse
    value_field = g
    value_type = hexblob
    fields {
      i = ${hexblob:object_id}
      n = ${hexblob:object_name}
    }
  }
  # for reverse gets - this isn't actually used currently
  map {
    pattern = shared/dictrevmap/$object_id
    table = user_mailbox_objects_reverse
    value_field = u,g,n
    #value_type = hexblob # for v2.2.27.1 and older
    value_type = string,hexblob,hexblob # v2.2.27.2 and newer
    fields {
      i = ${hexblob:object_id}
    }
  }
