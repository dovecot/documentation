#### doveadm batch

The `doveadm batch` command was removed.

#### doveadm fs

[[doveadm,fs put]] can now put metadata also.

#### doveadm indexer

Added [[doveadm,indexer]] command.

#### doveadm save

Added `-r received-date` parameter. See [[doveadm,save]].

#### dsync

The `dsync` command symlink was removed. Use [[doveadm,sync]] or
[[doveadm,backup]] commands directly instead.

#### Mailbox Commands

`USER` environment variable can be used only with `--no-userdb-lookup` parameter.

All mail commands require providing `-u`, `-F`, `-A` parameter or `--no-userdb-lookup` parameter.
This will always be subject to user database lookup and requires access to
auth userdb socket, unless `--no-userdb-lookup` was used.
