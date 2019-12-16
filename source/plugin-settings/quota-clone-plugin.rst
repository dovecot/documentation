.. _plugin-quota-clone:

===================
quota-clone plugin
===================

``quota-clone-plugin``
^^^^^^^^^^^^^^^^^^^^^^^^^
.. _plugin-quota-clone-setting_quota_clone_dict:

``quota_clone_dict``
---------------------------------------

The plugin for quota cloning is used for storing all users' current quota usage in a database that should not be used as the authoritative
quota database. Every time quota usage is updated, the dictionary specified here for the quota_clone plug-in is updated accordingly.

For more information, see :ref:`quota_clone_plugin`

Example Setting: 

.. code-block:: none

   quota_clone_dict = redis:host=127.0.0.1:port=6379

More complex example using SQL:

.. code-block:: none

   dict {
     mysql = mysql:/etc/dovecot/dovecot-dict-sql.conf.ext
   }

   plugin {
      quota_clone_dict = proxy::mysql
   }

