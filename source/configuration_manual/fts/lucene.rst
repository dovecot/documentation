.. _fts_backend_lucene:

Lucene FTS Engine
=================

**NOTE**: Although the fts-lucene plugin works, it's using CLucene
library, which is very old and has some bugs. It's a much better idea to
use :ref:`fts_backend_solr` instead, which has much more features and is more
stable.

Requires Dovecot v2.1+ to work properly. The CLucene version must be
v2.3 (not v0.9). Dovecot builds only a single Lucene index for all
mailboxes. The Lucene indexes are stored in ``lucene-indexes/``
directory under the mail root index directory (e.g.
``~/Maildir/lucene-indexes/``).

Compilation
-----------

If you compile Dovecot yourself, you must add the following switches to
your configure command for the plugin to be built:

::

   --with-lucene --with-stemmer

The second switch is only required if you have compiled libstemmer
yourself or if it's included in the CLucene you are using.

Configuration
-------------

Into 10-mail.conf (note add existing plugins to string)

::

   mail_plugins = $mail_plugins fts fts_lucene

Into 90-plugins.conf

::

   plugin {
     fts = lucene
     # Lucene-specific settings, good ones are:
     fts_lucene = whitespace_chars=@.
   }

The fts-lucene settings include:

-  whitespace_chars=<chars>: List of characters that are translated to
   whitespace. You may want to use "@." so that e.g. in
   "``first.last@example.org``" it won't be treated as a single word,
   but rather you can search separately for "first", "last" and
   "example".

-  default_language=<lang>: Default stemming language to use for mails.
   The default is english. Requires that Dovecot is built with
   libstemmer, which also limits the languages that are supported.

-  textcat_conf=<path> textcat_dir=<path>: If specified, enable guessing
   the stemming language for emails and search keywords. This is a
   little bit problematic in practice, since indexing and searching
   languages may differ and may not find even exact words because they
   stem differently.

-  no_snowball: Support normalization of indexed words even without
   stemming and libstemmer (Snowball). (v2.2.3+)

-  mime_parts: Index each MIME part separately and include the MIME part
   number in the "part" field. In future versions this will allowing
   showing which attachment matched the search result. (v2.2.13+)

Libraries
---------

-  `CLucene <http://sourceforge.net/projects/clucene/files/>`__: Get
   v2.3.3.4 (not v0.9)

-  `libstemmer <http://snowball.tartarus.org/download.php>`__: Builds
   libstemmer.o, which you can rename to libstemmer.a

-  `textcat <http://textcat.sourceforge.net/>`__
