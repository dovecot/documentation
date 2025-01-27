---
layout: doc
title: Events Design
dovecotlinks:
  event_design: Events Design
---

# Events Design

Dovecot supports events, which improves both logging and statistics.

::: tip
See Also:
* [[link,summary_events]],
* [[link,stats]],
* [[link,event_export]], and
* [[link,event_filter]].
:::

Each logging call can be attached to a specific event, which can provide more
metadata and context than just the log message string. This will eventually
allow implementing things like machine-parsable (e.g. `JSON`) log lines
containing key=value pairs, while still keeping the human readable text
available. Each logging event can also be captured and sent to stats, even if
it's not actually logged. Commonly statistics-related events are logged with
debug level.

Events have:

* Categories, such as `storage`, `mailbox` or `auth`.
* Fields, such as `user=foo@example.com` or `service=imap`.
* Creation timestamp with microsecond precision.
* Source code file and line number location when sending the event.
* It may have an easy human-readable name. This is important for events that
  are expected to be used for statistics, so they can be easily referred to.
* Forced debug-flag. Debug logging is enabled for this event regardless of
  the global debug log filters. A child event will inherit this flag.

Events are hierarchical, so they can have parent events. The events always
inherit all of their parents' categories and fields.

A child event can replace a parent's field, and it can also remove a
parent's field.

Ideally most events would have a parent hierarchy that reaches the top
event that was created for the current user/session. This allows statistics
to track which events happened due to which users. In some cases this may
not really be possible, such as an HTTP connection that is shared across
multiple users in the same process.

An event's lifetime is usually the same as the "object" it attaches to. For
example an IMAP client connection should have a single event created at the
beginning of the connection and destroyed at disconnection. The IMAP client
connection event could be used for logging things like "Client connected" and
"Client disconnected" and perhaps some other connection-specific events.
However, most of the logging should be done by new events that have the IMAP
client connection event as their parent.

::: tip
There's an automatic "duration" statistics field that is calculated from the
creation of the event to the (last) sending of the event, so for it to
make sense the event lifetime and its logging also needs to make sense.

So, for example, if the IMAP client connection event was used for logging
many things throughout the session, the "duration" field would make
little sense for most of those events.
:::

## Categories

The event categories are hierarchical. 

Example: `mail` category has parent `mailbox`, which has parent `storage`.
If an event filter contains `category=storage`, it will match the `mail`
and `mailbox` child categories as well.

::: tip
A category isn't the same as a service/process name, but there is a
`service:<name>` category.
:::

So, for example, IMAP process has an `imap` category for its IMAP-related
events, such as IMAP client connection and IMAP command related events.
Because most events would be child events under these IMAP events, they would
all inherit the `imap` category. So it would appear that using
`category=imap` filter would match most of the logging from imap process.
However, there would likely be some events that wouldn't have the IMAP client
as their parent event, so these wouldn't match the imap category.

## Fields

Each event can have any number of `key=value` fields. Parent event's
fields are inherited by the child event.

There are 4 types of fields:

* strings
* numbers (`intmax_t` = signed 64bit usually)
* timestamp (`struct timeval`)
* a list of strings

The fields can be used for various purposes:

* Filtering events with `field_name=value` matching
* Counting fields in statistics (most commonly number fields)
* They can include metadata that are internally used by the code. For example
  passing data from one plugin to others.
* Later on these fields can be used by the logging system.
* Field names should be consistent across the code. Besides making it easier
  for admins to configure the events, this allows statistics code to sum up
  fields from different unrelated events. 

  * Example: if all the networking events include `ip`, `net_in_bytes`, and
    `net_out_bytes` fields, statistics can globally track how much network
    traffic Dovecot is doing from its own point of view, regardless of whether
    it's HTTP traffic or IMAP traffic or something else.
