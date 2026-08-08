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
  event_export_opentelemetry:
    hash: opentelemetry
    text: "Event Export: OpenTelemetry"
  event_export_opentelemetry_logs:
    hash: log-records
    text: "Event Export: OpenTelemetry LogRecords"
  stats_sample_by:
    hash: sampling
    text: "Event Export: Sampling"
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

```doveconf[dovecot.conf]
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
| `json` | JSON output. With the [[setting,event_exporter_driver,opentelemetry]] driver this produces an OTLP/HTTP+JSON `TracesData` payload (proto3 canonical encoding); with all other drivers, the legacy event-envelope JSON shown below. |
| `tab-text` | TAB-separated text fields |
| `protobuf` | OTLP/HTTP+protobuf `TracesData` payload. Only valid with [[setting,event_exporter_driver,opentelemetry]] driver.<br />[[added,settings_event_exporter_opentelemetry_added]] |

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
| `opentelemetry` | Send events as OTLP/HTTP spans to an OpenTelemetry collector at [[setting,event_exporter_opentelemetry_endpoint_url]]. Wire format is selected by [[setting,event_exporter_format]] (`protobuf` or `json`). See [[link,event_export_opentelemetry]].<br />[[added,settings_event_exporter_opentelemetry_added]] |

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

## OpenTelemetry

[[added,settings_event_exporter_opentelemetry_added]]

The `opentelemetry` driver POSTs every emitted event to an OTLP/HTTP
collector (Jaeger v2, Grafana Tempo, the OpenTelemetry Collector, etc.)
as a serialized
[OTLP `TracesData`](https://opentelemetry.io/docs/concepts/signals/traces/)
payload. One Span is emitted per event.

The `opentelemetry` driver requires [[setting,event_exporter_format]]
to be set to one of:

| Format | Wire format | `Content-Type` |
| ------ | ----------- | -------------- |
| `protobuf` | OTLP/HTTP+protobuf (binary `TracesData`) | `application/x-protobuf` |
| `json` | OTLP/HTTP+JSON (proto3 ProtoJSON canonical encoding) | `application/json` |

The `protobuf` format produces a compact binary payload; the `json`
format is easier to inspect with `curl` / `jq` and has no extra build
dependency on the receiving side. Both POST to the same
`<endpoint_url>/v1/traces` path and carry identical trace/span content
(same `trace_id` for the same session, same attributes, etc.); they
differ only in serialization.

Any other format value is rejected at config load time. `protobuf` may
only be paired with this driver.

::: tip
Only OTLP/HTTP is implemented. OTLP/gRPC is **not** supported; point
[[setting,event_exporter_opentelemetry_endpoint_url]] at a collector that
accepts OTLP/HTTP (most collectors expose both endpoints on different
ports — use the HTTP one, typically port `4318`).
:::

Minimal configuration (protobuf):

```doveconf[dovecot.conf]
event_exporter otlp {
  driver = opentelemetry
  format = protobuf
  event_exporter_opentelemetry_endpoint_url = http://collector.example.com:4318
}

metric imap_traces {
  filter = event=*
  exporter = otlp
}
```

To export as JSON instead, set `format = json`:

```doveconf[dovecot.conf]
event_exporter otlp {
  driver = opentelemetry
  format = json
  event_exporter_opentelemetry_endpoint_url = http://collector.example.com:4318
}
```

The driver shares the standard [[link,http_client]] settings; tune the
per-request timeout (default `10s`) and other knobs directly under the
exporter block:

```doveconf[dovecot.conf]
event_exporter otlp {
  driver = opentelemetry
  event_exporter_opentelemetry_endpoint_url = http://collector.example.com:4318
  http_client_request_timeout = 2s
}
```

The JSON output follows the
[OTLP/HTTP+JSON encoding](https://opentelemetry.io/docs/specs/otlp/#json-protobuf-encoding):
`trace_id` / `span_id` are lowercase hex strings (OTLP deviates from
proto3 ProtoJSON here, which would use base64), `int64` values including
`startTimeUnixNano` / `endTimeUnixNano` / `intValue` are JSON strings,
and enums (`SpanKind`, `Status.code`) are name strings (e.g.
`"SPAN_KIND_SERVER"`, `"STATUS_CODE_OK"`).

### Trace correlation

Every span's `trace_id` is `SHA-1(<session-id>)[:16]` where the session
id is taken from the event field named by
[[setting,event_exporter_opentelemetry_trace_id_field]] (default `session`).
This ties all events of one mail session into one trace, deterministic
across restarts.

Each span's `span_id` is deterministically derived from
`SHA-1(<session-id> + <event-name> + <event-create-time>)[:8]`. The
same logical event produces the same `span_id` across re-emissions and
across processes, and (when log records are enabled) lets every
LogRecord reference the Span it belongs to via the shared
`span_id`. See [[link,event_export_opentelemetry_logs]].

Dovecot internally creates sub-sessions of the form `<base>:<rest>`
(per-user mail_storage retry counters, `indexer-worker`,
`doveadm:<guid>`, etc.). Each sub-session is emitted under its own
`trace_id`, and a [Span.Link](https://opentelemetry.io/docs/concepts/signals/traces/#span-links)
back to the parent's trace_id is attached. Collectors render this as a
clickable reference from the child trace to the parent trace.

If the configured trace_id_field is missing from an event, that event
is not exported.

### Span timing

Span `start_time` is the per-event creation timestamp (the moment the
event was created in dovecot, not the parent operation's start), and
`end_time` is when the event was sent. For passthrough events this
gives accurate per-operation timings rather than collapsing every event
to the parent's start time.

### Resource attributes

Each batch carries an OTel
[Resource](https://opentelemetry.io/docs/concepts/resources/) with
`service.name = "Dovecot"`, `service.instance.id` set to the hostname
and `service.version` set to the dovecot version. Sub-system context
(`imap`, `imap-login`, `auth`, `indexer-worker`, …) lands on the span's
InstrumentationScope rather than on `service.name`, so all traces show
up under a single `Dovecot` service in collector UIs.

### Log records

When [[setting,event_exporter_opentelemetry_emit_logs,yes]] is set, the
exporter additionally POSTs an OTLP
[LogRecord](https://opentelemetry.io/docs/specs/otel/logs/data-model/)
to `<endpoint_url>/v1/logs` for every matched event that carries a
formatted log message (i.e. events produced by `e_info()`,
`e_warning()`, `e_error()`, `e_debug()` and friends).

Log records always use the OTLP/HTTP+JSON wire format regardless of
[[setting,event_exporter_format]]; the protobuf encoding is not
emitted for logs.

Each LogRecord carries:

* the same `trace_id` and `span_id` as its corresponding Span, so the
  collector can navigate from a log line to its Span and vice versa,
* a `severityNumber` and `severityText` derived from the dovecot
  log type (DEBUG=5, INFO=9, WARN=13, ERROR=17, FATAL=21, PANIC=24),
* `body.stringValue` with the formatted message text from the
  `e_*()` call site,
* the event's fields and category list as `attributes`, identical to
  what the matching Span carries.

The exporter ships log records only for events whose corresponding
metric's `filter` matches. Use the metric filter to scope log
forwarding to the sessions you want to trace - typically a session
predicate plus a category restriction:

```doveconf[dovecot.conf]
event_exporter otlp_logs {
  driver = opentelemetry
  format = json
  event_exporter_opentelemetry_endpoint_url = http://collector.example.com:4318
  event_exporter_opentelemetry_emit_logs = yes
}

metric traced_session_logs {
  exporter = otlp_logs
  # Pick whichever events should ship as both spans and log records.
  filter = event=imap_command_finished or event=mail_user_session_finished
}
```

Disable [[setting,event_exporter_opentelemetry_emit_spans,no]]
together with `emit_logs = yes` to ship log records only.

When the metric filter does not match an event, no log message is
formatted or transmitted - the wire cost of enabling log records on a
heavy-traffic service is therefore proportional to the matched
volume, not the total event volume.

The corresponding ResourceLogs carries the same `service.name`,
`service.instance.id`, and `service.version` attributes as
ResourceSpans, so collectors group traces and logs under the same
service.

### Sampling

Use [[link,stats_sample_by]] to keep the export volume bounded -
particularly important when shipping all events from a busy mail
server.

## Sampling

[[added,settings_metric_export_sample_by_added]]

When a metric's exporter would emit too many events (for example, every
IMAP command from every session), the
[[setting,metric_export_sample_by]] block selects a deterministic subset
to forward to the exporter.

For each block, Dovecot hashes the configured event field with SHA-1,
folds the digest to a 64-bit integer, and exports the event when
`hash % 1000 < permille`. Because the decision is a pure function of the
field value, every event that shares the same value (e.g. every event
in the same IMAP session, when sampling by `session`) is either
exported in full or dropped in full. This is the property that makes
the resulting export usable for tracing: a sampled session has all of
its events, not a random scattering.

::: tip
Sampling only affects what reaches the [[setting,metric_exporter]].
The metric's in-process counters (`doveadm stats dump`,
OpenMetrics) still count every event.
:::

Multiple [[setting,metric_export_sample_by]] blocks combine with AND
semantics: an event is exported only if every rule passes. This lets a
metric require, say, both a sampled session *and* a sampled user.

If the configured [[setting,metric_export_sample_by_field]] is missing
from the event, the event is dropped from the export.

### Example: sample 10% of IMAP sessions

```doveconf[dovecot.conf]
event_exporter datalake {
  driver = http-post
  http_post_url = https://datalake.example.com/api/endpoint
  format = json
  time_format = rfc3339
}

metric imap_traced {
  exporter = datalake
  filter = event=imap_command_finished

  metric_export_sample_by sess {
    field = session
    permille = 100
  }
}
```

Roughly 10% of distinct session IDs are forwarded to the exporter, and
the same session always produces the same decision across restarts.

## Settings

<SettingsComponent tag="event-export" />

## Example Configs

If one wishes to send the events associated with IMAP commands completion to
a datalake having a HTTP API, one could use config such as:

```doveconf[dovecot.conf]
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

```doveconf[dovecot.conf]
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
