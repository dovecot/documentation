.. _plugin-mail-lua:

===============
mail-lua plugin
===============

.. versionadded:: v2.3.4

.. seealso:: :ref:`lua`

mail-lua is a plugin that can be loaded to provide API for mail storage Lua
plugins.


Settings
========

.. dovecot_plugin:setting:: mail_lua_script
   :added: v2.3.4
   :plugin: mail-lua
   :values: @string

   Specify filename to load for user.

   Example:

   .. code-block:: none

     plugin {
       mail_lua_script = /etc/dovecot/user.lua
     }
