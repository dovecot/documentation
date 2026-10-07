 * `source_location` in [[setting,log_debug]] and [[setting,log_core_filter]]
   is now matched against each log line's own source location. Previously
   info, warning and error lines of events with a raised minimum log level
   (e.g. auth lines with [[setting,auth_verbose,no]]) were matched against
   an internal source location, and the result matched for one log line was
   reused for the event's later log lines. Because the filter results can't
   be cached anymore when `source_location` is used, every debug log call
   becomes several times slower. Use `source_location` only temporarily
   while debugging. See [[link,event_filter_source_location_performance]].
