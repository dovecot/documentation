.. _plugin-mail-lua:

====================
mail-lua plugin
====================

.. versionadded:: v2.3.4 

mail-lua is a plugin that can be loaded to provide API for mail storage Lua plugins. 

.. _plugin-mail_lua-setting_mail_lua_script:

``mail_lua_script``
-------------------

.. versionadded:: v2.3.4

- Default: <empty>

Specify file name to load for user.

Format is ``<filename>``.

Example Setting:

.. code-block:: none

  plugin {
    mail_lua_script = /etc/dovecot/user.lua
  }
