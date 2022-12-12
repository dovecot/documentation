.. _imap_compress:

================
IMAP Compression
================

Dovecot supports the IMAP COMPRESS (:rfc:`4978`) extension.

It allows an IMAP client to dynamically enable stream compression for an
IMAP session.

Settings
========

.. versionremoved:: v2.4.0;v3.0.0

  Configuration of the compression level and algorithm was dropped. The
  extension is now enabled by default and configured with the default
  compression level for the available mechanism.

See :ref:`plugin-imap-zlib`.
