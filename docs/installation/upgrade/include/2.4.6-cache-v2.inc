The `dovecot.index.cache` file has a new v2 format. The file is now only
appended to, and it can be read without the `dovecot.index` file. All the data
that previously was overwritten in the cache file, such as the caching
decisions and the counters of deleted records, is now stored in the
`dovecot.index` file instead. The cache records now contain the mail's IMAP UID
and a checksum.

This makes the cache file more resilient:

 * If the `dovecot.index` file no longer matches the cache file, for example
   because it was deleted or restored from a backup, the cache offsets in the
   index are rebuilt from the cache file instead of deleting the cache file.
   This is logged as a warning `Rebuilt cache offsets to index: ...`. See the
   [[event,mail_cache_rebuild_finished]] event.
 * Partially written data at the end of the cache file is detected and removed
   by purging the file before anything more is written to it.
 * A broken cache record no longer causes the whole cache file to be deleted.
   The broken record and the mail's older records are ignored, but the mail's
   newer valid records are still used. The cache file is purged later to remove
   the broken record. This is logged as an error
   `Ignoring corrupted cache record at offset ...`, or
   `Dropping corrupted cache record at offset ...` if the broken record is
   found while purging. See the [[event,mail_cache_record_corrupted]] event.

Existing cache files keep their current format until they are purged, and
purging writes the new file in the v2 format. The files are purged for the
usual reasons, for example after enough mails have been expunged, so the
existing files are converted gradually. [[doveadm,mailbox cache purge]] can be
used to convert them immediately.

Older Dovecot versions don't understand the v2 format. They log an error
`Deleting corrupted cache: Unsupported major version (2)` and delete the cache
files, which makes accessing the mails slower until the cache is filled again.
Increase [[setting,dovecot_storage_version]] only after all the servers have
been upgraded and a rollback to an older version is no longer needed.

Lowering [[setting,dovecot_storage_version]] doesn't convert the existing v2
cache files back to v1. They keep the v2 format until they are purged. To avoid
losing the cache files when downgrading:

1. Lower the setting and reload Dovecot. The processes started after the
   reload write v1 cache files, but the old processes keep using the old
   setting and can still create new v2 cache files. With the default
   [[setting,shutdown_clients,yes]] the old processes are sent SIGTERM 35
   seconds after the reload and SIGKILL 35 seconds after that, so wait a bit
   over a minute. Otherwise wait until the old processes have exited, or end
   the user sessions with [[doveadm,kick]]. It doesn't end for example the
   `lmtp` processes.
2. Purge the cache files of all the mailboxes, for example:

   ```bash
   doveadm -f tab mailbox list -A | tail -n +2 |
     while IFS=$'\t' read -r user mailbox; do
       doveadm mailbox cache purge -u "$user" "$mailbox"
     done
   ```

3. Start the older Dovecot version.
