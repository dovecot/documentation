.. _fts_plugin:

=============================
Full Text Search (FTS) plugin
=============================

.. _plugin-fts-setting-fts_autoindex:

``fts_autoindex``
-----------------

- Default: ``no``
- Values: :ref:`boolean`

By default the FTS indexes are updated only while searching, so neither the LDA
nor an IMAP APPEND command updates the indexes immediately. This means that if
user has received a lot of mail since the last indexing (== search operation),
it may take a while to index all the mails before replying to the search
command. Dovecot sends periodic * OK Indexed n% of the mailbox updates which
can be caught by webmail implementations to implement a progress bar.

.. _plugin-fts-setting-fts_autoindex_max_recent_msgs:

``fts_autoindex_max_recent_msgs``
-----------------------------------

.. versionadded:: 2.2.9

- Default: ``0`` (ignore)
- Values: :ref:`uint`

When auto-indexing is used for full-text search, this parameter specifies to
skip it for any mailbox that contains more \Recent messages than the number
indicated (a state implying that the mailbox is never actually being accessed).

Example Setting:

.. code-block:: none

  plugin {
    fts_autoindex_max_recent_msgs = 999
  }

.. _plugin-fts-setting-fts_autoindex_exclude:

``fts_autoindex_exclude``
--------------------------

- Default: <empty>
- Values: :ref:`string`

This parameter indicates exclusions from the automatic indexing performed for
full-text search. Each exclusion gets its own line:

.. code-block:: none

  plugin {
    fts_autoindex_exclude = External Accounts/*
    fts_autoindex_exclude = \Trash
    fts_autoindex_exclude = Some Other Folder/
  }

.. _plugin-fts-setting-fts_index_timeout:

``fts_index_timeout``
------------------------

- Default: ``0`` (no timeout)
- Values: :ref:`uint`

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

.. _plugin-fts-setting-fts_languages:

``fts_languages``
-------------------

A space-separated list of languages that the system's full-text search should
be able to detect is provided with this setting, typically made in the plugin
block of 90-plugin.conf. The filters used for stemming and stopwords are
language-dependent.

Example Setting:

.. code-block:: none

  plugin {
    fts_languages = en de
  }

The language listed first is the default and is used when language recognition
fails.

.. _plugin-fts-setting-fts_tika:

``fts_tika``
---------------
.. versionadded:: 2.2.13

``http://tikahost:9998/tika/``: This URL needs to be running Apache Tika server
(e.g. started with java -jar tika-server/target/tika-server-1.5.jar)

URL for TIKA decoder for attachments.


.. _plugin-fts-setting-fts_decoder:

``fts_decoder``
---------------

.. versionadded:: 2.1

Decode attachments to plaintext using this service and index the resulting
plaintext. See the decode2text.sh script included in Dovecot for how to use
this.

Example on both:

.. code-block:: none

  plugin {
    fts_decoder = decode2text
    fts_tika = http://tikahost:9998/tika/
  }

  service decode2text {
    executable = script /usr/lib/dovecot/decode2text.sh
    user = vmail
    unix_listener decode2text {
      mode = 0666
    }
  }
