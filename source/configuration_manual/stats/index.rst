.. _statistics:

=============
Statistics
=============

This page is about the statistics support for Dovecot:

.. versionadded:: v2.3 

For v2.1 and v2.2 see :ref:`old_statistics`.

See :ref:`list_of_events` for list of all events that can be used in statistics.

Dovecot supports gathering statistics from "Events Design". Eventually all of the log messages should be events, so it will be possible to configure Dovecot to get statistics for anything that is logged. For debug messages it's possible to get statistics even if the message itself isn't logged.

Currently there are no statistics logged by default (but this might change). You'll need to add some metrics:

.. code-block:: none

   metric name {
     # Individual events can be identified either by their name or source file:line location.
     # The source location of course can change between Dovecot versions, so it should be
     # avoided.
     event_name = example_event_name
     #source_location = example.c:123

     # Space-separated list of categories that must match the event (e.g. "mail" or "storage")
     #categories = 

     # List of fields in event parameters that are included in the metrics.
     # All events have a default "duration" field that doesn't need to be listed here.
     #fields = 

     # List of key=value pairs that must match the event. The value can contain '?' and '*' wildcards.
     #filter {
     #  field_key = wildcard
     #}

     # v2.3.10+
     # List of fields to split statistics for (group by)
     # This generates sub-metrics for this metric based on this field.
     #group_by = field another-field
   }

Listing Statistics
^^^^^^^^^^^^^^^^^^^

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

The other fields (than duration) track whatever that field represents. For example with imap_command_finished's bytes_in field could be tracking how many bytes were being used by the IMAP commands. Non-numeric fields can also be tracked, although only the ``count`` is relevant to those.

The list of fields can be specified with the ``-f`` parameter. The default is:

.. code-block:: none

   doveadm stats dump -f 'count sum min max avg median stddev %95'

It's also possible to specify other percentiles than just 95%, for example:

.. code-block:: none

   doveadm stats dump -f 'count sum min max avg median stddev %95 %99 %99.9 %99.99'

The stats counters are reset whenever the stats process is started, which also means a dovecot reload will reset statistics. Using ``doveadm stats -r`` parameter will also reset the statistics atomically after they're dumped.

Examples:
---------

IMAP command statistics
^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: none

   metric imap_select_no {
     event_name = imap_command_finished
     filter {
       name = SELECT
       tagged_reply_state = NO
     }
   }
   
   metric imap_select_no_notfound {
     event_name = imap_command_finished
     filter {
       name = SELECT
       tagged_reply = NO*Mailbox doesn't exist:*
     }
   }

   metric storage_http_gets {
     event_name = http_request_finished
     categories = storage
     filter {
       method = get
     }
   }

   # generate per-command metrics on successful commands
   metric imap_command {
     event_name = imap_command_finished
     filter {
       tagged_reply_state = OK
     }
     group_by = cmd_name
   }

.. _stats_push_notifications:

Push notifications
^^^^^^^^^^^^^^^^^^

.. code-block:: none

   metric push_notifications {
     event_name = push_notification_finished
   }

   # for OX driver
   metric push_notification_http_finished {
     event_name = http_request_finished
     categories = push_notification
   }
