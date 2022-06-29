.. _plugin-mailbox-alias:

====================
mailbox-alias plugin
====================

.. warning::

  The mailbox-alias plugin is no longer supported nor available.

.. versionadded:: v2.1.10
.. versionremoved:: v2.4.0;v3.0.0

This plugin can be used to configure mailbox aliases, which on the filesystem
level are symlinks to other mailboxes. This doesn't magically solve the problem
of showing clients e.g. multiple Sent mailboxes, but it can be used to make
sure that all of the different variants will have the same mails in them.
Unfortunately it also means that some clients will download the same mails to
local cache multiple times.

This plugin doesn't currently work with mailbox list indexes, so
:dovecot_core:ref:`mailbox_list_index` = no is required.

The way it works is that:
 * The aliases won't be visible until the mailbox is CREATEd
 * When alias is CREATEd, a symlink is created to the original mailbox. If the
   original mailbox didn't exist yet, it's also created.
 * If a mailbox with the same name as alias was already created before this
   plugin was enabled, its behavior won't change unless it's deleted.
 * When alias is DELETEd, the symlink is removed without deleting any of the
   mails.
 * The original mailbox can't be DELETEd while it still has aliases.
 * Mailbox can't be RENAMEd if it's an alias or if it has aliases.

Example configuration where "Sent" is the real mailbox and it has aliases
"Sent Messages" and "Sent Items":

.. code-block:: none

   mail_plugins = $mail_plugins mailbox_alias
   plugin {
     mailbox_alias_old = Sent
     mailbox_alias_new = Sent Messages
     mailbox_alias_old2 = Sent
     mailbox_alias_new2 = Sent Items
   }

   # Usually you want the Sent mailbox to be autocreated and advertised as
   # SPECIAL-USE \Sent:
   namespace inbox {
     mailbox Sent {
       auto = create # or subscribe
       special_use = \Sent
     }
   }
