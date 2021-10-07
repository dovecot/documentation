.. _plugin-welcome:

==============
welcome plugin
==============

.. versionadded:: 2.2.25

.. seealso:: :ref:`welcome_plugin`

Settings
========

.. _plugin-welcome-setting_welcome_script:

``welcome_script``
------------------

- Default: <empty>
- Values:  :ref:`string`

The script to run when the user logs in for the first time (that is, when this
user's INBOX is created). This must be set or else the plugin will not be
active.

Example:

.. code-block:: none

  plugin {
    welcome_script = welcome %u
  }


.. _plugin-welcome-setting_welcome_wait:

``welcome_wait``
----------------

- Default: ``no``
- Values:  :ref:`boolean`

If enabled, wait for the script to finish.  By default, the welcome script
is run asynchronously.
