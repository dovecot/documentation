.. _plugin-fts-solr:

===============
fts-solr plugin
===============

.. seealso:: See: :ref:`fts_backend_solr` for details on Solr integration.

Settings
========

.. dovecot_plugin:setting:: fts_solr
   :plugin: fts-solr
   :values: @string

   Configuration of fts_solr driver.

   Format is a space separated list of options:

   .. code-block:: none

     fts_solr = [option1[=value1]] [option2[=value2]] [...]

   The following options are supported:

   ``url=<url>``

     * Default: ``https://localhost:8983/solr/dovecot/``
     * Values:  :ref:`string`
     * Required base URL for Solr.

       * Remember to add your core name if using solr 7+:
         ``"/solr/dovecot/"``.

   ``debug``

     * Default: no
     * Values:  <existence> (if ``debug`` exists, it is enabled)
     * Enable HTTP debugging. Writes to debug log.

   ``rawlog_dir=<directory>``

     .. dovecotadded:: 2.3.6

     * Default: <empty>
     * Values:  :ref:`string`
     * Enable rawlog debugging. Store HTTP exchanges between Dovecot and Solr
       in this directory.

   ``batch_size``

     .. dovecotadded:: 2.3.6

     * Default: ``1000``
     * Values:  :ref:`uint`
     * Configure the number of mails sent in single requests to Solr.

       * With ``fts_autoindex=yes``, each new mail gets separately indexed on
         arrival, so ``batch_size`` only matters when doing the initial
         indexing of a mailbox.
       * With ``fts_autoindex=no``, new mails don't get indexed on arrival, so
         ``batch_size`` is used when indexing gets triggered.

   ``soft_commit=yes|no``

     .. dovecotadded:: 2.3.6

     * Default: ``yes``
     * Values:  :ref:`boolean`
     * Controls whether new mails are immediately searchable via Solr.

       * See :ref:`fts_backend_solr-soft_commits` for additional information.

   Example:

   .. code-block:: none

     plugin {
       fts_solr = url=http://solr.example.org:8983/solr/ debug batch_size=1000
     }
