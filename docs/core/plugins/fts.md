---
layout: doc
title: fts
dovecotlinks:
  fts_tokenization:
    hash: tokenization
    text: FTS Tokenization
---

# FTS: Full Text Search Plugin (`fts`)

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
search through all messages (default behavior). If storage latencies are high,
this searching may not be completed in a reasonable time, or resource
utilization may be too large, especially in mailboxes with large messages.

Dovecot maintains these FTS indexing engines:

| Name | Description |
| ---- | ----------- |
| Dovecot Pro FTS | Dovecot native, object storage optimized driver. Only available as part of Dovecot Pro. |
| [[plugin,fts_solr]] | Interface to [Apache Solr](https://solr.apache.org/); stores data remotely. |
| [[plugin,fts_flatcurve]] | [Xapian](https://xapian.org/) based driver; stores data locally. |

## Searching In Dovecot

When a FTS indexing backend is not present, searches use a slow sequential
search through all message data. This is both computationally and time
expensive. It is desirable to pre-index data so that searches can be executed
against this index.

There is a subtle but important distinction between searching through message
headers and searching through message bodies.

Searching through message bodies (via the standard IMAP 'SEARCH TEXT/BODY'
commands) makes use of the FTS indexes.

On the other hand, searching through message headers benefits from Dovecot's
standard index and cache files (`dovecot.index` and `dovecot.index.cache`),
which often contain the necessary information.  It is possible to redirect
header searches to FTS indexes via a configuration option
([[setting,fts_enforced]]).

Triggers for FTS indexing are configurable. It can be started on demand when
searching, or automatically when new messages arrive or as a batch job.

By default the FTS indexes are updated only while searching, so neither
LDA/LMTP nor an IMAP 'APPEND' command updates the indexes immediately. This
means that if a user has received a lot of mail since the last indexing
(i.e., the last search operation), it may take a while to index all the new
mails before replying to the search command. Dovecot sends periodic “\* OK
Indexed n% of the mailbox” updates which can be caught by client
implementations to implement a progress bar.

Updating the FTS index as messages arrive makes for a more responsive user
experience, especially for users who don’t search often, but have a lot of
mail. On the other hand, it increases overall system load regardless of
whether or not the indexes will ever be used by the user.

## Dovecot FTS Architecture

Dovecot splits the full text search functionality into two parts:
a common tokenization library (lib-fts) and backend indexing engine responsible for storing the tokens produced by the common library persistently.

Some of the FTS backends do their own internal tokenization, although it's
possible to configure them to use the lib-fts tokenization as well.

See [Tokenization](#tokenization) for more details about configuring the
tokenization.

All backends are implemented as plugins that extend the base fts plugin's
functionality.

## Settings

<SettingsComponent plugin="fts" />

## Configuration

### FTS Indexing Triggers

Missing mails are always added to FTS indexes when using IMAP SEARCH command
that attempts to access the FTS indexes.

Automatic FTS indexing can also be done during mail delivery, IMAP APPEND and
other ways of adding mails to mailboxes using [[setting,fts_autoindex]].

Indexing can also be triggered manually:

```console
$ doveadm index -u user@domain -q INBOX
```

### Enforce FTS

When FTS indexing fails, Dovecot falls back on using the built-in search,
which does not have indexes for mail bodies.

This could end up opening all the mails in the mailbox, which often isn't
wanted.

To disable this functionality, enable [[setting,fts_enforced]].

## Indexing Attachments

Attachments can be indexed either via a script that translates the attachment
to UTF-8 plaintext or [Apache Tika](https://tika.apache.org/) server.

* [[setting,fts_decoder]]: Use decoder script.
* [[setting,fts_tika]]: Use Apache Tika server.

::: warning Note
[[setting,fts_decoder]] and [[setting,fts_tika]] cannot be used simultaneously.
:::

## Rescan

Dovecot keeps track of indexed messages in the `dovecot.index files`. If this
becomes out of sync with the actual FTS indexes (either too many or too few
mails), you'll need to do a rescan and then index missing mails:

```console
$ doveadm fts rescan -u user@domain
$ doveadm index -u user@domain -q '*'
```

Note that currently most FTS backends don't implement the rescan.
Instead, they simply delete all the FTS indexes. This may change in the
future versions.

## Languages

Language names are given as ISO 639-1 alpha 2 codes.

Stemming support indicates whether the `snowball` filter can be used.

Stopwords support indicates whether a stopwords file is distributed with
Dovecot.

Currently supported languages:

| Language Code | Language | Stemming | Stopwords |
| ------------- | -------- | -------- | --------- |
| da | Danish | Yes | Yes |
| de | German | Yes | Yes |
| en | English | Yes | Yes |
| es | Spanish | Yes | Yes |
| fi | Finnish | Yes | Yes |
| fr | French  | Yes | Yes |
| it | Italian | Yes | Yes |
| ja | Japanese (Requires Dovecot Pro) | No | No |
| nl | Dutch | Yes | Yes |
| no | Norwegian (Bokmal & Nynorsk detected) | Yes | Yes |
| pt | Portuguese | Yes | Yes |
| ro | Romanian | Yes | Yes |
| ru | Russian | Yes | Yes |
| sv | Swedish | Yes | Yes |
| tr | Turkish | Yes| Yes |

## Tokenization

Dovecot contains tokenization support that can be used by FTS drivers.

The lib-fts tokenization library works in the following way:

1. Language detection: When indexing, the text language is attempted to be
   detected.

   If the detection fails, the first listed language is used.

   When searching, the search is done using all the configured languages.

2. Tokenization: The text is split to tokens (individual words).

   * Whitespace and other nonindexable characters are dropped.
   * Base64 sequences are looked for and skipped.

3. Filtering: Tokens are normalized:

   * Normalization / lowercasing
   * Stemming

4. Stopwords: A configurable list of words not to be indexed

### Languages

[[setting,fts_languages]] lists languages FTS should detect.

At least one language must be listed.

The first language is the default language used in case detection fails.

Each added language makes the indexing and searching slightly slower, so it's
recommended not to add too many languages unnecessarily.

The language detection performance can be improved by limiting the number of
 languages available for textcat, see [[setting,fts_language_config]].

Example:

```[dovecot.conf]
plugin {
  fts_languages = en de
}
```

### Filter and Tokenizer Order

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

### Base64 Detection

Base64 sequences are looked for in the tokenization buffer and skipped when
detected.

A base64 sequence is detected by:

* An optional leader character comprised in `leader-characters` set,
* A run of characters, all comprised in the `base64-characters` set, at
  least `minimum-run-length` long,
* An end-of-buffer, or a trailer character comprised in `trailer-characters`
  set,

where:

* `leader-characters` are: `[ \t\r\n=:;?]`
* `base64-characters` are: `[0-9A-Za-z/+]`
* `trailer-characters` are: `[ \t\r\n=:;?]`
* `minimum-run-length` is: `50`
* `minimum-run-count` is: `1`

Thus, (even single) 50-chars runs of characters in the base64 set are
recognized as base64 and ignored in indexing.

If a base64 sequence happens to be split across different chunks of data,
part of it might not be detected as base64. In this case, the undetected
base64 fragment is still indexed. However, this happens rarely enough that
it does not significantly impact the quality of the filter.

So far the above rule seems to give good results in base64 indexing avoidance.
It also performs well in removing base64 fragments inside headers,
like ARC-Seal, DKIM-Signature, X-SG-EID, X-SG-ID,
including header-encoded parts (e.g. `=?us-ascii?Q?...?=` sequences).

## Filter Configuration

Filters affect how data is indexed.

They are configured through [[setting,fts_filters]].

Example:

```
plugin {
  fts_filters = normalizer-icu snowball stopwords
  fts_filters_en = lowercase snowball english-possessive stopwords
}
```

Available filters:

### `lowercase`

Change all text to lower case. Supports UTF8, when compiled with libicu
and the library is installed. Otherwise only ASCII characters are
lowercased.

### `stopwords`

Filter certain common and short words, which are usually useless for
searching.

::: warning
Using stopwords with multiple languages configured WILL cause some
searches to fail. The recommended solution is to NOT use the stopword
filter when multiple languages are present in the configuration.
:::

Stopwords specific settings:

<FTSConfigComponent name="stopwords_dir" default="&lt;DATADIR&gt;/stopwords">

Path to the directory containing stopword files. Stopword files are
looked up in `”<path>”/stopwords_<lang>.txt`.

See [languages](#languages) for the list of stopword files that are currently
distributed with Dovecot.

More languages can be obtained from
[Apache Lucene](https://lucene.apache.org/),
[Snowball stemmer](https://snowballstem.org/), or
https://github.com/stopwords-iso/.

</FTSConfigComponent>

### `snowball`

Stemming tries to convert words to a common base form. A simple example
is converting “cars” to “car” (in English).

This stemmer is based on the [Snowball stemmer](https://snowballstem.org/)
library.

### `normalizer-icu`

Normalize text using libicu. This is potentially very resource intensive.

::: tip Caveat for Norwegian
The default normalizer filter does not modify `U+00F8` (Latin Small Letter O
with Stroke). In some configurations it might be desirable to rewrite it to,
e.g., `o`. Same goes for the upper case version. This can be done by passing
a modified `id` setting to the normalizer filter.

Similar cases can exist for other languages as well.
:::

normalizer-icu specific settings:

<FTSConfigComponent name="stopwords_dir" default="Any-Lower; NFKD; [: Nonspacing Mark :] Remove; [\\x20] Remove">

Description of the normalizing/transliterating rules to use.

See [Normalizer Format](https://unicode-org.github.io/icu/userguide/transforms/general/#transliterator-identifiers)
for syntax.

</FTSConfigComponent>

### `english-possessive`

Remove trailing `'s` from English possessive form tokens. Any trailing
single `'` characters are already removed by tokenizing, whether this
filter is used or not.

The `snowball` filter also removes possessive suffixes from English, so
if using `snowball` this filter is not needed.

::: tip
`snowball` likely produces better results, so this filter is advisable only
when `snowball` is not available or cannot be used due to extreme CPU
performance requirements.
:::

### `contractions`

Removes certain contractions that can prefix words. The idea is to only
index the part of the token that conveys the core meaning.

Only works with French, so the language of the input needs to be
recognized by textcat as French.

It filters “qu'”, “c'”, “d'”, “l'”, “m'”, “n'”, “s'” and “t'”.

Do not use at the same time as `generic` tokenizer with
`algorithm=tr29 wb5a=yes`.

## Tokenizer Configuration

Tokenizers affect how input data is parsed.

Available tokenizers:

### `generic`

Input data, such as email text and headers, need to be divided into words
suitable for indexing and searching. The generic tokenizer does this.

Generic-specific settings:

<FTSConfigComponent name="maxlen" default="30">

Maximum length of token, before an arbitrary cut off is made.

</FTSConfigComponent>

<FTSConfigComponent name="algorithm" default="simple">

Accepted values are `simple` or `tr29`. It defines the method for
looking for word boundaries.

`simple` is faster and will work for many texts, especially those using
latin alphabets, but leaves corner cases.

`tr29` implements a version of Unicode technical report 29 word boundary
 lookup. It might work better with, e.g., texts containing Katakana or
Hebrew characters, but it is not possible to use a single algorithm for
all existing languages.

</FTSConfigComponent>

<FTSConfigComponent name="wb5a" default="no">

Unicode TR29 rule WB5a setting to the tr29 tokenizer. Splits
prefixing contracted words from base word. E.g. “l'homme” → “l”
“homme”. Together with a language specific stopword list unnecessary
contractions can thus be filtered away. This is disabled by default
and only works with the TR29 algorithm.

Enable by `fts_tokenizer_generic = algorithm=tr29 wb5a=yes`.

</FTSConfigComponent>

### `email-address`

This tokenizer preserves email addresses as complete search tokens, by
bypassing the generic tokenizer, when it finds an address. It will only
work as intended if it is listed **after** other tokenizers.

Email Address tokenizer specific settings:

<FTSConfigComponent name="maxlen" default="254">

Maximum length of token, before an arbitrary cut off is made.

</FTSConfigComponent>
