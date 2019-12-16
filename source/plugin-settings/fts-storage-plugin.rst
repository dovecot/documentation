.. _plugin-fts-storage:

===========================
fts-storage
===========================

``fts-storage-plugin``
^^^^^^^^^^^^^^^^^^^^^^^^
.. _plugin-fts-storage-setting_fts:

``fts``
-----------

By default the FTS indexes are updated only while searching, so neither the LDA
nor an IMAP APPEND command updates the indexes immediately. This means that if
user has received a lot of mail since the last indexing (== search operation),
it may take a while to index all the mails before replying to the search
command. Dovecot sends periodic * OK Indexed n% of the mailbox updates which
can be caught by webmail implementations to implement a progress bar.

.. _plugin-fts-storage-setting_fts_autoindex_max_recent_msgs:

``fts_autoindex_max_recent_msgs``
-----------------------------------

.. versionadded:: 2.2.9

When auto-indexing is used for full-text search, this parameter specifies to
skip it for any mailbox that contains more \Recent messages than the number
indicated (a state implying that the mailbox is never actually being accessed).

Example Setting:

.. code-block:: none

  plugin {
    fts_autoindex_max_recent_msgs = 999
  }

.. _plugin-fts-storage-setting_fts_autoindex_exclude:

``fts_autoindex_exclude``
--------------------------

This parameter indicates exclusions from the automatic indexing performed for
full-text search. Each exclusion gets its own line:

.. code-block:: none

  plugin {
    fts_autoindex_exclude = External Accounts/*
    fts_autoindex_exclude = \Trash
    fts_autoindex_exclude = Some Other Folder/
  }
