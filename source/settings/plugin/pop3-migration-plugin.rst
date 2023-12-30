.. _plugin-pop3-migration:

=====================
pop3-migration plugin
=====================

The pop3-migration plugin is used to preserve POP3 UIDLs.

When dsync is handling IMAP INBOX and requests a POP3 UIDL, the plugin
connects to the POP3 server and figures out which IMAP messages match the
POP3 messages and returns the appropriate POP3 UIDL.

For some POP3 servers it's possible to use the more efficient
:ref:`plugin-pop3-uidl-migrate`.

.. warning:: Always do a test migration to verify that POP3 UIDLs are preserved
             correctly. If the UIDL format is wrong, all the mails have to be
	     re-migrated.

.. seealso:: :ref:`Migrating from any IMAP/POP3 server to Dovecot via dsync <migrating_mailboxes>`

This plugin requires a :ref:`pop3c <pop3c_settings>` namespace configured
for accessing the source POP3 server. For example:

.. code-block:: none

   namespace pop3c {
     prefix = POP3-MIGRATION-NS/
     separator = /
     mail_driver = pop3c
     mail_path = 
     inbox = no
     list = no
     hidden = yes
   }

The plugin works by matching POP3 messages to IMAP messages. This isn't always
trivial with some servers, which can keep the POP3 and IMAP messages in
different order or include more than just IMAP INBOX messages in the POP3
messages.

Settings
========

.. dovecot_plugin:setting:: pop3_migration_all_mailboxes
   :default: no
   :plugin: pop3-migration
   :values: @boolean

   By default it's assumed that POP3 contains the same messages as IMAP INBOX.
   If there are any unexpected mails, the migration fails. If the POP3 server
   includes other folders' contents in POP3 as well, this setting needs to be
   enabled. It causes Dovecot to try to match POP3 messages in all the migrated
   folders, not just INBOX. There is no warning logged if any POP3 UIDLs are
   missing or if POP3 has messages that aren't found from IMAP.

.. dovecot_plugin:setting:: pop3_migration_ignore_extra_uidls
   :default: no
   :plugin: pop3-migration
   :values: @boolean

   If IMAP INBOX has all messages that exist in POP3, but POP3 still has some
   additional messages, the migration fails. Enable this setting to log it as
   a warning and continue anyway. This could happen if there's a race condition
   where a new mail is just delivered and it shows up in POP3 but not in IMAP.

.. dovecot_plugin:setting:: pop3_migration_ignore_missing_uidls
   :default: no
   :plugin: pop3-migration
   :values: @boolean

   If POP3 has messages that aren't found from IMAP INBOX, and IMAP INBOX also
   has messages not found from POP3, the migration fails. Enable this setting
   to log it as a warning and continue anyway.

.. dovecot_plugin:setting:: pop3_migration_mailbox
   :plugin: pop3-migration
   :values: @string

   This setting points to the POP3 INBOX in the configured pop3c namespace.
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

   IMAP and POP3 messages are attempted to be matched by the message sizes by
   default. This is the most efficient way of matching the messages, since both
   IMAP and POP3 listings can usually be looked up from indexes/caches. If the
   IMAP INBOX and POP3 listings don't match exactly, or if two adjacent
   messages have the same size, the rest of the messages are matched by reading
   their headers.

   If this setting is enabled, the message size check is skipped entirely and
   only headers are matched. This may be necessary for reliability if it's
   known that the IMAP and POP3 messages cannot be matched by size anyway.


.. dovecot_plugin:setting:: pop3_migration_skip_uidl_cache
   :default: no
   :plugin: pop3-migration
   :values: @boolean

   If imapc is configured with persistent indexes, the POP3 UIDLs are stored
   into the imapc mailbox's dovecot.index.cache files. Any following
   incremental migrations use these cached UIDLs if possible. This setting
   can be used to disable this in case there are any problems with the cache.
   This setting is unlikely to be ever needed.
