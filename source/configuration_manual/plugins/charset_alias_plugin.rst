.. _charset_alias_plugin:

====================
Charset Alias plugin
====================

.. versionadded:: v2.2.34

This plugin allows treating the specified source charset as a different charset when decoding to UTF-8. For instance, when decoding from shift_jis to UTF-8, using cp932 (or sjis-win) instead of shift_jis may be preferable to handle Microsoft extended chars properly.

Configuration
=============

.. code-block:: none

 mail_plugins = $mail_plugins charset_alias
 plugin {
   charset_aliases = shift_jis=sjis-win euc-jp=eucjp-win iso-2022-jp=iso-2022-jp-3
 }