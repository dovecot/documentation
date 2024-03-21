.. _plugin-quota-clone:

==================
quota-clone plugin
==================

.. dovecotadded:: 2.2.17

.. seealso:: :ref:`quota_clone_plugin`

Settings
========

.. dovecot_plugin:setting_filter:: quota_clone
   :filter: quota_clone
   :plugin: quota-clone
   :setting: dict_driver
   :values: @named_filter
   :added: 2.4.0,3.0.0

   Named filter for initializing dictionary used to update with quota clone
   information.

   See :ref:`dict` for dictionary configuration.

   Example:

   .. code-block:: none

      dict_redis_host = 127.0.0.1
      dict_redis_port = 6379
      quota_clone {
        dict redis {
	}
      }


.. dovecot_plugin:setting:: quota_clone_unset
   :plugin: quota-clone
   :values: @boolean
   :added: 2.4.0,3.0.0

   Unset quota information before updating. This is needed with some dict backends
   that do not support upserting, such as SQL with older SQLite.
