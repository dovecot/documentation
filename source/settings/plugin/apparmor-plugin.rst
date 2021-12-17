.. _plugin-apparmor:

===============
apparmor plugin
===============

.. versionadded:: v2.2.32

.. seealso:: See :ref:`apparmor_plugin` for a plugin overview.

Settings
========

.. _plugin-apparmor-setting_apparmor_hat:

``apparmor_hat``
----------------

- Default: <empty>
- Values:  :ref:`string`

The AppArmor "hat" to change to when a user is loaded. 

You can define muiltiple hats by appending an increasing number to the
setting name.

Example:

.. code-block:: none

  plugin {
    apparmor_hat = hat_name
    apparamor_hat2 = another_hat
  }
