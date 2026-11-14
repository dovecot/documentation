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
| `json` | JSON output. With the [[setting,event_exporter_driver,opentelemetry]] driver this produces OTLP/HTTP+JSON `TracesData` (and `LogsData`) payloads (proto3 canonical encoding); with all other drivers, the event JSON shown below. |
| `tab-text` | TAB-separated text fields |
| `protobuf` | OTLP/HTTP+protobuf `TracesData` (and `LogsData`) payloads. Only valid with [[setting,event_exporter_driver,opentelemetry]] driver.<br />[[added,settings_event_exporter_opentelemetry_added]] |

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
| `opentelemetry` | Send spans, and optionally log records, as OTLP/HTTP to an OpenTelemetry collector at [[setting,event_exporter_opentelemetry_url]]. Wire format is selected by [[setting,event_exporter_format]] (`protobuf` or `json`). See [[link,event_export_opentelemetry]].<br />[[added,settings_event_exporter_opentelemetry_added]] |

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

The `opentelemetry` driver sends spans to an OTLP/HTTP collector (Jaeger v2,
Grafana Tempo, the OpenTelemetry Collector, etc.) as serialized
[OTLP `TracesData`](https://opentelemetry.io/docs/concepts/signals/traces/)
payloads. Spans are queued and sent in batches, see
[Batching](#batching).

The `opentelemetry` driver requires [[setting,event_exporter_format]]
to be set to one of:

| Format | Wire format | `Content-Type` |
| ------ | ----------- | -------------- |
| `protobuf` | OTLP/HTTP+protobuf (binary `TracesData`) | `application/x-protobuf` |
| `json` | OTLP/HTTP+JSON (proto3 ProtoJSON canonical encoding) | `application/json` |

The `protobuf` format produces a compact binary payload; the `json`
format is easier to inspect with `curl` / `jq`. Both POST to the same
`<url>/v1/traces` path and carry identical trace/span content; they
differ only in serialization.

Any other format value is rejected at config load time. `protobuf` may
only be paired with this driver.

::: tip
Only OTLP/HTTP is implemented. OTLP/gRPC is **not** supported; point
[[setting,event_exporter_opentelemetry_url]] at a collector that
accepts OTLP/HTTP (most collectors expose both endpoints on different
ports — use the HTTP one, typically port `4318`).

The driver is available only when Dovecot is built with `libprotobuf-c`
support.
:::

Minimal configuration (protobuf):

```doveconf[dovecot.conf]
event_exporter otlp {
  driver = opentelemetry
  format = protobuf
  event_exporter_opentelemetry_url = http://collector.example.com:4318
}

metric traces {
  filter = event=*
  exporter = otlp
}
```

To export as JSON instead, set `format = json`.

The driver accepts the standard `http_client_*` settings (for example
[[setting,http_client_request_timeout]]) directly under the exporter block. The exporter overrides some defaults:

| Setting | Exporter default |
| ------- | ---------------- |
| [[setting,http_client_request_timeout]] | `2s` |
| [[setting,http_client_request_absolute_timeout]] | `5s` |
| [[setting,http_client_trace_context]] | `no` |

[[setting,http_client_request_absolute_timeout]] must not be `0`; the
configuration is rejected otherwise.

```doveconf[dovecot.conf]
event_exporter otlp {
  driver = opentelemetry
  format = json
  event_exporter_opentelemetry_url = http://collector.example.com:4318
  http_client_request_timeout = 1s
}
```

The JSON output follows the
[OTLP/HTTP+JSON encoding](https://opentelemetry.io/docs/specs/otlp/#json-protobuf-encoding):
`trace_id` / `span_id` are lowercase hex strings (OTLP deviates from
proto3 ProtoJSON here, which would use base64), `int64` values including
`startTimeUnixNano` / `endTimeUnixNano` / `intValue` are JSON strings,
and enums (`SpanKind`, `Status.code`) are name strings (e.g.
`"SPAN_KIND_SERVER"`, `"STATUS_CODE_ERROR"`).

### Spans

Spans are produced per *span owner*, not per event. A span owner is an
object that has a lifetime, and each owner is one span, which is sent when
the owner ends:

| Span name | Owner | Span kind |
| --------- | ----- | --------- |
| `login_client` | Client connection in a login process | `SERVER` |
| `imap_client` | IMAP client session | `SERVER` |
| `pop3_client` | POP3 client session | `SERVER` |
| `submission_client` | Submission client session | `SERVER` |
| `lmtp_client` | LMTP client connection | `SERVER` |
| `imap_command` | IMAP command | `INTERNAL` |
| `auth_request` | Authentication request in the auth process | `SERVER` |
| `auth_client_request` | Authentication request made by a service | `CLIENT` |
| `smtp_server_transaction` | SMTP/LMTP server transaction | `INTERNAL` |
| `doveadm_command` | doveadm command | `INTERNAL` for the CLI, otherwise `SERVER` |

Other events that match the metric's filter become child spans of the
span they happened in. They have the kind `INTERNAL`, are named after the
event and have a random span id.

While an IMAP command runs, events of the session that have no span of their
own and were created after the command started are children of the
`imap_command` span, for example `mail_opened`. Events created earlier, such as
`mail_expunged` and `mail_user_session_finished`, stay children of the
`imap_client` span.

The span of an owner is named after the owner's span name (for example
`imap_command` or `auth_request`). The name of the event that ended the
owner (for example `imap_command_finished`) is the name of the span's
`Span.Event`.

If a process disconnects unexpectedly before an owner ends, the span is sent
when the connection to the stats process is closed, with the attribute
`dovecot.span.truncated = true` and the closing time as its end time.

The span status is `ERROR` if the event has an `error` field (the field
value becomes the status message), if an IMAP command was replied to with
`BAD` (the status message is the tagged reply text), or if a POP3 reply was
`-ERR`. An IMAP `NO` reply is a normal protocol result and leaves the
status `UNSET`, as does everything else.

Event fields and the category list are sent as span `attributes`, subject to
[[setting,metric_exporter_include]] and [[setting,metric_fields]]. Fields whose
name begins with `_` are not sent, see [Reserved fields](#reserved-fields).

#### Span timing

The span `start_time` is the creation time of the event that owns the span. For
an IMAP command this is when its first data arrives, not when the full line is
received. Other exported events start at their own creation time, except events
that only extend another event (for example `mail_user_session_finished` and
the auth and SMTP `*_finished` events), which start at the creation time of the
event they extend.

The span `end_time` is the time the event that ends the span was sent (for
example `imap_command_finished`). An owner with no such event ends when its
last reference is released, or when the stats connection closes for truncated
spans.

#### Which spans are exported

An owner span is exported only if at least one record under it was exported
by the same exporter: an event of the owner itself, or of a span nested
inside it in the same process. With a filter such as

```doveconf[dovecot.conf]
metric imap_commands {
  filter = event=imap_command_finished
  exporter = otlp
}
```

the `imap_command` and `imap_client` spans are emitted, but the
`login_client` span of the login process is not, because no event of that
process matched. The collector then shows the trace with a missing parent.

For complete traces use `filter = event=*`, or include the events of the
session level (login, authentication and client sessions) in the filter.
Combine it with [[link,stats_sample_by]] to keep the volume bounded.

### Trace correlation

Every session gets a random `trace_id`, and every span owner a random
`span_id`. The ids are not derived from the session id. The id of the trace
is created by the first Dovecot process that handles the connection
(normally a login process, or `doveadm` for its own commands) and is passed
on, with the span id of the sender as the parent of the receiving span:

* login process to the IMAP/POP3/submission process: in the login
  request, together with the id of the `login_client` span as the parent.
* services to the auth process: the `trace_id` and `parent_span_id`
  fields of the auth protocol request. Userdb lookups carry them as well.
* proxying between Dovecot servers: IMAP `ID` `trace-id` / `parent-span-id`,
  or `XCLIENT` `TRACE-ID` / `PARENT-SPAN-ID`. The values are accepted only
  from [[setting,login_trusted_networks]]. See [[link,forwarding_parameters]].
* HTTP: the W3C `traceparent` header. It is sent when
  [[setting,http_client_trace_context,yes]] is set, and accepted by HTTP
  servers (such as the doveadm HTTP API) from
  [[setting,http_server_trace_context_trusted_networks]].

The parent span id sent to the auth process and in the `traceparent` header
follows the same rule: a lookup or request made while an IMAP command runs
(for example the home userdb lookup for a shared namespace) is a child of the
`imap_command` span.

This ties the events of one mail session, and the work it causes in other
processes, into one trace.

### Resource attributes

Each batch carries an OTel
[Resource](https://opentelemetry.io/docs/concepts/resources/) with
`service.name = "Dovecot"`, `service.version` set to the Dovecot version,
`service.instance.id` set to a random version 4 UUID, one per exporter
(a new one after a configuration reload), and `host.name` set to the
hostname. Sub-system context (`imap`, `imap-login`, `auth`, `indexer-worker`,
…) lands on the span's InstrumentationScope rather than on `service.name`, so
all traces show up under a single `Dovecot` service in collector UIs.

### Batching

Spans and log records are queued and sent in batches, one HTTP request per
batch, rather than one request per event. A batch is sent when it has
[[setting,event_exporter_opentelemetry_flush_count]] records, and at the latest
[[setting,event_exporter_opentelemetry_flush_interval]] after its first record
was queued. Spans and log records are queued separately.

Spans and log records share the
[[setting,event_exporter_opentelemetry_max_pending_requests]] export requests
that can be waiting for the collector. While that many are pending, a further
batch is dropped and an error is logged with the endpoint and the number of
dropped records, e.g.
`Too many pending requests for http://collector.example.com:4318/v1/traces, dropped 512 records`.

### Log records

When [[setting,event_exporter_opentelemetry_emit_logs,yes]] is set, the
exporter additionally sends an OTLP
[LogRecord](https://opentelemetry.io/docs/specs/otel/logs/data-model/)
to `<url>/v1/logs` for every matched event that carries a
formatted log message (i.e. events produced by `e_info()`,
`e_warning()`, `e_error()`, `e_debug()` and friends).

Log records use the wire format selected by
[[setting,event_exporter_format]]: `protobuf` or `json`, as for spans.
They are batched like spans.

Each LogRecord carries:

* the `trace_id` of the trace it belongs to, and the `span_id` of the span
  that was exported for the same event, so the collector can navigate from a
  log line to its span and vice versa. With
  [[setting,event_exporter_opentelemetry_emit_spans,no]] the `span_id` is
  that of the span the event happened in. Events outside of any span carry
  no `span_id`,
* a `severityNumber` and `severityText` derived from the dovecot
  log type (DEBUG=5, INFO=9, WARN=13, ERROR=17, FATAL=21;
  PANIC is sent as FATAL4=24),
* `body.stringValue` with the formatted message text from the
  `e_*()` call site,
* the event's fields and category list as `attributes`, identical to
  what the matching span carries.

The exporter ships log records only for events whose corresponding
metric's `filter` matches. Use the metric filter to scope log
forwarding to the sessions you want to trace - typically a session
predicate plus a category restriction:

```doveconf[dovecot.conf]
event_exporter otlp_logs {
  driver = opentelemetry
  format = json
  event_exporter_opentelemetry_url = http://collector.example.com:4318
  event_exporter_opentelemetry_emit_logs = yes
}

metric traced_session_logs {
  exporter = otlp_logs
  # Pick whichever events should ship as both spans and log records.
  filter = event=imap_command_finished
}
```

Only events logged with `e_*()` have a log record. `imap_command_finished`
is a debug-level record.

Disable [[setting,event_exporter_opentelemetry_emit_spans,no]]
together with `emit_logs = yes` to ship log records only.

When the metric filter does not match an event, no log message is
formatted or transmitted - the wire cost of enabling log records on a
heavy-traffic service is therefore proportional to the matched
volume, not the total event volume.

The corresponding ResourceLogs carries the same `service.name`,
`service.instance.id`, `service.version` and `host.name` attributes as
ResourceSpans, so collectors group traces and logs under the same
service.

### Reserved fields

Event fields whose name begins with `_` are reserved for the stats
process's internal use. `_log_message` and `_log_severity` carry the log
message and severity to the exporter. These fields are not exported by the
`json` and `tab-text` formats or as OpenTelemetry attributes, unless they are
named explicitly in [[setting,metric_fields]].

### Sampling traces

Sample by `trace_id` to keep or drop whole traces, see
[[link,stats_sample_by]].

## Sampling

[[added,settings_metric_export_sample_by_added]]

When a metric's exporter would emit too many events (for example, every
IMAP command from every session), the
[[setting,metric_export_sample_by]] block selects a deterministic subset
to forward to the exporter.

For each block, Dovecot hashes the configured event field with SHA-1,
folds the digest to a 64-bit integer, and exports the event when
`hash % 100000 < percent * 1000`. Because the decision is a pure function of
the field value, every event that shares the same value (e.g. every event
in the same IMAP session, when sampling by `session`) is either
exported in full or dropped in full. This is the property that makes
the resulting export usable for tracing: a sampled session has all of
its events, not a random scattering.

The field `trace_id` always uses the trace id of the event; an event field named
`trace_id` is not looked up. Sampling by `trace_id` keeps every event of a
trace together, including events of other systems sharing the trace id (a
`traceparent` header from a trusted network, or IMAP `ID` / `XCLIENT` from a
trusted proxy). It also keeps a `doveadm` command whole: the command's own
events have no `session` field, so sampling by `session` drops them.

::: tip
Sampling only affects what reaches the [[setting,metric_exporter]].
The metric's in-process counters (`doveadm stats dump`,
OpenMetrics) still count every event.
:::

Multiple [[setting,metric_export_sample_by]] blocks combine with AND
semantics: an event is exported only if every rule passes. This lets a
metric require, say, both a sampled session *and* a sampled user.

An event without the configured [[setting,metric_export_sample_by_field]], or
for `trace_id` without a trace id, is dropped from the export.

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
    percent = 10
  }
}
```

Roughly 10% of distinct session IDs are forwarded to the exporter, and
the same session always produces the same decision across restarts.

### Example: sample 1% of traces

```doveconf[dovecot.conf]
metric traces {
  exporter = datalake
  filter = event=*

  metric_export_sample_by traces {
    field = trace_id
    percent = 1
  }
}
```

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
