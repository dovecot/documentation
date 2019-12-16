.. _importingMailboxes_converting_exporting_moving_migrating:

===========================================================
 ImportingMailboxes/Converting/Exporting/Moving/Migrating
===========================================================

Almost everything related to moving/converting mail accounts can be done using the dsync tool. It can do either one-way synchronization or two-way synchronization of mailboxes.
See:

.. code-block:: none
   
   doveadm help sync

or

.. code-block:: none
   
   doveadm help backup

for more information. Also http://wiki.dovecot.org/Migration/Dsync describes how to migrate mails from another IMAP/POP3 servers.

Mails can be also imported to an existing mailbox using: 


.. code-block:: none
   
   doveadm  import 

The new mails will be appended to their respective folders, creating the folders if necessary. It's also possible to give a prefix for the new folders, such as "backup-restored-20140824/". 

Mails can be also continuously replicated between two Dovecot servers using the replicator service. See http://wiki.dovecot.org/Replication for more information.