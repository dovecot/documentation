===================================
Pigeonhole Sieve: Include Extension
===================================

.. seealso:: :ref:`pigeonhole_extension_include`

Settings
--------

.. pigeonhole:setting:: sieve_include_max_includes
   :default: 255
   :plugin: yes
   :values: @uint

The maximum number of scripts that may be included. This is the total number
of scripts involved in the include tree.


.. pigeonhole:setting:: sieve_include_max_nesting_depth
   :default: 10
   :plugin: yes
   :values: @uint

The maximum nesting depth for the include tree.
