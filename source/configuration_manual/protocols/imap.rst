.. _imap:

======================================
 Authentication via remote IMAP server
======================================

Available driver settings:

* host=<template> : IP address or hostname. Allows :ref:`config_variables` (e.g. host=imap.%d)
* port=<port>
* username=<template> : The default is %u, but this could be changed to for
  example %n@example.com
* ssl=imaps / ssl=starttls

 * ssl_ca_dir=<path>
 * ssl_ca_file=<path> (v2.2.30+)
 * allow_invalid_cert=yes|no : Whether to allow authentication even if the
   certificate isn't trusted. For v2.2 it defaults to "yes". (v2.2.30+)

*  rawlog_dir=<path>

See also `HowTo/ImapcProxy <https://wiki.dovecot.org/HowTo/ImapcProxy>`_ for
how to combine this with imapc storage.

Example:

Authenticates users against remote IMAP server in IP address 192.168.1.123:

.. code-block:: none

  passdb {
    driver = imap
    args = host=192.168.1.123
  }

IMAP Backend Configuration
==========================

* Enable some workarounds for Thunderbird

.. code-block:: none

  imap_client_workarounds = tb-extra-mailbox-sep tb-lsub-flags

.. toctree::
  :maxdepth: 1

  imap_server