---
layout: doc
title: Export
dovecotlinks:
  event_export: Event Export
  event_export_label:
    hash: filtering-events
    text: Filtering Events
  event_export_formats:
    hash: formats
    text: "Event Export: Formats"
  event_export_drivers:
    hash: drivers
    text: "Event Export: Drivers"
---

# Event Export

::: tip
See Also:
* [[link,summary_events]],
* [[link,event_filter]],
* [[link,stats]], and
* [[link,event_design]].
:::

## Exporter Definition

The [[setting,event_exporter]] named list filter defines how
[[link,summary_events]] should be exported. The basic definition is split into
two orthogonal parts: the format and the driver.

The format and its settings specify *how* an event is serialized, while the
driver and its settings specify *where* the serialized event is sent.

In both cases, the behavior is tweaked via the corresponding arguments
setting.

For example, the following block defines an exporter that uses the `http-post`
driver and `json` format:

```[dovecot.conf]
event_exporter http-localhost {
  driver = http-post
  http_post_url = http://localhost:1234/
  http_client_request_absolute_timeout = 500msec

  format = json
  time_format = rfc3339
}
```

### Formats

The format and its settings specify *how* an event is serialized.

Supported Formats:

| Formats | Description |
| ------- | ----------- |
| `json` | JSON output |
| `tab-text` | TAB-separated text fields |

#### Example: JSON

::: tip NOTE
This example is pretty-printed. The actual exported event omits the
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
event:imap_command_finished	hostname:dovecot-dev	start_time:2019-06-19T10:38:25.422744Z	end_time:2019-06-19T10:38:25.424812Z	category:imap	field:user=jeffpc	field:session=xlBB1KqLz1isGwB+	field:tag=a0005	field:cmd_name=SELECT	field:tagged_reply_state=OK	field:tagged_reply=OK [READ-WRITE] Select completed	field:last_run_time=2019-06-19T10:38:25.422709Z	field:running_usecs=1953	field:lock_wait_usecs=60	field:net_in_bytes=7	field:net_out_bytes=311
```

## Drivers

The driver and its settings specify *where* the serialized event is sent.

Supported drivers:

| Driver | Description |
| ------ | ----------- |
| `drop` | Ignore the serialized event |
| `log` | Send serialized event to syslog |
| `http-post` | Send the serialized event as a HTTP POST payload to [[setting,event_exporter_http_post_url]]. The driver defaults to [[setting,http_client_request_absolute_timeout,250 milliseconds]]. |
| `file` | Send serialized events to a file specified in [[setting,event_exporter_file_path]]<br />[[added,event_export_drivers_file_unix_added]] |
| `unix` | Send serialised events to a unix socket specified in [[setting,event_exporter_unix_path]]. The [[setting,event_exporter_unix_connect_timeout]] setting is used to specify how long the unix socket connection can take. Default is `250 milliseconds`.<br />[[added,event_export_drivers_file_unix_added]] |

The `drop` driver is useful when one wants to disable the event exporter
temporarily.  Note that serialization still occurs, but the resulting
payload is simply freed.

The `log` driver is useful for debugging as typically one is already
looking at the logs.

::: warning
It is possible for the stats process to consume a large amount of
memory buffering the POST requests if the timeout for `http-post` is set
very high, a lot of events are being generated, and the HTTP server is slow.
:::

To reopen the files created by `file` driver, see
[[man,doveadm-stats,reopen]].

## Event Definition

The event definition reuses and extends the `metric` config block used for
statistics gathering. The only additions to the block are the `exporter` and
`exporter_include` settings.

These are only meaningful if the event matches the predicate (categories,
filter, etc.) specified in the metric block.

### Filtering Events

One uses the `metric` block settings documented in [[link,stats]] to select and
filter the event to be exported. See [[setting,metric_exporter]] and
[[setting,metric_exporter_include]] settings.

## Settings

<SettingsComponent tag="event-export" />

## Example Configs

If one wishes to send the events associated with IMAP commands completion to
a datalake having a HTTP API, one could use config such as:

```[dovecot.conf]
event_exporter datalake {
  driver = http-post
  http_post_url = https://datalake.example.com/api/endpoint/somewhere
  http_client_request_absolute_timeout = 1sec

  format = json
  time_format = rfc3339
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
  driver = log

  format = json
  time_format = rfc3339
}

metric imap_commands {
  exporter = log
  filter = event=* AND category=service:imap
}
```
