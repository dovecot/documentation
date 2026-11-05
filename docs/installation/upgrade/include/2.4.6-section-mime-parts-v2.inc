#### Changed Storage Formats

These changes don't take effect until [[setting,dovecot_storage_version]] is
changed to `2.4.6`.

Two cache fields were added to `dovecot.index.cache`, see [[link,mail_cache]]:
`mime.parts.v2` replaces `mime.parts` and additionally describes
`message/global` parts, and `imap.bodystructure.utf8` holds the
`BODYSTRUCTURE` of messages containing `message/global` parts in the form
sent to sessions that have enabled `UTF8=ACCEPT` or `IMAP4rev2`.
[[doveadm,dump]] shows `mime.parts.v2` like `mime.parts`.

Below the configured version the legacy fields are written exactly as before.
Once the version is raised, new parses write `mime.parts.v2` instead of
`mime.parts`, existing `mime.parts` entries keep being used, and the next cache
purge drops them from mails that also have `mime.parts.v2`. Dovecot versions
older than v2.4.6 don't know the new fields and parse such mails again, so
this setting should be increased only once a rollback to an older version is
no longer possible.
