.. _settings_types:

======================
Dovecot Settings Types
======================

.. contents::
   :depth: 1
   :local:

.. _string:

String
------

String settings are typically used with variable expansion to configure how
something is logged. For example :dovecot_core:ref:`imap_logout_format`:

.. code-block:: none

   imap_logout_format = in=%i out=%o

The ``#`` character and everything after it are comments. Extra spaces and tabs
are ignored, so if you need to use these, put the value inside quotes. The
quote character inside a quoted string is escaped with ``\"``:

.. code-block:: none

   key = "# char, \"quote\", and trailing whitespace  "

.. _uint:

Unsigned integer
----------------

Unsigned integer is a number between 0..4294967295, although specific settings
may have additional restrictions.

.. _boolean:

Boolean
-------

Boolean settings interpret any value as true, or false.

``yes`` and ``no`` are the recommended values. However, ``y`` and ``1`` also
work as ``yes``. Whereas, only ``no`` will work as false.

All these are case-insensitive. Other values give errors.

.. _size:

Size
----

The size value type is used in Dovecot configuration to define the amount of
space taken by something, such as a file, cache or memory limit. The size value
type is case insensitive. The following suffixes can be used to define size:

- B = bytes
- K = kilobytes
- M = megabytes
- G = gigabytes
- T = terabytes

The values can optionally be followed by "I" or "IB". For example K = KI = KIB.
The size value type is base 2, meaning a kilobyte equals 1024 bytes.

.. _time:

Time
----

The Time value is used in Dovecot configuration to define the amount of Time
taken by something or for doing something, such as a sending or downloading
file, processing, and more. The Time value supports using suffixes of any of
the following words:

   secs, seconds, mins, minutes, msecs, mseconds, millisecs, milliseconds,
   hours, days, weeks

.. Note::

   So for example "d", "da", "day", "days" all mean the same.

.. _time_msecs:

Millisecond Time
----------------

Same as :ref:`time`, but support milliseconds precision.

.. _ip_addresses:

IP Addresses
------------

The IP can be IPv4 address like ``127.0.0.1``, IPv6 address without brackets
like ``::1``, or with brackets like ``[::1]``. The DNS name is looked up once
during config parsing, e.g. ``host.example.com``. If a /block is specified,
then it's a CIDR address like ``1.2.3.0/24``. If a /block isn't specified, then
it defaults to all bits, i.e. /32 for IPv4 addresses and /128 for IPv6
addresses.

.. _url:

URL
---

Special type of :ref:`string` setting. Conforms to Uniform Resource Locators (URL) (:rfc:`1738`).
