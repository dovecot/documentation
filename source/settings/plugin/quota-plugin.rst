.. _plugin-quota:

============
quota-plugin
============

``quota-plugin``
^^^^^^^^^^^^^^^^
.. _plugin-quota-setting_quota_exceeded_message:

``quota_exceeded_message``
--------------------------

The message specified here is passed on to a user who goes over quota. Note, that Dovecot can read the quota-exceeded message from a file.
The second example below shows this usage:

Example Setting:

.. code-block:: none

   quota_exceeded_message = Quota exceeded. 
   quota_exceeded_message = </path/to/quota_exceeded_message.txt


.. _plugin-quota-setting_quota_vsizes:

``quota_vsizes``
----------------

With this setting, virtual sizes rather than physical sizes are used for quota-related calculations. The value yes is required here if you wish to use the quota back end called count.

