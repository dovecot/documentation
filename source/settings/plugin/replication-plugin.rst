.. _plugin-replication:

==================
replication plugin
==================

For configuration details, see :ref:`replication`.

Settings
========

.. dovecot_plugin:setting:: mail_replica
   :plugin: replication
   :values: @string

   The location for replication.

   Example:

   .. code-block:: none

     mail_replica = remote:vmail@targethost.example.com


.. dovecot_plugin:setting:: replication_sync_timeout
   :default: 10 secs
   :plugin: replication
   :values: @time

   When a new mail message is saved via IMAP or a message is being delivered
   via LDA/LMTP, the system waits this amount of time for the mail to be
   synced to the remote site.  If it doesn't finish after this timeout, a
   status of success is indicated anyway.
