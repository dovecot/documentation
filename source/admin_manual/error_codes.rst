.. _doveadm_error_codes:

Doveadm (Dsync) Error/Exit Codes
================================

Dovecot uses standard libc error codes. These codes are most useful to
determine why dsync mail migration failed.

===== ============== =========================================================
Code  Label          Description
===== ============== =========================================================
0                    *Success*

2                    *Success, but mailbox changed during the sync*. This code
                     can be safely ignored during intermediate migrations (any
                     changes will be captured during a subsequent sync).  For
                     a final migration/cut-over, this error code indicates
                     that the dsync command should be re-run to ensure that
                     all changes made to the original mailbox are reflected in
                     the new mailbox (i.e., a final migration should not be
                     considered successful unless/until dsync returns 0).

64    EX_USAGE       *Incorrect parameters*. Dsync was called with wrong
                     parameters. This should never be seen in production
                     migration usage (absent a bug).

65    EX_DATAERR     *Data error*. Theoretically can happen, but should never
                     happen in real-life usage. If seen, it should be handled
                     as a failed migration, and details should be reported to
                     Dovecot for further investigation.

66    EX_NOINPUT     *Cannot open input*.

67    EX_NOUSER      *User no longer exists in user DB*. Either this user
                     should not be migrated (since they no longer exist) and
                     this user should be removed from the migration list, or
                     there is some issue interacting with the local identity
                     backend, in which case this migration should be treated
                     as a temporary failure (i.e. retry and/or requeue).

68    EX_NOHOST      *Hostname Unknown*. Source or destination hostname is not
                     known/resolvable.

69    EX_UNAVAILABLE *Service Unavailable*.

70    EX_SOFTWARE    *Internal Software Error*.

71    EX_OSERROR     *System Error (e.g., system cannot fork)*. Issue with
                     operating system of host running dsync.

72    EX_OSFILE      *Critical OS File Missing*. Issue with operating system
                     of host running dsync.

73    EX_CANTCREAT   *Cannot create mailbox/message as user is out of quota*.
                     For migrations, this should not occur as new storage
                     quotas should be equal/greater to the existing quota. If
                     this error occurs, would possibly indicate an issue with
                     the sync (i.e. duplicate message). In this case, the
                     migration should be marked as failed and the user flagged
                     for further investigation why the sync was unsuccessful.

74    EX_IOERR       *Input/Output Error*.

75    EX_TEMPFAIL    *Temporary failure*. A temporary error that may be
                     resolved by running the migration again. For migration
                     purposes, if this code is returned dsync should be
                     re-run. There should be some sort of maximum retry value
                     defined; if exceeded, the account should either be marked
                     as "error" or should be placed back in the queue to be
                     attempted to be migrated at a later time.

76    EX_PROTOCOL    *Remote error in protocol*.

77    EX_NOPERM      *Authentication failure*. If authentication to the
                     existing mail backend is via master user authentication,
                     this error should not occur. If it does occur, there is
                     a problem with the configuration (or, less likely, a bug
                     in dsync) and all migrations should be suspended until
                     the problem can be resolved. If authentication to the
                     existing mail backend is via the user's current
                     authentication credentials, this indicates that the
                     credentials are no longer valid. This migration should be
                     marked as either a temporary failure (if the
                     authentication credentials are automatically updated when
                     running the migration) or a permanent failure if there is
                     no ability to obtain the new authentication credentials.
                     Migrations into Dovecot (the new system) should be done
                     via a master user, so this error should not be returned
                     once the system is correctly configured. If this error
                     still occurs and is triggered by a failure to connect to
                     the new platform, all migrations should be suspended
                     until the problem can be resolved. Note: EX_NOPERM error
                     might also happen for other reasons, such as not having
                     write permissions to a folder, but this shouldn't happen
                     with dsync use in migration.

78    EX_CONFIG      *Invalid Settings/Configuration*. This error should not
                     be obtained once the migration system is correctly
                     configured, e.g. after testing the migration system in a
                     staging environment. If this error occurs, all migrations
                     should be suspended until the problem can be resolved.
===== ============== =========================================================

Other Issues:

* Folder renames if the names are invalid or too long.  dsync attempts to fix
  invalid folder names automatically. If the folder name is too long, a new
  generated GUID is given it as the name. A related issue is that if any
  renaming happens, the folder won't be synced incrementally because dsync
  doesn't realize that the folder was renamed (dsync is stateless).
