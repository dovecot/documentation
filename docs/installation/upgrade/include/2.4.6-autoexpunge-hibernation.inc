#### Autoexpunge With IMAP Hibernation

Hibernated IMAP sessions that ended without being unhibernated (e.g. the client
dropped the connection) never ran [[setting,mailbox_autoexpunge]]. IMAP-only
users without new mail deliveries were therefore never autoexpunged. Now
autoexpunging is checked before the session is hibernated, both with IDLE and
with [[setting,imap_hibernate_nonidle_timeout]]. The check is rate limited:
it's done again only once the next mail is known to expire, or at the latest
after the smallest [[setting,mailbox_autoexpunge]] value (at most 24 hours).
The autoexpunged mails are counted in the `%{autoexpunged}` variable of
[[setting,imap_logout_format]].

The `dovecot.autoexpunge.lock` file is now created only when some mailbox
actually has mails to expunge, instead of at every IMAP and POP3 logout and
LMTP delivery. Errors creating the lock file are logged only in that case
as well.
