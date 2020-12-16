Upgrading Dovecot v2.3.x to v2.3.7
==================================

 * fts-solr: The obsolete break-imap-search parameter is no longer recognized

Upgrading Dovecot v2.3.x to v2.3.12
===================================

 * Event filter syntax has changed, see :ref:`event_filter`.

Upgrading Dovecot v2.3.x to v2.3.14
====================================

 * Removed cydir storage format. It was never intended for production use.
 * Removed snarf plugin. It was for UW-IMAP's mbox compatibility, which is unlikely to be needed anymore.
 * Removed mail_filter plugin. It was mainly intended as an example plugin.
 * Removed autocreate plugin. Use `mailbox { auto }` :ref:`mailbox_settings` instead.
 * Removed expire plugin. Use `mailbox { autoexpunge }` :ref:`mailbox_settings` instead.
