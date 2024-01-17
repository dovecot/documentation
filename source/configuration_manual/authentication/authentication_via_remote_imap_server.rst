.. _authentication-authentication_via_remote_imap_server:

=====================================
Authentication via remote IMAP server
=====================================

Available driver settings:

* host=<template> : IP address or hostname. Allows %variables (e.g.
  host=imap.%d)
* port=<port>
* username=<template> : The default is %u, but this could be changed to for
  example %n@example.com
* ssl=imaps / ssl=starttls
* rawlog_dir=<path>

.. dovecotremoved:: 2.4.0,3.0.0 ssl_ca_file, ssl_ca_dir and allow_invalid_cert
                    settings have been removed. The standard ssl_* settings can
		    be used instead (also inside passdb { .. } if wanted).

See also `HowTo/ImapcProxy <https://wiki.dovecot.org/HowTo/ImapcProxy>`_ for
how to combine this with imapc storage.

Example
=======

Authenticates users against remote IMAP server in IP address 192.168.1.123:

.. code-block:: none

  passdb db1 {
    driver = imap
    args = host=192.168.1.123
  }
