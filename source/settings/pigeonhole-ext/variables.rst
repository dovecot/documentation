=====================================
Pigeonhole Sieve: Variables Extension
=====================================

.. seealso:: :ref:`pigeonhole_extension_variables`

.. _plugin-sieve-setting-sieve_variables_max_scope_size:

``sieve_variables_max_scope_size``
----------------------------------

 - Default: ``255``
 - Value: :ref:`uint`

.. versionadded:: v0.5.0

The maximum number of variables that can be declared in a scope. There are currently two variable scopes:
the normal script scope and the global scope created by the :ref:`include extension <pigeonhole_extension_include>`. The minimum value for this setting is 128.

.. _plugin-sieve-setting-sieve_variables_max_variable_size:

``sieve_variables_max_variable_size``
-------------------------------------

 - Default: ``4k``
 - Value: :ref:`size`

.. versionadded:: v0.5.0

The maximum allowed size for the value of a variable. If exceeded at runtime, the value is always truncated to the configured maximum.
The minimum value for this setting is 4000 bytes. The value is in bytes, unless followed by a k(ilo). 
