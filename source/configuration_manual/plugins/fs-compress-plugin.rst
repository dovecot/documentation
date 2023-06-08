.. _fs_compress_plugin:

==================
fs-compress plugin
==================

It can be used by any of the settings using the FS drivers (e.g.
:dovecot_plugin:ref:`obox_fs`, :dovecot_plugin:ref:`fts_dovecot_fs`, etc.)

The exact location where to set it in the FS driver string depends on what
other FS drivers are being used.

The important rules are:

 * Must be set before the final storage driver (s3, sproxyd, ...)
 * Should be set after fscache (you generally don't want fscache to be
   compressed for performance reasons).
 * Must be set before :ref:`fs_crypt`, because encrypted data compresses
   poorly.

Settings
========

See :ref:`plugin-fs-compress` for ``dovecot.conf`` setting information.

The fs-compress configuration format is:

.. code-block:: none

  compress:<compress_save>:<compress_save_level>

See :dovecot_plugin:ref:`compress_save <mail_compress_save>` for information on
available compression algorithms.

See :dovecot_plugin:ref:`compress_save_level <mail_compress_save_level>` for
information on compression levels and defaults.

Optional compression
--------------------

.. dovecotadded:: 2.2.34

By default fs-compress requires that the mail is compressed with the specified
algorithm.

To allow adding compression to existing storages without compression, you can
use the "maybe-" prefix in front of the algorithm.

For example:

.. code-block:: none

   obox_fs = fscache:512M:/var/cache/mails/%4Nu:compress:maybe-zstd:3:s3:https://ACCESSKEY:SECRET@s3.example.com/?bucket=mails

This decompresses mails if they were stored using zstd compression and falls
back to reading the mails as plaintext.

.. warning:: Prior to v2.3.13 it is not possible to use multiple different
             algorithms for the same user.

Example Configuration
---------------------

.. code-block:: none

  obox_fs = fscache:512M:/var/cache/mails/%4Nu:compress:zstd:3:s3:https://ACCESSKEY:SECRET@s3.example.com/?bucket=mails
  fts_dovecot_fs = fts-cache:fscache:512M:/var/cache/fts/%4Nu:compress:zstd:3:s3:https://s3.example.com/%8Mu/%u/fts/?bucket=mails

Note that these both work and don't have any practical difference, because
fs-dictmap doesn't modify the object contents in any way:

.. code-block:: none

  obox_index_fs = compress:zstd:3:dictmap:proxy:dict-async:cassandra ; sproxyd:http://sproxyd.scality.example.com/?class=2&reason_header_max_length=200 ; diff-table
  obox_index_fs = dictmap:proxy:dict-async:cassandra ; compress:zstd:3:sproxyd:http://sproxyd.scality.example.com/?class=2&reason_header_max_length=200 ; diff-table

With encryption enabled:

.. code-block:: none

  obox_fs = fscache:512M:/var/cache/mails/%4Nu:compress:zstd:3:mail-crypt:s3:https://ACCESSKEY:SECRET@s3.example.com/?bucket=mails
