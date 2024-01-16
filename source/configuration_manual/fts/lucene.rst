.. _fts_backend_lucene:

Lucene FTS Engine
=================

.. dovecotremoved:: 2.4.0,3.0.0

.. seealso:: :ref:`fts_backend_solr`.

Requires Dovecot v2.1+ to work properly. The CLucene version must be
v2.3 (not v0.9). Dovecot builds only a single Lucene index for all
mailboxes. The Lucene indexes are stored in ``lucene-indexes/``
directory under the mail root index directory (e.g.
``~/Maildir/lucene-indexes/``).

The Lucene backend uses the C language version of the Lucene search library.
This makes this backend more efficient for small and mid-sized sites.
Because Dovecot uses a single index for all of a user’s messages, this
backend scales badly with large user accounts.  Additionally, this backend
does not have a surrounding framework, like SOLR, to enable easy
distribution to multiple indexing backend hosts.

Compilation
-----------

If you compile Dovecot yourself, you must add the following switches to
your configure command for the plugin to be built:

.. code-block:: none

   --with-lucene --with-stemmer

The second switch is only required if you have compiled libstemmer
yourself or if it's included in the CLucene you are using.

Configuration
-------------

Example config:

.. code-block:: none

  mail_plugins {
    fts = yes
    fts_lucene = yes
  }

  plugin {
    fts = lucene
    fts_lucene = whitespace_chars=@.
  }

The following options are supported:

- ``default_language=<lang>``: Default stemming language to use for mails. The
  default is english. Requires that Dovecot is built with libstemmer, which
  also limits the languages that are supported.
- ``mime_parts``: Index each MIME part separately and include the MIME part
  number in the "part" field. In future versions this will allowing showing
  which attachment matched the search result.
- ``no_snowball``: Support normalization of indexed words even without stemming
  and libstemmer (Snowball).
- ``textcat_conf=<path>``, ``textcat_dir=<path>``: If specified, enable
  guessing the stemming language for emails and search keywords. This is a
  little bit problematic in practice, since indexing and searching languages
  may differ and may not find even exact words because they stem differently.
- ``whitespace_chars=<chars>``: List of characters that are translated to
  whitespace. You may want to use "@." so that e.g. in "first.last@example.org"
  it won't be treated as a single word, but rather you can search separately
  for "first", "last" and "example".

Libraries
---------

* `CLucene <https://sourceforge.net/projects/clucene/files/>`_: Get v2.3.3.4
  (not v0.9)
* `libstemmer <http://snowball.tartarus.org/download.php>`_: Builds
  libstemmer.o, which you can rename to libstemmer.a
* `textcat <https://textcat.sourceforge.net/>`_
