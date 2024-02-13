.. _language_tokenization:

================
FTS Tokenization
================

:ref:`fts_backend_dovecot` requires configuring FTS tokenization.
Other FTS engines can also optionally use it.

The lib-language tokenization library works in the following way:

#. Language detection: When indexing, the text language is attempted to be detected.
   If the detection fails, the first listed language is used.
   When searching, the search is done using all the configured languages.
#. Tokenization: The text is split to tokens (individual words).

    * Whitespace and other nonindexable characters are dropped.
    * Base64 sequences are looked for and skipped.

#. Filtering: Tokens are normalized:

    * Normalization / lowercasing
    * Stemming

#. Stopwords: A configurable list of words not to be indexed


Languages
^^^^^^^^^

The setting :dovecot_core:ref:`language` lists languages FTS should
detect.
At least one language must be listed.
The first language is the default language used in case detection fails.

Each added language makes the indexing and searching slightly slower, so it is
recommended not to add too many languages unnecessarily. The language detection
performance can be improved by limiting the number of languages available for
textcat, see :dovecot_core:ref:`textcat_config_path`.

Example::

  plugin {
    language = en de
  }


Tokenizers
^^^^^^^^^^

List of tokenizers to use. Tokenizers can be language specific

Example::

  language_tokenizers = generic email-address
  language_tokenizer_generic_algorithm = simple

  language en {
    tokenizers = generic
  }

See :dovecot_core:ref:`language_tokenizers`


Filters
^^^^^^^

List of filters to apply. Filters can be language specific.

Example::

  language_filters = normalizer-icu snowball stopwords

  language en {
    filters = normalizer-icu snowball english-possessive stopwords
  }

See :dovecot_core:ref:`language_filters`


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

Base64 detection
----------------

.. dovecotadded:: 2.3.18

Base64 sequences are looked for in the tokenization buffer and skipped when detected.

A base64 sequence is detected by:

  * an optional leader character comprised in ``leader-characters`` set,
  * a run of characters, all comprised in the ``base64-characters`` set, at least ``minimum-run-length`` long,
  * an end-of-buffer, or a trailer character comprised in ``trailer-characters`` set,

where:

  * ``leader-characters`` are: ``[ \t\r\n=:;?]``
  * ``base64-characters`` are: ``[0-9A-Za-z/+]``
  * ``trailer-characters`` are: ``[ \t\r\n=:;?]``
  * ``minimum-run-length`` is: ``50``
  * ``minimum-run-count`` is: ``1``

e.g. (even single) 50-chars runs of characters in the base64 set are recognized as
base64 and ignored in indexing.

If a base64 sequence happens to be split across different chunks of data, part of
it might not be detected as base64. In this case, the undetected base64 fragment is
still indexed. However, this happens rarely enough that it does not significantly
impact the quality of the filter.

So far the above rule seems to give good results in base64 indexing avoidance.
It also performs well in removing base64 fragments inside headers,
like ARC-Seal, DKIM-Signature, X-SG-EID, X-SG-ID,
including header-encoded parts (e.g. ``=?us-ascii?Q?...?=`` sequences).
