.. _fts:

======================
FTS (Full Text Search)
======================

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
* `Dovecot Pro FTS <https://www.open-xchange.com/portfolio/ox-dovecot-pro/>`_
  is currently only available as part of the OX Dovecot Pro product.
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
(:ref:`setting-plugin-fts_enforced`).

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

Dovecot splits the full text search functionality into two parts - a common
library (lib-fts) and backends responsible for storing the tokens produced by
the common library persistently.  The goal is to provide more
customizability for searching and a more unified range of features across the
backends. The backends are implemented as plugins.

See also https://wiki.dovecot.org/Plugins/FTS

The library portion implements common searching and indexing features:

+---------------------+------------------------------------------------+
| Feature             | Summary                                        |
+=====================+================================================+
| Normalization       | Unify saved form of text as much as possible   |
+---------------------+------------------------------------------------+
| Stemming            | Reduce words to their basic forms              |
+---------------------+------------------------------------------------+
| Language Detection  | Detect language of processed text              |
+---------------------+------------------------------------------------+
| Skip stop words     | A configurable list of words not to be indexed |
+---------------------+------------------------------------------------+
| Skip bad characters | E.g., non-language characters, base64 data,    |
|                     | HTML tags                                      |
+---------------------+------------------------------------------------+
| Decompound          | Index compounded words separately              |
+---------------------+------------------------------------------------+


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

Dovecot FTS is a proprietary FTS plugin available for OX Dovecot Pro. It
provides fast and compact indexing of search data.

All Dovecot indexes, including FTS indexes, are stored in the same storage
(including object storage) used to store the mail and index data. No
separate permanent storage media is needed for the FTS indexes.

The pre and post processing of input data and search terms heavily relies on
the upper level fts-plugin and lib-fts. Most of the configuration options
affect lib-fts functionality.

See also http://wiki.dovecot.org/Plugins/FTS

.. todo:: Link to Pro section below


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
enable :ref:`setting-plugin-fts_enforced`.


Automatic Indexing
^^^^^^^^^^^^^^^^^^

Proactive, automatic indexing, which can be triggered when mail is delivered
or appended to the users mailbox, is enabled via the
:ref:`setting-plugin-fts_autoindex` plugin setting.

Manual Indexing
^^^^^^^^^^^^^^^

The indexing can be done manually by running:

.. code-block:: none

  doveadm index -u user@domain -q INBOX


Languages
^^^^^^^^^

The setting :ref:`setting-plugin-fts_languages` lists languages FTS should
detect.


Filters
^^^^^^^

List of filters to apply. Filters can be language specific.

See :ref:`setting-plugin-fts_filters`


Tokenizers
^^^^^^^^^^

List of tokenizers to use.

See :ref:`setting-plugin-fts_tokenizers`


On filter and tokenizer order
-----------------------------

The filters and tokenizers are created in the order they are declared in
their respective settings in the configuration file. They form a chain, where
the first filter or tokenizer is the parent or grandparent of the rest. The
direction of the data flow needs some special attention.

In filters, the data flows from parent to child, so tokens are first passed
to the grandparent of all filters and then further down the chain. For some
filtering chains the order is important. E.g. the snowball stemmer wants all
input in lower case, so the filter lower casing the tokens will need to be
listed before it.

In tokenizers however, the data however flows from child to parent. This
means that the tokenizer listed 'last' gets the processed data 'first'.

So, for filters data flows “left to right” through the filters listed in the
configuration. In tokenizers the order is “right to left”.

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


Example Configuration:
----------------------

Example configuration using OBOX::

  #These are assumed below, 
  #mail_location = obox:%2Mu/%2.3Mu/%u:INDEX=~/:CONTROL=~/
  #obox_fs = fscache:1G:/tmp/fscache:s3:http://mails.s3.example.com/

  mail_plugins = $mail_plugins fts fts_dovecot

  plugin {
    fts = dovecot

    # Fall back to built in search.
    #fts_enforced = no

    # Local filesystem example:
    # Use local filesystem storing FTS indexes
    #fts_dovecot_fs = posix:prefix=%h/fts/ 

    # OBOX example:
    # Keep this the same as obox_fs plus the root "directory" in mail_location
    # setting. Then append e.g. /fts/
    # Example: s3:http://<ip.address.>/%2Mu/%2.3Mu/%u/fts/
    fts_dovecot_fs = fts-cache:fscache:1G:/tmp/fts-cache:s3:http://fts.s3.example.com/%2Mu/%2.3Mu/%u/fts/

    # Detected languages. Languages that are not recognized, default to the
    # first enumerated language, i.e. en.
    fts_languages = en fr # English and French. 

    # This chain of filters first normalizes and lower cases the text, then
    #  stems the words and lastly removes stopwords.
    fts_filters = normalizer-icu snowball stopwords

    # This chain of filters will first lowercase all text, stem the words,
    # remove possessive suffixes, and remove stopwords.
    fts_filters_en = lowercase snowball english-possessive stopwords

    # These tokenizers will preserve addresses as complete search tokens, but
    # otherwise tokenize the text into "words".
    fts_tokenizers = generic email-address
    fts_tokenizer_generic = algorithm=simple

    # Proactively index mail as it is delivered or appended, not only when
    # searching.
    fts_autoindex=yes

    # How many \Recent flagged mails a mailbox is allowed to have, before it
    # is not autoindexed.
    # This setting can be used to exclude mailboxes that are seldom accessed
    # from automatic indexing.
    fts_autoindex_max_recent_msgs=99

    # Exclude mailboxes we do not wish to index automatically.
    # These will be indexed on demand, if they are used in a search.
    fts_autoindex_exclude = \Junk
    fts_autoindex_exclude2 = \Trash
    fts_autoindex_exclude3 = .DUMPSTER
  }


Dovecot FTS Engine
------------------

FS Settings
^^^^^^^^^^^

The :ref:`setting-plugin-fts_dovecot_fs` setting defines the location for the
fts indexes.

The Dovecot FTS indexes are created and queried by a custom FTS engine. The
FTS engine component is loaded into the Dovecot FTS plugin as an index
backend and it processes text input from the FTS tokenizer and filter chains
and search queries constructed by the FTS plugin.

Data Storage Engine
^^^^^^^^^^^^^^^^^^^

Each account's mail is indexed into a small set of control files, and one or
more triplets of files.

The control files are::

  S - the 'Stats' cache - contains information about all of the triplets
  X - the 'eXpunge' file - a list of mails to be expunged
  Y - the 'expunged' file - a list of mails that have been expunged

Both X and Y grow by being appended to. When Y grows to sufficient size to
indicate that the X file contains old stuff, the contents of Y will be
subtracted from X, and Y will be deleted. This is automatic as part of an
expunge.

Each triplet contains of the following::

  D - the 'Docindex', or index of documents - contains { mailbox_guid, uid, header/mime_part } info
  W - the 'Wordlist' - contains all the indexed words, and offsets into the L file
  L - the 'docList' - containing lists of indices into the D file.

To perform a lookup of a word, find the L-offset for that word from the W
file. From that offset in the L file, read the list of docidx (document
index) values. From the D file, look up the { guid, uid, hdr/part } values.

This sounds complicated, but if a word is not found, you don't need to touch
the L and D files. If (AND) searching for multiple words, and one of the words
is not in the W file, then you don't need to touch the L file. If (AND)
searching, and the intersection of the lists in the L file is empty, then you
don't need to touch the D file.

These three files can be considered as 2 dimensional data, with W and D being
the two axes, and L being the 2D region itself. Preferably in typical use the
L files dominate the sizes. However, because deciding what is and isn't a
"word" is hard, the W files also can grow very large.

For storage planning, Product decision is to assume that no FTS file will
exceed 500MB.  Theoretically, they could grow past that size, but allowing
non-sparse objects to be used in Scality (for obox) is a valid trade-off for
better performance.

Stats Caching
^^^^^^^^^^^^^

Stats for each triplet are cached in the 'S' file - this includes the number
of entities (documents (= headers + parts) for D, words for W, and matches
for L files).

Maxuid stats for every mailbox_guid in each triplet are also cached in the
same file. This helps give fast answers to some common queries.

FTS Caches
^^^^^^^^^^

By default FTS has no read or write caches. When indexing a new mail the
FTS indexes are immediately written to the storage. With object storages this
means quite a lot of write and delete operations. To optimize this, "fts-cache"
was implemented for write caching. The fts-cache causes the last triplet to
be kept in local metacache until one of the following happens:

 * fts.L file's size grows larger than :ref:`setting-plugin-fts_dovecot_min_merge_l_file_size` (default: 128 kB)
 * The triplet has at least :ref:`setting-plugin-fts_dovecot_mail_flush_interval` number of mails. Note that the default is 0, which means this check isn't done at all.
 * Metacache is flushed

FTS is commonly also configured to use "fscache", which caches reading of
FTS triplets that were already saved to the object storage.

Lookups
^^^^^^^

The precise techniques for doing lookups depends on whether it's an AND or
an OR query. AND permits early aborts before any of the L file is even
touched. OR invites no such optimisation.


Dovecot General FTS Configuration
---------------------------------

.. _setting-plugin-fts_autoindex:

``fts_autoindex``
-----------------

- Default: ``no``
- Values: ``yes`` or ``no``

If enabled, index mail as it is delivered or appended.

See :ref:`setting-plugin-fts_autoindex_exclude`

See :ref:`setting-plugin-fts_autoindex_max_recent_msgs`


.. _setting-plugin-fts_autoindex_exclude:

``fts_autoindex_exclude``
-------------------------

- Default: ``no``

To exclude a mailbox from automatic indexing, it can be listed in this
setting.  To exclude additional mailboxes, add sequential numbers to the end
of the plugin name.  Example::

  fts_autoindex_exclude = \Junk
  fts_autoindex_exclude2 = \Trash
  fts_autoindex_exclude3 = Foo

.. todo:: Does this work on mailbox flags (like \Junk and \Trash), not just mailbox names?


.. _setting-plugin-fts_autoindex_max_recent_msgs:

``fts_autoindex_max_recent_msgs``
---------------------------------

- Default: <empty>

To exclude infrequently accessed mailboxes from automatic indexing, set this
value to the maximum number of \Recent flagged messages that exist in the
mailbox.

Mailboxes with more flagged \Recent messages than this value will not be
autoindexed, even though they get deliveries or appends. This is useful for,
e.g., inactive Junk folders.

Any folders excluded from automatic indexing will still be indexed, if a
search on them is performed.


.. _setting-plugin-fts_enforced:

``fts_enforced``
----------------

- Default: ``no``
- Values: ``yes``, ``no`` or ``body``

Require FTS indexes to perform a search?

If disabled, and searching using FTS fails, Dovecot will fall back on using the
built in search which does not have indexes for mail bodies. This may timeout
for large mailboxes and/or slow storage.

+-----+-----------+-----------------+---------------------------------------------------------------------+-------------------------+
|Value|Search type|FTS index updated|Error handling                                                       |New in version           |
+=====+===========+=================+=====================================================================+=========================+
|yes  |header     |yes              |Fail search                                                          |.. versionadded:: v2.2.19|
+-----+-----------+-----------------+---------------------------------------------------------------------+-------------------------+
|yes  |body       |yes              |Fail search                                                          |.. versionadded:: v2.2.19|
+-----+-----------+-----------------+---------------------------------------------------------------------+-------------------------+
|no   |header     |no               |Search without FTS: Try to use dovecot.index.cache, or open all mails|.. versionadded:: v2.2.19|
+-----+-----------+-----------------+---------------------------------------------------------------------+-------------------------+
|no   |body       |yes              |Search without FTS by opening all mails                              |.. versionadded:: v2.2.19|
+-----+-----------+-----------------+---------------------------------------------------------------------+-------------------------+
|body |header     |no               |Fail search                                                          |.. versionadded:: v2.3.7 |
+-----+-----------+-----------------+---------------------------------------------------------------------+-------------------------+
|body |body       |yes              |Fail search                                                          |.. versionadded:: v2.3.7 |
+-----+-----------+-----------------+---------------------------------------------------------------------+-------------------------+

.. _setting-plugin-fts_index_timeout:

``fts_index_timeout``
---------------------

- Default: <no timeout>

When SEARCH notices that index isn't up to date, it tells indexer to index the 
mails and waits until it is finished. This setting adds a maximum timeout to 
this wait. If the timeout is reached, the SEARCH fails with:
``NO [INUSE] Timeout while waiting for indexing to finish``


.. _setting-plugin-fts_filters:

``fts_filters``
-----------------

- Default: 

.. todo:: What is default?

The list of filters to apply.

Language specific filter chains can be specified with ``fts_filters_<lang>``.

List of available filters:

``lowercase``:

  Change all text to lower case. Supports UTF8, when compiled with libicu and
  the library is installed. Otherwise only ASCII characters are lower cased.

``stopwords``:

  Filter certain common and short words, which are usually useless for
  searching.

  Settings: ``stopwords_dir``, path to the directory containing stopword files.

  Stopword files are looked up in ``”<path>”/stopwords_<lang>.txt``.

  Currently Dovecot distributes stopword files for the following languages:

  +---------------+----------+
  | Language Code | Language |
  +===============+==========+
  | en            | English  |
  +---------------+----------+
  | fi            | Finnish  |
  +---------------+----------+
  | fr            | French   |
  +---------------+----------+

  More can be obtained from the Apache Lucene project or the snowball stemmer
  source.

  Stopword language files are also available from
  https://github.com/stopwords-iso/.

``snowball``:

  Stemming tries to convert words to a common base form. A simple example is
  converting “cars” to “car”.

  This stemmer is based on the Snowball stemmer library.
  
  Supported languages:

  +---------------+---------------------------------------+
  | Language Code | Language                              |
  +===============+=======================================+
  | da            | Danish                                |
  +---------------+---------------------------------------+
  | de            | German                                |
  +---------------+---------------------------------------+
  | en            | English                               |
  +---------------+---------------------------------------+
  | es            | Spanish                               |
  +---------------+---------------------------------------+
  | fi            | Finnish                               |
  +---------------+---------------------------------------+
  | it            | Italian                               |
  +---------------+---------------------------------------+
  | nl            | Dutch                                 |
  +---------------+---------------------------------------+
  | no            | Norwegian (Bokmål & Nynorsk detected) |
  +---------------+---------------------------------------+
  | pt            | Portuguese                            |
  +---------------+---------------------------------------+
  | ro            | Romanian                              |
  +---------------+---------------------------------------+
  | ru            | Russian                               |
  +---------------+---------------------------------------+
  | sv            | Swedish                               |
  +---------------+---------------------------------------+

``normalizer-icu``:

  Normalize text using libicu. This is potentially very resource intensive.

  Caveat for Norwegian: The default normalizer filter does not modify U+00F8
  (Latin Small Letter O with Stroke). In some configurations it might be
  desirable to rewrite it to e.g. o. Same goes for the upper case version.
  This can be done by passing a modified “id” setting to the normalizer filter.
  Similar cases can exists for other languages as well.

  Settings: ``id``, description of the normalizing/transliterating rules to use.
  See http://userguide.icu-project.org/transforms/general#TOC-Transliterator-Identifiers for syntax.
  Defaults to ``Any-Lower; NFKD; [: Nonspacing Mark :] Remove; [\\x20] Remove``

``english-possessive``:

  Remove trailing ``'s`` from english possessive form tokens. Any trailing
  single ``'`` characters are already removed by tokenizing, whether this
  filter is used or not.

  The snowball filter also removes possessive suffixes from English, so when
  using snowball, english-possessive is not needed. Snowball quite likely
  produces better results, so english-possessive is advisable only when
  snowball is not available or can not be used due to extreme CPU performance
  requirements.

``contractions``:

  Removes certain contractions that can prefix words. The idea is to only
  index the part of the token that conveys the core meaning.

  Only works with the French language, so the language of the input needs to
  be recognized by textcat as French.

  It filters “qu'”, “c'”, “d'”, “l'”, “m'”, “n'”, “s'” and “t'”.

  Do not use at the same time as ``generic`` tokenizer with
  ``algorithm=tr29 wb5a=yes``.

  Example::

    fts_filters = normalizer-icu snowball stopwords
    fts_filters_en = lowercase snowball english-possessive stopwords


.. _setting-plugin-fts_languages:

``fts_languages``
-----------------

- Default: 

.. todo:: What is default?

List languages FTS should detect.

The stemming and stopword filters are language dependent.

Language names are given as ISO 639-1 alpha 2 codes. Languages not in the
list, are categorized as the first listed language.
.. todo:: What does this mean?

Currently supported languages:

+---------------+---------------------------------------+
| Language Code | Language                              |
+===============+=======================================+
| da            | Danish                                |
+---------------+---------------------------------------+
| de            | German                                |
+---------------+---------------------------------------+
| en            | English                               |
+---------------+---------------------------------------+
| es            | Spanish                               |
+---------------+---------------------------------------+
| fi            | Finnish                               |
+---------------+---------------------------------------+
| fr            | French                                |
+---------------+---------------------------------------+
| it            | Italian                               |
+---------------+---------------------------------------+
| jp            | Japanese                              |
|               | (Requires separate Kuromoji license)  |
+---------------+---------------------------------------+
| nl            | Dutch                                 |
+---------------+---------------------------------------+
| no            | Norwegian (Bokmal & Nynorsk detected) |
+---------------+---------------------------------------+
| pt            | Portuguese                            |
+---------------+---------------------------------------+
| ro            | Romanian                              |
+---------------+---------------------------------------+
| ru            | Russian                               |
+---------------+---------------------------------------+
| sv            | Swedish                               |
+---------------+---------------------------------------+


.. _setting-plugin-fts_tokenizers:

``fts_tokenizers``
------------------

- Default: ``generic email-address``

The list of tokenizers to use.

List of tokenizers:

``generic``:

  Input data, such as email text and headers, need to be divided into words
  suitable for indexing and searching. The generic tokenizer does this.

  Settings:

    ``maxlen``: Maximum length of token, before an arbitrary cut off is made.
                Defaults to FTS_DEFAULT_TOKEN_MAX_LENGTH. The default is
                probably OK.

    ``algorithm``: Accepted values are ``simple`` or ``tr29``. It defines the
                   method for looking for word boundaries. Simple is faster and
                   will work for many texts, especially those using latin
                   alphabets, but leaves corner cases. The tr29 implements a
                   version of Unicode technical report 29 word boundary lookup.
                   It might work better with e.g. texts containing Katakana or
                   Hebrew characters, but it is not possible to use a single
                   algorithm for all existing languages. The default is simple.

    ``wb5a``: Unicode TR29 rule WB5a setting to the tr29 tokenizer. Splits
              prefixing contracted words from base word.
              E.g. “l'homme” → “l” “homme”. Together with a language
              specific stopword list unnecessary contractions can thus be
              filtered away. This is disabled by default and only works with
              the TR29 algorithm. Enable by
              ``fts_tokenizer_generic = algorithm=tr29 wb5a=yes``.

``email-address``:

  This tokenizer preserves email addresses as complete search tokens, by
  bypassing the generic tokenizer, when it finds an address. It will only
  work as intended if it is listed **after** other tokenizers.

``kuromoji``:

  This tokenizer is used for Japanese text. This tokenizer
  utilizes Atilika Kuromoji tokenizer library to tokenize Japanese text. This
  tokenizer also does NFKC normalization before tokenization. What NFKC
  normalization does is half-width and full-width character normalizations,
  such as:

    * transform half-width Katakana letters to full-width.
    * transform full-width number letters to half-width
    * transform those special letters (e.g, 1 will be transformed to 1, and 平成 to 平成)

  Settings:

    ``maxlen``: Maximum length of token, before an arbitrary cut off is made.
                The default value for the kuromoji tokenizer is 1024.

    ``kuromoji_split_compounds``: This setting enables “search mode” in the
                                  Atilika Kuromoji library. The setting
                                  defaults to enabled (i.e .1) and should not
                                  be changed unless there is a compelling
                                  reason. To disable, set the value to 0. NB
                                  If this setting is changed, existing FTS
                                  indexes will produce unexpected results. The
                                  FTS indexes should be recreated in this case.

    ``id``: Description of the normalizing/transliterating rules to use.
            See http://userguide.icu-project.org/transforms/general#TOC-Transliterator-Identifiers
            for syntax. Defaults to “Any-NFKC” which is quite good for CJK text
            mixed with latix alphabet languages. It transforms CJK characters to
            full-width encoding and transforms latin ones to half-width. The
            NFKC transformation is described above. NB In case this setting is
            changed, existing FTS indexes will produce unexpected results. The
            FTS indexes should be recreated.

  We use the predefined set of stopwords which is recommended by Atilika. Those
  stopwords are reasonable and they have been made by tokenizing Japanese
  Wikipedia and have been reviewed by us. This set of stopwords is also
  included in the Apache Lucene and Solr projects and it is used by many
  Japanese search implementations.


OX Dovecot Pro FTS Plugin Configuration
---------------------------------------

.. _setting-plugin-fts_dovecot_filename_sizes:

``fts_dovecot_filename_sizes``
------------------------------

- Default: <empty>

Specifies whether or no filenames should contain the file size.

Example::

  fts.D_238a58274822005cc3350000654d370e.000000b1-00000698.0001   # with size (0x698 == 1688 bytes)
  fts.D_bc75a6128d5fff5b83070000654d370e.00000046.0001            # without size

The possible values are:

  * ``yes``: Include sizes in new triplets' filenames (recommended for fresh installations)
  * ``no``: Do not include sizes in new triplets' filenames
  * ``"yes-force``: like ``yes``, but running ``doveadm fts optimize`` will replace all triplets with new ones using sizes in the filenames
  * ``no-force``: like ``no``, but running ``doveadm fts optimize`` will replace all triplets with new ones not using sizes in the filenames


.. _setting-plugin-fts_dovecot_fs:

``fts_dovecot_fs``
-------------------

- Default: <empty>

Define the location for the fts cache and indexes path on remote filesystems.

It must be somewhat synchronized with :ref:`plugin-obox-setting_obox_fs` and ``mail_location``, see also :ref:`mail_location_settings`.



A simple example when using obox with Scality sproxyd::

  mail_location = obox:%2Mu/%2.3Mu/%u:INDEX=~/:CONTROL=~/
  obox_fs = s3:http://192.168.0.1/
  fts_dovecot_fs = s3:http://192.168.0.1/%2Mu/%2.3Mu/%u/fts/

It is strongly recommended to use fscache to speed up Obox and Dovecot FTS
operation. It is recommended that the FTS and email fscaches point to
DIFFERENT locations. Adding cache to the previous example::

  mail_location = obox:%2Mu/%2.3Mu/%u:INDEX=~/:CONTROL=~/
  obox_fs = fscache:1G:/tmp/fscache:s3:http://192.168.0.1/
  fts_dovecot_fs = fts-cache:fscache:1G:/tmp/fts-cache:s3:http://192.168.0.1/%2Mu/%2.3Mu/%u/fts/

It is also possible to use local storage for FTS::

  fts_dovecot_fs = fts-cache:posix:prefix=/tmp/storage/%u/fts/:no-fsync

If using Cassandra, this is needed::

  fts_dovecot_fs = fts-cache:fscache:1G:/tmp/fts-cache:dictmap:proxy:idle_msecs=10000:dict-async:cassandra ; s3:http://192.168.0.1/%2Mu/%2.3Mu/%u/fts/ ; dict-prefix=%u/fts/

An example using mysql as dict::

  fts_dovecot_fs = fts-cache:fscache:1G:/tmp/cache/mails: compress:gz:6:dictmap:proxy::mysql ; sproxyd:http://localhost:801/?class=2&slow_warn_msecs=60000 ; dict-prefix=%u/fts/


.. _setting-plugin-fts_dovecot_prefix:

``fts_dovecot_prefix``
----------------------

.. versionadded:: v2.3.5

- Default: ``no``

Specifies how prefix search should be invoked. May not work with some
filters.

Options:

  * ``yes``: equivalent to ``0-255``
  * ``<num>-[<num>]``: search strings with that length will be treated as prefixes (e.g. "4-", "3-10")
  * ``no`` : no prefix searching is performed (this is the default)


.. _setting-plugin-fts_dovecot_min_merge_l_file_size:

``fts_dovecot_min_merge_l_file_size``
-------------------------------------

.. versionadded:: v2.3.5

- Default: ``128 kB``

The smallest FTS triplet is getting recreated whenever indexing new mails until
it reaches this size. Then the triplet becomes merged with the next largest
triplet.

When fts-cache is used, this effectively controls how large the fts.L file
can become in metacache until the FTS triplet is uploaded to object storage.


.. _setting-plugin-fts_dovecot_mail_flush_interval:

``fts_dovecot_mail_flush_interval``
-----------------------------------

.. versionadded:: v2.3.5

- Default: ``0`` (none)

Upload locally cached FTS indexes to object storage every N new emails. This
reduces the number of emails that have to be read after backend failure to
update the FTS indexes, but at the cost of doing more writes to object storage.

The recommended value is 10. This will become the default in some future
version.
