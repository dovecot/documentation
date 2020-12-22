Upgrading Dovecot v2.3.x to v2.3.7
==================================

 * fts-solr: The obsolete break-imap-search parameter is no longer recognized

Upgrading Dovecot v2.3.x to v2.3.12
===================================

 * Event filter syntax has changed, see :ref:`event_filter`.

Upgrading Dovecot v2.3.x to v2.3.14
===================================

 * Removed cydir storage format. It was never intended for production use.
 * Removed snarf plugin. It was for UW-IMAP's mbox compatibility, which is unlikely to be needed anymore.
 * Removed mail_filter plugin. It was mainly intended as an example plugin.
 * Removed autocreate plugin. Use `mailbox { auto }` :ref:`mailbox_settings` instead.
 * Removed expire plugin. Use `mailbox { autoexpunge }` :ref:`mailbox_settings` instead.
 * Removed xz write support from zlib plugin. (Reading xz compressed mails is still supported.) Use another compression algorithm.

Upgrading Dovecot v2.3.x to v2.3.15
===================================

 * The 'SNIPPET' and 'PREVIEW (w/explicit algorithm selection)' IMAP commands have been deprecated. The new RFC 8970 compliant PREVIEW command should be exclusoively used in the future.
