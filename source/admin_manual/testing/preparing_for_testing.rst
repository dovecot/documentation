.. _preparing_for_testing:

============================
Preparing for Testing
============================

System configuration

* Make sure your firewall is configured to allow incoming connections for the following tcp ports: 24, 110, 143, 993, 995, 4190.

* Ensure ulimit is high enough to accept all the connections and open files.

Dovecot configuration
^^^^^^^^^^^^^^^^^^^^^
Enable LMTP delivery times in the configuration:

.. code-block:: none

   deliver_log_format = msgid=%m from=<%f> size=%p vsize=%w session=%{session_time}ms delivery=%{delivery_time}ms: %$

You can then see log entries like:

.. code-block:: none

   Oct 06 12:40:13 lmtp(testuser_717@example.com)<iQBSCwulE1ZXMwAA0J78UA>: Info: iQBSCwulE1ZXMwAA0J78UA: msgid=unspecified from=<sender@example.com> size=155980 vsize=157963 session=161ms delivery=134ms: saved mail to INBOX

Increase the maximum user connections per IP
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
.. code-block:: none

   mail_max_userip_connections = 1000

Object Storage
^^^^^^^^^^^^^^
Reducing the fscache value in :dovecot_plugin:ref:`obox` will result in more load for your storage platform. The fscache / ftscache should always be on ``tmpfs``.

Troubleshooting
^^^^^^^^^^^^^^^
You might run into problems where you have too few services running and you need to increase the number of services and/or modify client limit for the following:

* auth
* imap
* pop3
* lmtp
* metacache
* metacache-worker 
