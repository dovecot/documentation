---
layout: doc
title: doveadm-kick
dovecotComponent: core
---

# doveadm-kick(1) - Disconnect users by user name and/or IP address

## SYNOPSIS

**doveadm** [*GLOBAL OPTIONS*] **kick** [**-a** *anvil_socket_path*] [**-f** *passdb_field*] [**-h** *dest_host*] *user_mask*

**doveadm** [*GLOBAL OPTIONS*] **kick** [**-a** *anvil_socket_path*] [**-f** *passdb_field*] [**-h** *dest_host*] *ip* [**/** *bits*]

**doveadm** [*GLOBAL OPTIONS*] **kick** [**-a** *anvil_socket_path*] [**-f** *passdb_field*] [**-h** *dest_host*] *user_mask* *ip* [**/** *bits*]

**doveadm** [*GLOBAL OPTIONS*] **kick** [**-a** *anvil_socket_path*] [**-f** *passdb_field*] **-h** *dest_host*

## DESCRIPTION

**doveadm**'s **kick** command is used to disconnect users by
*user_mask* and/or the *ip* address, from which they are connected.

In the first form, all users, whose login name matches the *user_mask*
argument, will be disconnected.

In the second form, all users, connected from the given IP address or
network range, will be disconnected.

In the third form, only users connected from the given IP address or
networks range and a matching login name will be disconnected.

In the last form, all proxy connections to the given destination host
are disconnected.

<!-- @include: include/global-options.inc -->

## OPTIONS

**-a** *anvil_socket_path*
:   This option is used to specify an absolute path to an alternative
    UNIX domain socket.

    By default [[man,doveadm]] will use the socket */rundir/anvil*. The
    socket may be located in another directory, when the default *base_dir*
    setting was overridden in */etc/dovecot/dovecot.conf*.

**-f** *passdb_field*
:   Alternative username field to use for kicking, as returned by passdb.
    Only the passdb fields beginning with the *user\_* prefix are
    tracked.

**-h** *dest_host*
:   Disconnect proxy connections to the given *dest_host*.

## ARGUMENTS

*ip* [/*bits*]
:   *ip* or *ip* **/** *bits* is the host or network, from which the
    users are connected.

*user_mask*
:   Is a user's login name, or the alternative username (user\_\* field) if
    the **-f** parameter is used. Depending on the configuration, a login
    name may be for example **jane** or **john@example.com**. It's also
    possible to use '*****' and '**?**' wildcards (e.g. -u \*@example.org).

## EXAMPLE

If you don't want to disconnect all users at once, you can check who's
currently logged in. The first example demonstrates how to disconnect
all users whose login name is 3 characters long and begins with **ba**:

```console
$ doveadm who -1 ja\*
username                      service pid ip
jane                          imap   8192 ::1
jano                          imap   8196 ::2
james                         imap   8203 2001:db8:543:2::1

$ doveadm kick jan?
# The connections for jane and jano are kicked.
```

The next example shows how to kick user foo's connections from
192.0.2.\*:

```console
$ doveadm who -1 foo
username                     service pid ip
foo                          imap   8135 fd95:4eed:38ba::25
foo                          imap   9112 192.0.2.53
foo                          imap   8216 192.0.2.111

$ doveadm kick foo 192.0.2.0/24

$ doveadm who f\*
username                  # service (pids) (ips)
foo                       1 imap    (8135) (fd95:4eed:38ba::25)
```

<!-- @include: include/reporting-bugs.inc -->

## SEE ALSO

[[man,doveadm]]
