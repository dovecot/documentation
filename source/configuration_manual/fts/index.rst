.. _fts:

======================
FTS (Full Text Search)
======================

.. toctree::
  :maxdepth: 1

  dovecot
  solr
  tokenization

Introduction
------------

As the amount and importance of information stored in email messages is
increasing in people’s everyday lives, searching through those messages is
becoming ever more important. At the same time mobile clients add their own
restrictions for what can be done on the client side. The ever diversifying
mail client software also tests the limits of the IMAP protocol and current
server implementations.

Furthermore, the IMAP protocol requires some rather complicated and expensive
searching capabilities.  For example, the protocol requires arbitrary
substring matching.  Some newer mobile clients (e.g. Apple iOS) rely on this
functionality.

Without a high-performance index, Dovecot must fall back to a slow sequential
search through all messages. If storage latencies are high, this searching
may not be completed in a reasonable time, or resource utilization may be
too large, especially in mailboxes with large messages.

Dovecot supports the following FTS indexing engines:

* :ref:`fts_backend_solr` communicates with
  Lucene's `Solr server <http://lucene.apache.org/solr/>`_.
* :ref:`fts_backend_dovecot` is currently only available as part of the OX Dovecot Pro product.
* :ref:`fts_backend_squat` is Dovecot's own search index. (Obsolete in v2.1+)
* `fts-xapian <https://github.com/grosjo/fts-xapian>`_ is `Xapian <https://xapian.org/>`_ based plugin. (Requires v2.3+)
* `fts-elastic <https://github.com/filiphanes/fts-elastic>`_ is `ElasticSearch <https://www.elastic.co>`_ based plugin.
* `fts-elasticsearch <https://github.com/atkinsj/fts-elasticsearch>`_ is another `ElasticSearch <https://www.elastic.co>`_ based plugin.


Searching In Dovecot
--------------------

When a FTS indexing backend is not present, searches use a slow sequential
search through all message data. This is both computationally and time
expensive. It is desirable to pre-index data so that searches can be executed
against this index.

There is a subtle but important distinction between searching through message
headers and searching through message bodies.

Searching through message bodies (via the standard IMAP 'SEARCH TEXT/BODY'
commands) makes use of the FTS indexes.

On the other hand, searching through message headers benefits from Dovecot's
standard index and cache files (dovecot.index and dovecot.index.cache), which
often contain the necessary information.  It is possible to redirect header
searches to FTS indexes via a configuration option
(:ref:`plugin-fts-setting-fts_enforced`).

Triggers for FTS indexing are configurable. It can be started on demand when
searching, or automatically when new messages arrive or as a batch job.

By default the FTS indexes are updated only while searching, so neither
LDA/LMTP nor an IMAP 'APPEND' command updates the indexes immediately. This
means that if a user has received a lot of mail since the last indexing
(i.e., the last search operation), it may take a while to index all the new
mails before replying to the search command. Dovecot sends periodic “* OK
Indexed n% of the mailbox” updates which can be caught by client
implementations to implement a progress bar.

Updating the FTS index as messages arrive makes for a more responsive user
experience, especially for users who don’t search often, but have a lot of
mail. On the other hand, it increases overall system load regardless of
whether or not the indexes will ever be used by the user.


Dovecot FTS Architecture
------------------------

Dovecot splits the full text search functionality into two parts:
a common tokenization library (lib-fts) and backend indexing engine responsible for storing the tokens produced by the common library persistently.
Some of the FTS backends do their own internal tokenization, although it's possible to configure them to use the lib-fts tokanization as well.
The backends are implemented as plugins.

See :ref:`fts_tokenization` for more details about configuring the tokenization.


Open-Source Dovecot Full Text Search Backends
---------------------------------------------

Currently, Dovecot only maintains one open-source FTS driver: Solr.

The SOLR backend is the most feature rich of the current implementations. It
uses the Apache Foundation SOLR search platform, which in turn uses the Java
implementation of the Lucene search library. This combination offers
“Advanced Full text Search capabilities”. These components run using Java
virtual machine (JVM) environments and it is possible to scale an
installation by adding more nodes running java virtual machines. However
using JVMs is quite resource intensive compared to Dovecot native components
and the achieved scaling comes at a high price as the number of required
host systems quickly grows very large.


OX Dovecot Pro Full Text Search Backend
---------------------------------------

 * :ref:`fts_backend_dovecot`

Dovecot FTS is a proprietary FTS plugin available for OX Dovecot Pro. It
provides fast and compact indexing of search data.

All Dovecot indexes, including FTS indexes, are stored in the same storage
(including object storage) used to store the mail and index data. No
separate permanent storage media is needed for the FTS indexes.

The pre and post processing of input data and search terms heavily relies on
the upper level fts-plugin and lib-fts. Most of the configuration options
affect lib-fts functionality.


FTS Configuration
-----------------

FTS Indexing Triggers
^^^^^^^^^^^^^^^^^^^^^

Missing mails are always added to FTS indexes when using IMAP SEARCH command that attempts to access the FTS indexes.
Automatic FTS indexing can also be done during mail delivery, IMAP APPEND and other ways of adding mails to mailboxes using :ref:`plugin-fts-setting-fts_autoindex`.

Indexing can also be triggered manually::

  doveadm index -u user@domain -q INBOX


Enforce FTS
^^^^^^^^^^^

When FTS indexing fails, Dovecot falls back on using the built-in search, which does not have indexes for mail bodies.
This could end up opening all the mails in the mailbox, which often isn't wanted.
To disable this functionality, enable :ref:`plugin-fts-setting-fts_enforced`.


Indexing attachments
--------------------

Attachments can be indexed either via a script that translates the attachment
to UTF-8 plaintext or Apache Tika server.

* :ref:`plugin-fts-setting-fts_decoder`: Use decoder script.
* :ref:`plugin-fts-setting-fts_tika`: Use Apache Tika server.


Rescan
------

Dovecot keeps track of indexed messages in the dovecot.index files. If this
becomes out of sync with the actual FTS indexes (either too many or too few
mails), you'll need to do a rescan and then index missing mails:

.. code-block:: none

  doveadm fts rescan -u user@domain
  doveadm index -u user@domain -q '*'

Note that currently most FTS backends don't properly implement the rescan.
Instead, they simply delete all the FTS indexes. This may change in the
future versions.


Dovecot General FTS Configuration
---------------------------------

See :ref:`fts_plugin` for settings.


Deprecated/Unmaintained FTS Plugins
-----------------------------------

.. toctree::
  :maxdepth: 1

  lucene
  squat
