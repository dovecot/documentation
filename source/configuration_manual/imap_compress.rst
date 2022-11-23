.. _imap_compress:

================
IMAP Compression
================

Dovecot supports the IMAP COMPRESS (:rfc:`4978`) extension.

It allows an IMAP client to dynamically enable stream compression for an
IMAP session.

Settings
========

See :ref:`plugin-imap-zlib`.

Configuration
-------------

.. code-block:: none

  protocol imap {
    mail_plugins = $mail_plugins imap_zlib
  }

  plugin {
    ## NOTE! Setting was called imap_zlib_compression_level before 2.3.15
    ## imap_compress_<algorithm>_level = value
    ##
    imap_compress_deflate_level = 6
  }

