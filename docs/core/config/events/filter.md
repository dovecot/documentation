---
layout: doc
title: Filtering
dovecotlinks:
  event_filter: Event Filtering
  event_filter_global:
    hash: global-filter-syntax
    text: Global Metric Filters
  event_filter_metric:
    hash: metric-filter-syntax
    text: Metric Filters
  event_filter_source_location_performance:
    hash: performance-with-source-location
    text: Performance With source_location
  event_filter_log_level:
    hash: log-level
    text: Log Level Filters
---

# Event Filtering

Dovecot's event support includes the ability to narrow down which events are
processed by filtering them based on the administrator-supplied predicate.

Individual events can be identified either by their name or source code
location. The source location of course can change between Dovecot
versions, so it should be avoided.

::: tip
See Also:
* [[link,summary_events]],
* [[link,event_export]],
* [[link,stats]], and
* [[link,event_design]].
:::

## Matching

Regardless of the syntax used, matching is performed the same way:

* Event names are compared using a case-sensitive wildcard match.  The
  wildcards supported are `?` and `*`.

  * If wildcard characters are needed as literal characters, they can be
    escaped with the `\` character, e.g. `\*`.
  * Events without a name never match `event=<name>`, but they do match
    `NOT event=<name>`. [[changed,event_filter_not_event_name_changed]]

* Event location is compared in two parts: the file name is compared
  case-sensitively, and the line number is compared as an integer.  For a
  match to occur, the filename must match *and* the line number must either
  match or be unspecified.
* Event categories are compared using a "has a" relationship.  A category in
  the filter must be present in the event for a match to occur.  Any other
  categories on the event do not influence the match.
* Event fields are compared using a case-insensitive wildcard match.  The
  wildcards supported are `?` and `*`.
* Log levels are compared by their severity: `debug` < `info` < `warning` <
  `error` < `fatal` < `panic`. See [Log Level](#log-level).

## Performance

[[added,event_filter_index_added]]

Filters are indexed by event name, so that an event is matched only against
the parts of the filter that can match its name. For this to work, the
filter's `OR` alternatives need to have an exact event name in their
top-level `AND` conditions, e.g. `event=imap_command_finished AND
cmd_name=SELECT`. Alternatives with a wildcard event name, or with no event
name at all, are evaluated for every event.

Top-level `category=service:<name>` conditions are evaluated only once per
process for filters that are matched against the process's own events (e.g.
[[setting,log_debug]], [[setting,log_core_filter]],
[[setting,process_shutdown_filter]] and metric filters in the processes
sending events to stats). For example a metric filter
`event=imap_command_finished AND category=service:imap` costs nothing in
processes other than imap.

## Common (Unified) Filter Language

The unified event filtering language is a SQL-like boolean expression that
supports the `AND`, `OR`, and `NOT` boolean operators, the `=`,
`<`. `>`, `<=`, and `>=` comparison operators, and parentheses to
clarify evaluation order.

The key-value comparisons are of the form: `<key> <operator> <value>`

Where the key is one of:

* `event`
* `category`
* `source_location`
* `log_level`
* a field name

The operator is one of:

* `=`
* `>`
* `<`
* `>=`
* `<=`

And the value is either:

* a single word token, or
* a quoted string

The value may contain wildcards if the comparison operator is `=`.

The value comparison is case-insensitive, but the key is case-sensitive.

There are some limitations on which operators work with what field types:

* string: Only the `=` operator is supported.
* ip: Only the `=` operator is supported.

  * The IPs are matched in their parsed form, e.g. `2001::1` matches
    `2001:0:0:0:0:0:0:1`.
  * The IPs can be matched against network bitmasks, e.g. `127.0.0.0/8`
    matches `127.4.3.2`.
  * Wildcards match the IP as if it was a string, i.e. `2001::1*` will match
    the IPs `2001::1` and `2001::1234`. However, `2001:0:0:0:0:0:0:1*`
    will not match either of them.
  * Link-local addresses match only against the same interface, e.g.
    `"fe80::1%lo"` won't match against `"fe80::1%eth0"`. Note that the
    `%` character needs to be inside a quoted string or event filter parsing
    fails.

* number: All operators are supported.

  * Wildcards match the number as if it was a string, i.e. `40*` will match
    numbers `40` and `401`.

* timestamp: No operators are supported.
* a list of strings: Only the `=` operator is supported.
  It returns true if the key is one of the values in the list. If the value
  is an empty string, it returns true if the list is empty.

  Event fields have specific types that constrain the possible values they
  can be filtered by. For example, `net_out_bytes` and `message_size`
  are numeric and can only be matched against numeric values. Previously
  type mismatches were silently ignored, beginning with this version each
  type mismatch and unsupported operation generate a respective warning.

Sizes can be expressed using the unit values `B` - which represents single
byte values - as well as `KB`, `MB`, `GB` and `TB` which are all powers
of 1024. If no unit is specified `B` is used by default. All size units
are case-insensitive.

Times can be specified with the units `milliseconds` (abbrev. `msecs`),
`seconds` (abbrev. `secs`), `minutes` (abbrev. `mins`), `days`,
and `weeks`.

### Log Level

[[added,event_filter_log_level_added]] The `log_level` key matches the log
level that the event is being sent with. The value is one of `debug`, `info`,
`warning`, `error`, `fatal` or `panic` (case-insensitive). All the comparison
operators are supported, and they compare the levels by their severity:

| Filter | Matching log levels |
| ------ | ------------------- |
| `log_level=debug` | `debug` |
| `log_level<info` | `debug` |
| `log_level>=warning` | `warning`, `error`, `fatal`, `panic` |
| `log_level>error` | `fatal`, `panic` |
| `NOT log_level=debug` | `info`, `warning`, `error`, `fatal`, `panic` |

Events that are only used for statistics (e.g. most named events) are
typically sent with the `debug` log level.

[[changed,log_filter_level_match_changed]] [[setting,log_debug]] and
[[setting,log_core_filter]] are matched against the log level of each
logged message. This matters for processes that hide some log levels by
default, for example auth processes hide `info` level messages unless
[[setting,auth_verbose]] is enabled:

```doveconf[dovecot.conf]
# Enable debug logging for auth, but not the hidden info messages
log_debug = log_level=debug AND category=auth
# Enable the hidden info messages for auth, but not debug logging
log_debug = log_level=info AND category=auth
# Enable both debug logging and the hidden info messages for auth
log_debug = category=auth
```

A filter without a `log_level` comparison matches all log levels.

::: warning [[deprecated,event_filter_log_level_added]]
Previously log levels were matched as if they were categories:
`category=debug`, `category=info`, `category=warning`, `category=error`,
`category=fatal` and `category=panic`. This still works the same as
`log_level=<level>`, but it is deprecated and a warning is logged about it.
Only the exact lowercase names are treated as log levels, e.g.
`category=Debug` refers to a category named `Debug`.
:::

### Examples

For example, to match events with the event name `abc`, one would use one of
the following expressions.  Note that white space is not significant between
tokens, and therefore the following are all equivalent:

```doveconf[dovecot.conf]
event=abc
event="abc"
event = abc
event = "abc"
```

A more complicated example:

```doveconf[dovecot.conf]
event=abc OR (event=def AND (category=imap OR category=lmtp) AND \
    NOT log_level=debug AND NOT (net_in_bytes<1024 OR net_out_bytes<1024))
```

A complicated example using size matching:

```doveconf[dovecot.conf]
(log_level=debug AND NOT (net_in_bytes<1KB OR net_out_bytes<1KB)) OR \
    (event=abc AND (message_size>1gb and message_size<1tB)) OR \
    (event=def AND (duration<1mins))
```

## Metric Filter Syntax

Events can be filtered inside the `metric` blocks (see [[link,stats]])
based on the event name, source location, the categories present, log level
and field values.

The `filter` metric key is set to the desired common filter language
expression. For example:

```doveconf[dovecot.conf]
metric example_http_metric {
  filter = event=http_request_finished AND \
      source_location=http-client.c:123 AND category=storage AND \
      category=imap AND user=testuser* AND status_code=200
}
```

## Global Filter Syntax

Settings such as [[setting,log_debug]] use the common filtering language.
For example:

```doveconf[dovecot.conf]
log_debug = (event=http_request_finished AND category=imap) OR \
    (event=imap_command_finished AND user=testuser)
```

### Performance With `source_location`

[[changed,event_filter_source_location_changed]] The result of matching
[[setting,log_debug]] and [[setting,log_core_filter]] against an event is
normally cached, so the filters are matched only once per event regardless of
how many lines the event logs. If either setting contains `source_location`
anywhere (including inside `NOT`), the result can be different for each log
line, so the caching is disabled for all events in the process. The filters
are then matched again for every log call, including every debug log call
that ends up not being logged.

::: warning
Using `source_location` in [[setting,log_debug]] or
[[setting,log_core_filter]] makes every debug log call in every process
several times slower, whether or not it gets logged. The more complex the
filter is, the slower it gets. This can noticeably slow down busy processes,
so use `source_location` only temporarily while debugging, and otherwise
prefer filtering by event name, category or fields.
:::

Metric filters are not affected by this.
