=====================================
Pigeonhole Sieve: Variables Extension
=====================================

.. seealso:: :ref:`pigeonhole_extension_variables`

Settings
--------

.. pigeonhole:setting:: sieve_variables_max_scope_size
   :added: pigeonhole-0.5.0
   :default: 255
   :plugin: yes
   :values: @uint

   The maximum number of variables that can be declared in a scope.

   There are currently two variable scopes: the normal script scope and the
   global scope created by the
   :ref:`include extension <pigeonhole_extension_include>`.

   .. note:: The minimum value for this setting is 128.


.. pigeonhole:setting:: sieve_variables_max_variable_size
   :added: pigeonhole-0.5.0
   :default: 4k
   :plugin: yes
   :values: @size

   The maximum allowed size for the value of a variable. If exceeded at
   runtime, the value is always truncated to the configured maximum.

   .. note:: The minimum value for this setting is 4000 bytes.
