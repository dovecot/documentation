#### Log Messages Are Always Single Line

[[changed,log_message_control_chars_changed]] A log message no longer spans
multiple lines. A line feed or any other ASCII control character, except
TAB, inside the message is now written as `<0xNN>`, e.g. `<0x0A>` for a
line feed. Multi-frame diagnostics such as Lua tracebacks, which were
previously written as several log lines each with its own log prefix, are
now a single log line with `<0x0A>` between the frames. Control characters
inside the log prefix itself (e.g. a username or session ID) are written
the same way.

This is a security hardening: a value that contains a line feed can no
longer produce a complete, correctly prefixed forged log line. Log parsers
that matched the continuation lines of a multi-line message need to be
updated to match the `<0xNN>` sequences within the single line instead.
