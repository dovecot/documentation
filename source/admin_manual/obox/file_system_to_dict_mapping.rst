.. _file_system_to_dict_mapping:

=================================
File system to dict mapping
=================================

fs-dictmap works by providing a view to Cassandra that ends up looking like a filesystem compatible with obox mailbox format. There are several hardcoded paths to make it possible. 
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

The filesystem can be accessed using doveadm fs commands. The fs-driver and fs-args parameters are based on the obox_fs and/or obox_index_fs settings depending on whether you’re accessing email objects, index objects or both.

The following shell script can be used to list all internal Dovecot filesystem names for a user.  (It must be run on a system configured to access the obox storage, as it reads Dovecot’s configuration.):

.. code-block:: none

   #!/bin/sh
   user="$1"
   if [ "$user" = "" ]; then
    echo "Usage: $0 <username>" >&2
    exit 1
   fi
   obox_fs_args=`doveconf -h plugin/obox_fs | sed 's/^.*dictmap://'`
   if [ "$obox_fs_args" = "" ]; then
    echo "plugin/obox_fs not set" >&2
    exit 1
   fi
   obox_index_fs_args=`doveconf -h plugin/obox_index_fs | sed 's/^.*dictmap://'`
   if [ "$obox_index_fs_args" = "" ]; then
    obox_index_fs_args="$obox_fs_args"
   fi
 
   doveadm fs iter dictmap "$obox_index_fs_args" "$user/idx/" | sed "s,^,$user/idx/,"
   doveadm fs iter-dirs dictmap "$obox_index_fs_args" "$user/mailboxes/" |
   while read mailbox; do
    doveadm fs iter dictmap "$obox_index_fs_args" "$user/mailboxes/$mailbox/idx/" | sed "s,^,$user/mailboxes/$mailbox/idx/,"   
    doveadm fs iter dictmap "$obox_fs_args" "$user/mailboxes/$mailbox/" | sed "s,^,$user/mailboxes/$mailbox/,"
   done

If you wish to delete all of the user’s data, you can do it recursively with:

.. code-block:: none

   doveadm obox user delete -u user@example.com
