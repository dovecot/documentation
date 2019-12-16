.. _maillog:

==================
Mail logger plugin
==================

This plugin can be used to log several actions done in a mail session:

* Setting and removing \Deleted flag
* Expunging (includes autoexpunge)
* Copying mails to another mailbox
* Mailbox creations
* Mailbox deletions
* Mailbox renames
* Any flag changes
* Saves

Messages' UID and Message-ID header is logged for each action. Here's an
example:

.. code-block:: none

  imap(user): copy -> Trash: uid=908, msgid=<123.foo@bar>
  imap(user): delete: uid=908, msgid=<123.foo@bar>
  imap(user): expunged: uid=908, msgid=<123.foo@bar>

You can enable the plugin globally for all services by setting:

.. code-block:: none

  mail_plugins = $mail_plugins mail_log notify

The notify plugin is required for the mail_log plugin's operation, so be
certain it's also enabled.

Configuration
=============

You can configure what and how mail_log plugin logs:

.. code-block:: none

  plugin {
    # Events to log. Defined in src/plugins/mail-log/mail-log-plugin.c - also available: flag_change save mailbox_create
    # autoexpunge is included in expunge
    mail_log_events = delete undelete expunge copy mailbox_delete mailbox_rename

    # Also available: Defined in src/plugins/mail-log/mail-log-plugin.c - flags vsize from subject
    mail_log_fields = uid box msgid size

    # Don't log fields that require opening the email (v2.2.28+).
    #mail_log_cached_only = yes
  }
