 * If [[setting,imap_id_retain]] is enabled on the proxies, upgrade them
   before the backends. An older proxy forwards the `trace-id` and
   `parent-span-id` fields of a client's `ID` command to the backend inside
   its own trusted `ID` command, and the backend uses them as the session's
   trace context.
