---
layout: doc
title: doveadm-penalty
---

# doveadm-penalty

## NAME

doveadm-penalty - Show current penalties

## SYNOPSIS

**doveadm** [*GLOBAL OPTIONS*] **penalty** [**-a** *anvil_socket_path*] [*ip* [**/** *mask*]]

## DESCRIPTION

The **doveadm penalty** command can be used to see the current
penalties.

<!-- todo:: (Extend me!/explain it) -->

<!-- @include: include/global-options.inc -->

## OPTIONS

**-a** *anvil_socket_path*
:   This option is used to specify an alternative socket. The option's
    argument is either an absolute path to a local UNIX domain socket, or
    a hostname and port (*hostname*:*port*), in order to connect a remote
    host via a TCP socket.

    By default [[man,doveadm]] will use the socket */rundir/anvil*. The
    socket may be located in another directory, when the default *base_dir*
    setting was overridden in */etc/dovecot/dovecot.conf*.

## ARGUMENTS

*ip* [/*mask*]
:   To reduce/filter the output supply an IP address or a network range
    in CIDR notation (ip/mask).

## EXAMPLE

```console
$ doveadm penalty
IP               penalty last_penalty        last_update
192.0.2.222            3 2010-06-15 15:19:27 15:19:27
192.0.2.53             3 2010-06-15 15:19:34 15:19:34
```

<!-- @include: include/reporting-bugs.inc -->

## SEE ALSO

[[man,doveadm]]
