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
  mail_driver = pop3c
  mail_path = 

  # Store index files locally:
  mail_path = ~/pop3c

Connection Settings
===================

.. dovecot_core:setting:: pop3c_features
   :values: @string

   A space-separated list of features, optimizations, and workarounds that can
   be enabled.

   Workarounds:

   ``no-pipelining``

     Prevents use of the PIPELINING extension even when it is advertised.


.. dovecot_core:setting:: pop3c_host
   :values: @string

   The remote POP3 host to connect to.


.. dovecot_core:setting:: pop3c_master_user
   :seealso: @pop3c_password;dovecot_core, @pop3c_user;dovecot_core
   :values: @string

   The master username to authenticate as on the remote POP3 host.

   To authenticate as a master user but use a separate login user, the
   following configuration should be employed, where the credentials are
   represented by masteruser and masteruser-secret:

   .. code-block:: none

     pop3c_user = %u
     pop3c_master_user = masteruser
     pop3c_password = masteruser-secret

   :ref:`Mail user variables <variables-mail_user>` can be used.


.. dovecot_core:setting:: pop3c_password
   :seealso: @pop3c_master_user;dovecot_core, @pop3c_user;dovecot_core
   :values: @string

   The authentication password for the remote POP3 server.

   If using master users, this setting will be the password of the master user.


.. dovecot_core:setting:: pop3c_port
   :default: 110
   :values: @uint

   The port on the remote POP3 host to connect to.


.. dovecot_core:setting:: pop3c_quick_received_date
   :default: no
   :values: @boolean

   If enabled, pop3c doesn't require calling TOP for each message in order to
   get the metadata.


.. dovecot_core:setting:: pop3c_rawlog_dir
   :seealso: @debugging_rawlog
   :values: @string

   Log all POP3 traffic input/output to this directory.


.. dovecot_core:setting:: pop3c_ssl
   :default: no
   :values: no, pop3s, starttls

   Use TLS to connect to the remote POP3 server.

   ============= =====================================================
   Value         Description
   ============= =====================================================
   ``no``        No TLS
   ``pop3s``     Explicitly connect to remote POP3 port using TLS
   ``starttls``  Use POP3 STARTTLS command to switch to TLS connection
   ============= =====================================================


.. dovecot_core:setting:: pop3c_ssl_verify
   :default: yes
   :seealso: @pop3c_ssl;dovecot_core
   :values: @boolean

   Verify remote POP3 TLS certificate?

   Verification may be disabled during testing, but should be enabled during
   production use.

   Only used if :dovecot_core:ref:`pop3c_ssl` is enabled.


.. dovecot_core:setting:: pop3c_user
   :default: %u
   :seealso: @pop3c_master_user;dovecot_core, @pop3c_password;dovecot_core
   :values: @string

   The user identity to be used for performing authentication to the source
   POP3 server.

   :ref:`Mail user variables <variables-mail_user>` can be used.


Usage Examples
==============

Connect using STARTTLS to pop3.example.com:

.. code-block:: none

  pop3c_host = pop3.example.com
  pop3c_password = secret
  pop3c_port = 110
  pop3c_ssl = starttls
  pop3c_user = user@example.com
