.. _forwarding_parameters:

=====================================================
Forwarding parameters in IMAP/POP3/LMTP/SMTP proxying
=====================================================

Dovecot supports proxying various pieces of information and even
variables for various protocols when forwarding connection. It requires
that the sender is listed under :dovecot_core:ref:`login_trusted_networks`. For
IMAP, it uses the ``ID`` command, for other protocols, ``XCLIENT`` is used.

This feature is supported since v1.2, except for parameter forwarding, which
was added in v2.2.29.

IMAP protocol
-------------

For IMAP protocol, this is done by extending the
ID (:rfc:`2971`) command.

* RFC Requirements

  * Maximum key length is 30 bytes.

  * Value strings MUST NOT be longer than 1024 octets.

    * Dovecot has exactly 1024 byte limit to values. Trying to send 1025 bytes
      results in "``BYE Input buffer full, aborting``" response.

  * Implementations MUST NOT send more than 30 field-value pairs.

    * That being said, there doesn't seem to be any limit to number of
      field-value pairs Dovecot can accept. In a test of thousands of pairs
      sent to Dovecot, there was not any increased memory usage (since each
      key-value pair was read separately and then discarded when not used).

The parameters are forwarded as part of the ID command field-value list.

.. code-block:: none

  5 ID (x-originating-ip "127.0.0.1" x-originating-port "143" ...)

Supported Fields
^^^^^^^^^^^^^^^^

+-------------------------------+----------------------------------------------+
| Field                         | Description                                  |
+===============================+==============================================+
| ``x-originating-ip``          | Client IP address                            |
+-------------------------------+----------------------------------------------+
| ``x-originating-port``        | Client port                                  |
+-------------------------------+----------------------------------------------+
| ``x-connected-ip``            | Server IP address                            |
+-------------------------------+----------------------------------------------+
| ``x-connected-port``          | Server port address                          |
+-------------------------------+----------------------------------------------+
| ``x-proxy-ttl``               | TTL which is reduced by each hop, loop       |
|                               | prevention. When TTL drops to 0, the         |
|                               | connection is dropped.                       |
+-------------------------------+----------------------------------------------+
| ``x-session-id`` /            | Session ID to be used.                       |
| ``x-session-ext-id``          |                                              |
+-------------------------------+----------------------------------------------+
| ``x-forward-<variable_name>`` | Forwarded variable, see                      |
|                               | :ref:`Variables <config_variables>`          |
+-------------------------------+----------------------------------------------+

POP3 protocol
-------------

For POP3 protocol, this is done with custom ``XCLIENT`` command which
accepts a space separated list of field=value parameters.

.. warning::

  There is a 1024 byte line limit for the XCLIENT command when using POP3.
  Reaching this limit would cause the XCLIENT command to fail. This would be
  visible to the POP3 client as "-ERR Input buffer full, aborting" or some
  other AUTH error.

Supported Fields
^^^^^^^^^^^^^^^^

============ ===================================================================
Field        Description
============ ===================================================================
``ADDR``     Client IP
``PORT``     Client port
``SESSION``  Session ID
``TTL``      TTL which is reduced by each hop, loop prevention. When TTL drops
             to 0, the connection is dropped.
``FORWARD``  Base64-encoded, tab-separated list of ``key=value`` pairs to be
             forwarded to auth process. The keys and values are escaped using
             Dovecot's tab-escape format.
============ ===================================================================

SMTP/LMTP protocol
------------------

See https://www.postfix.org/XCLIENT_README.html

Supported Fields (SMTP & LMTP)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

============ ===================================================================
Field        Description
============ ===================================================================
``ADDR``     Client IP; prefix (``IPV6:<ipv6_address>``) is required for IPv6.
             However, Dovecot currently forwards without the IPv6 prefix,
             which does not follow the correct Postfix XCLIENT syntax.
``PORT``     Client port
``TTL``      TTL which is reduced by each hop, loop prevention. When TTL drops
             to 0, the connection is dropped.
``HELO``     Original ``HELO``/``EHLO``
``LOGIN``    Original ``LOGIN`` value
``TIMEOUT``  Original ``TIMEOUT``
``PROTO``    Forwarded protocol: ``SMTP``, ``ESTMP``, or ``LMTP``.
============ ===================================================================

Supported Fields (*SMTP/Submission* ONLY)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

============ ===================================================================
Field        Description
============ ===================================================================
``FORWARD``  Base64-encoded, tab-separated list of ``key=value`` pairs to be
             forwarded to auth process. The keys and values are escaped using
             Dovecot's tab-escape format. This value is effectively limited
             to around 1000 bytes.
``SESSION``  Session ID
============ ===================================================================

LMTP
^^^^

Additional parameters supported for the LMTP ``RCPT TO`` command:

================= ==============================================================
Parameter         Description
================= ==============================================================
``XRCPTFORWARD``  Base64-encoded, tab-separated list of ``key=value`` pairs to
                  be forwarded. The keys and values are escaped using Dovecot's
                  tab-escape format. This value is effectively limited to
                  around 900 bytes.
================= ==============================================================
