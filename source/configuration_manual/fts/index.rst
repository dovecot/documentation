.. _fts:

======================
FTS (Full Text Search)
======================

.. toctree::
  :maxdepth: 1

  dovecot
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

* `Solr <https://wiki.dovecot.org/Plugins/FTS/Solr>`_ communicates with
  Lucene's `Solr server <http://lucene.apache.org/solr/>`_.
* `Lucene <https://wiki.dovecot.org/Plugins/FTS/Lucene>`_ uses Lucene's C++
  library.
* :ref:`fts_backend_dovecot` is currently only available as part of the OX Dovecot Pro product.
* `Squat <https://wiki.dovecot.org/Plugins/FTS/Squat>`_ is Dovecot's own search
  index. (Obsolete in v2.1+)
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

Currently, Dovecot ships with three open-source plugins.  Two are based on
popular open-source search software SOLR and Lucene while the third uses a
custom storage format (called Squat).  While they all provide the same basic
functionality (i.e., indexing of messages), they have different advantages and
disadvantages and therefore one must decide which trade-offs are acceptable in
a particular deployment.

.. note::

  Squat was obsoleted in Dovecot version 2.1.

The SOLR backend is the most feature rich of the current implementations. It
uses the Apache Foundation SOLR search platform, which in turn uses the Java
implementation of the Lucene search library. This combination offers
“Advanced Full text Search capabilities”. These components run using Java
virtual machine (JVM) environments and it is possible to scale an
installation by adding more nodes running java virtual machines. However
using JVMs is quite resource intensive compared to Dovecot native components
and the achieved scaling comes at a high price as the number of required
host systems quickly grows very large.

The Lucene backend uses the C language version of the Lucene search library.
This makes this backend more efficient for small and mid-sized sites.
Because Dovecot uses a single index for all of a user’s messages, this
backend scales badly with large user accounts.  Additionally, this backend
does not have a surrounding framework, like SOLR, to enable easy
distribution to multiple indexing backend hosts.

Finally, Dovecot features a fully native FTS backend called Squat. When it
was implemented, it was the only backend to support arbitrary substring
indexing and matching. Arbitrary substring indexing means that any part of
a word, not only its beginning, can be used as a search term. Currently
also SOLR supports similar functionality, but enabling it increases SOLR's
already high resource requirements.


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

FTS indexing can be triggered by new mail delivery or IMAP SEARCH command.
Indexing can also be triggered manually using doveadm commands.


Enforce FTS
^^^^^^^^^^^

When FTS indexing fails, Dovecot falls back on using the built in search,
which does not have indexes for mail bodies. To disable this functionality,
enable :ref:`plugin-fts-setting-fts_enforced`.


Automatic Indexing
^^^^^^^^^^^^^^^^^^

Proactive, automatic indexing, which can be triggered when mail is delivered
or appended to the users mailbox, is enabled via the
:ref:`plugin-fts-setting-fts_autoindex` plugin setting.

Manual Indexing
^^^^^^^^^^^^^^^

The indexing can be done manually by running:

.. code-block:: none

  doveadm index -u user@domain -q INBOX


Indexing attachments
--------------------

Attachments can be indexed either via a script that translates the attachment
to UTF-8 plaintext or Apache Tika server.

* ``fts_decoder=<service>``: Decode attachments to plaintext using this service
  and index the resulting plaintext. See the ``decode2text.sh`` script included
  in Dovecot for how to use this.
* ``fts_tika=http://tikahost:9998/tika/``: This URL needs to be running Apache
  Tika server (e.g. started with ``java -jar
  tika-server/target/tika-server-1.5.jar``)

  .. versionadded:: v2.2.13


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
