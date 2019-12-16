.. _plugin-vault:

====================
vault plugin
====================

``vault-plugin``
^^^^^^^^^^^^^^^^^^^
.. _plugin-vault-setting_vault_mailbox:

``vault_mailbox``
-------------------

The vault plugin performs the job of storing the incoming mail first to ARCHIVE and if that succeeded, 
then to user’s INBOX. It also adds the \Seen flag to the message. You can enable it with:

.. code-block:: none
    
   protocol lmtp
        { mail_plugins = $mail_plugins vault
          plugin 
            { 
              vault_mailbox = ARCHIVE
            }
        }
