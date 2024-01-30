.. _plugin-fts:

==========
fts plugin
==========

.. seealso:: See :ref:`fts` for an overview of the Dovecot Full Text Search
             (FTS) system.

.. _fts_languages:

FTS languages
^^^^^^^^^^^^^

Language names are given as ISO 639-1 alpha 2 codes.

Stemming support indicates whether the ``snowball`` filter can be used.

Stopwords support indicates whether a stopwords file is distributed with
Dovecot.

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
| ja            | Japanese                              | No       | No        |
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

Settings
^^^^^^^^

.. dovecot_plugin:setting:: fts_autoindex
   :default: no
   :plugin: fts
   :seealso: @fts_autoindex_exclude;dovecot_plugin, @fts_autoindex_max_recent_msgs;dovecot_plugin
   :values: @boolean

   If enabled, index mail as it is delivered or appended.


.. dovecot_plugin:setting:: fts_autoindex_exclude
   :plugin: fts
   :seealso: @fts_autoindex;dovecot_plugin
   :values: @boolean

   You can disable autoindexing for a mailbox adding this flag:

   Example::

      mailbox trash {
        special_use = \Trash
        fts_autoindex_exclude = yes
      }

      mailbox spam {
        special_use = \Junk
        fts_autoindex_exclude = yes
      }

      mailbox storage/* {
        fts_autoindex_exclude = yes
      }


.. dovecot_plugin:setting:: fts_autoindex_max_recent_msgs
   :added: 2.2.9
   :default: 0
   :plugin: fts
   :seealso: @fts_autoindex;dovecot_plugin
   :values: @uint

   To exclude infrequently accessed mailboxes from automatic indexing, set
   this value to the maximum number of ``\Recent`` flagged messages that exist
   in the mailbox.

   A value of ``0`` means to ignore this setting.

   Mailboxes with more flagged ``\Recent`` messages than this value will not
   be autoindexed, even though they get deliveries or appends. This is useful
   for, e.g., inactive Junk folders.

   Any folders excluded from automatic indexing will still be indexed, if a
   search on them is performed.

   Example::

     fts_autoindex_max_recent_msgs = 999


.. dovecot_plugin:setting:: fts_decoder_driver
   :plugin: fts
   :values: script, tika

   Optional setting; if set, decode attachments to plaintext using
   the selected service and index the resulting plaintext.


.. dovecot_plugin:setting:: fts_decoder_script_socket_path
   :added: 2.1.0
   :plugin: fts
   :values: @string

   (previously named ``fts_decoder``)
   Name of the script service used to decode the attachments.

   See the ``decode2text.sh`` script included in Dovecot for how to use this.

   Example::

     fts_decoder = script
     decoder_script_socket_path = decode2text

     service decode2text {
       executable = script /usr/lib/dovecot/decode2text.sh
       user = vmail
       unix_listener decode2text {
         mode = 0666
       }
     }


.. dovecot_plugin:setting:: fts_driver
   :plugin: fts
   :values: dovecot, solr, flatcurve

   (previously named ``fts``)
   Name of the backend implementation used to perform fts indexing.
   If not specified, fts is disabled.


.. dovecot_plugin:setting:: fts_enforced
   :added: 2.2.19
   :default: no
   :plugin: fts
   :values: yes, no, body

   Require FTS indexes to perform a search? This controls what to do when
   searching headers and what to do on error situations.

   When searching from message body, the FTS index is always (attempted to be)
   updated to contain any missing mails before the search is performed.

   ``no``

     Searching from message headers won't update FTS indexes. For header
     searches, the FTS indexes are used for searching the mails that are
     already in it, but the unindexed mails are searched via
     dovecot.index.cache (or by opening the emails if the headers aren't in
     cache).

     If FTS lookup or indexing fails, both header and body searches fallback
     to searching without FTS (i.e. possibly opening all emails). This may
     timeout for large mailboxes and/or slow storage.

   ``yes``

     Searching from message headers updates FTS indexes, the same way as
     searching from body does. If FTS lookup or indexing fails, the search
     fails.

   ``body``

     Searching from message headers won't update FTS indexes (the same
     behavior as with ``no``). If FTS lookup or indexing fails, the search
     fails.

     .. dovecotadded:: 2.3.7

   Note that only the ``yes`` value guarantees consistent search results. In
   other cases it's possible that the search results will be different
   depending on whether the search was performed via FTS index or not.


.. dovecot_plugin:setting:: fts_filters
   :plugin: fts
   :seealso: @fts_tokenization
   :values: @string

   The list of filters to apply.

   Language specific filter chains can be specified with ``fts_filters_<lang>``
   (e.g. ``fts_filters_en``).

   Available filters:

   ``lowercase``

     Change all text to lower case. Supports UTF8, when compiled with libicu
     and the library is installed. Otherwise only ASCII characters are
     lowercased.

   ``stopwords``

     Filter certain common and short words, which are usually useless for
     searching.

     .. warning::
        Using stopwords with multiple languages configured WILL cause some
        searches to fail. The recommended solution is to NOT use the stopword
        filter when multiple languages are present in the configuration.

     Settings:

       ``stopwords_dir``

         Path to the directory containing stopword files. Stopword files are
         looked up in ``”<path>”/stopwords_<lang>.txt``.

     See :ref:`fts_languages` for list of stopword files that are currently
     distributed with Dovecot.

     More languages can be obtained from
     `Apache Lucene <https://lucene.apache.org/>`_,
     `Snowball stemmer <https://snowballstem.org/>`_, or
     https://github.com/stopwords-iso/.

   ``snowball``

     Stemming tries to convert words to a common base form. A simple example
     is converting “cars” to “car” (in English).

     This stemmer is based on the
     `Snowball stemmer <https://snowballstem.org/>`_ library.

     See :ref:`fts_languages`

   ``normalizer-icu``

     Normalize text using libicu. This is potentially very resource intensive.

     .. note:: Caveat for Norwegian: The default normalizer filter does not
               modify ``U+00F8`` (Latin Small Letter O with Stroke). In some
               configurations it might be desirable to rewrite it to e.g.
               ``o``. Same goes for the upper case version. This can be done
               by passing a modified ``id`` setting to the normalizer filter.
               Similar cases can exist for other languages as well.

     Settings:

       ``id``

         Description of the normalizing/transliterating rules to use.

           * See `Normalizer Format`_ for syntax.
           * Defaults to ``Any-Lower; NFKD; [: Nonspacing Mark :] Remove;
             [\\x20] Remove``

   ``english-possessive``

     Remove trailing ``'s`` from English possessive form tokens. Any trailing
     single ``'`` characters are already removed by tokenizing, whether this
     filter is used or not.

     The ``snowball`` filter also removes possessive suffixes from English, so
     if using ``snowball`` this filter is not needed. ``snowball`` likely
     produces better results, so this filter is advisable only when
     ``snowball`` is not available or cannot be used due to extreme CPU
     performance requirements.

   ``contractions``

     Removes certain contractions that can prefix words. The idea is to only
     index the part of the token that conveys the core meaning.

     Only works with French, so the language of the input needs to be
     recognized by textcat as French.

     It filters “qu'”, “c'”, “d'”, “l'”, “m'”, “n'”, “s'” and “t'”.

     Do not use at the same time as ``generic`` tokenizer with
     ``algorithm=tr29 wb5a=yes``.

   Example:

   .. code-block:: none

     plugin {
       fts_filters = normalizer-icu snowball stopwords
       fts_filters_en = lowercase snowball english-possessive stopwords
     }

.. _`Normalizer Format`: https://unicode-org.github.io/icu/userguide/transforms/general/#transliterator-identifiers


.. dovecot_plugin:setting:: fts_header_excludes
   :added: 2.3.18
   :plugin: fts
   :values: @string

   The list of headers to, respectively, include or exclude.

   - The default is the preexisting behavior, i.e. index all headers.
   - ``includes`` take precedence over ``excludes``: if a header matches both,
     it is indexed.
   - The terms are case insensitive.
   - An asterisk ``*`` at the end of a header name matches anything starting
     with that header name.
   - The asterisk can only be used at the end of the header name.
     Prefix and infix usage of asterisk are not supported.

   Example::

     fts_header_excludes {
       Received = yes
       DKIM-* = yes
       X-* = yes
       Comments = yes
     }

     fts_header_includes {
       X-Spam-Status = yes
       Comments = yes
     }

   - ``Received`` headers, all ``DKIM-`` headers and all ``X-`` experimental
     headers are excluded, with the following exceptions:
   - ``Comments`` and ``X-Spam-Status`` are indexed anyway, as they match
     **both** the excludes and the includes. In this case, includes take
     precedence.
   - All other headers are indexed.

   Example::

     fts_header_excludes {
       * = yes
     }

     fts_header_includes {
       From = yes
       To = yes
       Cc = yes
       Bcc = yes
       Subject = yes
       Message-ID = yes
       In-* = yes
       X-CustomApp-* = yes
     }

   - No headers are indexed, except those explicitly specified in
     the includes.


.. dovecot_plugin:setting:: fts_header_includes
   :added: 2.3.18
   :plugin: fts
   :seealso: @fts_header_excludes;dovecot_plugin
   :values: @string


.. dovecot_plugin:setting:: fts_index_timeout
   :default: 0
   :plugin: fts
   :values: @uint

   When the full text search backend detects that the index isn't up-to-date,
   the indexer is told to index the messages and is given this much time to do
   so. If this time limit is reached, an error is returned, indicating that
   the search timed out during waiting for the indexing to complete:
   ``NO [INUSE] Timeout while waiting for indexing to finish``. Note the
   :dovecot_plugin:ref:`fts_enforced` setting does not change this behavior.

   A value of ``0`` means no timeout.


.. dovecot_plugin:setting:: fts_language_config
   :default: !<textcat dir>
   :plugin: fts
   :seealso: @fts_languages;dovecot_plugin
   :values: @string

   Path to the textcat/exttextcat configuration file, which lists the
   supported languages.

   This is recommended to be changed to point to a minimal version of a
   configuration that supports only the languages listed in
   :dovecot_plugin:ref:`fts_languages`.

   Doing this improves language detection performance during indexing and also
   makes the detection more accurate.

   Example:

   .. code-block:: none

     plugin {
       fts_language_config = /usr/share/libexttextcat/fpdb.conf
     }


.. dovecot_plugin:setting:: fts_languages
   :plugin: fts
   :seealso: @fts_language_config;dovecot_plugin
   :values: @string

   A space-separated list of languages that the full text search should
   detect.

   At least one language must be specified.

   The language listed first is the default and is used when language
   recognition fails.

   The filters used for stemming and stopwords are language dependent.

   .. note:: For better performance it's recommended to synchronize this
             setting with the textcat configuration file; see
             :dovecot_plugin:ref:`fts_language_config`.

   Example:

   .. code-block:: none

     plugin {
       fts_languages = en de
     }


.. dovecot_plugin:setting:: fts_decoder_tika_url
   :added: 2.2.13
   :plugin: fts
   :values: @string

   (previously named ``fts_tika``)
   URL for `Apache Tika <https://tika.apache.org/>`_ decoder for attachments.

   Example::

     fts_driver = tika
     fts_decoder_tika_url = http://tikahost:9998/tika/


.. dovecot_plugin:setting:: fts_tokenizers
   :default: generic email-address
   :plugin: fts
   :seealso: @fts_tokenization
   :values: @string

   The list of tokenizers to use.

   This setting can be overridden for specific languages by using
   ``fts_tokenizers_<lang>`` (e.g. ``fts_tokenizers_en``).

   List of tokenizers:

   ``generic``

     Input data, such as email text and headers, need to be divided into words
     suitable for indexing and searching. The generic tokenizer does this.

     Settings:

       ``maxlen``

         Maximum length of token, before an arbitrary cut off is made.
         Defaults to FTS_DEFAULT_TOKEN_MAX_LENGTH. The default is probably OK.

       ``algorithm``

         Accepted values are ``simple`` or ``tr29``. It defines the method for
         looking for word boundaries. Simple is faster and will work for many
         texts, especially those using latin alphabets, but leaves corner
         cases. The tr29 implements a version of Unicode technical report 29
         word boundary lookup. It might work better with e.g. texts
         containing Katakana or Hebrew characters, but it is not possible to
         use a single algorithm for all existing languages. The default is
         ``simple``.

       ``wb5a``

         Unicode TR29 rule WB5a setting to the tr29 tokenizer. Splits
         prefixing contracted words from base word. E.g. “l'homme” → “l”
         “homme”. Together with a language specific stopword list unnecessary
         contractions can thus be filtered away. This is disabled by default
         and only works with the TR29 algorithm. Enable by
         ``fts_tokenizer_generic = algorithm=tr29 wb5a=yes``.

   ``email-address``

     This tokenizer preserves email addresses as complete search tokens, by
     bypassing the generic tokenizer, when it finds an address. It will only
     work as intended if it is listed **after** other tokenizers.

   ``kuromoji``

     .. important:: The kuromoji tokenizer is a part of
                    :ref:`ox_dovecot_pro` only.

     This tokenizer is used for Japanese text. This tokenizer
     utilizes Atilika Kuromoji tokenizer library to tokenize Japanese text.
     This tokenizer also does NFKC normalization before tokenization. What
     NFKC normalization does is half-width and full-width character
     normalizations, such as:

       * transform half-width Katakana letters to full-width.
       * transform full-width number letters to half-width
       * transform those special letters (e.g, 1 will be transformed to 1, and
         平成 to 平成)

     Settings:

      ``maxlen``

        Maximum length of token, before an arbitrary cut off is made.
        The default value for the kuromoji tokenizer is ``1024``.

      ``kuromoji_split_compounds``

        This setting enables “search mode” in the Atilika Kuromoji library.
        The setting defaults to enabled (i.e .1) and should not be changed
        unless there is a compelling reason. To disable, set the value to 0.

        .. note:: If this setting is changed, existing FTS indexes will
                  produce unexpected results. The FTS indexes should be
                  recreated in this case.

      ``id``

        Description of the normalizing/transliterating rules to use. See
        `Normalizer Format` for syntax. Defaults to ``Any-NFKC`` which is
        quite good for CJK text mixed with latin alphabet languages. It
        transforms CJK characters to full-width encoding and transforms latin
        ones to half-width. The NFKC transformation is described above.

        .. note:: If this setting is changed, existing FTS indexes will
                  produce unexpected results. The FTS indexes should be
                  recreated in this case.

     We use the predefined set of stopwords which is recommended by Atilika.
     Those stopwords are reasonable and they have been made by tokenizing
     Japanese Wikipedia and have been reviewed by us. This set of stopwords is
     also included in the Apache Lucene and Solr projects and it is used by
     many Japanese search implementations.
