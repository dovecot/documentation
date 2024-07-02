---
layout: doc
title: Errors
dovecotlinks:
  troubleshooting: Dovecot troubleshooting
---

# Dovecot Errors and Troubleshooting

## Client Issues

::: warning
This section may contain old information.

If you do find client(s) that need special configuration, or no longer
need it, please let us know.
:::

It seems to be quite difficult to implement a working IMAP client.
[Best Practices for Implementing an IMAP Client](http://www.imapwiki.org/ClientImplementation)
tries to help with it.

### Negative UIDs

`Invalid messageset: 1181461470:-1181461446.`

IMAP uses unsigned 32bit integers for unique message identifiers.
Unfortunately a lot of IMAP clients use 32bit signed integers, which
means that if the UIDs go higher than 2147483647, they'll wrap to
negative integers. This causes errors such as above.

However normally the UIDs should never go that high, so it's possible to
avoid this problem.

Earlier Dovecot versions had bugs which could cause `X-UID:` headers in
incoming messages to grow the UIDs too high. Some spam messages
especially contained these intentionally broken `X-UID:` headers.

With newer Dovecot versions these broken `X-UID:` headers aren't
practically ever used. It happens only if the mail has a valid
`X-IMAPbase`: header, `X-UID:` header, and the mail is written to an empty
mbox file. Note that this can happen only to new mboxes, because expunging
all messages in a mailbox causes Dovecot to create a metadata message at
the beginning of the mbox file.

In any case it's still a good idea to filter out `X-UID:` and other
metadata headers in your MDA. [[link,lda]] does this internally.
See [[link,mbox_header_filter]].

#### Fixing

Fixing is done by letting Dovecot update UIDVALIDITY value and recreate
the UIDs beginning from one. This means that client's local cache will
be invalidated and the client will be required to download all the
messages again.

##### mbox

Delete Dovecot's index files (eg. `.imap/INBOX/`) and `X-IMAP:` and
`X-IMAPbase:` headers from the mbox file.

##### Maildir

This should really never be a problem with Maildir. If however you have
managed to cause it somehow (by receiving 2 billion mails?), you can
recreate the UIDs by deleting `dovecot-uidlist` file.

### Specific Clients

If not listed in this section, there are no known issues.

#### Apple Mail.app

On Mac OS X Leopard 10.5 Mail.app appears to support
subscribe/unsubscribe by right clicking on a mailbox, selecting 'Get
Account Info' and selecting 'Subscription List' from tabs. This however
doesn't really work with any IMAP server.

Apple Mail 3.6 (that comes with OS X 10.5 Leopard) supports
subscribing/unsubscribing to folders in the public namespace.

#### Outlook

- You should enable [[setting,pop3_client_workarounds,outlook-no-nuls]]
  workaround with POP3.

- If some Outlook users don't see new or sent mails in the appropriate
  folders after a migration from UW IMAPd even if they are visible in
  other clients (e.g. Roundcube, Thunderbird, or on the disk itself),
  and you get the error message "BAD Error in IMAP command UID: Invalid
  UID messageset" in the log or rawlog: It helps to remove the
  problematic IMAP account completely from Outlook and recreating it
  again there. It speaks a different IMAP afterwards, so there are
  reasons to believe it caches the details of some server on the first
  connect and doesn't refresh them even if you change the server's
  hostname in the account settings.

#### Thunderbird

- If you're using [[link,mbox]], [[link,dbox]], or [[link,maildir]] with
  `:LAYOUT=fs` you should enable
  [[setting,imap_client_workarounds,tb-extra-mailbox-sep]] workaround for IMAP.
  ([Bug report](https://bugzilla.mozilla.org/show_bug.cgi?id=29926))

- If you're using [[link,mbox]], and if you are not using a technique to
  allow folders that contain both sub-folders and messages (see
  [[link,mbox_child_folders]]) then you will have to disable "Server
  supports folders that contain sub-folders and messages" setting from
  Thunderbird.
  ([Enhancement request](https://bugzilla.mozilla.org/show_bug.cgi?id=284933))

-  Thunderbird may display incorrect new mail counts in the New Mail
   notification box. This is due to a bug in Thunderbird's handling of the
   CONDSTORE extension. See
   [Bug Report](https://bugzilla.mozilla.org/show_bug.cgi?id=885220) for
   details and a client-side workaround.

## Time Moved Backwards Error

Dovecot isn't very forgiving if your system's time moves backwards.
There are usually two possibilities why it's moving backwards:

1. You're running `ntpdate` periodically. This isn't a good idea.

2. You're using some kind of a virtual server and you haven't configured
   it right (or it's buggy).

Moving time backwards might cause various problems (see below).

### Time Synchronization

There are two choices for synchronizing your clock:

1. Use [ntpd](https://www.ntp.org/). It periodically checks the
   current time from NTP server and slows down or speeds up the clock if
   necessary. Unlike ntpdate, it doesn't just move the time forwards or
   backwards (unless the difference is large).

   - If the time difference is too large for ntpd and it "steps", then
     use "-x" as a command line option for ntpd or use "tinker step 0"
     in `/etc/ntp.conf`.

     - This shows up in logs as: `ntpd[17697]: time reset -2.075483 s`

2. If ntpd doesn't work well (e.g. a bad network connection), you can
   use [clockspeed](https://cr.yp.to/clockspeed.html) or
   [chrony](https://chrony.tuxfamily.org/) as well.

In some systems ntpd/ntpdate is run at boot, but only after Dovecot has
started. That can cause Dovecot to die immediately. If you have this
problem, fix your init scripts to run ntpd/ntpdate first, before
starting Dovecot. Also, seriously consider running ntp-wait before
starting Dovecot.

### What about Daylight Saving/Summer Time?

On Unix-like systems, time is stored internally as the number of seconds
since January 1, 1970, 00:00:00 UTC
(see [UNIX time](https://en.wikipedia.org/wiki/Unix_time)); concepts
such as time zones and daylight saving time are applied in user space by the C
library, and will normally not have an impact on Dovecot's behavior.

### Dovecot Shouldn't Just Die!

Dovecot's behavior when time moves backwards is:

- Existing imap and pop3 processes either sleep or die

- Master process stops creating new processes until either the original
  time is reached, or after a maximum wait of 3 minutes.

- Other processes log a warning, but do nothing else.

- Timeouts are updated so that the timeout is executed approximately at
  the original intended time.

Dovecot also notices when time unexpectedly jumps forwards. In that
situation it logs a warning and also updates timeouts.

The reason why imap/pop3 processes get killed and new ones can't be
created for a while is to avoid problems related to timestamps. Some
issues are:

- Uniqueness of Maildir filenames and dbox global unique identifiers
  relies on a growing timestamp.

- Dotlock files' staleness is detected by looking at its mtime.

- Timestamps are stored internally all around in memory (as well as in
  index files) and compared to current time. Those checks may or may
  not be buggy if current time shrinks.

While killing mail processes doesn't fully solve any of those issues,
they're at least less likely to happen then.

## CentOS/RHEL8 Mail Location

When installing dovecot on CentOS8 or RHEL8, you might experience problems
with writing into mail location.

This is due to several restrictions that need to be disabled.

### SystemD restrictions

The packages distributed with CentOS8 come with restrictive systemd unit
files. These restrictions are good from security perspective, yet the errors
do not guide into the correct changes.

If you see log messages such as:

`dovecot: imap(test): Namespace '': mkdir(/home/mail/domain/test/Maildir) failed: Permission denied (euid=1005(vmail) egid=1005(vmail) missing +w perm: /home/mail/domain, UNIX perms appear ok (ACL/MAC wrong?))`

You need to use `systemctl edit dovecot` to add following stanza

```
[Service]
ReadWritePaths=/home/mail
```

And run `systemctl daemon-reload`.

### SELinux

You can check `/var/log/audit/audit.log` for message such as:

`type=AVC msg=audit(1586604621.637:6736): avc:  denied  { write } for pid=12750 comm="imap" name="Maildir" dev="dm-3" ino=438370738 scontext=system_u:system_r:dovecot_t:s0 tcontext=unconfined_u:object_r:etc_runtime_t:s0 tclass=dir permissive=0 type=SYSCALL msg=audit(1586604621.637:6736): arch=c000003e syscall=83 success=no exit=-13 a0=55b493a7f338 a1=1ed a2=ffffffff a3=fffffffffffffcd8  items=0 ppid=12735 pid=12750 auid=4294967295 uid=1005 gid=1005 euid=1005 suid=1005 fsuid=1005 egid=1005 sgid=1005 fsgid=1005 tty=(none) ses=4294967295 comm="imap" exe="/usr/libexec/dovecot/imap"subj=system_u:system_r:dovecot_t:s0 key=(null)`

If you see this, you need to relabel your mail location to `mail_home_rw_t`.

```console
$ chcon -R -t mail_home_rw_t /home/mail
```

To make this change permanent, you need to add new fcontext rule:

```console
$ semanage fcontext --add --type mail_home_rw_t --range s0 '/home/mail(/.*)?'
```

After this, Dovecot should be able to write into your mail location again.

## dovecot.index.cache is Too Large

### Problem 1

`Error: Corrupted index cache file .../dovecot.index.cache: Cache file too large`

The problem in these cases is that the user has a folder with a large number of
messages. The only solution for now is to delete the `dovecot.index.cache` for
that folder. Since v2.3.11 this is done automatically.

The cache files generally are useful to reduce disk IO by being able to read
commonly accessed data from the cache instead of opening the individual emails.
However, usually these kind of huge folders are some kind of system accounts
which just gather a lot of mails which are periodically deleted. In these
cases the cache file usually isn't very useful.

### Problem 2

Alternatively you can encounter:

`Fatal: master: service(imap): child ... returned error 83 (Out of memory (service imap { vsz_limit=1024 MB }, you may need to increase it))`

and:

`Error: mmap(size=...) failed with file .../dovecot.index.cache: Cannot allocate memory`

These usually happen because the `dovecot.index.cache` file is so large
that it can't fit into the memory.

The solution is usually to either raise the imap service's `vsz_limit` or
`default_vsz_limit` to somewhat higher than the maximum cache file size
(1 GB by default). For example to `1500M`.

An alternative solution to this is to reduce the maximum cache file size to
be somewhat lower than the imap service's vsz_limit. See
[[setting,mail_cache_max_size]].

## UNIX Socket Resource Temporarily Unavailable

Commonly visible as:

`imap-login: Error: net_connect_unix(imap) failed: Resource temporarily unavailable`

This means that there are more imap-login processes trying to connect to
the "imap" UNIX socket than there are imap processes accepting the
connections. The kernel's connection listener queue got full and it
started rejecting further connections. So what can be done about it?

### Wrong Service Settings

This can happen if `service imap { client_limit }` is set to anything
else than 1. IMAP (and POP3 and other mail) processes do disk IO, lock
waiting and such, so if all the available imap processes are stuck
waiting on something, they can't accept new connections and they queue
up in the kernel. For mail processes only `client_limit=1` is recommended.

It can also happen if `service imap { process_limit }` is reached.
Dovecot logs a warning if process_limit or client_limit is reached.

### Out of File Descriptors

If the "ulimit -n" is too low, kernel stops notifying the process about
incoming connections. Make sure that the limit is at least as high as
the client_limit. Dovecot also internally checks this, and if it's too
low it writes a warning to stderr at startup and to log.

Note that Dovecot is not using "dovecot" user's or PAM's limits in
general. Make sure the limits are correct with:
`cat /proc/`pidof dovecot`/limits`.

### Master Process Busy

Dovecot master process forks all of the new processes. If it's using
100% CPU, it doesn't have time to fork enough new processes. Even if
it's not constantly using 100% CPU there may be fork bursts where it
temporarily gets too busy. The solution is to make it do less work by
forking less processes:

- Most importantly switch to [[link,login_processes_high_performance]].
  This alone might be enough.

- You can also switch (most of the) other commonly forked processes to
  be reused. For example `service imap { service_count = 100 }`
  reuses the imap process for 100 different IMAP connections before it
  dies. This is useful mainly for imap, pop3 and managesieve services.
  It's better to avoid using `service_count=0` (unlimited) in case
  there are memory leaks.

- You can pre-fork some idling processes to handle bursts with
  `service { process_min_avail }`.

See [[link,service_configuration]] before changing any service
settings. Some services require specific values to work correctly.

### Listener Queue Size

Dovecot uses `service { client_limit } * service { process_limit }` as the
listener queue size. There is no upper limit in Dovecot.

Most OSes use an even lower limit, typically `128`. In Linux you can
increase this through: `/proc/sys/net/core/somaxconn`.

## Change Group Operation Not Permitted

`imap(user): Error: chown(/home/user/mail/.imap/INBOX, group=12(mail)) failed: Operation not permitted (egid=1000(user), group based on /var/mail/user - see https://doc.dovecot.org/admin_manual/errors/chgrp_no_perm/)`

This means that Dovecot tried to copy `/var/mail/user` file's group (mail) to
the index file directory it was creating (`/home/user/mail/.imap/INBOX`), but
the process didn't belong to the mail group, so it failed. This is important
for preserving access permissions with [[link,shared_mailboxes]]. Group copying
is done only when it actually changes the access permissions; for example with
0600 or 0666 mode the group doesn't matter at all, but with 0660 or 0640 it
does.

To solve this problem you can do only one of two things:

1. If the group doesn't actually matter, change the permissions so that
   the group isn't copied (e.g. `chmod 0600 /var/mail/\*`, see [[link,mbox]]).

2. Give the mail process access to the group (e.g.,
   [[setting,mail_access_groups,mail]]). However, this is dangerous.
   [It allows users with shell access to read other users' INBOXes](https://dovecot.org/list/dovecot-news/2008-March/000060.html).
