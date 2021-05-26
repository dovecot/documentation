.. _plugin-imap-compress:

====================
IMAP COMPRESS plugin
====================

The goal of the extension is to reduce the bandwidth usage of IMAP.

Configuration:

.. code-block:: none

  #mail_plugins = $mail_plugins zlib # Required for v2.1 and older only

  protocol imap {
    mail_plugins = $mail_plugins imap_zlib
  }

  plugin {
    ## NOTE! Setting was called imap_zlib_compression_level before 2.3.15
    ## imap_compress_<algorithm>_level = value
    ##
    # imap_compress_deflate_level = 6
  }


Settings
========

.. _setting-plugin_imap_compress_level:

``imap_compress_<algorithm>_level``
----------------------------------------

.. versionchanged:: 2.3.15

Defines compression level for the given algorithm.
Refer to algorithm documentation for possible values.

 - Default: depends on algorithm.
 - Values: integer, algorithm specific.

.. _setting-plugin_imap_zlib_compression_level:

.. versionremoved:: 2.3.15

This is now called :ref:`setting-plugin_imap_compress_level`.
