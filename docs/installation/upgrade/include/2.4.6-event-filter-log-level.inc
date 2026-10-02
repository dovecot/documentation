#### Event Filter Log Levels

Event filters have a new `log_level` key for matching the log level, e.g.
`log_level=debug` or `log_level>=warning`. See [[link,event_filter_log_level]].

The old way of matching log levels as if they were categories
(`category=debug`, `category=info`, `category=warning`, `category=error`,
`category=fatal` and `category=panic`) is deprecated. It still works, but a
warning is logged for it in [[setting,log_debug]], [[setting,log_core_filter]],
[[setting,process_shutdown_filter]] and `metric { filter }` settings. Replace
it with `log_level=<level>`. Note that the new syntax can't be used until all
servers using the configuration have been upgraded. Also processes still
running the old version don't send events to a `metric { filter }` that uses
`log_level` until they are restarted.

[[setting,log_debug]] and [[setting,log_core_filter]] are now matched against
the actual log level of each logged message. Previously they were always
matched as `debug` level. This changes the behavior only for filters that
contain a log level check in processes that hide some log levels by default:
auth processes and login processes' auth logging hide `info` level messages
unless [[setting,auth_verbose]] is enabled. For example:

| Setting | Old behavior | New behavior |
| ------- | ------------ | ------------ |
| `log_debug = category=debug AND category=auth` | Auth debug and hidden info messages are logged | Only auth debug messages are logged |
| `log_debug = log_level=info AND category=auth` | Not supported | Only the hidden auth info messages are logged |
| `log_debug = category=auth` | Auth debug and hidden info messages are logged | No change |

`metric { filter }` settings no longer affect logging. Previously a metric
filter matching auth events (e.g. `category=auth`) caused also the hidden
auth `info` messages to be logged.
