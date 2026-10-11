[[added,imap_hibernate_nonidle_added]]

[[setting,imap_hibernate_nonidle_timeout]] hibernates connections whose last
command has finished this long ago, even if they are not in IDLE. This helps
with clients that keep the connection open between commands, such as clients
that poll with NOOP or STATUS. Any input from the client moves the connection
back to a new imap process, so the timeout should be longer than the clients'
polling interval.

```doveconf[dovecot.conf]
imap_hibernate_timeout = 5s
imap_hibernate_nonidle_timeout = 5min
```

Things to know about hibernating connections without IDLE:

* New mails and flag changes that happened during the hibernation are sent to
  the client before the reply to its next command.
* If messages were expunged from the selected mailbox during the hibernation,
  the client is disconnected with
  `* BYE IMAP session state is inconsistent, please relogin.` The client's
  next command hasn't started yet when the connection is moved back, so
  EXPUNGE replies can't be sent and the client's message sequence numbers
  can't be kept in sync. The
  [[event,imap_client_unhibernated]] event's `error` field is then
  `IMAP session state is inconsistent: Mailbox <name>: <count> messages expunged during hibernation`,
  which can be used to count how often this happens.
* The connection is not hibernated while there are expunges that the client
  hasn't been told about yet, e.g. after a FETCH command. Hibernation is tried
  again after the next command.
* The connection is not hibernated if the `delay-newmail`
  [[setting,imap_client_workarounds]] is enabled.
* The `imap-hibernate` process disconnects the client after 30 minutes of
  inactivity, the same as the imap process does.
* Connections using NOTIFY are not hibernated.
