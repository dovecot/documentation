.. _plugin-vault:

============
vault Plugin
============

.. note::

  Vault plugin is only available as part of :ref:`ox_dovecot_pro`.

The vault plugin performs the job of storing the incoming mail first to
a configurable mailbox location (e.g. ``ARCHIVE``) and, if that succeeds,
then to user’s INBOX. It also adds the ``\Seen`` flag to the message.

Settings:
=========

.. dovecot_plugin:setting:: vault_mailbox
   :plugin: vault
   :values: @string

   This setting enables the vault plugin and identifies where to store a copy
   of the message.

   Example:

   .. code-block:: none

     protocol lmtp {
       mail_plugins {
         vault = yes
       }
       plugin {
         vault_mailbox = ARCHIVE
       }
     }
