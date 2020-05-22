.. _fts_tokenization:

================
FTS Tokenization
================

:ref:`fts_backend_dovecot` requires configuring FTS tokenization.
Other FTS engines can also optionally use it.

The lib-fts tokenization library works in the following way:

#. Language detection: When indexing, the text language is attempted to be detected.
   If the detection fails, the first listed language is used.
   When searching, the search is done using all the configured languages.
#. Tokenization: The text is split to tokens (individual words).

    * Whitespace and other nonindexable characters are dropped.

#. Filtering: Tokens are normalized:

    * Normalization / lowercasing
    * Stemming

#. Stopwords: A configurable list of words not to be indexed


Languages
^^^^^^^^^

The setting :ref:`plugin-fts-setting-fts_languages` lists languages FTS should detect.
At least one language must be listed.
The first language is the default language used in case detection fails.

Each added language makes the indexing and searching slightly slower, so it's recommended not to add too many languages unnecessarily.
The language detection performance can be improved by limiting the number of languages available for textcat, see :ref:`plugin-fts-setting-fts_language_config`.

Example::

  plugin {
    fts_languages = en de
  }


Tokenizers
^^^^^^^^^^

List of tokenizers to use.

Example::

    fts_tokenizers = generic email-address
    fts_tokenizer_generic = algorithm=simple

See :ref:`plugin-fts-setting-fts_tokenizers`


Filters
^^^^^^^

List of filters to apply. Filters can be language specific.

Example::

    fts_filters = normalizer-icu snowball stopwords
    fts_filters_en = normalizer-icu snowball english-possessive stopwords


See :ref:`plugin-fts-setting-fts_filters`


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
