.. _autocreate:

===================
autocreate plugin
===================

With v2.1+ you don't need this plugin. Use `mailbox { auto } <https://wiki.dovecot.org/MailboxSettings>`_ setting instead.

This plugin allows administrator to specify mailboxes that must always exist for all users. They can optionally also be subscribed. The mailboxes are created and subscribed always after user logs in. Namespaces are fully supported, so namespace prefixes need to be used where necessary.

Example:

.. code-block:: none

   protocol imap {
   mail_plugins = $mail_plugins autocreate
   }
   plugin {
   autocreate = Trash
   autocreate2 = Spam
   #autocreate3 = ..etc..
   autosubscribe = Trash
   autosubscribe2 = Spam
   #autosubscribe3 = ..etc..
   }
