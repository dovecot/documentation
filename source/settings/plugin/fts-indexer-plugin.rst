.. _plugin-fts-indexer:

======================
fts-indexer-plugin
======================

``fts-indexer-plugin``
^^^^^^^^^^^^^^^^^^^^^^^^
.. _setting-plugin_fts_index_timeout:

``fts_index_timeout``
------------------------

When the full-text search algorithm detects that the index isn't up-to-date,
the indexer is told to index the messages and is given this much time to do so.
If this time limit is reached, an error is returned, indicating that the search
timed out during waiting for the indexing to complete. This setting is
typically made in the plugin block of 90-plugin.conf.

Example Setting:

.. code-block:: none

  plugin {
    fts_index_timeout = 60s
  }
