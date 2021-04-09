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
