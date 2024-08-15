---
layout: doc
title: Design
dovecotlinks:
  event_design: events design
---

# Events Design

Dovecot supports events, which improves both logging and statistics.

::: tip See Also
* [[link,summary_events]]
* [[link,stats]]
* [[link,event_export]]
* [[link,event_filter]]
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
parent's field with `event_field_clear()`.

Ideally most events would have a parent hierarchy that reaches the top
event that was created for the current user/session. This allows statistics
to track which events happened due to which users. In some cases this may
not really be possible, such as an HTTP connection that is shared across
multiple users in the same process. Generic libraries should take the
parent event in function parameters or in a settings struct or similar.

An event's lifetime is usually the same as the "object" it attaches to. For
example an IMAP client connection should have a single event created at the
beginning of the connection and destroyed at disconnection. The IMAP client
connection event could be used for logging things like "Client connected" and
"Client disconnected" and perhaps some other connection-specific events.
However, most of the logging should be done by new events that have the IMAP
client connection event as their parent.

::: tip Note
There's an automatic "duration" statistics field that is calculated from the
creation of the event to the (last) sending of the event, so for it to
make sense the event lifetime and its logging also needs to make sense.

So, for example, if the IMAP client connection event was used for logging
many things throughout the session, the "duration" field would make
little sense for most of those events.
:::

Events are sent by logging it. Any `e_debug()`, `e_info()`, `e_warning()`
or `e_error()` call will also send the event, which may be redirected to the
stats process. Often events that are intended for statistics are sent using the
`e_debug()` call. The event can be sent to statistics even if it's not
actually logged. Avoid sending events excessively.

::: warning
An `e_debug()` call every time connection reads or writes something will
likely result in a huge amount of unnecessary debug logging.
:::

## Event Names

Events that are expected to be used in statistics should have a name. Be
consistent when naming the events.

The name's prefix should be the subsystem that is logging the event. Usually
this would be the primary category of the event. 

Example: IMAP related events should begin with `imap_` and mailbox related
events begin with `mailbox_`.

The name should consist of only `[a-z]`, `[0-9]` and `_` characters.

Current naming conventions for name suffixes:

* `_connected` (for connections)
* `_disconnected` (for connections)
* `_finished` (when some operation finishes, e.g. IMAP command or HTTP request)
  * e.g. `http_request_finished`, `dns_request_finished`,
    `imap_command_finished`
  * This should be used regardless of whether the operation succeeded or
    failed. The details would be in fields.
* `_retried` (if an operation is internally retried one or more times before
  it's finished)

## Categories

The event categories are hierarchical. 

Example: `mail` category has parent `mailbox`, which has parent `storage`.
If an event filter contains `category=storage`, it will match the `mail`
and `mailbox` child categories as well.

::: tip Note
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

The same category name must not be duplicated within the process. This is
because event handling is optimized and performs category checking by
comparing the categories' pointers, not names' strings. (Then again, if
the struct `event_category` variable names were consistent, you'd get
duplicate symbol errors from linker as well.)

Be careful naming events that go through client and server boundaries.

Example: if both `lib-dns` and dns service use `dns` as their category and
also have identically named `dns_lookup` event, there's no easy way to
differentiate in event filters between these two. 
   
So a statistics filter could end up counting each DNS lookup twice. Since
it's more difficult to remember to check for event naming conflicts, it
would be safer to use different category names entirely.

The category name should consist of only `[a-z]`, `[0-9]` and `-`
characters. `:` is also used as a special case in `service:<name>`, but it
shouldn't be used for naming new categories.

## Fields

Each event can have any number of `key=value` fields. Parent event's
fields are inherited by the child event.

There are 4 types of fields:

* strings
* numbers `(intmax_t = signed 64bit usually)`
* timestamp (struct timeval)
* a list of strings

The fields can be used for various purposes:

* Filtering events with field_name=value matching
* Counting fields in statistics (most commonly number fields)
* They can include metadata that are internally used by the code. For example
  passing data from one plugin to others.
* Later on these fields can be used by the logging system.
* Field names should be consistent across the code. Besides making it easier
  for admins to configure the events, this allows statistics code to sum up
  fields from different unrelated events. 

Example: if all the networking events include `ip`, `net_in_bytes`, and
`net_out_bytes` fields, statistics can globally track how much network
traffic Dovecot is doing from its own point of view, regardless of whether
it's HTTP traffic or IMAP traffic or something else.

### Current Naming Conventions

* The name should consist of only `[a-z]`, `[0-9]` and `_` characters.
* Timestamps should have `_time` suffix
* Durations should have `_usecs` suffix and be in microseconds.
  * Try to avoid adding extra duration fields for most events. There's the
    automatic `duration` field already that contains how long the event
    has existed. So usually the event lifetime should be the same as the
    wanted duration field.
* Incoming TCP/IP connections should have `remote_ip`, `remote_port`,
  `local_ip`, and `local_port` fields
* Outgoing TCP/IP connections should have `ip` and `port` for the remote side.

  * For local side (bind address) `client_ip` and `client_port` may
    optionally be used

  ::: warning
  These are all different from incoming connection's IP/port fields. This
  is because often everything starts from an incoming connection, which will
  be used as the root event. So we may want to filter e.g. outgoing HTTP
  events going to port 80 which were initiated from IMAP clients that
  connected to `port 993` `(port=80 local_port=993)`
  :::

* Connection reads/writes should be counted in `net_in_bytes` and
  `net_out_bytes` fields
  * These fields are usually easiest updated with
    `event_add_int(event, net_in_bytes, istream->v_offset)` and
    `event_add_int(event, net_out_bytes, ostream->offset)`. If iostreams
    aren't used, `event_inc_int()` maybe be easier.

* (Local) disk reads should have `disk_read` and `disk_write` fields

  * With remote filesystems like NFS it may be difficult to differentiate
    between disk IO and network IO. Generally the `disk_read/write` should
    be used for `POSIX read()` and `write()` calls from filesystem.
  * Counting only `read()s` and `write()s` doesn't necessarily translate
    to actual disk IO since it may only be accessing the kernel page cache.
    Still, this may be useful.
  * There is a lot of disk IO performed all over the code, so Dovecot will
    likely never include events for all disk reads/writes.

* `error=<value>`: The operation failed. The `<value>` may be simply `y`
  or contain more details. This field shouldn't exist at all for successful
  operations.

* `error_code=<value>`: Machine-readable error code for a failed operation.
  If set, the `error` field must also be set.

::: tip Note
Events shouldn't be sent every time when receiving/sending network traffic.
Instead, the `net_in/out_bytes` fields should be updated internally so
that whenever the next event is sent it will have an updated traffic number.

Generally it's not useful for events to be counting operations. Rather
each operation should be a separate event, and the statistics code should
be the one counting them. This way statistics can only be counting, e.g.,
operations with `duration > 1 sec`. If the statistics code was seeing only
bulk operation counts this wouldn't be possible. The `net_in/out_bytes` and
such fields are more of an exception, because it would be too inefficient
to send individual events each time those were updated.
:::

::: tip Note
Even though internally updating a field for an event's parent will be
immediately visible to its children, the update won't be automatically sent
to the stats process. We may need to fix this if it becomes a problem.
:::

Field inheritance may become problematic also when multiple nested ioloops
are used. For example an outgoing imapc connection could receive a reply,
which synchronously triggers an outgoing quota SQL connection. The quota
SQL connection's parent event likely shouldn't be the imapc connection's
event, because otherwise they could be mixing the `IP/port fields` and
perhaps others. This isn't necessarily a problem though, but this is why
when connection.c performs outgoing UNIX socket connection it clears the
IP/port fields to make sure they don't exist for the connection event due
to inheritance from a parent event.

## Passthrough Events

Passthrough events' main purpose is to make it easier to create temporary
events as part of the event parameter in `e_error()`, `e_warning()`,
`e_info()`, or `e_debug()`. These passthrough events are automatically
freed when the `e_*()` call is finished. Because this makes the freeing
less obvious, it should be avoided outside `e_*()'s` event parameter.

A passthrough event's creation timestamp is the same as the parent event's
timestamp, because its intention is to only complement it with additional
fields. This way the generated event `duration` field is preserved properly.

The passthrough events also change the API to be more convenient towards
being used in a parameter. Instead of having to use:

```
event_add_str(event_set_name(event_create(parent), "name"), "key", "value")
```

The event_passthrough API can be a bit more readable as:

```
event_create_passthrough(parent)->set_name("name")->add_str("key", "value")->event().
```

The passthrough event is converted to a normal event at the end with the
event() call. 

::: tip Note

This API works by modifying the last created passthrough event, so it's
not possible to have multiple passthrough events created in parallel.
:::

## Log Prefixes

Events allow replacing the current log prefix or appending to it. This way
for example opening a mailbox can add a `Mailbox <name>:  prefix` and then
`use e_debug(box->event, ...)` without having to specify the mailbox name in
every log message.

## Global Events

Sometimes there's not really any specific event that a log message would
belong to, or it would be difficult to transfer the event there. In these
cases the old `i_debug()`, `i_info()`, `i_error()`, etc. logging calls can
still be used. These will be using the global event and its logging prefix.

The global events are pushed/popped in a stack. For example with IMAP the
initial global event is the user's event. During IMAP command execution
the global event is the IMAP command event.
