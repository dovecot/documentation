---
layout: doc
title: Debugging
order: 304
dovecotlinks:
  developer_debug: Developer Debugging
  debug_clients:
    hash: client-traffic-sniffing
    text: Debugging Clients
  debug_core_dumps:
    hash: core-dumps
    text: Core Dumps
  debug_hangs:
    hash: hangs
    text: Debugging Hangs
---

# Debugging Tips

## Core Dumps

Whenever Dovecot crashes, you see something like this in log file:

```
dovecot: Apr 23 11:16:05 Error: child 86116 (imap) killed with signal 11
```

No matter how that happened, it’s a bug and will be fixed if you can provide
enough information on how it happened.

### Generating Core Dumps

The best way to debug is to get a backtrace from gdb, but the problem is that
Dovecot doesn’t dump core files by default. You can solve this in a few ways:

#### systemd-coredump

Install [systemd-coredump](https://www.freedesktop.org/software/systemd/man/systemd-coredump.html)
if possible. It has proven to be good at capturing core dumps for Dovecot.

#### `core dumps disabled`

Run `ulimit -c unlimited` before starting Dovecot.

If you start Dovecot using some script, note that they often override the
limit, so you might have to override. Example:

```console
echo ‘DAEMON_COREFILE_LIMIT=”unlimited”‘ >> /etc/sysconfig/dovecot
```

#### `core not dumped`

##### Write Permissions

The process dumping the core needs to be able to write to the core dump
directory.

Check where the core file should be written to and make sure it has enough
write permissions.

If core doesn’t contain an absolute path, it’s relative to the process’s
current directory. With imap/pop3 processes this means that the core is
written to the user’s home directory. Make sure home is returned by
[[link,userdb]] by setting [[setting,mail_debug,yes]] and checking from the
logs that the correct home directory is returned.

###### Linux

You can specify where core gets written:

```console
echo "/var/core/core.%e.%p" > /proc/sys/kernel/core_pattern
```

The crashing process needs to have write permissions for it:

```console
chmod 1777 /var/core
```

You need to allow core dumps in systemd as well. Run
`systemctl edit dovecot` and add:

```
[Service]
LimitCORE=infinity
```

###### FreeBSD
You can specify core location with `kern.corefile` sysctl.

##### Chrooted Process

chrooted processes like imap-login will try to write the core inside the
chroot, even when `core_pattern` is an absolute path.

##### Setuid Process

For some services you may be able to tell Dovecot to drop privileges before
execv(), making the process non-setuid.

See [[setting,service_drop_priv_before_exec]].

###### Linux

Dovecot usually tells the kernel to dump the core anyway. Modern Linux
systems require running this to enable:

```console
sysctl -w fs.suid_dumpable=2
```

###### FreeBSD

```console
sysctl kern.sugid_coredump=1
```

##### Core File Already Exists

If there already exists a core file with the same name, it’s not overwritten.

##### Out of Disk Space

If core files are written to their own filesystem, you may not notice if it
runs out of disk space.

##### Core is Too Large

If `ulimit -c` wasn't set to `unlimited`, maybe the core size limit was
reached?

#### `core dumped`

Core file was successfully written!

### Direct GDB Debugging

You can run, e.g., imap binary directly with gdb and talk IMAP protocol to it.

```
# gdb --args /usr/local/libexec/dovecot/imap -u user@domain

...

(gdb) r
Starting program: /usr/local/libexec/dovecot/imap
* PREAUTH [CAPABILITY IMAP4rev1 SORT THREAD=REFERENCES MULTIAPPEND UNSELECT
LITERAL+ IDLE CHILDREN LISTEXT LIST-SUBSCRIBED] Logged in as user
```

Then start typing IMAP commands, e.g.,
`x select inbox, x fetch 1:* (flags envelope bodystructure), x fetch 1 body.peek[]`.

When the program crashes, execute `bt full` command in gdb to debug.

## Hangs

Check for a few seconds what system calls the process is doing.
See [[link,debug_process_tracing]].

GDB backtrace can also be highly helpful, especially if process tracing
doesn't show anything happening. Then it means Dovecot is in some infinite
loop.

You can get the backtrace by attaching GDB into the existing process:

```
gdb -p pid-of-hanging-process

..

(gdb) bt full
#0 cmd_select (client=0x808d800) at cmd-select.c:87
#1 0x0804d36a in client_handle_input (client=0x808d800) at client.c:306
#2 0x0804d439 in _client_input (context=0x808d800) at client.c:342

..

(gdb) quit
```

## Client Traffic Sniffing

If a problem happens only with a specific client, the best way to figure out
what’s happening is to find out what it's actually talking to server.

Some clients may provide logging on their own, or you can use some TCP
traffic sniffer such as Wireshark or ngrep.

You can also use Dovecot’s [[link,rawlog]] to log the traffic. (It works
with TLS/SSL.)

### Debugging Core Dumps

You need the core dump, the binary that produced it, and ALL the shared
libraries on the system.

::: tip
If using `dovecot-sysreport`, all of this should be done for you.
:::

::: details Manual collection

```sh
#!/bin/sh

binary=/usr/libexec/dovecot/imap
core=/var/core/core.12345
dest=core.tar.gz
(echo "info shared"; sleep 1) |
  gdb $binary $core |
  grep '^0x.*/' | sed 's,^[^/]*,,' |
  xargs tar czf $dest --dereference $binary $core
```

:::

#### Scripting gdb

When you have multiple core dumps, it's troublesome to manually obtain
the backtraces for all of them.

Here's a script that takes a number of dovecot-sysreport-\*.tar.gz
files as parameters and creates dovecot-sysreport-\*.tar.bt output
files for them:

::: details

```bash
#!/bin/bash -e

for fname in $*; do
  mkdir tmp-gdb
  cd tmp-gdb
  tar xzf ../$fname
  core_path=$(find . -name '*core*')
  # FIXME: handles only libexec files - should also support doveadm at least
  binary_name=$(file $core_path \| grep "dovecot/" \| sed "s/^.*from 'dovecot\/\([^']*\).*$/\1/")
  cat <<EOF | gdb usr/libexec/dovecot/$binary_name > ../$fname.bt
set pagination off
set solib-absolute-prefix .
core $core_path
bt full
quit
EOF
  cd ..
  rm -rf tmp-gdb
done
```

:::

## Debug Pre-auth IMAP with libexec/dovecot/imap

The imap executable can be started in IMAP PREAUTH mode. This
circumvents login and authorization and lets you connect to the
imap process directly, without having to go through the imap-login
process.

Start imap in PREAUTH with one of:

```sh
/usr/libexec/dovecot/imap -u <username>
src/imap/imap -u <username>
doveadm exec imap -u <username>
```

This also works for pop3 and managesieve. lmtp can also be started from
command line without the -u parameter (because the recipient is given
with RCPT TO command).

## Debug Pre-auth IMAP with a Real Client

1. Run the following script:

   ```sh
   rm -f /tmp/f && mkfifo /tmp/f && \
   cat /tmp/f | ./imap -u testuser | nc -l 127.0.0.1 143 > /tmp/f
   ```

2. Connect to port 143 with the imap client of your choice.

3. Attach with gdb to the running imap process, if you so wish.
   This can also be used together with imaptest, if you define
   imaptest to use only one username. Some configurations or use
   cases might require dovecot to be running (e.g. for
   authentication). In those cases, select a different port for
   "nc" or change dovecot not to listen on 143.

## Debug Most Dovecot Executables Inside the Source Tree

To avoid having to make install dovecot before running an executable in
gdb or valgrind, use libtool. For example:

```sh
libtool e gdb --args src/imap/imap
```

Maybe add a helpful alias to your `.bashrc` or similar:

```bash
alias lgdb='libtool --mode=execute gdb'
```

## Debug Dovecot Master

```
GDB=1 gdb --args dovecot -F
```

Start with `-F` = foreground mode.

If you've compiled --with-devel-checks, GDB=1 environment needs to be
set so it doesn't fail when it detects extra "leaked" file descriptors.

## Standalone Non-Root Debugging Environments

Dovecot can be instructed to run the imap handler as a non-root user,
and therefore that binary can be debugged by that same non-root user. At
the moment, only manual (telnet) interaction is possible. This setup is
documented in [[link,rootless]].

## Disabling Optimizations

gdb can be difficult if code is compiled with optimizations (-O2).
Printing variables may fail and stepping over code can jump confusingly
all over the place. The easiest way to avoid this is to just disable
optimizations either for Dovecot entirely or just some files:

- Globally: `EXTRA_CFLAGS=-O0 ./configure ...`

- Within a directory: Remove -O2 from CFLAGS in Makefile

  - Edit/touch some .c file(s) in the directory to recompile, or make
    clean to rebuild everything in the directory

If you want to just select a few functions to be built with -O0, then
create 2 files, src/lib/optimise-off.h and src/lib/options-restore.h as
follows:

```c
#if defined(__GNUC__)
#if (__GNUC__ > 4) || ((__GNUC__ == 4) && (__GNUC_MINOR__ > 4))
#pragma GCC push_options
#pragma GCC optimize (0)
#else
#warning GCC not new enough to support local optimization pragmas
#endif
#endif
```

and

```c
#if defined(__GNUC__)
#if (__GNUC__ > 4) || ((__GNUC__ == 4) && (__GNUC_MINOR__ > 4))
#pragma GCC pop_options
#else
/* He already knows */
#endif
#endif
```

Then just use #include those files around just the functions you want
un-optimised.

Another dirty and quick way to opt out the optimization is to use pragma
to quote the code.

```c
#pragma GCC push_options
#pragma GCC optimize ("O0")
.... code
#pragma GCC pop_options
```

## Following Deep Inside Structs

Dovecot implements classes/objects using C structs. For example there is the
`struct connection` base object, which is extended with:

```c
struct dict_connection {
    struct connection conn;
    ...
}
```

However, many places still refer to these extended objects using their base
classes, so you need to cast them to get all of their wanted fields visible.
For example:

```c
(gdb) p dict_connections
$1 = (struct connection_list *) 0x55823025e9a0
(gdb) p dict_connections.connections
$2 = (struct connection *) 0x55823025c160
(gdb) p *dict_connections.connections
$3 = {prev = 0x0, next = 0x0, list = 0x55823025e9a0,
... the rest of struct connection
(gdb) p *(struct dict_connection *)dict_connections.connections
$4 = {conn = {prev = 0x0, next = 0x0, list = 0x55823025e9a0,
... the rest of struct dict_connection
```

It's a bit more tricky to look inside dynamic array types. As an example
lets consider `ARRAY(struct dict_connection_cmd *) cmds`. This ends up
being expanded into:

```c
struct array {
    buffer_t *buffer;
    size_t element_size;
};
union {
    struct array arr;
    struct dict_connection_cmd *const *v;
    struct dict_connection_cmd **v_modifiable;
} cmds;
```

You can find out the size of the array with:

```c
p cmds.arr.buffer.used / cmds.arr.element_size
```

You can access the elements of the array with:

```c
p *(*cmds.v)[0]
p *(*cmds.v)[1]
p *(*cmds.v)[...]
```

So to actually access the `dict_connection.cmds` array for the first
connection in `dict_connections`, the gdb print commands get a bit long:

```c
(gdb) p ((struct dict_connection *)dict_connections.connections).cmds
$5 = {arr = {buffer = 0x55823026da80, element_size = 8}, v = 0x55823026da80,
      v_modifiable = 0x55823026da80}

(gdb) p ((struct dict_connection *)dict_connections.connections).cmds.arr.buffer.used / 8
$6 = 1

(gdb) p *(*((struct dict_connection *)dict_connections.connections).cmds.v)[0]
$7 = {cmd = 0x55822ecc8b00 <cmds+16>, conn = 0x55823025c160, start_timeval = {
      tv_sec = 1632257119, tv_usec = 530341}, event = 0x558230280b98,
      reply = 0x0, iter = 0x0, iter_flags = 0, async_reply_id = 0, trans_id = 0,
      rows = 0, uncork_pending = false}
```

There can of course be multiple dict connections, which you can access by
following the linked list:

```c
(gdb) p *dict_connections.connections.next
(gdb) p *dict_connections.connections.next.next
(gdb) p *dict_connections.connections.next.next.next
```

## Debugging Data Stack Growth

Dovecot uses [[link,data_stack]] to implement its own secondary stack.
This stack is intended to usually stay rather small, ideally within its
initial 32 kB size. There are `data_stack_grow` events sent when it grows.
To debug why data stack grows, you can have it panic:

```
log_core_filter = event=data_stack_grow
# Or have it panic later:
log_core_filter = event=data_stack_grow and alloc_size >= 10240
```

The core dump can then be analyzed:

```c
(gdb) p *current_frame
$1 = {prev = 0x555555874e78, block = 0x555555910760, block_space_left = 15640,
      last_alloc_size = 96, marker = 0x5555557e726c "data-stack.c:514",
      alloc_bytes = 96, alloc_count = 1}
(gdb) p *current_frame.prev
$2 = {prev = 0x555555874e18, block = 0x5555558742a0, block_space_left = 7264,
      last_alloc_size = 744, marker = 0x5555557c011f "index-storage.c:1056",
      alloc_bytes = 7312, alloc_count = 71}
(gdb) p *current_frame.prev.block
$3 = {prev = 0x0, next = 0x555555910760, size = 10240, left = 696,
      left_lowwater = 696, canary = 0xbadbadd5badbadd5, data = 0x5555558742d0 "8"}
```

First look at the `block` variable for these frames, and note how it changes
for the 2rd one. So the data stack is grown between the 1nd and the 2rd frame.
And since `block_space_left` was about 7 kB while the block's full size was
10240 bytes, most of the space is allocated sometimes after
`index-storage.c:1056`. We can also look further into the data stack frames
to see if there are any other frames that use up a lot of memory:

```c
(gdb) p *current_frame.prev.prev
$4 = {prev = 0x555555874db8, block = 0x5555558742a0, block_space_left = 7360,
      last_alloc_size = 96, marker = 0x5555557aef7c "mail-storage.c:2818",
      alloc_bytes = 96, alloc_count = 1}
...
$5 = {prev = 0x5555558743e0, block = 0x5555558742a0, block_space_left = 8440,
      last_alloc_size = 560, marker = 0x5555557a5467 "cmd-copy.c:328",
      alloc_bytes = 984, alloc_count = 6}
(gdb) p *current_frame.prev.prev.prev.prev.prev
$6 = {prev = 0x555555874338, block = 0x5555558742a0, block_space_left = 9976,
      last_alloc_size = 112, marker = 0x5555557a720f "imap-client.c:1357",
      alloc_bytes = 1536, alloc_count = 14}
```

So there was also some 1.5 kB used between `imap-client.c:1357` and
`cmd-copy.c:328` which might be worth looking into.

Once you start debugging, get a gdb backtrace and start inserting further data
stack frames into the function calls that the gdb backtrace shows. For example:

```c
(gdb) bt
#0  data_stack_send_grow_event (last_alloc_size=744) at data-stack.c:400
#1  t_malloc_real (size=<optimized out>, permanent=<optimized out>)
    at data-stack.c:523
...
#10 0x000055555565257c in index_list_get_metadata (box=0x5555558ee8b0,
    items=MAILBOX_METADATA_CACHE_FIELDS, metadata_r=0x7fffffffe180)
    at mailbox-list-index-status.c:343
#11 0x00005555555ea928 in mailbox_get_metadata (box=0x5555558ee8b0,
    items=items@entry=MAILBOX_METADATA_CACHE_FIELDS,
    metadata_r=metadata_r@entry=0x7fffffffe180) at mail-storage.c:2204
#12 0x0000555555672794 in index_copy_cache_fields (
    ctx=ctx@entry=0x5555559093b0, src_mail=src_mail@entry=0x555555904408,
    dest_seq=1) at index-storage.c:1068
```

Here you can see that #1 matches is inside the `data-stack.c:514` data
stack frame and #12 is inside the `index-storage.c:1056` data stack frame.
So you could start placing more `T_BEGIN { .. } T_END` frames between
#2 and #11 frames shown by gdb to get more details where the data stack is
being used.

## Valgrind

The most useful Valgrind parameters:

| Parameter | Description |
| --------- | ----------- |
| `–-vgdb=no` | Needed on some systems to avoid problems. |
| `--keep-debuginfo=yes` | Prevent unhelpful `??` for already unloaded plugins. |
| `--num-callers=<n>` | Display last \<n\> functions calls in the backtrace for each error. |
| `--leak-check=full` | Show also unfreed memory as being leaked. |
| `--trace-children=yes` | Trace also the forked child processes. |
| `--suppressions=<path>` Suppressions for things that can't be fixed. Usually in external libraries. |
| `-q` | Quiet: don't log about initialization etc. |

### Standalone

```sh
valgrind --leak-check=full /usr/libexec/dovecot/imap -u user@example.com
```

### Service Settings

```
service imap {
  executable = /usr/bin/valgrind --vgdb=no --num-callers=50
               --leak-check=full -q /usr/local/libexec/dovecot/imap
}
```

### Debugging Valgrind errors in a Live Program Using GDB

```sh
valgrind --vgdb-error=0
```

And follow the instructions given by valgrind. Also works within emacs.

### Debugging over forks with Valgrind

If you're an emacs user, you're only allowed to debug one process at a
time (per emacs).

As above,

```sh
valgrind --vgdb-error=0
```

Method 1: Just start the first gdb in a different shell or emacs window
as normal, and then pretty much ignore it. After the fork, pick up the
process in your primary emacs gdb window as normal.

Method 2: Follow the gdb instructions, "cont" the program, ^C, and
"detach" the program. I'm not sure what happens to the parent after
that. When valgrind stops on the fork, follow the new set of gdb
instructions and continue as normal.

In neither method do you need to "set follow-fork-mode child" as gdb
isn't aware of the fork.

### Valgrinding Plugin Memory Leaks

Valgrind output at exit may contain very unhelpful `??` lines, which
point to already unloaded plugins. You can avoid this by
giving `--keep-debuginfo=yes` parameter.

Alternative way would be to set GDB=1 environment to disable all plugin
unloading. This will cause some extra warnings about leaking memory in
dl\*() functions which can be ignored. You can also do this in
dovecot.conf:

```[dovecot.conf]
import_environment {
  GDB = 1
}
```

## Debugging Tools

See [[link,debug]] for scripts that are useful for reporting
issues to the Dovecot developers.
