.. _plugin-fts-solr:

===============
fts-solr plugin
===============

.. seealso:: See: :ref:`fts_backend_solr` for details on Solr integration.

Settings
========


.. dovecot_plugin:setting:: fts_solr_batch_size
   :plugin: fts-solr
   :values: @uint
   :default: 1000

   Configures the number of mails sent to Solr in a single request.

   * With :dovecot_plugin:ref:`fts_autoindex` = ``yes``, each new mail gets
     separately indexed on arrival, so ``fts_solr_batch_size`` only matters
     during the initial indexing of a mailbox.

   * With :dovecot_plugin:ref:`fts_autoindex` = ``no``, new mails don't get
     indexed on arrival, so ``fts_solr_batch_size`` is used when indexing
     is triggered.

.. dovecot_plugin:setting:: fts_solr_soft_commit
   :plugin: fts-solr
   :values: @boolean
   :default: yes

   Controls whether new mails are immediately searchable via Solr.

   * See :ref:`fts_backend_solr-soft_commits` for additional information.


.. dovecot_plugin:setting:: fts_solr_url
   :plugin: fts-solr
   :values: @string

   Required base URL for Solr.

   * Remember to add your core name if using solr 7+:
     ``"/solr/dovecot/"``.


Example:

.. code-block:: none

  fts_solr_url = http://solr.example.org:8983/solr/dovecot/
  fts_solr_batch_size = 1000


Troubleshooting
===============

Debug can be activated using:

.. code-block:: none

  log_debug = category=fts-solr

Rawlogs can be activated using:

.. code-block:: none

  fts_solr {
    http_client_rawlog_dir = /path/to/writable/directory/solr-rawlogs
  }
