.. _plugin-quota-clone:

==================
quota-clone plugin
==================

.. versionadded:: v2.2.17

.. seealso:: :ref:`quota_clone_plugin`

Settings
========

.. dovecot_plugin:setting:: quota_clone_dict
   :plugin: quota-clone
   :values: @string

The dictionary to update with quota clone information. This must be set for
the plugin to be active.

See :ref:`dict` for dictionary configuration.

Example: 

.. code-block:: none

  plugin {
    quota_clone_dict = redis:host=127.0.0.1:port=6379
  }
