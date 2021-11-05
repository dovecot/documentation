.. _plugin-trash:

============
trash plugin
============

.. seealso:: :ref:`trash_plugin`

Settings
========

.. _plugin-trash-setting_trash:

``trash``
---------

- Default: <empty>
- Values:  :ref:`string`

A text file that configures the plug-in's behavior. This setting is required
for the plugin to be active.

Example:

.. code-block:: none

  trash = /etc/dovecot/dovecot-trash.conf.External

The file uses the following format: 

.. code-block:: none

  <priority> <mailbox name>

Deletion begins with the mailbox that has the lowest priority number and
proceeds from there.
