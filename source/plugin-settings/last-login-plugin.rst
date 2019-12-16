.. _plugin-last-login:

===================
last-login plugin
===================

``last-login-plugin``
^^^^^^^^^^^^^^^^^^^^^^^^^^
.. _plugin-last-login-setting_last_login_dict:

``last_login_dict``
---------------------------------------

.. versionadded:: 2.2.14

The last_login plugin can be used to update the user-specific last-login timestamp in the dictionary indicated by this setting.

Example Setting: 

.. code-block:: none

   last_login_dict = redis:host=127.0.0.1:port=6379


.. _plugin-last-login-setting_last_login_key:

``last_login_key``
--------------------
.. versionadded:: 2.2.14

The last_login plugin can be used to update the user-specific last-login timestamp in the dictionary indicated.  This setting specifies the key.

Example Setting: 

.. code-block:: none

   last_login_key = last-login/%u


.. _plugin-last-login-setting_last_login_precision:

``last_login_precision``
-------------------------
Precision for last login timestamp

