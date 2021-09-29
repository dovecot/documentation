.. _plugin-fts-solr:


===========================
fts-solr
===========================

``fts-solr-plugin``
^^^^^^^^^^^^^^^^^^^^
.. _setting-plugin_fts_solr:

``fts_solr``
--------------

Example config to use full-text search with Apache Solr:

.. code-block:: none

  mail_plugins = $mail_plugins fts fts_solr

  plugin {
    fts = solr
    fts_solr = url=http://solr.example.org:8983/solr/ debug soft_commit=yes batch_size=1000
  }

``fts_solr`` supports the following options:

- ``url=<solr url>``: Required base URL for Solr. (remember to add your core
  name if using solr 7+ : "/solr/dovecot/"). The default URL for Solr 7+ is
  ``https://localhost:8983/solr/dovecot/``
- ``debug``: Enable HTTP debugging. Writes to debug log.
- ``rawlog_dir=<directory>``: For debugging, store HTTP exchanges between
  Dovecot and Solr in this directory.

  .. versionadded:: 2.3.6

- ``batch_size`` : Configure the number of mails sent in single requests to
  Solr, default is ``1000``.

  .. versionadded:: 2.3.6

  - with ``fts_autoindex=yes``, each new mail gets separately indexed on
    arrival, so batch_size only matters when doing the initial indexing of a
    mailbox.
  - with ``fts_autoindex=no``, new mails don't get indexed on arrival, so
    batch_size is used when indexing gets triggered.

- ``soft_commit=yes|no``: Control whether new mails are immediately searchable
  via Solr, default to yes. When using no, it's important to set autoCommit or
  autoSoftCommit time in solrconfig.xml so mails eventually become searchable.

.. _plugins-fts_solr_soft_commits:

Soft commits
------------

If soft commits are enabled, dovecot will perform a soft commit to SOLR at the
end of transaction. This has the benefit that search results are immediately
available. You can also enable automatic commits in SOLR config, with

.. code-block:: xml

  <autoSoftCommit>
    <maxTime>60000</maxTime>
  </autoSoftCommit>

or setting it in solrconfig.xml with

.. code-block:: xml

  ${solr.autoSoftCommit.maxTime:60000}

You can also set up a cron job for performing the commits manually.

See: :ref:`fts_backend_solr`.
