.. _plugin-acl:

==========
acl plugin
==========

.. seealso:: See :ref:`acl` for a plugin overview.

Settings
^^^^^^^^

.. dovecot_plugin:setting:: acl_driver
   :plugin: acl
   :added: 3.0.0
   :values: @string

   The ACL driver to use. This setting is **REQUIRED** - if empty, the acl
   plugin is disabled.

   The format is:

   .. code-block:: none

     backend

   Currently, there is a single backend available: ``vfile``. This backend
   supports two ways of defining the ACL configuration:

   *global*

     ACL rules are applied to all users.

   *per-mailbox*

     Each mailbox has separate ACL rules. They are stored in a ``dovecot-acl``
     file in each mailbox (or :dovecot_core:ref:`mail_control_path`) directory.
     This is the default.


.. dovecot_plugin:setting:: acl
   :plugin: acl
   :added: 3.0.0
   :values: @named_filter

   Specifies an ACL entry on global, namespace or mailbox level. The filter name refers to the
   :dovecot_plugin:ref:`acl_id` setting.

   Has two settings, :dovecot_plugin:ref:`acl_id` and :dovecot_plugin:ref:`acl_rights`. The ``acl_id`` setting is same as
   the identifier in ACL and ``acl_rights`` is the permission to grant, or deny, for this user.

   Example config:

   .. code-block:: none

      namespace inbox {
         mailbox DUMPSTER {
            acl owner {
              rights =
            }
         }

         acl user=admin {
           rights = lr
         }

         # you can also set id explicitly
         acl some-name {
           id = user=foo
           rights = lr
         }
      }

.. dovecot_plugin:setting:: acl_id
   :plugin: acl
   :added: 3.0.0
   :values: @string

   Specifies identity to match. See :ref:`acl-file_format` for values.
   The :dovecot_plugin:ref:`acl` filter name refers to this setting.

.. dovecot_plugin:setting:: acl_rights
   :plugin: acl
   :added: 3.0.0
   :values: @string

   Specifies rights for this acl. See :ref:`acl-file_format` for values.
   This is usually used in :dovecot_plugin:ref:`acl` {} block, so the acl\_ prefix can be left out.

.. dovecot_plugin:setting:: acl_global_path
   :plugin: acl
   :added: 3.0.0
   :values: @string

   Location of global ACL configuration file. This option is deprecated,
   you should use :ref:`inline ACLs <acl-imap_acl>` instead.

.. dovecot_plugin:setting:: acl_cache_ttl
   :plugin: acl
   :default: 30 seconds
   :added: 3.0.0
   :values: @time

   The interval for running stat() on the ACL file
   to check for changes.

.. dovecot_plugin:setting:: acl_defaults_from_inbox
   :added: 2.2.2
   :default: no
   :plugin: acl
   :values: @boolean

   If enabled, the default ACLs for private and shared namespaces (but not
   public namespaces) are taken from the INBOX. This means that giving
   somebody access to your INBOX will give them access to all your other
   mailboxes as well, unless the specific mailboxes' ACLs override the
   INBOX's.


.. dovecot_plugin:setting:: acl_globals_only
   :added: 2.2.31
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


.. dovecot_plugin:setting:: acl_ignore
   :added: 2.3.15
   :plugin: acl
   :values: @boolean

   Can be used in global config, namespace, or mailbox level to ignore ACLs.

   .. code-block:: none

     namespace ignore {
       acl_ignore = yes
     }

.. dovecot_plugin:setting:: acl_sharing_map
   :plugin: acl
   :seealso: @dict
   :values: @named_filter

   A shared mailbox dictionary that defines which users may LIST mailboxes
   shared by other users.

   See :ref:`user_shared_mailboxes_shared_mailbox_listing` for further details
   on the contents of the dictionary entries.

   Example:

   .. code-block:: none

     acl_sharing_map {
       dict file {
         path = /var/lib/dovecot/shared-mailboxes
       }
     }


.. dovecot_plugin:setting:: acl_user
   :plugin: acl
   :seealso: @authentication-master_users_acls
   :values: @string

   See :dovecot_core:ref:`auth_master_user_separator` for the format of this
   setting.
