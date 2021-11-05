.. _plugin-mail-lua:

===============
mail-lua plugin
===============

.. versionadded:: v2.3.4 

.. seealso:: :ref:`lua`

mail-lua is a plugin that can be loaded to provide API for mail storage Lua
plugins.

.. _plugin-mail-lua-setting_mail_lua_script:

``mail_lua_script``
-------------------

.. versionadded:: v2.3.4

- Default: <empty>
- Values:  :ref:`string`

Specify filename to load for user.

Example:

.. code-block:: none

  plugin {
    mail_lua_script = /etc/dovecot/user.lua
  }
