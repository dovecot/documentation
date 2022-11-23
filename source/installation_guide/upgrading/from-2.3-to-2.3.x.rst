================================
Upgrading Dovecot v2.3 to v2.3.x
================================

.. contents::
   :depth: 1
   :local:

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
 * obox (fs-dictmap):
   :ref:`Update configuration to support Cassandra max bucket ID safe shrinking behavior <upgrade_2_3_14_max_bucket_id>`

.. _upgrade_2_3_14_max_bucket_id:

Max Bucket ID Safe Shrinking
----------------------------

.. note::

  Only needed for :ref:`obox + fs-dictmap <dictmap_configuration>`
  installations.

To support Cassandra max bucket ID safe shrinking behavior,
``dovecot-dict-cql.conf.ext`` must get updated. The map for
``shared/dictmap/$user/mailboxes/$mailbox_guid/max_bucket`` must include the
writetime of the last ``max_bucket`` update. See:
:ref:`dictmap_cassandra_objectid`.

This mapping update is downwards compatible and can be done independently of
upgrading OX Dovecot Pro.  It is not a schema update but rather fetching
additional, already available, information from Cassandra using the built-in
writetime functionality.

The issue solved by this change is that in a fs-dictmap installation (e.g.,
Cassandra+Scality), the ``max_bucket`` ID never shrinks. Buckets are used to
prevent partitions in Cassandra becoming too big (each bucket is sized to
keep 10,000 mails).

If a user receives a huge amount of mails and fills multiple buckets, the
max_bucket id is incremented. If most of these mails are deleted again, this
now larger ``max_bucket`` ID stays.

A big ``max_bucket`` id means one Cassandra SELECT per bucket < max_bucket.
This happens whenever a folder is accessed for the first time in the metacache
(after cleanup or backend change) and all the mails of this folder are
listed.

Thus, this change means there could be less Cassandra SELECTs overall. This
fix is automatically applied per user after a user's folder has been accessed
for the first time.

In order to prevent race conditions, the writetime of the last ``max_bucket``
ID is taken into account. This is why the change to the Dovecot Cassandra
mapping configuration is necessary. The change of the mapping is downwards
compatible so rollbacks to earlier versions are not complicated by this change.

Before 2.3.14, the ``max_bucket`` ID never shrunk, which means that there
could be inefficient  mailboxes with a higher ``max_bucket`` ID than actual
filled buckets.

To be informed about shrinking, the
:ref:`event_fs_dictmap_max_bucket_changed` event can be monitored.

Upgrading Dovecot v2.3.x to v2.3.15
===================================

 * :dovecot_core:ref:`ssl_min_protocol` default changed to TLSv1.2, as older TLS versions are deprecated (see :rfc:`8996`). Change it to TLSv1 or TLSv1.1 if you need to support older, deprecated protocols.
 * The 'SNIPPET' and 'PREVIEW (w/explicit algorithm selection)' IMAP commands have been deprecated. The new :rfc:`8970` compliant PREVIEW command should be exclusively used in the future.
 * :ref:`plugin-fs-compress` now accept per-algorithm value.
 * :ref:`plugin-zlib <plugin-mail-compress>` now accepts per-algorithm value.
 * :ref:`plugin-imap-zlib` now uses per-algorithm compression level settings. The old setting is ignored.

Upgrading Dovecot v2.3.x to v2.3.16
===================================
 * :ref:`auth-worker service <service_configuration_auth_worker>` service\_count setting has been changed.
