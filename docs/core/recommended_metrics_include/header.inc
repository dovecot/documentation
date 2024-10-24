This page lists recommended metrics that allow inspecting dovecot's behavior in
the most general situations. More specialized situations might require further
refinements or additional statistics. For an overview of how to gather
statistics see [[link,stats]]. A list of all available events and their fields
can be found [[link,summary_events,here]].

The following examples use the custom `log-export` exporter.

```[dovecot.conf]
event_exporter log-export {
  format = json
  format_args = time-rfc3339
  transport = log
}
```
