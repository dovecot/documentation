.. _fts:

======================
FTS (Full Text Search)
======================

.. toctree::
  :maxdepth: 1

  dovecot
  solr
  flatcurve
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
search through all messages (default behavior). If storage latencies are high,
this searching may not be completed in a reasonable time, or resource
utilization may be too large, especially in mailboxes with large messages.

Dovecot maintains these FTS indexing engines:

============================= ================================================
Name                           Description
============================= ================================================
:ref:`fts_backend_dovecot`    Dovecot native, object storage optimized driver.
                              Only available as part of
                              :ref:`ox_dovecot_pro`.
:ref:`fts_backend_solr`       Interface to
                              `Apache Solr <https://solr.apache.org/>`_;
                              stores data remotely.
:ref:`fts_backend_flatcurve`  `Xapian`_ based driver; stores data locally.
============================= ================================================

.. _`Xapian`: https://xapian.org/

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
(:dovecot_plugin:ref:`fts_enforced`).

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

Some of the FTS backends do their own internal tokenization, although it's
possible to configure them to use the lib-fts tokenization as well.

See :ref:`fts_tokenization` for more details about configuring the
tokenization.

All backends are implemented as plugins.


Open-Source Dovecot Full Text Search Backends
---------------------------------------------

Currently, Dovecot maintains two open-source FTS drivers: Flatcurve and Solr.

:ref:`Flatcurve <fts_backend_flatcurve>` is designed as a simple, built-in option.  Data is stored locally in the mailbox storage location.

:ref:`Solr <fts_backend_solr>` enables more advanced searching and storage options, but requires operation of an external server (and associated storage).

OX Dovecot Pro Full Text Search Backend
---------------------------------------

:ref:`fts_backend_dovecot` is a proprietary FTS plugin available for
:ref:`ox_dovecot_pro`. It provides fast and compact indexing of search data.

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

Missing mails are always added to FTS indexes when using IMAP SEARCH command
that attempts to access the FTS indexes.

Automatic FTS indexing can also be done during mail delivery, IMAP APPEND and
other ways of adding mails to mailboxes using
:dovecot_plugin:ref:`fts_autoindex`.

Indexing can also be triggered manually:

.. code-block:: none

  doveadm index -u user@domain -q INBOX


Enforce FTS
^^^^^^^^^^^

When FTS indexing fails, Dovecot falls back on using the built-in search,
which does not have indexes for mail bodies.

This could end up opening all the mails in the mailbox, which often isn't
wanted.

To disable this functionality, enable :dovecot_plugin:ref:`fts_enforced`.


Indexing Attachments
--------------------

Attachments can be indexed either via a script that translates the attachment
to UTF-8 plaintext or Apache Tika server.

* :dovecot_plugin:ref:`fts_decoder`: Use decoder script.
* :dovecot_plugin:ref:`fts_tika`: Use Apache Tika server.

.. note:: :dovecot_plugin:ref:`fts_decoder` and :dovecot_plugin:ref:`fts_tika`
          cannot be used simultaneously

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

In Dovecot Pro FTS backend there are ``doveadm fts check`` commands, which
can be used to determine whether rescan is necessary. See
:ref:`fts_dovecot_consistency_check` for details.


Dovecot General FTS Configuration
---------------------------------

See :ref:`plugin-fts` for settings.
