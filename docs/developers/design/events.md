---
layout: doc
title: Events
dovecotlinks:
  event_devel_design:
    hash: events-design
    text: "Developers: Events Design"
---

# Events Design

See [[link,event_design]] first for an overview of the design.

## Sending Events

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

## Category Naming

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

::: tip
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

::: tip
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

::: tip
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
