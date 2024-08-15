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
---

# Event Filtering

Dovecot's event support includes the ability to narrow down which events are
processed by filtering them based on the administrator-supplied predicate.

Individual events can be identified either by their name or source code
location. The source location of course can change between Dovecot
versions, so it should be avoided.

::: tip See Also
* [[link,summary_events]]
* [[link,event_export]]
* [[link,stats]]
* [[link,event_design]]
:::

## Matching

Regardless of the syntax used, matching is performed the same way:

* Event names are compared using a case-sensitive wildcard match.  The
  wildcards supported are `?` and `*`.

  * If wildcard characters are needed as literal characters, they can be
    escaped with the `\` character, e.g. `\*`.

* Event location is compared in two parts: the file name is compared
  case-sensitively, and the line number is compared as an integer.  For a
  match to occur, the filename must match *and* the line number must either
  match or be unspecified.
* Event categories are compared using a "has a" relationship.  A category in
  the filter must be present in the event for a match to occur.  Any other
  categories on the event do not influence the match.
* Event fields are compared using a case-insensitive wildcard match.  The
  wildcards supported are `?` and `*`.

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

### Examples

For example, to match events with the event name `abc`, one would use one of
the following expressions.  Note that white space is not significant between
tokens, and therefore the following are all equivalent:

```
event=abc
event="abc"
event = abc
event = "abc"
```

A more complicated example:

```
event=abc OR (event=def AND (category=imap OR category=lmtp) AND \
    NOT category=debug AND NOT (net_in_bytes<1024 OR net_out_bytes<1024))
```

A complicated example using size matching:

```
(category=debug AND NOT (net_in_bytes<1KB OR net_out_bytes<1KB)) OR \
    (event=abc AND (message_size>1gb and message_size<1tB)) OR \
    (event=def AND (duration<1mins))
```

## Metric Filter Syntax

Events can be filtered inside the `metric` blocks (see [[link,stats]])
based on the event name, source location, the categories present, and field
values.

The `filter` metric key is set to the desired common filter language
expression. For example:

```
metric example_http_metric {
  filter = event=http_request_finished AND \
      source_location=http-client.c:123 AND category=storage AND \
      category=imap AND user=testuser* AND status_code=200
}
```

## Global Filter Syntax

Settings such as [[setting,log_debug]] use the common filtering language.
For example:

```
log_debug = (event=http_request_finished AND category=imap) OR \
    (event=imap_command_finished AND user=testuser)
```
