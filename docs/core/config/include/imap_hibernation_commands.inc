[[added,imap_hibernate_commands_added]]

The `imap-hibernate` process answers some commands itself, so that a new imap
process doesn't need to be created for them. This helps especially with
clients that stop and restart IDLE periodically, e.g. sending DONE, NOOP and
IDLE every 29 minutes.

| Command | When answered by `imap-hibernate` |
| ------- | --------------------------------- |
| `DONE` | [[setting,imap_hibernate_nonidle_timeout]] is set. The connection then stays hibernated without IDLE. Without the setting only when followed by `IDLE` or `LOGOUT` in the same input. |
| `IDLE` | No mailbox change has been noticed since the hibernation. |
| `NOOP` | No mailbox change has been noticed since the hibernation. |
| `CHECK` | A mailbox is selected and no mailbox change has been noticed since the hibernation. |
| `LOGOUT` | Always, unless IDLE is running. |

All other commands, and these commands when the conditions don't hold, move
the connection back to a new imap process. If the same input contains both
commands that can be answered and commands that can't, the answered commands'
replies are sent first by the new imap process. While IDLE is running, `DONE`
is answered only if all the following commands in the same input can also be
answered. Otherwise the new imap process finishes the IDLE, so it can still
send pending EXPUNGEs before it.

Things to know:

* A mailbox change is noticed using the same inotify watches that wake up a
  hibernated IDLE. Any change in the mailbox's index files counts, even if it
  wouldn't be visible to the client. Changes that are not noticed by inotify
  (e.g. changes done by another server on shared storage) are not noticed
  either, so `NOOP` doesn't show them. This is the same limitation that
  hibernated IDLE has.
* Connections hibernated by [[setting,imap_hibernate_nonidle_timeout]] while a
  mailbox is selected have no inotify watches, so their `NOOP`, `CHECK` and
  `IDLE` always move the connection back to an imap process.
* After `DONE` has been answered by `imap-hibernate`, the connection is
  hibernated without IDLE, so messages expunged before the client's next
  command cause the relogin described in
  [[link,imap_hibernation_nonidle]]. This is why `DONE` is answered only
  when [[setting,imap_hibernate_nonidle_timeout]] is set.
* `LOGOUT` answered by `imap-hibernate` doesn't run the
  [[setting,mailbox_autoexpunge]] check that the imap process does at logout.
  The check was already done before the connection was hibernated.
* The [[event,imap_command_finished]] event is sent also by `imap-hibernate`
  for the commands it finishes. It has the `imap-hibernate` category, so it can
  be used to count how many commands were answered without an imap process.
