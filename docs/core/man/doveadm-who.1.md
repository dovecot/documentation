---
layout: doc
title: doveadm-who
dovecotComponent: core
---

# doveadm-who(1) - Show who is logged into the Dovecot server

## SYNOPSIS

**doveadm** [*GLOBAL OPTIONS*] **who** [**-1**] [**-f** *passdb_field*] [**-a** *anvil_socket_path*] [*user_mask*] [*ip* [**/** *bits*]]

## DESCRIPTION

The **who** command is used to show which users from which hosts are
currently connected to which service.

<!-- @include: include/global-options-formatter.inc -->

This command uses by default the output formatter **table**.

## OPTIONS

**-1**
:   Print one line per user and connection. Otherwise the connections are
    grouped by the username.

**-a** *anvil_socket_path*
:   This option is used to specify an alternative socket. The option's
    argument is either an absolute path to a local UNIX domain socket, or
    a hostname and port (*hostname*:*port*), in order to connect a remote
    host via a TCP socket.

    By default [[man,doveadm]] will use the socket */rundir/anvil*. The
    socket may be located in another directory, when the default *base_dir*
    setting was overridden in */etc/dovecot/dovecot.conf*.

**-f** *passdb_field*
:   Alternative username field to use for kicking, as returned by passdb.
    Only the passdb fields beginning with the *user_* prefix are
    tracked.

## ARGUMENTS

*ip* [**/** *bits*]
:   Specify an *ip* address or network range, in CIDR notation, to reduce
    the result to matching connections.

*user_mask*
:   List only users whose login name matches the *user_mask*, or the
    alternative username (user_* field) if the **-f** parameter is used.
    It's also possible to use wildcards in the *user* name.

## EXAMPLE

Show authenticated sessions, filtered by the client's IP address:

```console
$ doveadm who ::1
username                       # proto (pids)        (ips)
jane                           2 imap  (30155 30412) (::1)

$ doveadm who 192.0.2.0/24
username                        # proto (pids)  (ips)
john@example.com                1 imap  (30257) (192.0.2.34)
```

Show authenticated sessions, filtered by username:

```console
$ doveadm who pvo
username         # proto (pids)                    (ips)
pvo              1 sieve (30343)                   (fd95:4eed:38ba::25)
pvo              4 imap  (25693 25686 25679 25669) (fd95:4eed:38ba::25)

$ doveadm who ja\*
username                    # proto (pids)        (ips)
james                       1 imap  (30091)       (127.0.0.1)
jane                        2 imap  (30155 30412) (::1)
```

<!-- @include: include/reporting-bugs.inc -->

## SEE ALSO

[[man,doveadm]]
