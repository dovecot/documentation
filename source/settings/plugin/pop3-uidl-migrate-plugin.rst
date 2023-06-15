.. _plugin-pop3-uidl-migrate:

========================
pop3-uidl-migrate plugin
========================

.. note:: pop3-uidl-migrate plugin is only available as part of
  :ref:`ox_dovecot_pro`.

The pop3-uidl-migrate plugin is used to preserve POP3 UIDLs. It's a more
efficient way than using :ref:`plugin-pop3-migration`, because it doesn't
require a separate POP3 connection to get the UIDLs. However, this plugin can
be used only for a few POP3 servers.

.. warning:: Always do a test migration to verify that POP3 UIDLs are preserved
             correctly. If the UIDL format is wrong, all the mails have to be
	     re-migrated.

Settings
========

.. dovecot_plugin:setting:: pop3_uidl_migrate_format
   :plugin: pop3-uidl-migrate
   :values: @string

   A template of the UIDL format to use when migrating messages.

   The template supports variable substitution of the form
   ``%%{variable_name}``.

   Variable substitutions available:

   ======================= ==================================================
   Field                   Value
   ======================= ==================================================
   ``owm``                 OpenWave: If Message-ID header is valid POP3 UIDL,
                           use it. Otherwise, use MD5 of the Message-ID
                           header.
   ``uid``                 IMAP message UID
   ``uidvalidity``         Current UID validity
   ======================= ==================================================

   Example:

   .. code-block:: none

     plugin {
       # Critical Path: IMAP UIDVALIDITY-IMAP UID
       pop3_uidl_migrate_format = %%{uidvalidity}-%%{uid}
       # OpenWave:
       pop3_uidl_migrate_format = %%{owm}
     }
