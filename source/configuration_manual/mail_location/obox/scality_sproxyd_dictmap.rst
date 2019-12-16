.. _scality_sproxyd_dict_map:

===============================
Scality sproxyd dict map
===============================

Append the following to the ``dovecot-dict-cql.conf.ext`` file as described See
:ref:`simple_mapping`.

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
