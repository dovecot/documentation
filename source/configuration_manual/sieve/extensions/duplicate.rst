.. _pigeonhole_extension_duplicate:

=====================================
Pigeonhole Sieve: Duplicate Extension
=====================================

The **duplicate** extension :rfc:`7352` adds a new test command
called ``duplicate`` to the Sieve language. This test adds the ability
to detect duplications. The main application for this new test is
handling duplicate deliveries commonly caused by mailing list
subscriptions or redirected mail addresses. The detection is normally
performed by matching the message ID to an internal list of message IDs
from previously delivered messages. For more complex applications, the
``duplicate`` test can also use the content of a specific header field
or other parts of the message.

.. dovecotchanged:: 2.4.0,3.0.0

  ``vnd.dovecot.duplicate`` extension has been removed in favor of this.

Configuration
-------------

The **duplicate** extension is available by default. The **duplicate**
extension has its own specific settings. The following settings are
available (default values are indicated):

:pigeonhole:ref:`sieve_duplicate_default_period` = 14d

:pigeonhole:ref:`sieve_duplicate_max_period` = 7d
   These options respectively specify the default and the maximum value
   for the period after which tracked values are purged from the
   duplicate tracking database. The period is specified in s(econds),
   unless followed by a d(ay), h(our) or m(inute) specifier character.

Example
-------

::

   plugin {
     sieve = ~/.dovecot.sieve

     sieve_duplicate_default_period = 1h
     sieve_duplicate_max_period = 1d
   }
