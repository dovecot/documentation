[[added,mailbox_change_notify_added]]

A connection hibernated in IDLE is woken up when its mailbox changes. With
[[setting,mailbox_change_notify]] enabled (the default), each Dovecot process
that changes a mailbox sends a notification about it to the `notifier`
service. `imap-hibernate` registers a watch to the notifier for the mailbox of
each hibernated IDLE connection, and the notifier forwards the matching
notifications to it. The hibernated connections don't need any inotify
watches.

Only the changes that are visible to IMAP clients are notified: new and
expunged mails, flag and keyword changes, and deleting the mailbox. Updates to
the mailbox's cache file don't wake up the connections.

The `notifier` service has two listeners:

| Listener | Used by |
| -------- | ------- |
| `fifo_listener notifier` | All the processes that change mailboxes (e.g. `imap`, `pop3`, `lmtp`, `doveadm`, `dovecot-lda`) write the notifications to this FIFO. |
| `unix_listener notifier-watch` | `imap-hibernate` registers the watches and receives the notifications. |

A notifier service must have `process_limit = 1`, because the FIFO keeps the
notifications ordered and intact only with a single reader.

Mailbox formats whose changes don't all go through Dovecot's index files
(imapc, pop3c, virtual) can't be hibernated in IDLE.

#### FIFO Permissions

The FIFO is created with mode `0660`, owned by `root` and
[[setting,default_internal_group]]. The processes that start as root (`imap`,
`pop3`, `lmtp`, `doveadm` server) open it before they drop privileges, so they
can write to it with any mail UID.

A process that can't open the FIFO sends no notifications. A hibernated
connection then sees its changes only when something else changes the
mailbox, or when the client sends a command. This applies to:

* `dovecot-lda` and `doveadm` run as the mail user.
* Services configured to run as a non-root user.
* A process that has already dropped its root privileges and changes a
  mailbox whose notifications go to another notifier shard (see below), for
  example a shared mailbox or an LMTP delivery to multiple recipients.

For these, make the FIFO writable for the mail user:

```doveconf[dovecot.conf]
service notifier {
  fifo_listener notifier {
    user = vmail
  }
}
```

Don't make the FIFO writable for everyone: writing waits when the FIFO is full,
so any local user could slow down the mailbox changes of all users.

Mails written into the mailbox by something else than Dovecot (e.g. another
MDA writing directly into a Maildir) don't wake up the hibernated connections.

Changes to the `fifo_listener` settings require a restart. At reload the FIFO
is kept only when its settings are unchanged, and the running processes keep
writing to the FIFO they opened.

#### Notifier Restarts and Reloads

* At reload the new notifier takes over from the old one, and `imap-hibernate`
  moves its watches to it without waking up the connections.
* If the notifier dies, `imap-hibernate` registers its watches again, and then
  wakes up the hibernated IDLE connections, because their mailbox may have
  changed in the meantime. The connections are woken up gradually, 20 per
  second in each `imap-hibernate` process.
* If the notifier stops reading the FIFO and it becomes full, a process
  writing to it waits for at most 5 seconds. It then logs an error and doesn't
  send notifications for the next 10 seconds.

#### Sharding

One notifier process handles all the notifications written to its FIFO. If it
becomes a bottleneck, the notifier can be sharded by username with
configuration only. Each shard is a separate notifier service with its own
FIFO and socket, and the paths are chosen with a hash of the mailbox owner's
username. Both path settings must use the same expression:

```doveconf[dovecot.conf]
mailbox_change_notify_fifo_path = notifier-%{user | sha256 % 2}
mailbox_change_notify_socket_path = notifier-watch-%{user | sha256 % 2}

service notifier-0 {
  executable = notifier
  user = $SET:default_internal_user
  process_limit = 1
  idle_kill_interval = infinite
  fifo_listener notifier-0 {
    path = notifier-0
    mode = 0660
    group = $SET:default_internal_group
  }
  unix_listener notifier-watch-0 {
    path = notifier-watch-0
    mode = 0600
    user = $SET:default_internal_user
  }
}

service notifier-1 {
  executable = notifier
  user = $SET:default_internal_user
  process_limit = 1
  idle_kill_interval = infinite
  fifo_listener notifier-1 {
    path = notifier-1
    mode = 0660
    group = $SET:default_internal_group
  }
  unix_listener notifier-watch-1 {
    path = notifier-watch-1
    mode = 0600
    user = $SET:default_internal_user
  }
}
```

The default `notifier` service can stay as it is, it's then just unused.
