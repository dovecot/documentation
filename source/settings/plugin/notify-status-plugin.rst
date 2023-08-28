.. _plugin-notify-status:

====================
notify-status plugin
====================

.. dovecotadded:: 2.2.33

.. seealso:: See :ref:`notify_status_plugin` for configuration information.

Settings
--------

.. dovecot_plugin:setting_filter:: notify_status
   :filter: notify_status
   :setting: dict_driver
   :values: @string

   The dict_driver to use. This is required to be set if it is not set in the
   filter notify_status will try to use the globally defined dict_driver.

   See :ref:`dict` for how to configure dictionaries.

   Example:

   .. code-block:: none

     notify_status {
       dict_driver = proxy
       dict_proxy_name = notify
     }


.. dovecot_plugin:setting:: mailbox_notify_status
   :plugin: notify-status
   :values: @boolean

   By default, all mailboxes are disabled

   You can enable single mailboxes or mailbox wildcards by adding
   notify_status = yes

   Example:

   .. code-block:: none

     mailbox INBOX {
       notify_status = yes
     }
     mailbox Spam {
       notify_status = yes
     }
     mailbox *BOX {
       notify_status = yes
     }


.. dovecot_plugin:setting:: notify_status_value
   :default: {"messages":%{messages},"unseen":%{unseen}}
   :plugin: notify-status
   :values: @string

   A template of the string that will be written to the dictionary.

   The template supports variable substitution of the form
   ``%{variable_name}``.

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
