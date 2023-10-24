.. _fs_dictmap_mapping:

=============================
fs-dictmap filesystem mapping
=============================

The :ref:`fs-dictmap <dictmap_configuration>` driver works by providing a view
to Cassandra that ends up looking like a filesystem, which is compatible with
the obox mailbox format. There are several hardcoded paths to make it possible.
The mapping between the filesystem and the dict keys is:

 ====================================   ============================================          ======================================
 Filesystem path                        Dict keys (shared/ prefix not included)                        Files
 ====================================   ============================================          ======================================
   $user                                                                                           Hardcoded idx/ and mailboxes/  

   $user/idx/                             dictmap/$user/idx/$object_name                            User root index bundles
                                          
                                          dictdiffmap/$user/idx/$host

   $user/mailboxes/                       dictmap/$user/mailboxes/                                  Folder GUID directories

                                          $mailbox_guid

   $user/mailboxes/$mailbox_guid/         dictmap/$user/mailboxes/                                  Email objects
                                          
                                          $mailbox_guid/ 

                                          $bucket/$object_name
                                    
   $user/mailboxes/$mailbox_guid/idx/     dictmap/$user/mailboxes/                                  Folder index bundles
                                          $mailbox_guid/                    
                                          
                                          idx/$object_name 
                                          
                                          dictdiffmap/$user/mailboxes/
                                          
                                          $mailbox_guid/idx/$host

   $user/fts/                             dictmap/$user/fts/$object_name                           Full text search index objects
 ====================================   ============================================          ======================================

The filesystem can be accessed using the ``doveadm fs`` or ``doveadm mail fs``
commands. The ``config-filter-name`` parameter is either ``obox`` or
``metacache``. you're accessing email objects or index objects.

The included ``obox-user-objects.sh`` and ``obox-user-iter.sh`` scripts can be
used to list all objects for a user.

If you wish to delete all of the user’s data, you can do it recursively with:

.. code-block:: none

   doveadm obox user delete -u user@example.com
