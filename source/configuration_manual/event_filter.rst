.. _event_filter:

===============
Event Filtering
===============

Dovecot's event support includes the ability to narrow down which events are
processed by filtering them based on the administrator-supplied predicate.

Individual events can be identified either by their name or source code
location.  The source location of course can change between Dovecot
versions, so it should be avoided.

Regardless of the syntax used, matching is performed the same way:

* Event names are compared using a case-sensitive wildcard match.  The
  wildcards supported are ``?`` and ``*``.
* Event location is compared in two parts: the file name is compared
  case-sensitively, and the line number is compared as an integer.  For a
  match to occur, the filename must match *and* the line number must either
  match or be unspecified.
* Event categories are compared using a "has a" relationship.  A category in
  the filter must be present in the event for a match to occur.  Any other
  categories on the event do not influence the match.
* Event fields are compared using a case-insensitive wildcard match.  The
  wildcards supported are ``?`` and ``*``.

.. _event_filter_metric:

Metric filter syntax
^^^^^^^^^^^^^^^^^^^^

.. versionadded:: v2.3

Events can be filtered inside the ``metric`` blocks (see :ref:`statistics`)
based on the event name, source location, the categories present, and field
values.

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

.. versionadded:: v2.3

The global filter syntax is used by a handful of global settings.  In
general, it is a boolean expression following the "OR of ANDs" pattern where
the "OR" and "AND" operators are implied.

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
