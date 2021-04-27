.. _plugin-fs-compress:

==================
fs-compress plugin
==================

``fs-compress`` has no settings in dovecot.conf

It can be used by any of the settings using the FS drivers (e.g. :ref:`plugin-obox-setting_obox_fs`, :ref:`plugin-fts-dovecot-setting-fts_dovecot_fs`, etc.)

The exact location where to set it in the FS driver string depends on what other FS drivers are being used.
The important rules are:

 * Must be set before the final storage driver (s3, sproxyd, ...)
 * Should be set after fscache (you generally don't want fscache to be compressed for performance reasons).
 * Must be set before :ref:`fs_crypt`, because encrypted data compresses poorly.

.. versionchanged:: 2.3.15

You can use per-algorithm compression levels, and defaults. Prior to v2.3.15,
the compression level must be an integer in the range 1 to 9 regardless of the
algorithm selected. The default level is 6. These values may not make sense
with compression algorithms other than gz and bz2. For example, zstd supports
levels from -1 to 22 in latest Zstandard version.

Examples:

.. code-block:: none

  obox_fs = fscache:512M:/var/cache/mails/%4Nu:compress:gz:6:s3:https://ACCESSKEY:SECRET@s3.example.com/?bucket=mails
  fts_dovecot_fs = fts-cache:fscache:512M:/var/cache/fts/%4Nu:compress:gz:6:s3:https://s3.example.com/%8Mu/%u/fts/?bucket=mails

Note that these both work and don't have any practical difference, because fs-dictmap doesn't modify the object contents in any way:

.. code-block:: none

  obox_index_fs = compress:gz:6:dictmap:proxy:dict-async:cassandra ; sproxyd:http://sproxyd.scality.example.com/?class=2&reason_header_max_length=200 ; diff-table
  obox_index_fs = dictmap:proxy:dict-async:cassandra ; compress:gz:6:sproxyd:http://sproxyd.scality.example.com/?class=2&reason_header_max_length=200 ; diff-table

With encryption enabled:

.. code-block:: none

  obox_fs = fscache:512M:/var/cache/mails/%4Nu:compress:gz:6:mail-crypt:s3:https://ACCESSKEY:SECRET@s3.example.com/?bucket=mails

Optional compression
--------------------

.. versionadded:: v2.2.34

By default fs-compress requires that the mail is compressed with the specified algorithm.
To allow adding compression to existing storages without compression, you can use the "maybe-" prefix in front of the algorithm.
For example:

.. code-block:: none

   obox_fs = fscache:512M:/var/cache/mails/%4Nu:compress:maybe-gz:6:s3:https://ACCESSKEY:SECRET@s3.example.com/?bucket=mails

This decompresses mails if they were stored using gz compression and falls back to reading the mails as plaintext.

.. warning:: Prior to v2.3.13 it is not possible to use multiple different algorithms for the same user.
