.. _mail_log_plugin:

==================
Mail logger plugin
==================

This plugin can be used to log several actions done in a mail session:

* Setting and removing \Deleted flag
* Expunging (includes autoexpunge)
* Copying mails
* Saves
* Mailbox creations
* Mailbox deletions
* Mailbox renames
* Any flag changes

Messages' IMAP UID and Message-ID header is logged for each action.

Example:

.. code-block:: none

  imap(user): copy -> Trash: uid=908, msgid=<123.foo@bar>
  imap(user): delete: uid=908, msgid=<123.foo@bar>
  imap(user): expunged: uid=908, msgid=<123.foo@bar>

The notify plugin is required for the mail_log plugin's operation, so be
certain it's also enabled.

Settings
========

See :ref:`plugin-mail-log`.

Example Configuration
=====================

.. code-block:: none

   # Enable the plugin globally for all services
   mail_plugins {
     notify = yes
     mail_log = yes
   }

   plugin {
     mail_log_events = delete undelete expunge mailbox_delete mailbox_rename
     mail_log_fields = uid box msgid size from
     mail_log_cached_only = yes
   }
