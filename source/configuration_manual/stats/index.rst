.. _statistics:

==========
Statistics
==========

.. dovecotadded:: 2.3.0

See :ref:`list_of_events` for list of all events that can be used in statistics.

Dovecot supports gathering statistics from events (see :ref:`event_design`).
Currently there are no statistics logged by default, and therefore they must
be explicitly added using the ``metric`` configuration blocks.

The event ``filter`` setting is the only required setting in a metric block.
It specifies which events should be used when calculating the
statistics for a given metric block.  Event filtering is described in detail
in :ref:`event_filter_metric`.

Note that Dovecot also has many unnamed events. These aren't generally useful
for statistics, but in some situations they may become visible in statistics.
To avoid surprises, it's a good idea to always specify ``event=name`` in the
filter setting. You can also use ``event=*`` to match all named events.

Settings
========

.. dovecot_core:setting:: metric
   :values: @named_list_filter

   Creates a new metric. The filter name refers to the
   :dovecot_core:ref:`metric_name` setting.


.. dovecot_core:setting:: metric_name
   :values: @string

   Name of the metric. It is visible in statistics outputs.


.. dovecot_core:setting:: metric_fields
   :values: @boollist

   A list of fields included in the metric. All events have a default
   "duration" field that does not need to be listed explicitly.

   .. dovecotchanged:: 2.4.0,3.0.0 All listed fields are exported to OpenMetrics as well.


.. dovecot_core:setting:: metric_group_by
   :values: @boollist

   This can be used to dynamically generate sub-metrics based on fields'
   values. See :ref:`statistics_group_by` for more details and examples.


.. dovecot_core:setting:: metric_filter
   :values: @string

   :ref:`Event filter <event_filter_metric>` that matches the events belonging
   to this metric.


.. dovecot_core:setting:: metric_exporter
   :values: @string

   Export events matching the filter with this
   :ref:`event exporter <event_export>`. Refers to the
   :dovecot_core:ref:`event_exporter_name` setting. If empty, the events are
   used only for statistics, and no exporting is done.


.. dovecot_core:setting:: metric_exporter_include
   :default: name hostname timestamps categories fields
   :values: @boollist

   Specifies which parts of the event are exported to the serialized event:

   * ``name`` - The name of the event
   * ``hostname`` - The name of the host generating this event
   * ``timestamps`` - The event start and end timestamps
   * ``categories`` - A set of categories associated with this event
   * ``fields`` - The fields associated with this event; the fields that will be
     exported are defined by the :dovecot_core:ref:`metric_fields` setting.

   For example, ``exporter_include=name hostname timestamps`` includes just the 3
   specified parts, while ``exporter_include=`` includes nothing - the exported
   event will be empty (e.g., ``{}`` in JSON).

.. dovecot_core:setting:: metric_description
   :values: @string

   Human-readable description of the metric. This is included in the HELP text
   sent to OpenMetrics.


.. _statistics_group_by:

Group by
========

.. dovecotadded:: 2.3.10 adds support for implicit discrete aggregation
.. dovecotchanged:: 2.3.11 adds support for explicit aggregation functions
.. dovecotchanged:: 3.0.0,2.4.0
	allows sub-metric names up to 256 bytes in total, before it was 32 per label

The :dovecot_core:ref:`metric_group_by` setting allows dynamic hierarchical
metric generation based on event fields' values.  Each field listed in the
``group_by`` generates one level of "sub-metrics".  These automatically
generated metrics are indistinguishable from those statically defined
in the config file.

Dovecot supports a number of aggregation functions that can be used to
quantize a field's value before it is used to generate a metric.

The format is always the same: the field name, a colon, the aggregation
function name, and optionally a colon followed by colon delimited parameters
to the aggregation function.

`discrete`
----------

The simplest aggregation function is to use the value as is.  Because this
is a very common use case, not specifying an aggregation function is treated
as an alias for discrete aggregation.  In other words, ``field`` and
``field:discrete`` produce the same behavior.

Example::

   metric imap_command {
     filter = event=imap_command_finished
     group_by = cmd_name tagged_reply_state
   }

This example configuration will generate statistics for each IMAP command.
The first "sub-metric" level is based on the IMAP command name, and the
second (and in this example final) level is based on the tagged reply.  For
example, a ``SELECT`` IMAP command that succeeded (in other words, it had an
``OK`` reply) will generate the metric ``imap_command_SELECT_ok``.

In addition to the final level metric, all intermediate level metrics are
generated as well.  For example, the same ``SELECT`` IMAP command will
generate all of the following metrics:

 - ``imap_command``
 - ``imap_command_SELECT``
 - ``imap_command_SELECT_ok``

Note: While the top level metrics (e.g., ``imap_command`` above) are
generated at start up, all ``group_by`` metrics are generated dynamically
when first observed.

.. _statistics_exponential_quantization:

`exponential`
-------------

The field's integer value is quantized into exponentially sized ranges.

The exponential aggregation function takes three colon delimited integer
arguments that define the set of ranges used: the minimum magnitude, the
maximum magnitude, and the base.  The exact configuration syntax is:
``field:exponential:min:max:base``

Note: Currently, only base 2 and base 10 are supported.

The first range starts at negative infinity and ends at ``pow(base, min)``.
The second range begins at ``pow(base, min) + 1`` and ends at
``pow(base, min + 1)``, the next covers ``pow(base, min + 1) + 1`` to
``pow(base, min + 2)``, and so on.  The last range covers
``pow(base, max) + 1`` to positive infinity.

For example, given the specification ``duration:exponential:1:5:10``, the
ranges would be:

* (-inf, 10]
* [11, 100]
* [101, 1000]
* [1001, 10000]
* [10001, 100000]
* [100001, +inf)

Much like the metric names generated with the ``discrete`` aggregation
function, the ones generated by the ``exponential`` function include
information about the value of the field.  However, in this case it is the
range the value belongs to.

Specifically, it is the name of the field being quantized, and the lower and
upper bounds for the range.

Example::

   metric imap_command {
     filter = event=imap_command_finished
     group_by = cmd_name duration:exponential:1:5:10
   }

This will generate metric names of the format
``imap_command_{cmd}_duration_{min}_{max}`` where ``{cmd}`` is the IMAP
command name, and ``{min}`` and ``{max}`` are the range bounds.  Therefore,
for a ``SELECT`` IMAP command, the possible generated metric names are:

* ``imap_command_SELECT_ninf_10``
* ``imap_command_SELECT_11_100``
* ``imap_command_SELECT_101_1000``
* ``imap_command_SELECT_1001_10000``
* ``imap_command_SELECT_10001_100000``
* ``imap_command_SELECT_100001_inf``

Note: Since the metric names cannot contain -, the string ``ninf`` is used
to denote negative infinity.

Note: Much like in the ``discrete`` case, the metrics are allocated only
when first observed.

Finally, because all intermediate level metrics are generated as well.  The
above example, will also generate all of the following metrics:

 - ``imap_command``
 - ``imap_command_SELECT``

`linear`
--------

The field's integer value is quantized into linearly sized ranges.

The linear aggregation function takes three colon delimited integer
arguments that define the set of ranges used: the minimum value, the
maximum value, and the range step size.  The exact configuration syntax is:
``field:linear:min:max:step``

The first range starts at negative infinity and ends at ``min``.  The second
range begins at ``min + 1`` and ends at ``min + step``, the next covers
``min + step + 1`` to ``min + (2 * step)``, and so on.  The last range
covers ``max + 1`` to positive infinity.

For example, given the specification ``net_out_bytes:linear:0:5000:1000``, the
ranges would be:

* (-inf, 0]
* [1, 1000]
* [1001, 2000]
* [2001, 3000]
* [3001, 4000]
* [4001, 5000]
* [5001, +inf)

See the description of the :ref:`statistics_exponential_quantization`
aggregation function for how metric names are formed from these ranges.

Listing Statistics
==================

The gathered statistics are available by running:

.. code-block:: none

   doveadm stats dump

Each event has a ``duration`` field, which tracks in microseconds how long the event existed. For example with ``imap_command_finished`` field it could be:

.. code-block:: none

   metric_name          field      count  sum       min  max     avg      median stddev %95
   imap_commands        duration   35     1190122   162  340477  34003    244    31215  188637

The above means:

========== ==================================================================================
   count    There have been 35 IMAP commands
   sum      The IMAP commands were running in total for 1190122 microseconds (= 1.1 seconds)
   min      The fastest IMAP command took 162 microseconds
   max      The slowest IMAP command took 340477 microseconds
   avg      The average time spent on an IMAP commands was 34003 microseconds
   median   The median time spent on an IMAP command was 244 microseconds
   stddev   Standard deviation for the time spent on IMAP commands
   %95      95% of the IMAP commands took 188637 microseconds or less
========== ==================================================================================

The other fields (than duration) track whatever that field represents. For example with imap_command_finished's net_in_bytes field could be tracking how many bytes were being used by the IMAP commands. Non-numeric fields can also be tracked, although only the ``count`` is relevant to those.

The list of fields can be specified with the ``-f`` parameter. The default is:

.. code-block:: none

   doveadm stats dump -f 'count sum min max avg median stddev %95'

It's also possible to specify other percentiles than just 95%, for example:

.. code-block:: none

   doveadm stats dump -f 'count sum min max avg median stddev %95 %99 %99.9 %99.99'

The stats counters are reset whenever the stats process is started, which also means a dovecot reload will reset statistics. Using ``doveadm stats -r`` parameter will also reset the statistics atomically after they're dumped.

Modifying Statistics Dynamically
================================

.. dovecotadded:: 2.3.17

Metrics can be added or removed dynamically. The changes do not persist after configuration reload.

Metrics can be added dynamically by running:

.. code-block:: none

   doveadm stats add [--description <string>] [--exporter <name> [--exporter-include <field>]] [--fields <fields>] [--group-by <fields>] <name> <filter>

* ``exporter``: See :dovecot_core:ref:`metric_exporter`
* ``exporter-include``: See :dovecot_core:ref:`metric_exporter_include`
* ``fields``: See :dovecot_core:ref:`metric_fields`
* ``group-by``: See :dovecot_core:ref:`metric_group_by`
* ``<filter>``: See :dovecot_core:ref:`metric_filter`

For example:

.. code-block:: sh

   doveadm stats add --description "IMAP SELECT commands" --exporter log-exporter --exporter-include "name timestamps" --fields "net_in_bytes net_out_bytes" --group-by "cmd_name tagged_reply_state" imap_cmd_select "event=imap_command_finished AND cmd_name=SELECT"

Metrics can be removed dynamically by running:

.. code-block:: none

   doveadm stats remove <name>

For example:

.. code-block:: sh

   doveadm stats remove imap_cmd_select

Examples
========

IMAP command statistics
-----------------------

.. code-block:: none

   metric imap_select_no {
     filter = event=imap_command_finished AND cmd_name=SELECT AND \
       tagged_reply_state=NO
   }

   metric imap_select_no_notfound {
     filter = event=imap_command_finished AND cmd_name=SELECT AND \
       tagged_reply="NO*Mailbox doesn't exist:*"
   }

   metric storage_http_gets {
     filter = event=http_request_finished AND category=storage AND \
       method=get
   }

   # generate per-command metrics on successful commands
   metric imap_command {
     filter = event=imap_command_finished AND \
       tagged_reply_state=OK
     group_by = cmd_name
   }

.. _stats_push_notifications:

Push notifications
------------------

.. code-block:: none

   metric push_notifications {
     filter = event=push_notification_finished
   }

   # for OX driver
   metric push_notification_http_finished {
     filter = event=http_request_finished AND category=push_notification
   }
