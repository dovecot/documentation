.. _time:

========
Time
========

The Time value is used in Dovecot configuration to define the amount of Time
taken by something or for doing something, such as a sending or downloading
file, processing, and more. The Time value supports using suffixes of any of
the following words:

   secs, seconds, mins, minutes, msecs, mseconds, millisecs, milliseconds,
   hours, days, weeks

.. Note::

   So for example "d", "da", "day", "days" all mean the same.

* Time Interval:

   Combination of a positive integer number and a time unit. Available time
   units are mentioned above. To match messages from last week, you may specify

For example:

.. code-block:: none

   since 1w, since 1weeks or since 7days.
