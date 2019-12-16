.. _mail_event_logging:

=========================
Mail Event Logging
=========================

See http://wiki.dovecot.org/Plugins/MailLog for more details. 

.. code-block:: none

   mail_plugins = $mail_plugins notify mail_log

Enable the mail_log plugin. 

.. code-block:: none

   plugin {
    mail_log_events = delete undelete expunge copy mailbox_delete mailbox_rename
    mail_log_fields = uid box msgid size from
   }

Log a line about events that may cause message to be deleted. This is commonly useful when debugging why users have lost messages.