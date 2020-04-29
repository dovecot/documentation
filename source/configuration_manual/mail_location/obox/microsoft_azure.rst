.. _microsoft_azure:

======================
Microsoft Azure
======================

.. code-block:: none

   plugin {
     # Basic configuration:
     obox_fs = azure:ACCESSKEY https://STORAGENAME.blob.core.windows.net/CONTAINER_NAME/
   }

The parameters are:

+-----------------------------------+----------------------------------------------------------------------------------+
| Parameter                         |Description                                                                       |
+===================================+==================================================================================+
| See :ref:`http_storages` for common parameters                                                                       |
+-----------------------------------+----------------------------------------------------------------------------------+

Example configuration
---------------------

.. code-block:: none

   mail_location = obox:%u:INDEX=~/:CONTROL=~/
   plugin {
     obox_fs: fscache:1G:/var/cache/mails:compress:gz:6:azure:ACCESSKEY https://STORAGENAME.blob.core.windows.net/mails/
     obox_index_fs: compress:gz:6:azure:ACESSKEY https://STORAGENAME.blob.core.windows.net/mails/
     fts_dovecot_fs: fts-cache:fscache:1G:/var/cache/fts:compress:gz:6:azure:ACCESSKEY https://STORAGENAME.blob.core.windows.net/mails/
   }

Get ACCESSKEY and STORAGENAME from
`www.windowsazure.com <https://azure.microsoft.com/en-us/>`_ ->
Storage (-> Create STORAGENAME) -> STORAGENAME -> Manage Keys.

The storage account is required to be *General-purpose v2*. (*Blob*
storage account will not work.)