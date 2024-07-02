---
layout: doc
title: Formats Overview
dovecotlinks:
  mailbox_formats: mailbox formats
---

# Mailbox Formats

Mailbox formats control the way that mail data is stored.

## Available Formats

Mailbox formats supported by Dovecot:

### mbox

See [[link,mbox]].

Traditional UNIX mailbox format.

Users' INBOX mailboxes are commonly stored in `/var/spool/mail` or
`/var/mail` directory. Single file contains multiple messages.

### Maildir

See [[link,maildir]].

One file contains one message. A reliable choice since files are never
modified and all operations are atomic. The top-level Maildir
directory contains the `Maildir/cur`, `Maildir/new`, and
`Maildir/tmp` subdirectories.

### dbox

See [[link,dbox]].

Dovecot's own high performance mailbox format. Messages are stored in
one or more files, each containing one or more messages.

There are two flavors of dbox:

* `sdbox`: "single-dbox" - one message per file
* `mdbox`: "multi-dbox" - multiple messages per file

### imapc

See [[link,imapc]].

Use remote IMAP server as mail storage.

### pop3c

See [[link,pop3c]].

Use remote POP3 server as mail storage.

## Configuration

See [[link,mail_location]] for configuration information.

## Physical Storage

The mailbox formats define how Dovecot stores mail data, but it does not
address where that data will physically live - that is a decision for the
administrator to make.

There are two general categories of storage: local and shared.

### Local Storage

#### Filesystems

* See [[link,maildir]] for Maildir-specific filesystem optimizations
* Dovecot doesn't rely on atime updates, so you can mount the filesystem with
  `noatime`

#### Index Files

Keeping index files on a different disk than the mail spool gives you better
performance. The indexes have a lot of write activity so it is recommended to
use RAID-10 instead of RAID-5 for them.

#### Fsyncing

By default, Dovecot calls `fsync()` and `fdatasync()` whenever it's
useful to prevent potential data loss. The main reason for this is so that
Dovecot won't lie that the message was saved to the disk, if in fact a power
failure a second later would lose the message. With IMAP clients this is
perhaps a less serious problem, because the lost message was most likely
either a mail in Draft mailbox or a message in "Sent Messages" mailbox; in
other words, a message that the user had already seen. However if
[[link,lda]] or [[link,lmtp]] loses a message, the user never even knew
that the message existed, unless the sender decides to resend it.

Since power failures and kernel panics are quite rare, many people are
tempted to disable fsyncing because it may increase the performance quite a
lot. Dovecot allows this by setting [[setting,mail_fsync,never]].

However, this is dangerous, especially with IMAP, LDA, and LMTP. If you do
want to set to `never`, you should only explicitly do this for services
that you are comfortable with data loss. Example:

```
# Default
mail_fsync = optimized

protocol pop3 {
  # Enable fsyncing for POP3
  mail_fsync = never
}
```

## Shared Storage

The recommended storage solution for large installations that require
high-availability and scalable performance is object storage.

[[link,dovecot_pro]] provides the obox mailbox format to efficiently
interact with object storage systems.

Dovecot allows keeping mails and index files in clustered filesystems.
Dovecot does not specifically support any specific clustered solution - it
is the responsibility of the admin to perform functional and load
testing to guarantee the storage solution provides adequate performance.

Dovecot also supports keeping mails and index files on NFS. Everything
described in this page applies to NFS as well, but see [[link,nfs]] for
additional NFS-specific problems and optimizations.

Dovecot CE only supports mailbox access on a single server: a user can only be
accessed by a single Dovecot server at a time.

### Memory Mapping

By default, Dovecot `mmap()s` the index files. This may not work with all
clustered filesystems, and it most certainly won't work with NFS.

Setting [[setting,mmap_disable,yes]] disables `mmap()` and Dovecot does its own
internal caching. If `mmap()` is supported by your filesystem, it's still
not certain that it gives better performance. Try benchmarking to make sure.

### Locking

Dovecot supports locking index files with fcntl (default), flock or dotlocks.
Some clustered filesystems may not support fcntl, so you can change it to use
flock instead. Fcntl locks may also cause problems with some NFS
configurations, in which case you can try if switching to dotlocks helps.
Note that dotlocks are the slowest locking method.

You can change the locking method from [[setting,lock_method]] setting.
Regardless of the `lock_method` setting, Dovecot always uses dotlocks for
some locks.

### Clock Synchronization

Run ntpd on each node to make sure clocks are synchronized. If the clocks are
more than one second apart from each others and multiple computers access the
same mailbox simultaneously, you may get errors from Dovecot.

### Caching

Your cluster will probably perform better if users are usually redirected to
the same server. This is because the mailbox may already be cached in the
memory and it may also reduce the traffic between the clusterfs nodes.

At the very least, make sure that your load balancer redirects connections
from the same IP address to the same server, if possible.

### FUSE / GlusterFS

FUSE caches dentries and file attributes internally. If you're using multiple
GlusterFS clients to access the same mailboxes, you're going to have
problems. Worst of these problems can be avoided by using NFS cache flushes,
which just happen to work with FUSE as well:

```
mail_nfs_index = yes
mail_nfs_storage = yes
```

These probably don't work perfectly.

### Samba / CIFS

Dovecot's temporary files may include a colon character `:` in their
filename, which is not a permitted character when using CIFS.

Dovecot also renames the temporary files whilst holding a lock in them, which
generates the error "Text file is busy".

In short, CIFS/smbfs is unlikely to work as a remote filesystem.
