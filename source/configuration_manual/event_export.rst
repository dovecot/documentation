.. _event_export:

=============
Event Export
=============

.. dovecotadded:: 2.3.7


There are two parts to the configuration: 

(1) exporter definitions, and 

(2) event definition.

See also:

 * :ref:`list_of_events` for list of all events.
 * :ref:`event_filter`
 * :ref:`statistics`
 * :ref:`event_design` for technical implementation details

Exporter Definition
===================

The :dovecot_core:ref:`event_exporter` named list filter defines how
:ref:`events <list_of_events>` should be exported. The basic definition is
split into two orthogonal parts: the format and the transport.

The format and its arguments specify *how* an event is serialized, while the
transport and its arguments specify *where* the serialized event is sent.

In both cases, the behavior is `tweaked` via the corresponding arguments
setting.

For example, the following block defines an exporter that uses the ``foo``
transport and ``json`` format:

.. code-block:: none

   event_exporter ABC {
     format = json
     format_args = time-rfc3339
     transport = foo
     transport_args = bar
     transport_timeout = 500msec
   }

Settings
========

.. dovecot_core:setting:: event_exporter
   :values: @named_list_filter

   Creates a new event exporter. The filter name refers to the
   :dovecot_core:ref:`event_exporter_name` setting.


.. dovecot_core:setting:: event_exporter_name
   :values: @string

   Name of the event exporter. It is referred by the
   :dovecot_core:ref:`metric_exporter` settings.


.. dovecot_core:setting:: event_exporter_transport
   :values: @string

   The transport to use. See :ref:`event_exporter_transports`.


.. dovecot_core:setting:: event_exporter_transport_args
   :values: @string

   The transport arguments to use. See :ref:`event_exporter_transports`.


.. dovecot_core:setting:: event_exporter_transport_timeout
   :values: @time_msecs

   Abort the http-post request after this timeout.


.. dovecot_core:setting:: event_exporter_format
   :values: @string

   Format used for serializing the event. See
   :ref:`event_exporter_formats`.


.. dovecot_core:setting:: event_exporter_format_args
   :values: @string

   Format-specific arguments used for serializing the event. See
   :ref:`event_exporter_formats`.


.. _event_exporter_formats:

Formats
^^^^^^^

The format and its arguments specify *how* an event is serialized.

Since some formats cannot express certain values natively (e.g., JSON does not
have a timestamp data type), the ``format_args`` setting can be used to
influence the serialization algorithm's output.

There are two formats and two format args.

Formats:
^^^^^^^^
* json
* tab-text

Format Args:
^^^^^^^^^^^^

* `time-rfc3339` - serialize timestamps as strings using the :rfc:`3339` format
  (YYYY-MM-DDTHH:MM:SS.uuuuuuZ)
* `time-unix` - serialize timestamps as a floating point number of seconds
  since the Unix epoch

Example JSON
^^^^^^^^^^^^

Note: This example is pretty-printed.  The actual exported event omits the
whitespace between the various tokens.

.. code-block:: JSON

   {
      "event" : "imap_command_finished",
      "hostname" : "dovecot-dev",
      "start_time" : "2019-06-19T10:38:25.422744Z",
      "end_time" : "2019-06-19T10:38:25.424812Z",
      "categories" : [
         "imap"
      ],
      "fields" : {
         "net_in_bytes" : 7,
         "net_out_bytes" : 311,
         "last_run_time" : "2019-06-19T10:38:25.422709Z",
         "lock_wait_usecs" : 60,
         "name" : "SELECT",
         "running_usecs" : 1953,
         "session" : "xlBB1KqLz1isGwB+",
         "tag" : "a0005",
         "tagged_reply" : "OK [READ-WRITE] Select completed",
         "tagged_reply_state" : "OK",
         "user" : "jeffpc"
      }
   }

Example tab-text
^^^^^^^^^^^^^^^^

.. code-block:: none

   event:imap_command_finished        hostname:dovecot-dev    start_time:2019-06-19T10:38:25.422744Z  end_time:2019-06-19T10:38:25.424812Z    category:imap   field:user=jeffpc       field:session=xlBB1KqLz1isGwB+  field:tag=a0005 field:cmd_name=SELECT       field:tagged_reply_state=OK     field:tagged_reply=OK [READ-WRITE] Select completed     field:last_run_time=2019-06-19T10:38:25.422709Z field:running_usecs=1953        field:lock_wait_usecs=60        field:net_in_bytes=7        field:net_out_bytes=311

.. _event_exporter_transports:

Transports
^^^^^^^^^^

The transport and its arguments specify *where* the serialized event is sent.

Currently, there are three transports:

* `drop` - ignore the serialized event
* `log` - send serialized event to syslog
* `http-post` - send the serialized event as a HTTP POST payload to the URL
  specified in the ``transport_arg`` setting with a timeout specified by
  ``transport_timeout``. Default is 250 milliseconds.
* `file` - send serialized events to a file specified in
   the ``transport_arg`` setting.
* `unix` - send serialised events to a unix socket specified in the
    the ``transport_arg`` setting. The ``transport_timeout`` setting is
    used to specify how long the unix socket connection can take.
    Default is 250 milliseconds.

The `drop` transport is useful when one wants to disable the event exporter
temporarily.  Note that serialization still occurs, but the resulting
payload is simply freed.

The `log` transport is useful for debugging as typically one is already
looking at the logs.

Caution: It is possible for the stats process to consume a large amount of
memory buffering the POST requests if the timeout for `http-post` is set
very high, a lot of events are being generated, and the HTTP server is slow.

To reopen the files created by `file` transport, see :man:doveadm-stats(1):
reopen command.

Event Definition
================

The event definition reuses and extends the `metric` config block used for
statistics gathering.  The only additions to the block are the ``exporter`` and
``exporter_include`` settings.

These are only meaningful if the event matches the predicate (categories,
filter, etc.) specified in the metric block.

.. _filtering-events-label:

Filtering Events
^^^^^^^^^^^^^^^^

One uses the ``metric`` block settings documented in :ref:`statistics` to
select and filter the event to be exported. See
:dovecot_core:ref:`metric_exporter` and
:dovecot_core:ref:`metric_exporter_include` settings.

Example Configs
===============

If one wishes to send the events associated with IMAP commands completion to
a datalake having a HTTP API, one could use config such as:

.. code-block:: none

   event_exporter datalake {
     format = json
     format_args = time-rfc3339
     transport = http-post
     transport_args = https://datalake.example.com/api/endpoint/somewhere
     transport_timeout = 1sec
   }
   
   metric imap_commands {
     exporter = datalake
     exporter_include = name hostname timestamps
     filter = event=imap_command_finished
   }


When debugging, it is sometimes useful to dump information to the log.
For example, to output all named events from the IMAP service:

.. code-block:: none

   event_exporter log {
     format = json
     format_args = time-rfc3339
     transport = log
   }
   
   metric imap_commands {
     exporter = log
     filter = event=* AND category=service:imap
   }
