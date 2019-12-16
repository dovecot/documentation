.. _plugin-welcome:

======================
welcome plugin
======================

``welcome-plugin``
^^^^^^^^^^^^^^^^^^^^
.. _plugin-welcome-setting_welcome_script:

``welcome_script``
--------------------

.. versionadded:: 2.2.25

The script pointed to by this parameter to the welcome_script plug-in is run when the user logs in for the first time (that is, when
this user's INBOX is created).  It is called similarly to the quota-warning scripts, with the username being the first parameter
passed to it in this:

Example Setting:

.. code-block:: none

   welcome_script = welcome %u


