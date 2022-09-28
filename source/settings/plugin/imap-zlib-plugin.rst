.. _plugin-imap-zlib:

================
imap-zlib plugin
================

See :ref:`imap_compress` for an overview of Dovecot's IMAP compression support.

.. note::

  The imap-zlib plugin has been integrated into the main imap functionality of
  dovecot with version 2.4.0/3.0.0. The ``COMPRESS`` IMAP extension is now
  automatically enabled. Furthermore Dovecot is now required to be compiled
  with the ``zlib`` library, which provides the ``deflate`` compression
  mechanism used by this IMAP extension.

Settings
========

.. dovecot_plugin:setting:: imap_compress_<algorithm>_level
   :changed: v2.3.15
   :default: !<algorithm dependent>
   :plugin: imap-zlib
   :values: @uint

   Defines the compression level for the given algorithm.

   Per the RFC, only the ``deflate`` algorithm is currently supported.

   =========== ================== ======= =======
   Algorithm   Minimum            Default Maximum
   =========== ================== ======= =======
   ``deflate`` 0 (no compression) 6       9
   =========== ================== ======= =======


.. dovecot_plugin:setting:: imap_zlib_compression_level
   :plugin: imap-zlib
   :removed: v2.3.15 Now called :dovecot_plugin:ref:`imap_compress_<algorithm>_level`
