.. _event_export:

=============
Event Export
=============

.. versionadded:: v2.3.7


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

The ``event_exporter`` block defines how :ref:`events <list_of_events>`
should be exported.  The basic definition is split into two orthogonal parts:
the format and the transport.

The format and its arguments specify *how* an event is serialized, while the
transport and its arguments specify *where* the serialized event is sent.

In both cases, the behavior is `tweaked` via the corresponding arguments
setting.

For example, the following block defines an exporter that uses the `foo`
transport and `json` format:

.. code-block:: none

   event_exporter ABC {
     format = json
     format_args = time-rfc3339
     transport = foo
     transport_args = bar
     transport_timeout = 500msec
   }

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

* `time-rfc3339` - serialize timestamps as strings using the RFC 3339 format
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
         "bytes_in" : 7,
         "bytes_out" : 311,
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

   event:imap_command_finished        hostname:dovecot-dev    start_time:2019-06-19T10:38:25.422744Z  end_time:2019-06-19T10:38:25.424812Z    category:imap   field:user=jeffpc       field:session=xlBB1KqLz1isGwB+  field:tag=a0005 field:name=SELECT       field:tagged_reply_state=OK     field:tagged_reply=OK [READ-WRITE] Select completed     field:last_run_time=2019-06-19T10:38:25.422709Z field:running_usecs=1953        field:lock_wait_usecs=60        field:bytes_in=7        field:bytes_out=311

Transports
^^^^^^^^^^

The transport and its arguments specify *where* the serialized event is sent.

Currently, there are three transports:

* `drop` - ignore the serialized event
* `log` - send serialized event to syslog
* `http-post` - send the serialized event as a HTTP POST payload to the URL
  specified in the ``transport_arg`` setting with a timeout specified by
  ``transport_timeout``

The `drop` transport is useful when one wants to disable the event exporter
temporarily.  Note that serialization still occurs, but the resulting
payload is simply freed.

The `log` transport is useful for debugging as typically one is already
looking at the logs.

Caution: It is possible for the stats process to consume a large amount of
memory buffering the POST requests if the timeout for `http-post` is set
very high, a lot of events are being generated, and the HTTP server is slow.

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

One uses the `metric` block settings documented in :ref:`statistics` to
select and filter the event to be exported.

`exporter`
^^^^^^^^^^

The `exporter` setting identifies which exporter should be used to export this
event.  If the setting is not specified, this event is *not* exported.  (This
is to allow certain metrics to be used only for statistics.)

`exporter_include`
^^^^^^^^^^^^^^^^^^

There are five possible parts that can be included in a serialized event:

* `name` - the name of the event
* `hostname` - the name of the host generating this event
* `timestamps` - the event start and end timestamps
* `categories` - a set of categories associated with this event
* `fields` - the fields associated with this event

The `exporter_include` setting is made up of these tokens which control what
parts of an event are exported.  It can be set to any set of those
(including empty set) and the order doesn't matter.  It defaults to all 5
tokens.

For example, ``exporter_include=name hostname timestamps`` includes just the 3
specified parts, while ``exporter_include=`` includes nothing - the exported
event will be empty (e.g., ``{}`` in JSON).

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
