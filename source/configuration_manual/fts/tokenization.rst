.. _fts_tokenization:

================
FTS Tokenization
================

The lib-fts tokenization library implements common searching and indexing features:

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

Languages
^^^^^^^^^

The setting :ref:`plugin-fts-setting-fts_languages` lists languages FTS should
detect.


Filters
^^^^^^^

List of filters to apply. Filters can be language specific.

See :ref:`plugin-fts-setting-fts_filters`


Tokenizers
^^^^^^^^^^

List of tokenizers to use.

See :ref:`plugin-fts-setting-fts_tokenizers`


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
