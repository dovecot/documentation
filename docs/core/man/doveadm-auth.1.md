---
layout: doc
title: doveadm-auth
dovecotComponent: core
---

# doveadm-auth(1) - Flush/lookup/test authentication data

## SYNOPSIS

**doveadm** [*GLOBAL OPTIONS*] **auth** *command* [*OPTIONS*] [*ARGUMENTS*]

## DESCRIPTION

The **doveadm auth** *COMMANDS* can be used to perform various
authentication related actions.

<!-- @include: global-options-formatter.inc -->

## OPTIONS

<!-- @include: option-x.inc -->

## ARGUMENTS

*user*
:   The *user*'s login name. Depending on the configuration, the login
    name may be for example **jane** or **john@example.com**.

*password*
:   Optionally the user's password. [[man,doveadm]] will prompt for the
    password, if none was given.

## COMMANDS

### auth cache flush

**doveadm** [*GLOBAL OPTIONS*] auth cache flush [**-a** *master_socket_path*] [*user* ...]

Flush the authentication cache. By default the cache is flushed for all
the users (which can also be done by sending SIGHUP to the auth
process). You can also flush the cache for one or more users by
providing their usernames.

**-a** *master_socket_path*
:   This option is used to specify an absolute path to an alternative
    UNIX domain socket.

    By default [[man,doveadm]] will use the socket */rundir/auth-master*.
    The socket may be located in another directory, when the default
    *base_dir* setting was overridden in */etc/dovecot/dovecot.conf*.

<!-- @include: option-x.inc -->

### auth lookup

**doveadm** [*GLOBAL OPTIONS*] auth lookup [**-a** *userdb_socket_path*] [**-x** *auth_info*] [**-f** *field*] *user* [...]

Similar to [[man,doveadm-user]] command, except it performs a *passdb*
lookup (without authentication) instead of a *userdb* lookup.

**-a** *userdb_socket_path*
:   This option is used to specify an absolute path to an alternative
    UNIX domain socket.

    By default [[man,doveadm]] will use the socket */rundir/auth-userdb*.
    The socket may be located in another directory, when the default
    *base_dir* setting was overridden in */etc/dovecot/dovecot.conf*.

**-f** *field*
:   When this option and the name of a userdb field is given,
    [[man,doveadm]] will show only the value of the specified field.

<!-- @include: option-x.inc -->

### auth test

**doveadm** [*GLOBAL OPTIONS*] auth test [**-a** *auth_socket_path*] [**-A** *sasl_mech*] [**-x** *auth_info*] *user* [*password*]

Test authentication for the given user.

**-a** *auth_socket_path*
:   This option is used to specify an absolute path to an alternative
    UNIX domain socket.

    By default [[man,doveadm]] will use the socket */rundir/auth-client*.
    The socket may be located in another directory, when the default
    *base_dir* setting was overridden in */etc/dovecot/dovecot.conf*.

**-A** *sasl_mech*
:   The SASL mechanism used for the authentication. By default PLAIN is used.

<!-- @include: option-x.inc -->

### auth login

**doveadm** [*GLOBAL OPTIONS*] auth login [**-a** *auth_socket_path*] [**-m** *auth_master_socket_path*] [**-A** *sasl_mech*] [**-x** *auth_info*] *user* [*password*]

Test full login for the given user; i.e. performing both passdb lookup (authentication) and userdb lookup (login).

**-a** *auth_socket_path*
:   This option is used to specify an absolute path to an alternative
    UNIX domain socket.

    By default [[man,doveadm]] will use the socket */rundir/auth-client*.
    The socket may be located in another directory, when the default
    *base_dir* setting was overridden in */etc/dovecot/dovecot.conf*.

**-m** *auth_master_socket_path*
:   This option is used to specify an absolute path to an alternative
    UNIX domain socket for the master socket.

    By default [[man,doveadm]] will use the socket */rundir/auth-master*.
    The socket may be located in another directory, when the default
    *base_dir* setting was overridden in */etc/dovecot/dovecot.conf*.

**-A** *sasl_mech*
:   The SASL mechanism used for the authentication. By default PLAIN is used.

<!-- @include: option-x.inc -->

## EXAMPLE

This example demonstrates an imap authentication test for user john,
assuming the user is connected from the host with the IP address
192.0.2.143.

```sh
doveadm auth test -x service=imap -x rip=192.0.2.143 john
```
```
Password:
passdb: john auth succeeded
extra fields:
  user=john
```

<!-- @include: reporting-bugs.inc -->

## SEE ALSO

[[man,doveadm]]
