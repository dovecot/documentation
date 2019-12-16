.. _optimize_index_diff_and_Self_bundle_Updates:

=================================================
Optimize Index Diff & Self-bundle Updates
=================================================

Cassandra doesn't handle row deletions very efficiently. The more rows are
deleted, the larger number of tombstones and the longer it takes to do lookups
from the same partition.

Most of the deletions Dovecot does are index diff & self-bundle updates.

Each Dovecot Backend server always writes only a single such object per folder,
which allows storing them with (user, folder, host) primary key and updating
the rows on changes, instead of inserting & deleting the rows.

The ``diff-table`` parameter enables this behavior.

Diff-table requires these additional tables:

.. code-block:: none

  user_index_diff_objects
  user_mailbox_index_diff_objects

Creation of these tables (and the corresponding dictmap settings required) are
described See :ref:`simple_mapping`. and See :ref:`scality_sproxyd_dict_map`
respectively.
