.. _parameter_forwarding:

=====================================================
Forwarding parameters in IMAP/POP3/LMTP/SMTP proxying
=====================================================

Dovecot supports proxying various pieces of information and even
variables for various protocols when forwarding connection. It requires
that the sender is listed under ``trusted_networks``. For IMAP, it uses
the ``ID`` command, for other protocols, ``XCLIENT`` is used.

This feature is supported since v1.2, except for x-forward which was
added in v2.2.29.

IMAP protocol
-------------

For IMAP protocol, this is done by extending the ID command. The maximum
length of parameters to parse is 255 bytes. The parameters are forwarded
as part of the ID command key-value list.

``5 ID (x-originating-ip "127.0.0.1" x-originating-port "143"... )``

Supported parameters
~~~~~~~~~~~~~~~~~~~~

-  ``x-originating-ip`` - Client IP

-  ``x-originating-port`` - Client port

-  ``x-connected-ip`` - Server IP

-  ``x-connected-port`` - Server port

-  ``x-proxy-ttl`` - TTL which is reduced by each hop, loop prevention.
   When TTL drops to 0, the connection is dropped.

-  ``x-session-id`` / ``x-session-ext-id`` - Session ID to be used.

-  ``x-forward-<variable_name>`` - Forwarded variable, see
   :ref:`Variables <config_variables>`

POP3 protocol
-------------

For POP3 protocol, this is done with custom ``XCLIENT`` command which
accepts a space separated list of key=value parameters.

Supported parameters
~~~~~~~~~~~~~~~~~~~~

-  ``ADDR`` - Client IP

-  ``PORT`` - Client port

-  ``SESSION`` - Session ID

-  ``TTL`` - TTL which is reduced by each hop, loop prevention. When TTL
   drops to 0, the connection is dropped.

-  ``FORWARD`` - Base64 encoded key=value parameter to be stored.

SMTP/LMTP protocol
------------------

See http://www.postfix.org/XCLIENT_README.html

-  ``ADDR`` - Client IP, IPV6: prefix is needed for IPv6.

-  ``PORT`` - Client port

-  ``SESSION`` - Session ID

-  ``HELO`` - Original HELO/EHLO

-  ``LOGIN`` - Original LOGIN value

-  ``TIMEOUT`` - Original TIMEOUT

-  ``TTL`` - TTL which is reduced by each hop, loop prevention. When TTL
   drops to 0, the connection is dropped.

-  ``PROTO`` - Forwarded protocol, can be one of SMTP, ESTMP, LMTP.

-  ``FORWARD`` - Base64 encoded key=value parameter to be stored.
