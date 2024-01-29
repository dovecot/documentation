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

Strings can contain any characters. Strings support :ref:`config_variables`,
so if ``%`` character is wanted, it needs to be escaped as ``%%``.

.. _string_novars:

String without variables
------------------------

Non-variable strings are when :ref:`config_variables` aren't wanted
to be used. Typically this is done when setting-specific
:ref:`%variables <config_variables>` are wanted
to be used instead. For example:

.. code-block:: none

   imap_logout_format = in=%i out=%o

Here the ``%i`` and ``%o`` refer to variables specific to the
:dovecot_core:ref:`imap_logout_format` setting.

.. _uint:

Unsigned integer
----------------

Unsigned integer is a number between 0..4294967295, although specific settings
may have additional restrictions.

The value can also be "unlimited", which translates to 4294967295.

.. _uint_oct:

Octal unsigned integer
----------------------

Same as :ref:`uint`, but if the value is prefixed with ``0``, the number is
read as octal (instead of decimal).

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

The value can also be "unlimited".

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

The value can also be "infinite".

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

.. _named_filter:

Named Filter
^^^^^^^^^^^^

The settings inside the filter are used only in a specific situation. See
:ref:`named_filters` for more details.

.. _named_list_filter:

Named List Filter
^^^^^^^^^^^^^^^^^

The settings inside the filter are used only in a specific situation. The
filter has a unique name, which can be used to identify it within the list.
See :ref:`named_filters` for more details.

.. _strlist:

String List
-----------

String list is a list of key=value pairs. Each key name is unique within the
list (i.e. giving the same key multiple times overrides the previous one).
The string list is configured similarly to :ref:`named_filters`:

.. code-block:: none

   fs_randomfail_ops {
     read = 100
     write = 50
   }

.. _boollist:

Boolean List
------------

Boolean list is a list of key=yes/no pairs. Each key name is unique within the
list (i.e. giving the same key multiple times overrides the previous one).
The boolean list can be configured as a space or comma-separated list, which
replaces the previous boolean list entirely. For example:

.. code-block:: none

   mail_plugins = quota imap_quota
   mail_plugins = acl,imap_acl # removes quota and imap_quota

Quotes are also supported:

.. code-block:: none

   doveadm_allowed_commands = "mailbox list" "mailbox create"

The boolean list can also be configured to update an existing boolean list.
For example:

.. code-block:: none

   mail_plugins = quota acl
   protocol imap {
     mail_plugins {
       imap_quota = yes
       imap_acl = yes
     }
   }
   local 10.0.0.0/24 {
     protocol imap {
       mail_plugins {
         imap_acl = no
       }
     }
   }
