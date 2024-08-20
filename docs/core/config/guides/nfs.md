---
layout: doc
title: NFS
dovecotlinks:
  nfs: NFS
---

# NFS

Dovecot is commonly used with NFS. However, Dovecot does **not** support
accessing the same user simultaneously by different servers. That will
result in more or less severe mailbox corruption. Note that this applies
to all mailbox access, including mail delivery.

* Users must be assigned to specific backends (i.e. in the proxy's passdb
  lookups).
* Use [[link,lmtp]] for mail deliveries.
* Set [[setting,mmap_disable,yes]]
* Set [[setting,mail_fsync,always]]
* Do **not** set [[setting,mail_nfs_index]] or [[setting,mail_nfs_storage]]
  (i.e. keep them as `no`)
* Do **not** use the `quota-status` service.
* Unmounted NFS mount point directory should not be writable to Dovecot
  mail processes (i.e. often the `vmail` user). Otherwise if the NFS
  isn't mounted for some reason and user access mails, a new empty user
  mail directory is created, which breaks things.

## NFS Mount Options

* `actimeo`: This or the more specific settings can be used to control NFS
  caching. Increasing this can reduce NFS traffic. It should be at least
  60 seconds (`actimeo=60`).

* `nordirplus`: Disable readdirplus operations, which aren't needed by
  Dovecot. They can also slow down some NFS servers.

* `noatime`: Disable updating atime. Dovecot doesn't need this and it may
  slow down NFS servers.

* `root_squash`: Dovecot doesn't care about this. Typically Dovecot doesn't
  store any root-owned files in NFS.

* `nolock` / `local_lock=all`: This is possible to use as a slightly
  unsafe optimization. All file locking is handled only locally instead of via
  NFS server.

  Assuming users are never accessed simultaneously by multiple backends, there
  is no need to use locking across NFS. Each user only locks their own
  files, and the user should only be accessed by a single server at a time.

  In some rare situations the same user can become accessed by multiple
  servers simultaneously. In those situations the mails
  are more likely to become corrupted if `nolock` is used. However, if
  indexes and emails are on different mountpoints, email corruption shouldn't
  be possible if the `nolock` is enabled only for the index mountpoint.
  This can still increase the likelihood of index corruption (which can lose
  message flags), but locking won't prevent index corruption completely anyway.

## Optimizations

Potential optimizations to use:

* mdbox format is likely more efficient to use than the sdbox format. The
  downside is that it requires running periodic [[doveadm,purge]] for each
  user. Theses commands should be run via a doveadm proxy so they are run
  in the proper backends.
* Use [[setting,mail_volatile_path,/dev/shm/dovecot/%2.256Nu/%u]] to store some
  temporary files (e.g. lock files) in tmpfs rather than NFS.
* Use [[setting,mailbox_list_index_prefix,/fast/%2.256Nu/%u]] to use "smaller
  fast storage" for index files and "larger slow storage" for mail files. Also
  use [[setting,mailbox_list_iter_from_index_dir,yes]] to list mailboxes via
  the fast index storage rather than the slow mail storage.
* Use [[setting,mailbox_list_iter_from_index_dir,/slow/%2.256Nu/%u]] to use
  "smaller fast storage" for new mails and "larger slow storage" for old
  mails. The [[doveadm,altmove]] command needs to be run periodically. Also use
  [[setting,mail_alt_check,no]] to disable a sanity check to make sure alt
  storage path doesn't unexpectedly change.
* See the NFS mount options above.

## Clock Synchronization

Run ntpd in the NFS server and all the NFS clients to make sure their
clocks are synchronized. If the clocks are more than one second apart
from each others and multiple computers access the same mailbox
simultaneously, you may get errors.
