.. _fts_plugin:

=============================
Full Text Search (FTS) plugin
=============================

.. _plugin-fts-setting-fts_autoindex:

``fts_autoindex``
-----------------

- Default: ``no``
- Values: :ref:`boolean`

If enabled, index mail as it is delivered or appended.

See :ref:`plugin-fts-setting-fts_autoindex_exclude`

See :ref:`plugin-fts-setting-fts_autoindex_max_recent_msgs`


.. _plugin-fts-setting-fts_autoindex_max_recent_msgs:

``fts_autoindex_max_recent_msgs``
-----------------------------------

.. versionadded:: 2.2.9

- Default: ``0`` (ignore)
- Values: :ref:`uint`

To exclude infrequently accessed mailboxes from automatic indexing, set this value to the maximum number of ``\Recent`` flagged messages that exist in the mailbox.

Mailboxes with more flagged ``\Recent`` messages than this value will not be autoindexed, even though they get deliveries or appends.
This is useful for, e.g., inactive Junk folders.

Any folders excluded from automatic indexing will still be indexed, if a search on them is performed.

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

To exclude a mailbox from automatic indexing, it can be listed in this setting.
To exclude additional mailboxes, add sequential numbers to the end of the plugin name.
It's possible to use either mailbox names or refer to them using special-use flags (e.g. ``\Trash``)

For example::

  fts_autoindex_exclude = \Junk
  fts_autoindex_exclude2 = \Trash
  fts_autoindex_exclude3 = External Accounts/*


.. _plugin-fts-setting-fts_index_timeout:

``fts_index_timeout``
------------------------

- Default: ``0`` (no timeout)
- Values: :ref:`uint`

When the full text search backend detects that the index isn't up-to-date,
the indexer is told to index the messages and is given this much time to do so.
If this time limit is reached, an error is returned, indicating that the search
timed out during waiting for the indexing to complete:
``NO [INUSE] Timeout while waiting for indexing to finish``


Example Setting:

.. code-block:: none

  plugin {
    fts_index_timeout = 60s
  }


.. _plugin-fts-setting-fts_enforced:

``fts_enforced``
----------------

- Default: ``no``
- Values: ``yes``, ``no`` or ``body``

Require FTS indexes to perform a search?

If disabled, and searching using FTS fails, Dovecot will fall back on using the
built in search which does not have indexes for mail bodies. This may timeout
for large mailboxes and/or slow storage.

+-------+-------------+-------------------+-----------------------------------------------------------------------+---------------------------+
| Value | Search type | FTS index updated | Error handling                                                        | New in version            |
+=======+=============+===================+=======================================================================+===========================+
| yes   | header      | yes               | Fail search                                                           | .. versionadded:: v2.2.19 |
+-------+-------------+-------------------+-----------------------------------------------------------------------+---------------------------+
| yes   | body        | yes               | Fail search                                                           | .. versionadded:: v2.2.19 |
+-------+-------------+-------------------+-----------------------------------------------------------------------+---------------------------+
| no    | header      | no                | Search without FTS: Try to use dovecot.index.cache, or open all mails | .. versionadded:: v2.2.19 |
+-------+-------------+-------------------+-----------------------------------------------------------------------+---------------------------+
| no    | body        | yes               | Search without FTS by opening all mails                               | .. versionadded:: v2.2.19 |
+-------+-------------+-------------------+-----------------------------------------------------------------------+---------------------------+
| body  | header      | no                | Fail search                                                           | .. versionadded:: v2.3.7  |
+-------+-------------+-------------------+-----------------------------------------------------------------------+---------------------------+
| body  | body        | yes               | Fail search                                                           | .. versionadded:: v2.3.7  |
+-------+-------------+-------------------+-----------------------------------------------------------------------+---------------------------+


.. _plugin-fts-setting-fts_filters:

``fts_filters``
-----------------

- Default: <none>

The list of filters to apply.

Language specific filter chains can be specified with ``fts_filters_<lang>`` (e.g. ``fts_filters_en``).

List of available filters:

``lowercase``:

  Change all text to lower case. Supports UTF8, when compiled with libicu and
  the library is installed. Otherwise only ASCII characters are lower cased.

``stopwords``:

  Filter certain common and short words, which are usually useless for
  searching.

  Settings: ``stopwords_dir``, path to the directory containing stopword files.

  Stopword files are looked up in ``”<path>”/stopwords_<lang>.txt``.

  See :ref:`fts_languages` for list of stopword files that are currently distributed with Dovecot.
  More can be obtained from the Apache Lucene project or the snowball stemmer
  source.

  Stopword language files are also available from
  https://github.com/stopwords-iso/.

``snowball``:

  Stemming tries to convert words to a common base form. A simple example is
  converting “cars” to “car”.

  This stemmer is based on the Snowball stemmer library.
  
  See ref:`fts_languages`

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

See also :ref:`fts_tokenization`


.. _plugin-fts-setting-fts_language_config:

``fts_language_config``
-----------------------

- Default: <textcat dir>

Path to the textcat/exttextcat configuration file, which lists the supported languages.
For example ``/usr/share/libexttextcat/fpdb.conf``.
This is recommended to be changed to point to a minimal version of a configuration that supports only the languages listed in :ref:`plugin-fts-setting-fts_languages`.
Doing this improves language detection performance during indexing and also makes the detection more accurate.


.. _plugin-fts-setting-fts_languages:

``fts_languages``
-----------------

- Default: <empty>

A space-separated list of languages that the full text search should detect.
At least one language must be specified.
The language listed first is the default and is used when language recognition fails.

For better performance it's recommended to synchronize this setting with the textcat configuration file, see :ref:`plugin-fts-setting-fts_language_config`.

The filters used for stemming and stopwords are language dependent.

Example setting:

.. code-block:: none

  plugin {
    fts_languages = en de
  }

.. _fts_languages:

FTS languages
^^^^^^^^^^^^^

Language names are given as ISO 639-1 alpha 2 codes.
Stemming support indicates whether the "snowball" filter can be used.
Stopwords support indicates whether a stopwords file is distributed with Dovecot.
Currently supported languages:

+---------------+---------------------------------------+----------+-----------+
| Language Code | Language                              | Stemming | Stopwords |
+===============+=======================================+==========+===========+
| da            | Danish                                | Yes      | Yes       |
+---------------+---------------------------------------+----------+-----------+
| de            | German                                | Yes      | Yes       |
+---------------+---------------------------------------+----------+-----------+
| en            | English                               | Yes      | Yes       |
+---------------+---------------------------------------+----------+-----------+
| es            | Spanish                               | Yes      | Yes       |
+---------------+---------------------------------------+----------+-----------+
| fi            | Finnish                               | Yes      | Yes       |
+---------------+---------------------------------------+----------+-----------+
| fr            | French                                | Yes      | Yes       |
+---------------+---------------------------------------+----------+-----------+
| it            | Italian                               | Yes      | Yes       |
+---------------+---------------------------------------+----------+-----------+
| jp            | Japanese                              | No       | No        |
|               | (Requires separate Kuromoji license)  |          |           |
+---------------+---------------------------------------+----------+-----------+
| nl            | Dutch                                 | Yes      | Yes       |
+---------------+---------------------------------------+----------+-----------+
| no            | Norwegian (Bokmal & Nynorsk detected) | Yes      | Yes       |
+---------------+---------------------------------------+----------+-----------+
| pt            | Portuguese                            | Yes      | Yes       |
+---------------+---------------------------------------+----------+-----------+
| ro            | Romanian                              | Yes      | Yes       |
+---------------+---------------------------------------+----------+-----------+
| ru            | Russian                               | Yes      | Yes       |
+---------------+---------------------------------------+----------+-----------+
| sv            | Swedish                               | Yes      | Yes       |
+---------------+---------------------------------------+----------+-----------+
| tr            | Turkish                               | Yes      | Yes       |
+---------------+---------------------------------------+----------+-----------+

See also :ref:`fts_tokenization`


.. _plugin-fts-setting-fts_tokenizers:

``fts_tokenizers``
------------------

- Default: ``generic email-address``

The list of tokenizers to use.
This setting can be overridden for specific languages by using ``fts_tokenizers_<lang>`` (e.g. ``fts_tokenizers_en``).

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

See also :ref:`fts_tokenization`


.. _plugin-fts-setting-fts_tika:

``fts_tika``
---------------
.. versionadded:: 2.2.13

``http://tikahost:9998/tika/``: This URL needs to be running Apache Tika server
(e.g. started with ``java -jar tika-server/target/tika-server-1.5.jar``)

URL for TIKA decoder for attachments.


.. _plugin-fts-setting-fts_decoder:

``fts_decoder``
---------------

.. versionadded:: 2.1

Decode attachments to plaintext using this service and index the resulting plaintext.
See the ``decode2text.sh`` script included in Dovecot for how to use this.

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

