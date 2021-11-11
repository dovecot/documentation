=====================================
Pigeonhole Sieve: Duplicate Extension
=====================================

.. seealso:: :ref:`pigeonhole_extension_duplicate`

Settings
--------

.. pigeonhole:setting:: sieve_duplicate_default_period
   :default: 14d
   :plugin: yes
   :values: @time

Default period after which tracked values are purged from the duplicate
tracking database.


.. pigeonhole:setting:: sieve_duplicate_max_period
   :default: 7d
   :plugin: yes
   :values: @time

Maximum period after which tracked values are purged from the duplicate
tracking database.
