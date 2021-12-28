.. _plugin-acl:

==========
acl plugin
==========

.. seealso:: See :ref:`acl` for a plugin overview.

Settings
^^^^^^^^

.. dovecot_plugin:setting:: acl
   :plugin: acl
   :values: @string

   The ACL driver to use. This setting is **REQUIRED** - if empty, the acl
   plugin is disabled.

   The format is:

   .. code-block:: none

     backend[:option[:option...]]

   Currently, there is a single backend available: ``vfile``. This backend
   supports two ways of defining the ACL configuration:

   *global*

     ACL rules are applied to all users.

   *per-mailbox*

     Each mailbox has separate ACL rules. They are stored in a ``dovecot-acl``
     file in each mailbox (or ``CONTROL``) directory. This is the default.

   This backend has the following options:

   ============== ============================================================
   Name           Description
   ============== ============================================================
   <global_path>  If a path is defined, this is the location of the global ACL
                  configuration file.
   cache_secs     The interval, in seconds, for running stat() on the ACL file
                  to check for changes. DEFAULT: 30 seconds
   ============== ============================================================

   Example:

   .. code-block:: none

     plugin {
       # Per-user ACL:
       acl = vfile

       # Global ACL; check for changes every minute
       #acl = vfile:/etc/dovecot/dovecot-acl:cache_secs=60
     }


.. dovecot_plugin:setting:: acl_defaults_from_inbox
   :added: v2.2.2
   :default: no
   :plugin: acl
   :values: @boolean

   If enabled, the default ACLs for private and shared namespaces (but not
   public namespaces) are taken from the INBOX. This means that giving
   somebody access to your INBOX will give them access to all your other
   mailboxes as well, unless the specific mailboxes' ACLs override the
   INBOX's.


.. dovecot_plugin:setting:: acl_globals_only
   :added: v2.2.31
   :default: no
   :plugin: acl
   :values: @boolean

   If enabled, don't try to find ``dovecot-acl`` files from mailbox
   directories. This reduces unnecessary disk I/O when only global ACLs are
   used.


.. dovecot_plugin:setting:: acl_groups
   :plugin: acl
   :values: @string

   A comma-separated string which contains all the groups the user belongs to.

   A user's UNIX groups have no effect on ACLs (you can enable them by using a
   special :ref:`post_login_scripting`).

   The default ACL for mailboxes is to give the mailbox owner all permissions
   and other users none. Mailboxes in public namespaces don't have owners, so
   by default no one can access them.


.. dovecot_plugin:setting:: acl_ignore_namespace
   :added: v2.3.15
   :plugin: acl
   :values: @string

   Ignore ACLs entirely for the given namespace.

   You can define multiple namespaces by appending an increasing number to
   the setting name.

   Example:

   .. code-block:: none

     plugin {
       acl_ignore_namespace = virtual/
       # Ignore shared/ and all its (autocreated) child namespaces
       acl_ignore_namespace2 = shared/*
     }


.. dovecot_plugin:setting:: acl_shared_dict
   :plugin: acl
   :seealso: @dict
   :values: @string

   A shared mailbox dictionary that defines which users may LIST mailboxes
   shared by other users.

   See :ref:`user_shared_mailboxes_shared_mailbox_listing` for further details
   on the contents of the dictionary entries.

   Example:

   .. code-block:: none

     plugin {
       acl_shared_dict = file:/var/lib/dovecot/shared-mailboxes
     }


.. dovecot_plugin:setting:: acl_user
   :plugin: acl
   :seealso: @authentication-master_users_acls
   :values: @string

   See :dovecot_core:ref:`auth_master_user_separator` for the format of this
   setting.


.. dovecot_plugin:setting:: master_user
   :plugin: acl
   :seealso: @acl_user;dovecot_plugin
   :values: @string

   TODO
