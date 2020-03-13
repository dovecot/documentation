.. _plugin-fts-lucene:

===========================
fts-Lucene plugin
===========================

``fts-lucene-plugin``
^^^^^^^^^^^^^^^^^^^^^^^^
.. _plugin-fts-lucene-setting_fts_lucene:

``fts_lucene``
-------------------

Example config to use full-text search with Lucene's C++ library:

.. code-block:: none

  mail_plugins = $mail_plugins fts fts_lucene

  plugin {
    fts = lucene
    fts_lucene = whitespace_chars=@.
  }

``fts_lucene`` supports the following options:

- ``whitespace_chars=<chars>``: List of characters that are translated to
  whitespace. You may want to use "@." so that e.g. in "first.last@example.org"
  it won't be treated as a single word, but rather you can search separately
  for "first", "last" and "example".
- ``default_language=<lang>``: Default stemming language to use for mails. The
  default is english. Requires that Dovecot is built with libstemmer, which
  also limits the languages that are supported.
- ``textcat_conf=<path>``, ``textcat_dir=<path>``: If specified, enable
  guessing the stemming language for emails and search keywords. This is a
  little bit problematic in practice, since indexing and searching languages
  may differ and may not find even exact words because they stem differently.
- ``no_snowball``: Support normalization of indexed words even without stemming
  and libstemmer (Snowball).
- ``mime_parts``: Index each MIME part separately and include the MIME part
  number in the "part" field. In future versions this will allowing showing
  which attachment matched the search result.

See: `Lucene Full Text Search Indexing <https://wiki.dovecot.org/Plugins/FTS/Lucene>`_
