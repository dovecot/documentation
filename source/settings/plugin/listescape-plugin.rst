.. _plugin-listescape:

=================
listescape plugin
=================

.. seealso:: See :ref:`listescape_plugin` for configuration information.

Settings
========

.. dovecot_plugin:setting:: listescape_char
   :default: \
   :plugin: listescape
   :values: @string

   The escape character to use.

   ``%`` needs to be written twice to escape it, because
   :ref:`config_variables` are expanded in plugin section.
