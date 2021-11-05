.. _plugin-imap-zlib:

================
imap-zlib plugin
================

See :ref:`imap_compress` for an overview of Dovecot's IMAP compression support.

Settings
========

.. _plugin-imap-zlib-setting-imap_compress_level:

``imap_compress_<algorithm>_level``
-----------------------------------

.. versionchanged:: 2.3.15

- Default: <algorithm dependent>
- Values:  :ref:`uint`

Defines the compression level for the given algorithm.

Per the RFC, only the ``deflate`` algorithm is currently supported.

=========== ================== ======= =======
Algorithm   Minimum            Default Maximum
=========== ================== ======= =======
``deflate`` 0 (no compression) 6       9
=========== ================== ======= =======


.. _plugin-imap-zlib-setting-imap_zlib_compression_level:

``imap_zlib_compression_level``
-------------------------------

.. versionremoved:: 2.3.15

This is now called :ref:`plugin-imap-zlib-setting-imap_compress_level`.
