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

See also :ref:`language_tokenization`

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


.. dovecot_plugin:setting:: fts_languages
   :plugin: fts
   :seealso: @textcat_config_path;dovecot_core
   :values: @string

   A space-separated list of languages that the full text search should
   detect.

   At least one language must be specified.

   The language listed first is the default and is used when language
   recognition fails.

   The filters used for stemming and stopwords are language dependent.

   .. note:: For better performance it's recommended to synchronize this
             setting with the textcat configuration file; see
             :dovecot_core:ref:`textcat_config_path`.

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
