.. _plugin-notify-status:

====================
notify-status plugin
====================

.. versionadded:: v2.2.33

.. seealso:: See :ref:`notify_status_plugin` for configuration information.

Settings
--------

.. dovecot_plugin:setting:: notify_status_dict
   :plugin: notify-status
   :values: @string

   The URI of the dictionary to use. This MUST be set for the plugin to be
   active.

   See :ref:`dict` for how to configure dictionaries.

   Example:

   .. code-block:: none

     plugin {
       notify_status_dict = proxy:dict-async:notify_status
     }


.. dovecot_plugin:setting:: notify_status_mailbox
   :plugin: notify-status
   :values: @string

   A mailbox pattern to exclude from status updates. Wildcards are acceptable.

   By default, all mailboxes are processed.

   You can define multiple quota roots by appending an increasing number to the
   setting label.

   Example:

   .. code-block:: none

     plugin {
       notify_status_mailbox = Spam
       notify_status_mailbox2 = Archive/*
     }


.. dovecot_plugin:setting:: notify_status_value
   :default: {"messages":%%{messages},"unseen":%%{unseen}}
   :plugin: notify-status
   :values: @string

   A template of the string that will be written to the dictionary.

   The template supports variable substitution of the form
   ``%%{variable_name}``.

   Supported variable substitutions:

   ======================= ============================================
   Field                   Value
   ======================= ============================================
   ``first_recent_uid``    First recent UID
   ``highest_modseq``      Highest modification sequence number
   ``highest_pvt_modseq``  Highest private modification sequence number
   ``mailbox``             Mailbox name
   ``messages``            Number of messages
   ``recent``              Number of recent messages (deprecated)
   ``uidnext``             Predicted next UID value
   ``uidvalidity``         Current UID validity
   ``unseen``              Number of unseen messages
   ``username``            Username (user@domain)
   ======================= ============================================
