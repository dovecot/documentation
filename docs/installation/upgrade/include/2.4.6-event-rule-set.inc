 * The protocol between the stats process and the processes sending events
   to it has changed. Processes started by the previous version can't send
   statistics to the new stats process, so they send none until they exit.
   Restart Dovecot after upgrading, as always.
 * Metrics whose filter doesn't have an explicit `event=""` condition no
   longer receive unnamed events or parent events. Previously a metric filter
   without any event name, e.g. `category=imap`, counted also the parent
   events of the events sent for the other metrics. Use `event=""` to count
   unnamed events (see [[link,event_filter]]).
 * [[setting,process_shutdown_filter]] now also matches debug events that
   aren't logged or sent to stats. Previously it matched them only if
   [[setting,log_debug]] or a metric wanted the event.
