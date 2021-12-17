.. _plugin-replication:

==================
replication plugin
==================

For configuration details, see :ref:`replication`.

Settings
========


.. _plugin-replication-setting_mail_replica:

``mail_replica``
----------------

This parameter for the mail_replica plug-in indicates the location
for replication.

Example:

.. code-block:: none

  mail_replica = remote:vmail@targethost.example.com


.. _plugin-replication-setting_replication_sync_timeout:

``replication_sync_timeout``
----------------------------

When a new mail message is saved via IMAP or a message is being delivered via
LDA/LMTP, the system waits this amount of time for the mail to be synced to
the remote site.  If it doesn't finish after this timeout, a status of success
is indicated anyway.

Example Setting: 

.. code-block:: none

  replication_sync_timeout = 2s
