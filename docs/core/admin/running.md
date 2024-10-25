---
layout: doc
title: Running Dovecot
dovecotlinks:
  running_dovecot: running Dovecot
---

# Running Dovecot

## Starting

Dovecot can simply be started by running dovecot as root. If there are any
problems, they're usually written to terminal, but they may also be written
to error log at page [[link,logging]] as well.

* See [[link,startup_scripts]]

## Stopping

Killing the Dovecot master process with a normal TERM signal does a clean
shutdown. This can be done easily with [[doveadm,stop]].

[[setting,shutdown_clients]] controls whether existing IMAP and POP3
sessions are killed.

If you are using systemd, you need to set:

```
[Service]
KillMode=none
ExecStop=/usr/bin/doveadm stop
```

to avoid systemd from killing processes on restart.

## Processes

When Dovecot is running, it uses several processes:

```sh
ps auxw|grep "dovecot"
```
```
root        7245  0.1  0.1   2308  1096 pts/0    S+   19:53   0:00 dovecot
dovecot     7246  0.0  0.0   2084   824 pts/0    S+   19:53   0:00 dovecot/anvil
root        7247  0.0  0.0   2044   908 pts/0    S+   19:53   0:00 dovecot/log
root        7250  0.0  0.3   4988  3740 pts/0    S+   19:53   0:00 dovecot/config
root        7251  0.0  0.2  10024  2672 pts/0    S+   19:53   0:00 dovecot/auth
root        7303  0.6  0.3  10180  3116 pts/0    S+   19:57   0:00 dovecot/auth -w
vmail       7252  0.0  0.1   3180  1264 pts/0    S+   19:53   0:00 dovecot/imap
vmail       7255  0.0  0.1   3228  1596 pts/0    S+   19:54   0:00 dovecot/pop3
dovenull    7260  0.0  0.1   4028  1940 pts/0    S+   19:54   0:00 dovecot/imap-login
dovenull    7262  0.0  0.1   4016  1916 pts/0    S+   19:54   0:00 dovecot/pop3-login
```

* `dovecot` process is the Dovecot master process which keeps everything
  running.
* `anvil` keeps track of user connections.
* `log` writes to log files. All logging, except from master process, goes
  through it.
* `config` parses the configuration file and sends the configuration to
  other processes.
* `auth` handles all authentication.
* `auth -w` process is an authentication worker process. It's used only
  with some "blocking" authentication databases, such as [[link,auth_sql]].
* `imap-login` and `pop3-login` processes handle new IMAP and POP3
  connections until user has logged in. They also handle proxying SSL
  connections even after login.
* `imap` and `pop3` processes handle the IMAP and POP3 connections after
  user has logged in.


## Reloading Configuration

Sending HUP signal to Dovecot reloads configuration. This can be done
easily with: [[doveadm,reload]]. An acknowledgement is written to log file.

## Running Multiple Invocations of Dovecot

You may wish to invoke a second session (or even multiple sessions) of
Dovecot for testing different functionality, configurations, etc.

In order to run multiple instances of Dovecot, you must:

1. Create a differently named copy of the `dovecot.conf` configuration file
   with these changes:

   1. Change [[setting,base_dir]] to the new run directory.

   2. Change services' `inet_listener` port numbers to new, unused values.

   3. Optionally, change `instance_name` to show a different "dovecot/"
      prefix in ps output.

   4. If you're using authentication sockets (for SMTP AUTH or deliver),
      you'll need to change them as well. [[setting,auth_socket_path]]
      specifies the socket path for deliver.

      * Alternatively, if all the instances have identical authentication
        configuration, you can have only a single Dovecot instance serve
        the auth sockets and have the other instances use them.

2. Invoke dovecot (and dovecot-lda) with the `-c` parameter and the
   modified configuration file, e.g.: `dovecot -c /usr/local/etc/dovecot2.conf`

3. In order to tell the logs apart, you can set different log facilities
   for the instances, e.g., `syslog_facility=local6`, then configure syslogd
   to write local6 into "dovecot-otherinstance.log". Alternatively specify
   the log paths directly in [[setting,log_path]] and related settings.

## Rotating Log Files

If you specified log file paths manually in `dovecot.conf` instead of
using syslog, you can send USR1 signal to Dovecot to make it close and
reopen the log files. This can be done with: [[doveadm,log reopen]].

## Troubleshooting

If you can't see the Dovecot processes running after starting dovecot,
something is most likely wrong in your dovecot.conf. Look at the error from
Dovecot's log file. See [[link,logging]] for how to find the log.

If you really can't find any error messages from any logs, try starting
Dovecot with `dovecot -F`. If you see it crash like:

`sh: segmentation fault (core dumped) dovecot -F`

Then it's a bug in Dovecot. Please report it with your configuration file.

If it simply quits without giving any error, then it wrote the error to a
log file and you just didn't find it. Try specifying the log file manually
and make sure you're really looking at the correct file.

See also [[link,troubleshooting]].
