[[added,imap_hibernate_nonidle_added]]

[[setting,imap_hibernate_nonidle_timeout]] hibernates connections whose last
command has finished this long ago, even if they are not in IDLE. This helps
with clients that keep the connection open between commands, such as clients
that poll with NOOP or STATUS. Input from the client moves the connection
back to a new imap process, so the timeout should be longer than the clients'
polling interval. Some commands are answered by the `imap-hibernate` process
itself, see [[link,imap_hibernation_commands]].

```doveconf[dovecot.conf]
imap_hibernate_timeout = 5s
imap_hibernate_nonidle_timeout = 5min
```

Things to know about hibernating connections without IDLE:

* New mails and flag changes that happened during the hibernation are sent to
  the client before the reply to its next command.
* [[added,imap_hibernate_ghost_expunges_added]] Messages expunged from the
  selected mailbox during the hibernation are sent as EXPUNGE or VANISHED
  replies by the first command that is allowed to send them (e.g. `NOOP`, but
  not `FETCH`), the same as in a session that was never hibernated. Until
  then the expunged messages keep their sequence numbers, and fetching their
  contents returns `NIL` with `OK [EXPUNGEISSUED]`.
* The client is disconnected with
  `* BYE IMAP session state is inconsistent, please relogin.` if messages were
  expunged during the hibernation and either the transaction log no longer
  reaches back to the start of the hibernation (it was rotated twice), or the
  selected mailbox is a `virtual` or `imapc` mailbox. The
  [[event,imap_client_unhibernated]] event's `error` field is then
  `IMAP session state is inconsistent: Mailbox <name>: Couldn't find expunges since hibernation (...)`
  or
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
