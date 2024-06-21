## Dovecot Core

### v2.3.x to v2.3.7

* fts-solr: The obsolete break-imap-search parameter is no longer recognized

### v2.3.x to v2.3.12

* Event filter syntax has changed, see [[link,event_filter]].

### v2.3.x to v2.3.14

* Removed autocreate plugin. Use
  [[setting,namespace/mailbox/auto,mailbox { auto }]] instead.
* Removed expire plugin. Use
  [[setting,namespace/mailbox/autoexpunge,mailbox { autoexpunge }]] instead.
* Removed xz write support from zlib plugin. (Reading xz compressed mails
  is still supported.) Use another compression algorithm.

### v2.3.x to v2.3.15

* [[setting,ssl_min_protocol]] default changed to TLSv1.2, as older TLS
  versions are deprecated (see [[rfc,8996]]). Change it to TLSv1 or
  TLSv1.1 if you need to support older, deprecated protocols.
* The 'SNIPPET' and 'PREVIEW (w/explicit algorithm selection)' IMAP commands
  have been deprecated. The new [[rfc,8970]] compliant PREVIEW command
  should be exclusively used in the future.
* [[plugin,fs-compress]] now accept per-algorithm value.
* `plugin-zlib <plugin-mail-compress>` now accepts per-algorithm value.
* `plugin-imap-zlib` now uses per-algorithm compression level settings.
  The old setting is ignored.

### v2.3.x to v2.3.16

* [[link,service_auth_worker]] service service_count setting has been changed.

### v2.3.x to v2.3.20

* `fts_stopwords_workaround` has been introduced.

  The default for the setting, `auto`, activates some mitigations for the
  problem of some searches failing to retrieve the expected result when
  stopwords and multiple languages are used together.
  To revert to the pre 2.3.20 behavior, set `fts_stopwords_workaround = no`.
