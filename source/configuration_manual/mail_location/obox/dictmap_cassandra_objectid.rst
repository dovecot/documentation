.. _dictmap_cassandra_objectid:

==========================================================
fs-dictmap/Cassandra mappings for Object ID based storages
==========================================================

These mappings can be used with:
 * :ref:`scality_sproxyd`
 * Any other object storage when using
   :dovecot_plugin:ref:`fs_dictmap_storage_objectid_prefix` setting.

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

Append the following to the ``dovecot-dict-cql.conf.inc`` file as described in
:ref:`dictmap_cassandra`.

.. code-block:: none

  # WARNING: The order of the dict_map {} sections is important here.
  # Do NOT reorder them or the end result may not work.

  dict_map shared/dictmap/$user/idx/$object_name {
    sql_table = user_index_objects
    value i {
      type = hexblob
    }

    field u {
      pattern = $user
    }
    field n {
      pattern = $object_name
    }
  }

  dict_map shared/dictmap/$user/mailboxes/$mailbox_guid/idx/$object_name {
    sql_table = user_mailbox_index_objects
    value i {
      type = hexblob
    }

    field u {
      pattern = $user
    }
    field g {
      pattern = $mailbox_guid
      type = hexblob
    }
    field n {
      pattern = $object_name
    }
  }

  dict_map shared/dictmap/$user/mailboxes/$mailbox_guid/$bucket/$object_name {
    sql_table = user_mailbox_objects
    value i {
      type = hexblob
    }

    field u {
      pattern = $user
    }
    field g {
      pattern = $mailbox_guid
      type = hexblob
    }
    field b {
      pattern = $bucket
      type = uint
    }
    field n {
      pattern = $object_name
      type = hexblob
    }
  }

  dict_map shared/dictmap/$user/mailboxes/$mailbox_guid/max_bucket {
    sql_table = user_mailbox_buckets
    value b {
      type = uint
    }
    value writetime(b) {
      type = uint
    }

    field u {
      pattern = $user
    }
    field g {
      pattern = $mailbox_guid
      type = hexblob
    }
  }

  dict_map shared/dictmap/$user/fts/$object_name {
    sql_table = user_fts_objects
    value i {
      type = hexblob
    }

    field u {
      pattern = $user
    }
    field n {
      pattern = $object_name
    }
  }

  dict_map shared/dictdiffmap/$user/idx/$host {
    sql_table = user_index_diff_objects
    value m {
    }

    field u {
      pattern = $user
    }
    field h {
      pattern = $host
    }
  }

  dict_map shared/dictdiffmap/$user/mailboxes/$mailbox_guid/idx/$host {
    sql_table = user_mailbox_index_diff_objects
    value m {
    }

    field u {
      pattern = $user
    }
    field g {
      pattern = $mailbox_guid
      type = hexblob
    }
    field h {
      pattern = $host
    }
  }

  dict_map shared/dictmap/$user/mailboxes/$mailbox_guid {
    sql_table = user_mailbox_index_diff_objects
    value m {
    }

    field u {
      pattern = $user
    }
    field g {
      pattern = $mailbox_guid
      type = hexblob
    }
  }

  dict_map shared/dictrevmap/$user/mailboxes/$mailbox_guid/$object_id {
    sql_table = user_mailbox_objects_reverse
    value n {
      type = hexblob
    }

    field u {
      pattern = $user
    }
    field g {
      pattern = $mailbox_guid
      type = hexblob
    }
    field i {
      pattern = $object_id
      type = hexblob
    }
  }

  dict_map shared/dictrevmap/$object_id/$object_name {
    sql_table = user_mailbox_objects_reverse
    value g {
      type = hexblob
    }

    field i {
      pattern = $object_id
      type = hexblob
    }
    field n {
      pattern = $object_name
      type = hexblob
    }
  }

  dict_map shared/dictrevmap/$object_id {
    sql_table = user_mailbox_objects
    value u {
    }
    value g {
      type = hexblob
    }
    value n {
      type = hexblob
    }

    field i {
      pattern = $object_id
      type = hexblob
    }
  }
