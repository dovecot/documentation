.. _plugin-quota-clone:

==================
quota-clone plugin
==================

.. versionadded:: v2.2.17

.. seealso:: :ref:`quota_clone_plugin`

Settings
========

.. _plugin-quota-clone-setting_quota_clone_dict:

``quota_clone_dict``
--------------------

- Default: <empty>
- Values:  :ref:`string`

The dictionary to update with quota clone information. This must be set for
the plugin to be active.

See :ref:`dict` for dictionary configuration.

Example: 

.. code-block:: none

  plugin {
    quota_clone_dict = redis:host=127.0.0.1:port=6379
  }
