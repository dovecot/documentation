.. _plugin-charset-alias:

====================
charset-alias plugin
====================

.. versionadded:: 2.2.34

.. seealso:: See :ref:`charset_alias_plugin` for a plugin overview.

Settings
========

.. _plugin-charset-alias-setting_charset_aliases:

``charset_aliases``
-------------------

- Default: <empty>
- Values:  :ref:`string`

A space-separated string of ``<from>=<to>`` charsets. The "from" charsets"
will be treated as "to" charsets when decoding to UTF-8.

Example:

.. code-block:: none

  plugin {
    charset_aliases = shift_jis=sjis-win euc-jp=eucjp-win iso-2022-jp=iso-2022-jp-3
  }
