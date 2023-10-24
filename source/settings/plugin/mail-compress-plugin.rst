.. _plugin-mail-compress:

====================
mail-compress plugin
====================

.. seealso:: See :ref:`mail_compress_plugin` for a plugin overview.

.. _compress_methods:

Compression methods
-------------------

The following methods are supported:

=========== =================================================== =================
Name        Library (method)                                    Dovecot Support
=========== =================================================== =================
``bz2``     `libbzip2 (bzip2) <https://sourceware.org/bzip2/>`_ v2.0+
``gz``      `zlib (gzip) <https://www.zlib.net/>`_              v2.0+
``deflate`` `zlib (gzip) <https://www.zlib.net/>`_              v2.0+
``lz4``     `liblz4 <https://www.lz4.org/>`_                    v2.2.11+
``xz``      `liblzma <https://tukaani.org/xz/>`_                **DEPRECATED**
                                                                (v2.2.9+ reading,
                                                                v2.2.9-v2.3.13
                                                                writing)
``zstd``    `Zstandard <https://facebook.github.io/zstd/>`_     v2.3.12+
=========== =================================================== =================

Settings
^^^^^^^^

.. dovecot_plugin:setting:: mail_compress_write_method
   :plugin: compress
   :values: @string

   The :ref:`compression method <compress_methods>` to use for writing
   new mails. If empty, new mails are written without compression, but old
   mails can still be read.

   Example:

   .. code-block:: none

      mail_compress_write_method = zstd


.. dovecot_plugin:setting:: compress_gz_level
   :default: 6
   :plugin: mail_compress
   :values: @uint

   The compression level to use for gz compression. Must be between
   0 (no compression) and 9.


.. dovecot_plugin:setting:: compress_deflate_level
   :default: 6
   :plugin: mail_compress
   :values: @uint

   The compression level to use for deflate compression. Must be between
   0 (no compression) and 9.


.. dovecot_plugin:setting:: compress_bz2_block_size_100k
   :default: 9
   :plugin: mail_compress
   :values: @uint

   The compression block size to use. Must be between 1 (100 000 bytes) and
   9 (900 000 bytes).


.. dovecot_plugin:setting:: compress_zstd_level
   :default: 3
   :plugin: mail_compress
   :values: @uint

   The compression level to use for zstd compression. Must be between
   1 and 22.
