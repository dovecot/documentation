---
layout: doc
title: Debug
order: 198
dovecotlinks:
  debug: debugging
---

# Debugging and Troubleshooting

::: tip
For reporting issues with Dovecot CE, see https://dovecot.org/bugreport-mail.
:::

## Crashes

Dovecot has been designed to crash rather than continue in a potentially
unsafe manner that could cause data loss. Most crashes usually happen just
once and retrying the operation will succeed, so usually even if you see
them it's not a big problem.

Of course, all crashes are bugs that should eventually be fixed, so feel
free to report them always even if they're not causing any visible problems.

Reporting crashes is usually best accompanied with a gdb backtrace as
described in https://www.dovecot.org/bugreport.html. See
[core dumps](#core-dumps) for further information.

Instead of crashing, there have been some rare bugs in Dovecot when some
process could go into infinite loop, which causes the process to use 100%
CPU.

If you detect such processes, it would be helpful to get a gdb backtrace
of the running process:

```sh
gdb -p pid-of-process
bt full
```

After getting the backtrace, you can `kill -9` the process.

## Process Tracing

If a Dovecot process hangs or is just really slow, the best way to debug it
is to see what it's really doing. Typically you'd be looking into imap or pop3
processes.

### Linux

```sh
strace -tt -o log -p <process pid>
```

### BSDs, OS X <= 10.4

```sh
# enable process tracing
ktrace -f log -p <process pid>
# do whatever makes it break, then stop the process tracing:
ktrace -C
# and see what it's done:
kdump -T -f log
```

### OS X >= 10.5

```sh
dtruss -p <process id>
```

### Solaris

```sh
truss -d -r0 -w1 -o log -p <process pid>
```

`-r0` and `-w1` cause all IMAP input/output to be logged. `-d` adds
timestamps to the log.

## Core Dumps

### dovecot-sysreport

::: tip
This is the recommended way of reporting core dumps to the Dovecot developers.
:::

::: warning
Before posting the output of the script publicly, make sure the exported
configuration doesn't have anything sensitive in it.
:::

Use the [dovecot-sysreport](https://raw.githubusercontent.com/dovecot/core/master/src/util/dovecot-sysreport), which can also be found in the Dovecot
packages:

```sh
dovecot-sysreport --core <binary> <core>
```

#### Debugging Core Dumps in Other Systems

If you have a tar.gz generated from dovecot-sysreport, you can debug it
in any Linux distribution. But you still need to have the Dovecot
debuginfo packages installed globally, which could be a bit tricky.

You need the core dump, the binary that produced it and ALL the shared
libraries on the system. For example:

```sh
binary=/usr/libexec/dovecot/imap
core=/var/core/core.12345
dest=core.tar.gz
(echo "info shared"; sleep 1) |
  gdb $binary $core |
  grep '^0x.*/' | sed 's,^[^/]*,,' |
  xargs tar czf $dest --dereference $binary $core
```

### core-tar.sh

https://dovecot.org/tools/core-tar.sh

Usage: `./core-tar.sh <binary> <core> <dest.tar.gz>`

Debugging on the test server then ideally would have all the debuginfo
packages (for exactly the same binaries). You can run gdb there with:

```sh
mkdir coretest
cd coretest
tar xzf ../core.tar.gz
gdb imap
set solib-absolute-prefix .
core imap.core
bt full
```

## Session IDs

Each `IMAP`, `POP3` and `LMTP` connection has its own unique session ID.

This ID is logged in all the lines and passed between Dovecot services, which
allows tracking it all the way through proxies to backends and their various
processes.

The session IDs look like `<ggPiljkBBAAAAAAAAAAAAAAAAAAAAAAB>`.

## Mail Debugging

Setting [[setting,log_debug]] will make Dovecot log all kinds of things
about mailbox initialization. Note that it won't increase error logging
at all, so if you're having some random problems it's unlikely to provide
any help.

If there are any problems with a mailbox, Dovecot should automatically fix
it. If that doesn't work for any reason, you can manually also request
fixing a mailbox by running [[doveadm,force-resync,-u user@domain INBOX]],
where `INBOX` should be replaced with the folder that is having problems
(or `*` if all folders should be fixed).

Users may sometimes complain that they have lost emails. The problem is
almost always that this was done by one of the user's email clients
accidentally. Especially accidentally configuring a "POP3 client" to a
new device that deletes the mails after downloading them.

For this reason it's very useful to enable the [[plugin,mail-log]] and
enable logging for all the events that may cause mails to be lost. This way
it's always possible to find out from the logs what exactly caused messages
to be deleted.

If you're familiar enough with Dovecot's index files, you can use
[[doveadm,dump]] command to look at their contents in human readable
format and possibly determine if there is something wrong in them.

## Rawlogs

See [[link,rawlog]].

## Authentication Debugging

See [[link,authentication_debug]].

## Developer Debugging

For detailed debugging of Dovecot issues, see [[link,developer_debug]].
