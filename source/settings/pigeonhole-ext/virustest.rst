=====================================
Pigeonhole Sieve: Virustest Extension
=====================================

.. seealso:: :ref:`pigeonhole_extension_spamtest_virustest`

.. _plugin-sieve-setting-sieve_virustest_status_type:

``sieve_virustest_status_type``
-------------------------------

 - Default: <empty>
 - Value: ``score``, ``strlen``, ``text``

This specifies the type of status result that the spam/virus scanner produces.
This can either be a numeric score ``(score)``, a string of identical characters ``(strlen)``, e.g. `'*******'`, or a textual description ``(text)``, e.g. ``'Spam'`` or ``'Not Spam'``.

.. _plugin-sieve-setting-sieve_virustest_status_header:

``sieve_virustest_status_header``
---------------------------------

 - Default: <empty>
 - Value: ``<header-field> [ ":" <regexp> ]``

This specifies the header field that contains the result information of the spam scanner and it may express the syntax of the content of the header.
If no matching header is found in the message, the spamtest command will match against ``0``.

This is a structured setting. The first part specifies the header field name. Optionally, a POSIX regular expression follows the header field name,
separated by a colon. Any white space directly following the colon is not part of the regular expression. If the regular expression is omitted,
any header content is accepted and the full header value is used. When a regular expression is used,
it must specify one match value (inside brackets) that yields the desired spam scanner result.
If the header does not match the regular expression or if no value match is found, the spamtest test will match against ``0`` during Sieve script execution.

.. _plugin-sieve-setting-sieve_virustest_max_value:

``sieve_virustest_max_value``
-----------------------------

 - Default: <empty>
 - Value: :ref:`uint`

This statically specifies the maximum value a numeric spam score can have. 


 .. _plugin-sieve-setting-sieve_virustest_max_header:

``sieve_virustest_max_header``
------------------------------
 - Default: <empty>
 - Value: ``<header-field> [ ":" <regexp> ]``

Some spam scanners include the maximum score value in one of their status headers. Using this setting,
this maximum can be extracted from the message itself instead of specifying the maximum manually using the setting :ref:`plugin-sieve-setting-sieve_virustest_max_value`.
The syntax is identical to the :ref:`plugin-sieve-setting-sieve_virustest_status_header` setting. 


.. _plugin-sieve-setting-sieve_virustest_text_valuex:

``sieve_virustest_text_valueX``
-------------------------------

 - Default: <empty>
 - Value: :ref:`string`

When the sieve_virustest_status_type setting is set to text, these settings specify that the spamtest test will match against
the value ``X`` when the specified string is equal to the text (extracted) from the status header.
For spamtest and spamtestplus, values of X between 0 and 10 are recognized, while virustest only uses values between 0 and 5. 
