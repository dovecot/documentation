.. _plugin-mail-compress:

====================
mail-compress plugin
====================

.. seealso:: See :ref:`mail_compress_plugin` for a plugin overview.

Settings
^^^^^^^^

.. dovecot_plugin:setting:: mail_compress_save
   :plugin: compress
   :values: @string

   The compression algorithm to use.  This setting is REQUIRED - if empty, the
   plugin is disabled.

   The following algorithms are supported:

   ======== =================================================== =================
   Name     Library (algorithm)                                 Dovecot Support
   ======== =================================================== =================
   ``bz2``  `libbzip2 (bzip2) <https://sourceware.org/bzip2/>`_ v2.0+
   ``gz``   `zlib (gzip) <https://www.zlib.net/>`_              v2.0+
   ``lz4``  `liblz4 <https://www.lz4.org/>`_                    v2.2.11+
   ``xz``   `liblzma <https://tukaani.org/xz/>`_                **DEPRECATED**
                                                                (v2.2.9+ reading,
                                                                v2.2.9-v2.3.13
                                                                writing)
   ``zstd`` `Zstandard <https://facebook.github.io/zstd/>`_     v2.3.12+
   ======== =================================================== =================

   Example:

   .. code-block:: none

      mail_compress_save = zstd


.. dovecot_plugin:setting:: mail_compress_save_level
   :default: !<algorithm dependent>
   :plugin: mail_compress
   :values: @uint

   The compression level to use.  This value is dependent on the algorithm
   chosen in :dovecot_plugin:ref:`mail_compress_save`.

   The following levels are supported:

   ======== ================== ============= =======
   Name     Minimum            Default       Maximum
   ======== ================== ============= =======
   ``bz2``  1                  9             9
   ``gz``   0 (no compression) 6             9
   ``lz4``  1                  1             9
   ``zstd`` 1                  3             22
   ======== ================== ============= =======

   Example:

   .. code-block:: none

      mail_compress_save_level = 3

   .. dovecotchanged:: 2.3.15

      Prior to v2.3.15, the compression level must be an integer in the range
      1 to 9 regardless of the algorithm selected. The default level is 6.
      This value may not make sense with compression algorithms other than gz
      and bz2. For example, zstd supports levels from 1 to 22 in latest
      versions.
