.. _plugin-last-login:

=================
last-login plugin
=================

.. seealso:: See :ref:`lastlogin_plugin` for configuration information.

Settings
========

.. _plugin-last-login-setting_last_login_dict:

``last_login_dict``
-------------------

.. versionadded:: 2.2.14

- Default: <empty>
- Values:  :ref:`string`

The dictionary where last login information is updated.

Example::

  plugin {
    last_login_dict = redis:host=127.0.0.1:port=6379
  }


.. _plugin-last-login-setting_last_login_key:

``last_login_key``
------------------

.. versionadded:: 2.2.14

- Default: ``last-login/%u``
- Values:  :ref:`string`

The key that is updated in the dictionary (defined by
:ref:`plugin-last-login-setting_last_login_dict`) with the last login
information.


.. _plugin-last-login-setting_last_login_precision:

``last_login_precision``
-------------------------

.. versionadded:: 2.2.14

- Default: ``s``
- Values:  ``s`` | ``ms`` | ``us`` | ``ns``

Precision for last login timestamp.
