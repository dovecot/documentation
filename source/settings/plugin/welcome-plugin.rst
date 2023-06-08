.. _plugin-welcome:

==============
welcome plugin
==============

.. dovecotadded:: 2.2.25

.. seealso:: :ref:`welcome_plugin`

Settings
========

.. dovecot_plugin:setting:: welcome_script
   :plugin: welcome
   :values: @string

   The script to run when the user logs in for the first time (that is, when
   this user's INBOX is created). This must be set or else the plugin will not
   be active.

   Example:

   .. code-block:: none

     plugin {
       welcome_script = welcome %u
     }


.. dovecot_plugin:setting:: welcome_wait
   :default: no
   :plugin: welcome
   :values: @boolean

   If enabled, wait for the script to finish. By default, the welcome script
   is run asynchronously.
