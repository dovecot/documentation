---
layout: doc
title: Optimization
---

# Dovecot Optimizations

## TZ (timezone) Environment Variable

The use of the TZ environment variable can dramatically reduce the number
of system calls and kernel context switches performed by the application.

The `localtime()` function in glibc checks whether the `TZ` environment
variable is set. If it is not set, then glibc will use the `stat()` system
call every time `localtime()` is called, even with vDSO in place.

Setting the `TZ` environment variable to `:/etc/localtime` (or some other
timezone file of your choice) for a process will save glibc from making those
extra unnecessary system calls (Notice the column `:` prefix before the file
path).

The variable can be set either from the shell:

```sh
export TZ=:/etc/localtime
```

or directly from inside the Dovecot configuration file:

```
import_environment = $import_environment TZ=:/etc/localtime
```

Note that a reload is not sufficient for the change to take effect. A restart
is required.

::: tip
See Also:
* [GNU man page for the TZ environment variable](https://www.gnu.org/software/libc/manual/html_node/TZ-Variable.html), and
* [Article explaining in detail the issue](https://blog.packagecloud.io/set-environment-variable-save-thousands-of-system-calls/).
:::

## Disk I/O

Usually heavily loaded IMAP and POP3 servers don't use much CPU, but
they use all the disk I/O they can get. So reducing disk I/O is probably
the most useful optimization you can do.

- See [[link,mbox]] for mbox-specific optimizations.

- See [[link,maildir]] for Maildir-specific optimizations.

- See [[link,dbox]] for Dovecot's own
  high-performance mailbox format. It usually gives much better performance
  than mbox/Maildir.

- See [[plugin,fts]] for optimizing IMAP SEARCH command.

- See [[link,pop3]] for POP3 optimizations, especially 
  [[setting,pop3_no_flag_updates,yes]].

- [[setting,mailbox_list_index,yes]] can help a lot by replying to IMAP STATUS
  (and similar) lookups from a single index without having to open each
  mailbox index separately. This is the default.

  - Also [[setting,mailbox_list_index_very_dirty_syncs,yes]] makes Dovecot
    assume that the list index is up-to-date.

- [[setting,mail_prefetch_count]] setting may be helpful with some mailbox
  formats.

- [[setting,mail_volatile_path,/tmp/dovecot-volatile/%2.256Nu/%u]] moves, e.g.,
  lock files to the volatile directory. This is helpful especially if the
  [[link,mail_location,mail location settings]] otherwise point to a remote
  filesystem like NFS.

- If the [[plugin,acl]] is used, but only global ACLs are needed, set
  [[setting,acl_globals_only,yes]].

## CPU Usage

- See [[link,login_processes]] for optimizing CPU usage caused by logins.

- See [[setting,auth_cache_size]] setting for caching passdb and userdb
  lookups.

  - To distribute password hash calculations to multiple CPU cores (via
    auth-worker processes), set
    [[setting,auth_cache_verify_password_with_worker,yes]].

- Services having [[link,service_client_limit]] &gt; 1 and
  [[link,service_process_limit]] &gt; 1, set [[link,service_process_min_avail]]
  to the number of CPU cores.

- To reduce forks by reusing existing processes for new requests, increase
  [[link,service_service_count]] from 1 to higher (e.g. 100)
  for imap and pop3 services. It's better not to set it too high or
  unlimited (0), because different users use different amounts of
  memory, and it's wasteful when a lot of processes end up having a lot
  of "free" memory.

## Memory Usage

There aren't many settings which affect Dovecot's memory usage. In
general Dovecot uses as much memory as it needs, which is usually quite
little.

- [[setting,auth_cache_size]] controls maximum memory size for caching
  passdb/userdb lookups

- [[link,login_processes_high_performance]] for login processes

- [[setting,imap_hibernate_timeout]]` controls when to move IDLEing IMAP
  connections to wait for changes in a shared imap-hibernate process.
  This frees up the imap process.

Note that these settings do NOT directly affect the memory usage:

- [[link,service_vsz_limit]]: These are simply safe guards against
  potential memory leaks. If the process's virtual size reaches the
  limit, the process is killed by the kernel.

- [[link,service_process_limit]] and [[link,service_client_limit]]: These
  are mostly to avoid DoS attacks using up all your memory.

## Operating Systems

::: warning
Dovecot is developed for Linux.

Although Dovecot may work on other OS platforms, the main developer focus (and
the focus of this page) is exclusively Linux.
:::

The default Linux configurations are usually quite good. The only things needed
to check are:

* `/proc/sys/fs/inotify/max_user_watches` and `max_user_instances` need to
  be large enough to handle all the IDLEing IMAP processes.

  ```
  fs.inotify.max_user_instances = 65535
  fs.inotify.max_user_watches = 65535
  ```

* In order to reduce I/O on the backends, it is recommended to disable the
  ext4 journal:

  ```sh
  tune2fs -O ^has_journal /dev/vdb
  e2fsck -f /dev/vdb
  ```

* Dovecot doesn't require atimes, so you can mount the filesystem with noatime:

  ```sh
  mount -o defaults,discard,noatime /dev/vdb /storage
  ```

* All the servers' hostnames must be unique. This is relied on in many
  different places.
* Make sure the servers are running ntpd or some other method of synchronizing
  clocks. The clocks shouldn't differ more than 1 second.

  The time must never go backwards - this is especially important in Dovecot
  backends when using Cassandra, because otherwise `DELETEs` or `UPDATEs` may
  be ignored when the query timestamp is older than the previous
  `INSERT/UPDATE`.

* With busy servers Dovecot might run out of TCP ports. It may be useful to
  increase `net.ipv4.ip_local_port_range`.

  ```
  net.ipv4.ip_local_port_range = 1024 65500
  ```

## TIME-WAIT Connections

* `net.ipv4.tcp_tw_reuse=1` can help to avoid "Cannot assign requested
  address" errors for outgoing connections and is rather safe to set. It
  only affects outgoing connections.

See: https://vincent.bernat.ch/en/blog/2014-tcp-time-wait-state-linux

### NOT Recommended

Adjusting TCP buffer sizes is also usually a bad idea, unless your kernel
is very old and you have good knowledge of the types of TCP traffic (number
of connections, bandwidth consumed, activity patterns etc) you will have.
