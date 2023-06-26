.. _event_filter:

===============
Event Filtering
===============

See also:

 * :ref:`list_of_events` for list of all events.
 * :ref:`statistics`
 * :ref:`event_export`
 * :ref:`event_design` for technical implementation details

Dovecot's event support includes the ability to narrow down which events are
processed by filtering them based on the administrator-supplied predicate.

Individual events can be identified either by their name or source code
location.  The source location of course can change between Dovecot
versions, so it should be avoided.

Regardless of the syntax used, matching is performed the same way:

* Event names are compared using a case-sensitive wildcard match.  The
  wildcards supported are ``?`` and ``*``.

   * If wildcard characters are needed as literal characters, they can be
     escaped with the ``\`` character, e.g. ``\*``.

     .. dovecotchanged:: 2.4.0,3.0.0

* Event location is compared in two parts: the file name is compared
  case-sensitively, and the line number is compared as an integer.  For a
  match to occur, the filename must match *and* the line number must either
  match or be unspecified.
* Event categories are compared using a "has a" relationship.  A category in
  the filter must be present in the event for a match to occur.  Any other
  categories on the event do not influence the match.
* Event fields are compared using a case-insensitive wildcard match.  The
  wildcards supported are ``?`` and ``*``.

.. _event_filter_new_lang:

Unified Filter Language
^^^^^^^^^^^^^^^^^^^^^^^

.. dovecotadded:: 2.3.12

The unified event filtering language is a SQL-like boolean expression that
supports the ``AND``, ``OR``, and ``NOT`` boolean operators, the ``=``,
``<``. ``>``, ``<=``, and ``>=`` comparison operators, and parentheses to
clarify evaluation order.

The key-value comparisons are of the form: ``<key> <operator> <value>``

Where the key is one of:

#. ``event``
#. ``category``
#. ``source_location``
#. a field name

The operator is one of:

#. ``=``
#. ``>``
#. ``<``
#. ``>=``
#. ``<=``

And the value is either:

#. a single word token, or
#. a quoted string

The value may contain wildcards if the comparison operator is ``=``.
The value comparison is case-insensitive, but the key is case-sensitive.

There are some limitations on which operators work with what field types:

* string: Only the ``=`` operator is supported.
* ip: Only the ``=`` operator is supported.

  * The IPs are matched in their parsed form, e.g. ``2001::1`` matches
    ``2001:0:0:0:0:0:0:1``.
  * The IPs can be matched against network bitmasks, e.g. ``127.0.0.0/8``
    matches ``127.4.3.2``.
  * Wildcards match the IP as if it was a string, i.e. ``2001::1*`` will match
    the IPs ``2001::1`` and ``2001::1234``. However, ``2001:0:0:0:0:0:0:1*``
    will not match either of them.
  * Link-local addresses match only against the same interface, e.g.
    ``"fe80::1%lo"`` won't match against ``"fe80::1%eth0"``. Note that the
    ``%`` character needs to be inside a quoted string or event filter parsing
    fails.

* number: All operators are supported.

  * Wildcards match the number as if it was a string, i.e. ``40*`` will match
    numbers ``40`` and ``401``.

* timestamp: No operators are supported.
* a list of strings: Only the ``=`` operator is supported.
  It returns true if the key is one of the values in the list. If the value
  is an empty string, it returns true if the list is empty.

.. dovecotchanged:: 2.4.0,3.0.0 Event fields have specific types that
                    constrain the possible values they can be filtered by. For
                    example ``net_out_bytes`` and ``message_size`` are numeric and
                    can only be matched against numeric values. Previously type
                    mismatches were silently ignored, beginning with this
                    version each type mismatch and unsupported operation
                    generate a respective warning.

For example, to match events with the event name ``abc``, one would use one of
the following expressions.  Note that white space is not significant between
tokens, and therefore the following are all equivalent::

  event=abc
  event="abc"
  event = abc
  event = "abc"

A more complicated example::

  event=abc OR (event=def AND (category=imap OR category=lmtp) AND \
    NOT category=debug AND NOT (net_in_bytes<1024 OR net_out_bytes<1024))

.. dovecotadded:: 2.4.0,3.0.0 Sizes can be expressed using the unit values
   ``B`` - which represents single byte values - as well as ``KB``, ``MB``,
   ``GB`` and ``TB`` which are all powers of 1024. If no unit is specified
   ``B`` is used by default. All size units are case-insensitive. Additionally
   times can be specified with the units ``milliseconds`` (abbrev. ``msecs``),
   ``seconds`` (abbrev. ``secs``), ``minutes`` (abbrev. ``mins``), ``days``,
   and ``weeks``.

For example::

  (category=debug AND NOT (net_in_bytes<1KB OR net_out_bytes<1KB)) OR \
    (event=abc AND (message_size>1gb and message_size<1tB)) OR \
    (event=def AND (duration<1mins))

.. _event_filter_metric:

Metric filter syntax
^^^^^^^^^^^^^^^^^^^^

.. dovecotadded:: 2.3.0
.. dovecotchanged:: 2.3.12 filtering changed to use the common filter language
  (see :ref:`event_filter_new_lang`)

Events can be filtered inside the ``metric`` blocks (see :ref:`statistics`)
based on the event name, source location, the categories present, and field
values.

Since v2.3.12, the ``filter`` metric key is set to the desired common filter
language expression.  For example::

   metric example_http_metric {
     filter = event=http_request_finished AND \
         source_location=http-client.c:123 AND category=storage AND \
         category=imap AND user=testuser* AND status_code=200
   }


Old metric filter syntax
~~~~~~~~~~~~~~~~~~~~~~~~

Prior to v2.3.12, metric blocks used the filtering syntax described in the
remainder of this section.

All four use the same ``key=value`` syntax, however the semantics of each
are slightly different.

* Event name filtering uses the ``event_name`` key.  The value is matched as
  described above.
* Event source location filtering uses the ``source_location`` key.  The
  value is matched as described above.
* Event category filtering uses the ``categories`` key.  The value is a
  space-separated list of categories *all* of which must be matched as
  described above.
* Event field filtering uses the field name as the key, however the
  key-value pairs are inside the ``filter`` sub-block.  The value is matched
  as described above.

An event is said to match the filter if *all* of the specified key-value
pairs match.

For example, the following matches all events with the name
``http_request_finished``, the source code location ``http-client.c:123``,
the categories ``storage`` and ``imap``, the field ``user`` beginning with
the string ``testuser``, and ``status_code`` equal to 200::

   metric example_http_metric {
     event_name = http_request_finished
     source_location = http-client.c:123
     categories = storage imap
     filter {
       user = testuser*
       status_code = 200
     }
   }

.. _event_filter_global:

Global filter syntax
^^^^^^^^^^^^^^^^^^^^

.. dovecotadded:: 2.3.0
.. dovecotchanged:: 2.3.12 filtering changed to use the common filter language
  (see :ref:`event_filter_new_lang`)

Since v2.3.12, settings such as :dovecot_core:ref:`log_debug` use the common
filtering language.  For example::

  log_debug = (event=http_request_finished AND category=imap) OR \
              (event=imap_command_finished AND user=testuser)

Old global filter syntax
~~~~~~~~~~~~~~~~~~~~~~~~

Prior to v2.3.12, these settings used the filtering syntax described in the
remainder of this section.

In general, the setting's value is a boolean expression following the "OR of
ANDs" pattern where the "OR" and "AND" operators are implied.

The entire expression is a disjunction (OR) of sub-expressions separated by
spaces.  Each sub-expression is either a comparison (see below) or a
conjunction (AND) of comparisons grouped together by a pair of parentheses.

In other words, using ``C`` to denote a comparison:

* ``C`` is a single comparison
* ``C1 C2`` is the expression "C1 OR C2"
* ``(C1 C2)`` is the expression "C1 AND C2"
* ``C1 (C2 C3)`` is the expression "C1 OR (C2 AND C3)"

Note that any number of comparisons and sub-expressions is possible, however
no other nesting is allowed.

The comparisons can be based on the event name, source location, the
categories present, and field values.  All four use the same ``key:value``
syntax, however the semantics of each are slightly different.  In all cases,
the values are matched as described in the introduction.

* Event name filtering uses the ``event`` key.
* Event source location filtering uses the ``source`` key.
* Event category filtering uses the ``category`` key.
* Event field filtering uses the ``field`` key, and the value uses the
  ``fieldname=fieldvalue`` format.

Additionally, there are two aliases:

* ``cat:foo`` is equivalent to ``category:foo``
* ``service:foo`` is equivalent to ``category:service:foo``

An event is said to match the filter if the entire boolean expression
evaluates as true.

For example, the following matches all events with the name
``http_request_finished`` that have the category ``imap``, as well as all
events with the name ``imap_command_finished`` that have the field ``user``
equal to the value ``testuser``::

  (event:http_request_finished category:imap) \
  (event:imap_command_finished field:user=testuser)
