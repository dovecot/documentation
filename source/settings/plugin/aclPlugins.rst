.. _aclPlugins:

===============
acl plugin
===============

``acl-lookup-dict-plugin``
^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. _plugin-acl-lookup-dict-setting-acl_shared_dict:

``acl_shared_dict``
--------------------

This parameter is used if you wish to let users LIST mailboxes shared by other users. Specify the shared mailbox dictionary here. 
 
Example Setting:

.. code-block:: none

  plugin
     {
      acl_shared_dict = file:/var/lib/dovecot/shared-mailboxes
     }


``acl-storage-plugin``
^^^^^^^^^^^^^^^^^^^^^^^
.. _plugin-acl-storage-setting_acl_groups:

``acl_groups``
------------------

ACL groups support works by returning a comma-separated acl_groups extra field from userdb, which contains all the groups the user belongs to. 
User's UNIX groups have no effect on ACLs (you can enable them by using a special post-login script).


.. _plugin-acl-storage-setting_master_user:

``master_user``
--------------------

Specify both the master username and the login username in the same username field. 
The usernames are separated by a string configured by the ``auth_master_user_separator`` setting. 
UW-IMAP uses * as the separator, so that could be a good choice. Using * as the separator, the master user would log in as ``login_user*master_user``.

Master users are configured by adding a new passdb with master=yes setting. The users in the master passdb cannot log in as themselves, only as other people. That means they don't need to exist in the userdb, because the userdb lookup is done only for the user they're logging in as.


.. _plugin-acl-storage-setting_acl:

``acl``
---------

The vfile back end supports two types of access-control lists:
per-mailbox ones (stored in a file in the relevant mail directory: dovecot-acl) and global ones, to be applied to all user mailboxes.
The directory path for any global access-control lists is given here, and the parameter's cache_secs element indicates the interval, in
seconds, for running stat() on the dovecot-acl file to check forchanges.


.. _plugin-acl-storage-setting_acl_user:

``acl_user``
----------------


``acl-backend-plugin``
^^^^^^^^^^^^^^^^^^^^^^^
.. _plugin-acl-backend-setting_acl_globals_only:

``acl_globals_only``
-------------------------

.. versionadded:: 2.2.31

If enabled, don't try to find dovecot-acl files from mailbox directories.
This reduces unnecessary disk I/O when only global ACLs are used. 

Example Setting:

.. code-block:: none

   acl_globals_only = yes


.. _plugin-acl-backend-setting_acl_defaults_from_inbox:

``acl_defaults_from_inbox``
-------------------------------

.. versionadded:: 2.2.2

.. code-block:: none

   plugin 
   { 
    acl_defaults_from_inbox = yes
   }

As mentioned above in the plugin setting, If the default ACLs for private and shared namespaces (but not public namespaces) are taken from the INBOX. 
This means that giving somebody access to your INBOX will give them access to all your other mailboxes as well, unless the specific mailboxes' ACLs override the INBOX's.
