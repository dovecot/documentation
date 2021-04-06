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

There are some limitations for this kind of use case:

-  ``imapc_*`` settings are global. You can't have two different namespaces
   with different imapc settings yet.

-  The imapc code doesn't support some IMAP features. Most importantly
   SORT isn't supported, which may result in lower performance.

.. image:: _static/imapc.png
   :alt: Accesses to shared mailboxes via imapc


Setting up user-shared folders
------------------------------

You'll need to setup master user logins to work for all the users. The
logged in user becomes the master user. The master user doesn't actually
have any special privileges. It's just used to get ACLs applied correctly
using permissions of the master user (the logged in user). It is supported
to access shared mailboxes of users which live on other backends via the IMAP
protocol. For this purpose shared mailboxes in a cluster must be accessed via
another namespace which has ``location`` configured to use ``imapc``.

Mailboxes in the shared namespace can be accessed using the given namespace
prefix. For example the user ``someone1`` could have access to a
mailbox(``shared_mailbox``) owned by the user ``someone2``. To access mails
in this mailbox ``someone1`` would access a mailbox with the name
``shared/someone2/shared_mailbox``. The permissions which are given to
``someone1`` on this mailbox are determined by :ref:`acl`.


::

   namespace {
    type = shared
    prefix = shared/%%u/
    list = children
    # Use INDEXPVT to enable per-user \Seen flags.
    # If running earlier versions than 2.3.15, or if using obox storage
    # INDEXPVT is not supported.
    location = imapc:~/shared/%%u:INDEXPVT=~/shared-pvt/%%u
   }

Additionally imapc must be configured accordingly on the backends:
 * :ref:`setting-imapc_master_user` must be set to ``%u`` e.g. the logged in
   user becomes imapc master user
 * :ref:`setting-imapc_password` must be set to the master password which is
   configured on all backends and directors
 * :ref:`setting-imapc_host` must point to a load balancer's address that
   connects to Dovecot director/proxy
 * :ref:`setting-imapc_features`: To be able to pass through ``SEARCH`` commands
   to the sharing user's backend, :ref:`setting-imapc_features` should at least
   contain ``search``.

.. versionadded:: 2.3.15 INDEXPVT for imapc is supported from 2.3.15 onwards.
                  In general INDEXPVT with imapc is only supported for non-obox
                  storages.

::

   imapc_host = director-ip
   imapc_master_user = %u
   #imapc_user = # leave this empty. It'll be automatically filled with the destination username.
   imapc_password = master-secret
   imapc_features = search

As mentioned earlier the :ref:`acl <acl>` plugin must be loaded and configured
accordingly:

::

    mail_plugins = $mail_plugins acl

    plugin {
      acl = vfile
      # Added in 2.3.15
      acl_ignore_namespace = shared/*
      acl_shared_dict = $your_prefered_shared_dict
    }

The :ref:`acl <acl>` plugin must be told to ignore the shared namespace and all
its children using the :ref:`plugin-acl-setting-acl_ignore_namespace` setting.

The shared dictionary needs to be accessible from all the backends. The
possibilities for it are:

-  file: A single shared file in filesystem. This becomes a performance
   bottleneck easily if there are many in a shared filesystem.

-  fs posix: Shared directory in filesystem. This will create many small
   files in a shared filesystem.

-  sql: Shared SQL server

-  Any other `shared dictionary <https://wiki.dovecot.org/Dictionary>`__ can
   be used like described at :ref:`user_shared_mailboxes_shared_mailbox_listing`
