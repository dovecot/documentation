.. _microsoft_azure:

======================
Microsoft Azure
======================

.. code-block:: none

   mail_location = obox:%u:INDEX=~/:CONTROL=~/
   plugin
   {
   # Old?
   # obox_fs = fscache:1G:/var/cache/mails:azure:ACCESSKEY https://STORAGENAME.blob.core.windows.net/
 
   # Newer (verified January 2018)
   obox_fs: fscache:1G:/var/cache/mails:compress:gz:6:azure:ACCESSKEY https://OBJECT_USER.blob.core.windows.net/CONTAINER_NAME/
   obox_index_fs: compress:gz:6:azure:ACESSKEY https://OBJECT_USER.blob.core.windows.net/CONTAINER_NAME/
   fts_dovecot_fs: fts-cache:fscache:1G:/var/cache/fts:compress:gz:6:azure:ACCESSKEY https://OBJECT_USER.blob.core.windows.net/CONTAINER_NAME/
   }

Get ACCESSKEY and STORAGENAME from `www.windowsazure.com <https://azure.microsoft.com/en-us/>`_ ``-> Storage (-> Create STORAGENAME) -> STORAGENAME -> Manage Keys``.

Given current obox code (January 2018), storage account is required to be ``General-purpose v2``. (``Blob`` storage account will not work.)