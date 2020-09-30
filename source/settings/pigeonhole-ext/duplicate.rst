=====================================
Pigeonhole Sieve: Duplicate Extension
=====================================

.. seealso:: :ref:`pigeonhole_extension_duplicate`

.. _plugin-sieve-setting-sieve_duplicate_default_period:

``sieve_duplicate_default_period``
----------------------------------

 - Default: ``14d``
 - Value: :ref:`time`

Default period after which tracked values are purged from the duplicate tracking database.
The period is specified in s(econds), unless followed by a d(ay), h(our) or m(inute) specifier character. 

.. _plugin-sieve-setting-sieve_duplicate_max_period:

``sieve_duplicate_max_period``
------------------------------

 - Default: ``7d``
 - Value: :ref:`time`

Maximum period after which tracked values are purged from the duplicate tracking database.
The period is specified in s(econds), unless followed by a d(ay), h(our) or m(inute) specifier character.
