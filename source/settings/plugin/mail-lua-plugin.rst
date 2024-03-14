.. _plugin-mail-lua:

===============
mail-lua plugin
===============

.. dovecotadded:: 2.3.4

.. seealso:: :ref:`lua`

mail-lua is a plugin that can be loaded to provide API for mail storage Lua
plugins.


Settings
========

.. dovecot_plugin:setting_filter:: mail_lua
   :filter: mail_lua
   :plugin: mail-lua
   :values: @named_filter
   :added: 2.4.0,3.0.0

   Named filter for initializing mail_lua settings
   see :dovecot_core:ref:`lua_file` and :dovecot_core:ref:`lua_settings`

   Example:

   .. code-block:: none

      mail_lua {
        lua_file = /etc/dovecot/user.lua
        lua_settings {
          extra_param = %{userdb:extra_param}
        }
      }
