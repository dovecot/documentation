---
layout: doc
title: Export
dovecotlinks:
  event_export: Event Export
  event_export_label:
    hash: filtering-events
    text: Filtering Events
  event_export_transports:
    hash: transports
    text: Event Export Transports
---

# Event Export

::: tip See Also
* [[link,summary_events]]
* [[link,event_filter]]
* [[link,stats]]
* [[link,event_design]]
:::

## Exporter Definition

The `event_exporter` block defines how events should be exported.

The basic definition is split into two orthogonal parts: the format and
the transport.

The format and its arguments specify *how* an event is serialized, while the
transport and its arguments specify *where* the serialized event is sent.

In both cases, the behavior is tweaked via the corresponding arguments
setting.

For example, the following block defines an exporter that uses the `foo`
transport and `json` format:

```[dovecot.conf]
event_exporter ABC {
  format = json
  format_args = time-rfc3339
  transport = foo
  transport_args = bar
  transport_timeout = 500msec
}
```

### Formats

The format and its arguments specify *how* an event is serialized.

Since some formats cannot express certain values natively (e.g., JSON does not
have a timestamp data type), the `format_args` setting can be used to
influence the serialization algorithm's output.

Supported Formats:

| Formats | Description |
| ------- | ----------- |
| `json` | JSON output |
| `tab-text` | TAB-separated text fields |

Supported Format Arguments:

| Arguments | Description |
| --------- | ----------- |
| `time-rfc3339` | Serialize timestamps as strings using the [[rfc,3339]] format (YYYY-MM-DDTHH:MM:SS.uuuuuuZ) |
| `time-unix` | Serialize timestamps as a floating point number of seconds since the Unix epoch |

#### Example: JSON

::: tip Note
This example is pretty-printed.  The actual exported event omits the
whitespace between the various tokens.
:::

```json
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
```

#### Example: tab-text

```
event:imap_command_finished        hostname:dovecot-dev    start_time:2019-06-19T10:38:25.422744Z  end_time:2019-06-19T10:38:25.424812Z    category:imap   field:user=jeffpc       field:session=xlBB1KqLz1isGwB+  field:tag=a0005 field:cmd_name=SELECT       field:tagged_reply_state=OK     field:tagged_reply=OK [READ-WRITE] Select completed     field:last_run_time=2019-06-19T10:38:25.422709Z field:running_usecs=1953        field:lock_wait_usecs=60        field:net_in_bytes=7        field:net_out_bytes=311
```

## Transports

The transport and its arguments specify *where* the serialized event is sent.

Supported Transports:

| Transport | Description |
| --------- | ----------- |
| `drop` | Ignore the serialized event |
| `log` | Send serialized event to syslog |
| `http-post` | Send the serialized event as a HTTP POST payload to the URL specified in the `transport_arg` setting with a timeout specified by `transport_timeout`. Default is `250 milliseconds`. |
| `file` | Send serialized events to a file specified in the `transport_arg` setting.<br />[[added,event_export_transports_file_unix_added]] |
| `unix` | Send serialised events to a unix socket specified in the `transport_arg` setting. The `transport_timeout` setting is used to specify how long the unix socket connection can take. Default is `250 milliseconds`.<br />[[added,event_export_transports_file_unix_added]] |

The `drop` transport is useful when one wants to disable the event exporter
temporarily.  Note that serialization still occurs, but the resulting
payload is simply freed.

The `log` transport is useful for debugging as typically one is already
looking at the logs.

::: warning
It is possible for the stats process to consume a large amount of
memory buffering the POST requests if the timeout for `http-post` is set
very high, a lot of events are being generated, and the HTTP server is slow.
:::

To reopen the files created by `file` transport, see
[[man,doveadm-stats,reopen]].

## Event Definition

The event definition reuses and extends the `metric` config block used for
statistics gathering. The only additions to the block are the `exporter` and
`exporter_include` settings.

These are only meaningful if the event matches the predicate (categories,
filter, etc.) specified in the metric block.

### Filtering Events

One uses the `metric` block settings documented in [[link,stats]] to
select and filter the event to be exported.

#### `exporter`

The `exporter` setting identifies which exporter should be used to export this
event.  If the setting is not specified, this event is *not* exported.  (This
is to allow certain metrics to be used only for statistics.)

#### `exporter_include`

There are five possible parts that can be included in a serialized event:

| Part | Description |
| ---- | ----------- |
| `name` | The name of the event |
| `hostname` | The name of the host generating this event |
| `timestamps` | The event start and end timestamps |
| `categories` | A set of categories associated with this event |
| `fields` | The fields associated with this event; the fields that will be exported are defined by the [[link,stats,fields]] setting in the parent `metric` block |

The `exporter_include` setting is made up of these tokens which control what
parts of an event are exported.  It can be set to any set of those
(including empty set) and the order doesn't matter.  It defaults to all 5
tokens.

For example, `exporter_include=name hostname timestamps` includes just the 3
specified parts, while `exporter_include=` includes nothing - the exported
event will be empty (e.g., `{}` in JSON).

## Example Configs

If one wishes to send the events associated with IMAP commands completion to
a datalake having a HTTP API, one could use config such as:

```[dovecot.conf]
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
```

When debugging, it is sometimes useful to dump information to the log.
For example, to output all named events from the IMAP service:

```[dovecot.conf]
event_exporter log {
  format = json
  format_args = time-rfc3339
  transport = log
}

metric imap_commands {
  exporter = log
  filter = event=* AND category=service:imap
}
```
