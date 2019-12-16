.. _plugin-charset-alias:

===========================
charset-alias plugin
===========================

``charset-alias-plugin``
^^^^^^^^^^^^^^^^^^^^^^^^^
.. _plugin-charset-alias-setting_charset_aliases:

``charset_aliases``
------------------------
.. versionadded:: 2.2.34

This plugin allows treating the specified source charset as a different charset when decoding to UTF-8. 

For instance, when decoding from shift_jis to UTF-8, using cp932 (or sjis-win) instead of shift_jis may be preferable to handle Microsoft extended chars properly.

