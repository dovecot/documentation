.. _imap_compress:

================
IMAP Compression
================

Dovecot supports the 
`IMAP COMPRESS (RFC 4978) <https://tools.ietf.org/html/rfc4978>`_ extension.

It allows an IMAP client to dynamically enable stream compression for an
IMAP session.

Settings
========

.. versionremoved:: v2.4.0;v3.0.0

  Configuration of the compression level and algorithm was dropped. The
  extension is now enabled by default and configured with the default
  compression level for the available mechanism.

See :ref:`plugin-imap-zlib`.
