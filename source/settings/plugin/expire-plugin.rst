.. _plugin-expire:

===============
expire plugin
===============

.. versionremoved:: 2.3.14 This plugin is not needed. Use `mailbox { autoexpunge }` :ref:`mailbox_settings` instead.


``expire-plugin``
^^^^^^^^^^^^^^^^^^^
.. _plugin-expire-setting_expire:

``expire``
------------

The expire plug-in is typically used to optimize expunging of old messages from users' mailboxes.  When enabled, it reduces disk I/O.
The plug-in should be enabled globally - i.e., for all mail plug-ins rather than only specific protocols.


.. _plugin-expire-setting_expire_dict:

``expire_dict``
-------------------

Configuration for the expire plug-in's MySQL back end is handled in dovecot.conf, with a setting such as the following in the plugin block:

.. code-block:: none
   
   expire_dict = proxy::expire


.. _plugin-expire-setting_expire_cache:

``expire_cache``
------------------

A setting of yes (the default) enables caching of the dict value in the dovecot.index file.  
This setting for the expire plug-in significantly reduces the number of dict look-ups.
