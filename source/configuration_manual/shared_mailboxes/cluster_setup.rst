.. _mailbox_sharing_in_cluster:

===================================
Shared Mailboxes in Dovecot Cluster
===================================

As mentioned in :ref:`Director <dovecot_director>`, you can't have
multiple servers accessing the same user at the same time
or it will lead into trouble. This can become problematic with shared
mailboxes, because two users who are sharing a folder may run in
different servers. The solution here is to access the shared folders via
IMAP protocol, which passes through the Dovecot proxies/directors so the
actual filesystem access is done only by one server.

There are a some limitations for this kind of use case:

-  ``imapc_*`` settings are global. You can't have two different namespaces
   with different imapc settings yet.

-  The imapc code doesn't support many IMAP features. Most importantly
   SEARCH isn't supported, which may result in lower performance.


Setting up user-shared folders
------------------------------

You'll need to setup master user logins to work for all the users. The
logged in user becomes the master user. This way the ACLs are applied
correctly.

::

   namespace {
    type = shared
    prefix = shared/%%u/
    location = imapc:~/shared/%%u/ # cache for shared indexes
   }
   imapc_host = director-ip
   imapc_master_user = %u
   #imapc_user = # leave this empty. It'll be automatically filled with the destination username.
   imapc_password = master-secret

   plugin {
     acl_shared_dict = fs:posix:prefix=/nfs/shared-acls/
   }

The shared dictionary needs to be accessible from all the backends. The
possibilities for it are:

-  file: A single shared file in filesystem. This becomes a performance
   bottleneck easily if there are many users sharing folders.

-  fs posix: Shared directory in filesystem. This will create many small
   files to the filesystem.

-  sql: Shared SQL server

-  Any other `shared dictionary <https://wiki.dovecot.org/Dictionary>`__
