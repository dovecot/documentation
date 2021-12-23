.. _plugin-pop3-migration:

=====================
pop3-migration plugin
=====================

The pop3-migration plugin is used to preserve POP3 UIDLs.

When dsync is handling IMAP INBOX and requests a POP3 UIDL, the plugin
connects to the POP3 server and figures out which IMAP messages match the
POP3 messages and returns the appropriate POP3 UIDL.

.. seealso:: `Migrating from any IMAP/POP3 server to Dovecot via dsync <https://wiki.dovecot.org/Migration/Dsync>`_

Settings
========

.. dovecot_plugin:setting:: pop3_migration_all_mailboxes
   :default: no
   :plugin: pop3-migration
   :values: @boolean

   TODO

.. dovecot_plugin:setting:: pop3_migration_ignore_extra_uidls
   :default: no
   :plugin: pop3-migration
   :values: @boolean

   TODO

.. dovecot_plugin:setting:: pop3_migration_ignore_missing_uidls
   :default: no
   :plugin: pop3-migration
   :values: @boolean

   TODO

.. dovecot_plugin:setting:: pop3_migration_mailbox
   :plugin: pop3-migration
   :values: @string

   TODO

   This setting is required for the plugin to be active.

   Example:

   .. code-block:: none

     plugin {
       pop3_migration_mailbox = POP3-MIGRATION-NS/INBOX
     }


.. dovecot_plugin:setting:: pop3_migration_skip_size_check
   :default: no
   :plugin: pop3-migration
   :values: @boolean

   TODO


.. dovecot_plugin:setting:: pop3_migration_skip_uidl_check
   :default: no
   :plugin: pop3-migration
   :values: @boolean

   TODO
