#### IMAP Hibernation Uses the Notifier Service

A connection hibernated in IDLE is now woken up by notifications that the
Dovecot processes send to the new `notifier` service, instead of by inotify
watches that `imap-hibernate` holds for each hibernated connection. So the
hibernated connections no longer use up the inotify instances. See
[[link,imap_hibernation_notifier]].

 * The `notifier` service is started on every installation with the default
   [[setting,mailbox_change_notify]]`=yes`, and each change visible to IMAP
   clients writes a notification to its FIFO, also when IMAP hibernation
   isn't used.
 * Mails written into the mailbox by something else than Dovecot (e.g. another
   MDA writing directly into a Maildir) no longer wake up hibernated
   connections.
 * Processes that can't open the notifier FIFO send no notifications: for
   example `dovecot-lda` run as the mail user, and services configured to run
   as a non-root user. Their changes wake up hibernated connections only after
   the FIFO is made writable for them.
 * Changes that aren't visible to the client (e.g. cache file updates) no
   longer wake up hibernated connections.
 * The `imap` and `imap-hibernate` processes must be the same version. With
   different versions the connection isn't hibernated.
 * Unchanged FIFO listeners are no longer recreated at reload.
 * [[setting,mailbox_change_notify]]`=no` restores the previous behavior,
   except for the FIFO listeners.
