.. _pop3c_settings:

===================
Pop3c Configuration
===================

See :ref:`Pop3c <pop3c_mbox_format>` for a technical description of Dovecot's
pop3c mailbox format.

Mail Location Configuration Examples
====================================

.. code-block:: none

  # In-memory index files:
  mail_location = pop3c:

  # Store index files locally:
  mail_location = pop3c:~/pop3c

Connection Settings
===================

.. _setting-pop3c_features:

``pop3c_features``
------------------

- Default: <empty>
- Values: :ref:`string`

A space-separated list of features, optimizations, and workarounds that can
be enabled.

Workarounds
###########

* ``no-pipelining``: Prevents use of the PIPELINING extension even when it is
  advertised.


.. _setting-pop3c_host:

``pop3c_host``
--------------

- Default: <empty>
- Values: :ref:`string`

The remote POP3 host to connect to.


.. _setting-pop3c_master_user:

``pop3c_master_user``
---------------------

- Default: <empty>
- Values: :ref:`string`

The master username to authenticate as on the remote POP3 host.

To authenticate as a master user but use a separate login user, the
following configuration should be employed, where the credentials are
represented by masteruser and masteruser-secret:

.. code-block:: none

  pop3c_user = %u
  pop3c_master_user = masteruser
  pop3c_password = masteruser-secret

:ref:`Mail user variables <variables-mail_user>` can be used.

See also :ref:`setting-pop3c_password`.
See also :ref:`setting-pop3c_user`.


.. _setting-pop3c_password:

``pop3c_password``
------------------

- Default: <empty>
- Values: :ref:`string`

The authentication password for the remote POP3 server.

If using master users, this setting will be the password of the master user.

See also :ref:`setting-pop3c_master_user`.
See also :ref:`setting-pop3c_user`.


.. _setting-pop3c_port:

``pop3c_port``
--------------

- Default: ``110``
- Values: :ref:`uint`

The port on the remote POP3 host to connect to.


.. _setting-pop3c_quick_received_date:

``pop3c_quick_received_date``
-----------------------------

- Default: ``no``
- Values: :ref:`boolean`

If enabled, pop3c doesn't require calling TOP for each message in order to get
the metadata.


.. _setting-pop3c_rawlog_dir:

``pop3c_rawlog_dir``
--------------------

- Default: <empty>
- Values: :ref:`string`

Log all POP3 traffic input/output to this directory.

See: :ref:`debugging_rawlog`.


.. _setting-pop3c_ssl:

``pop3c_ssl``
-------------

- Default: <empty>
- Values: <empty>, ``no``, ``pop3s``, ``starttls``

Use TLS to connect to the remote POP3 server.

=================== =====================================================
Value               Description
=================== =====================================================
``<empty>``, ``no`` No TLS
``pop3s``           Explicitly connect to remote POP3 port using TLS
``starttls``        Use POP3 STARTTLS command to switch to TLS connection
=================== =====================================================


.. _setting-pop3c_ssl_verify:

``pop3c_ssl_verify``
--------------------

- Default: ``yes``
- Values: :ref:`boolean`

Verify remote POP3 TLS certificate?

Verification may be disabled during testing, but should be enabled during
production use.

Only used if :ref:`setting-pop3c_ssl` is enabled.


.. _setting-pop3c_user:

``pop3c_user``
--------------

- Default: ``%u``
- Values: :ref:`string`

The user identity to be used for performing a regular LOGIN to the source POP3
server.

:ref:`Mail user variables <variables-mail_user>` can be used.

See also :ref:`setting-pop3c_master_user`.
See also :ref:`setting-pop3c_password`.


Usage Examples
==============

Do a regular POP3 LOGIN, using STARTTLS, to pop3.example.com:

.. code-block:: none

  pop3c_host = pop3.example.com
  pop3c_password = secret
  pop3c_port = 1110
  pop3c_ssl = starttls
  pop3c_user = user@example.com
