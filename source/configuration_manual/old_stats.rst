.. _old_stats:

=================
stats (old_stats)
=================

.. deprecated:: v2.3.0

Dovecot supports gathering statistics (CPU, disk usage, etc.) from mail
processes (IMAP, POP3, LMTP, etc.) to the stats process. The stats process can
later be queried what's going on in the system. With imap_stats plugin you can
get per-command level statistics for IMAP commands.

There are different `zoom levels` you can look at the statistics:

* command: Per-IMAP command
* session: Per IMAP/POP3 connection
* user: Per user (all of user's sessions summed up)
* domain: Per domain (all of domain's users summed up)
* ip: Per IP address (all sessions from the IP summed up)
* global: Everything summed up

  .. versionadded:: 2.2.16

Basic Configuration
===================

.. code-block:: none

  mail_plugins = $mail_plugins stats
  protocol imap {
    mail_plugins = $mail_plugins imap_stats
  }
  plugin {
    # how often to session statistics (must be set)
    stats_refresh = 30 secs
    # track per-IMAP command statistics (optional)
    stats_track_cmds = yes
  }

You'll also need to give enough permissions for mail processes to be able to
write to stats-mail fifo.

For example if you use a single `vmail` user for mail access:

.. code-block:: none

  service stats {
    fifo_listener stats-mail {
      user = vmail
      mode = 0600
    }
  }

Memory usage configuration
==========================

The stats process attempts to keep memory usage below a specified amount. This
value is only approximate because of extra overhead caused by ``malloc()``
itself.

.. code-block:: none

  stats_memory_limit = 16 M

Once the memory limit is reached, oldest statistics are freed from memory.
Different statistics levels have different timeout limits, which are configured
in:

.. code-block:: none

  stats_command_min_time=1 mins
  stats_domain_min_time=12 hours
  stats_ip_min_time=12 hours
  stats_session_min_time=15 mins
  stats_user_min_time=1 hours

So for example the above means:

* An IMAP command is kept in memory for at least 1 minute after it has finished
* A user is kept in memory for 1 hour after its last session has disconnected.

The stats process attempts to honor these ``min_time-settings``, but if memory
is tight it can go below these values to honor the ``stats_memory_limit``
setting.

Statistics gathered
===================

Statistics gathered internally by the stats process:

* num_logins: Number of logins

  .. versionadded:: 2.2.14

* num_cmds: Number of IMAP commands run

  .. versionadded:: 2.2.14

* num_connected_sessions: Number of current IMAP sessions

  .. versionadded:: 2.2.14


Statistics gathered using the ``getrusage()`` system call:

* user_cpu: User CPU (seconds.microseconds)
* sys_cpu: System CPU (seconds.microseconds)
* clock_time: Wall-clock time (seconds.microseconds). Doesn't include time
  spent waiting in ioloop, which means it doesn't include (most of) the time
  spent waiting on client network traffic.

  .. versionadded:: v2.2.11

* min_faults: Minor page faults (page reclaims)
* maj_faults: Major page faults
* vol_cs: Voluntary context switches
* invol_cs: Involuntary context switches
* disk_input: Number of bytes read from disk
* disk_output: Number of bytes written to disk

The disk_input and disk_output attempt to count the actual ``read``/``write``
bytes to physical disk, so e.g. reads from OS's cache aren't counted. Note that
not all operating systems and filesystem support this, instead they simply show
these values always as 0.

Statistics gathered from ``/proc/self/io`` output (Linux-only):

* read_count: Number of read() syscalls
* write_count: Number of write() syscalls
* read_bytes: Number of bytes read using read() syscalls
* write_bytes: Number of bytes written using write() syscalls

.. Note::

  The above numbers are not only about disk I/O, but also about network I/O,
  Dovecot's IPC and every other kind of reads/writes as well.

Statistics gathered by Dovecot's lib-storage internally:

* mail_lookup_path: Number of open() and stat() calls (i.e. `path lookups`)
* mail_lookup_attr: Number of stat() and fstat() calls
* mail_read_count: Number of read() calls for message data (e.g. index files
  not counted)
* mail_read_bytes: Number of message bytes read()
* mail_cache_hits: Number of cache hits from ``dovecot.index.cache`` file

.. Note::

  Statistics are collected only on backends so stats service doesn't do
  anything on directors and proxies.

doveadm stats
=============

top
^^^

``doveadm stats top [<sort field>]``

The top command gives a very simple `top`-like view of connected sessions. The
optional sort field is one of:

* disk: disk_input and disk_output summed up (default)
* cpu: user_cpu and sys_cpu summed up
* any other statistics field

This `top` isn't very good, but a much better one can be found as a Perl
script: stats-top.pl, which also requires stats.pl and tab-formatter.pl.

dump
^^^^

``doveadm stats dump <level> [<filter>]``

The dump command shows a raw output of the statistics. The level parameter is
one of the levels listed at the top of this page (e.g. `session`). The filter
can contain zero of more filters:

* connected: The session must be currently connected (or the user/domain/ip
  must have at least one session that is currently connected)
* since=<timestamp>: Last update was since this UNIX timestamp
* user=<wildcard>: Username matches this wildcard
* domain=<wildcard>: Domain name matches this wildcard
* ip=<ip>[/bits]: IP address matches this IP/network (e.g. 192.168.1.0/24)

If nothing matches the filter, the output is a single empty line. Otherwise it
begins with a header line followed by data lines. Each line has a list of
fields separated by TABs. The header describes what the data fields are. The
list of fields depends on what level you're listing. Some of the fields are:

* session: 128 bit session GUID in hex format. This uniquely identifies a
  single session. Used by commands and sessions.
* connected: Is the client currently connected? 0=no, 1=yes.
* pid: Process ID of the session. If the session is no longer connected, the
  PID may not exist anymore.
* last_update: UNIX timestamp of the last time this data was updated
* reset_timestamp: UNIX timestamp of when this user/domain/ip structure was
  created. This is useful when you want to track incrementally what changed:

 * If timestamp is the same as in your previous lookup, you can simply count
   ``different=new_value - previous_value``.
 * If timestamp has changed since your previous lookup, the statistics were
   reset to zero since and the ``difference=new_value``.

Stats protocol
==============

You can connect to stats process via ``$base_dir/stats`` UNIX socket, or you
can simply add more UNIX/TCP listeners to the stats service, e.g.:

.. code-block:: none

  service stats {
    inet_listener {
      address = 127.0.0.1
      port = 24242
    }
  }

The protocol is almost entirely identical to ``doveadm stats dump`` command's
parameters and output. The only difference is that you prefix your request with
`EXPORT<tab>`.

For example:

.. code-block:: none

  EXPORT<tab>session<tab>connected<lf>

The output will be identical to ``doveadm stats dump session connected``
command.

Carbon support
==============

.. versionadded:: v2.2.27

You can configure dovecot to send statistics periodically in carbon format.

To do this, configure

.. code-block:: none

  stats_carbon_server=ip:port # default port 2003
  stats_carbon_name=hostname # do not use dots
  stats_carbon_interval=30s # default is 30 seconds

  service stats {
    # this is needed if you want stats to be sent when no one is connected
    process_min_avail=1
  }

This will send all available global statistics in `carbon format
<https://graphite.readthedocs.io/en/latest/feeding-carbon.html>`_
