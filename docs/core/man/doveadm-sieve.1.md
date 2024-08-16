---
layout: doc
title: doveadm-sieve
dovecotComponent: pigeonhole
---

# doveadm-sieve(1) - Commands related to handling Sieve scripts

## SYNOPSIS

**doveadm** [*GLOBAL OPTIONS*] *sieve_cmd* [*options*] [*arguments*]

## DESCRIPTION

The **doveadm sieve** commands are part of Pigeonhole ([[man,pigeonhole,,7]]),
which adds Sieve ([[rfc,5228]]) and ManageSieve ([[rfc,5804]]) support to
Dovecot ([[man,dovecot]]).

The **doveadm sieve** commands can be used to manage Sieve filtering.

<!-- @include: global-options-formatter.inc -->

## OPTIONS

<!-- @include: option-A.inc -->

<!-- @include: option-F-file.inc -->

<!-- @include: option-no-userdb-lookup.inc -->

<!-- @include: option-S-socket.inc -->

<!-- @include: option-u-user.inc -->

## ARGUMENTS

*scriptname*
:   Is the name of a *Sieve script*, as visible to ManageSieve clients.

    ::: tip
    For Sieve scripts that are stored on disk, this is the filename
    without the ".sieve" extension.
    :::

## COMMANDS

### sieve put

**doveadm** [*GLOBAL OPTIONS*] sieve put
  [**-A** | **-u** *user* | **-F** *file* | **\-\-no-userdb-lookup**]
  [**-S** *socket_path*]
  [**-a**]
  *scriptname*

This command puts one new Sieve script in the script storage. The script
is read from standard input. If the script compiles successfully, it is
stored under the provided *scriptname .* If the **-a** option is
present, the Sieve script is subsequently marked as the active script
for execution at delivery.

### sieve get

**doveadm** [*GLOBAL OPTIONS*] sieve get
  [**-A** | **-u** *user* | **-F** *file* | **\-\-no-userdb-lookup**]
  [**-S** *socket_path*]
  *scriptname*

This command retrieves the Sieve script named *scriptname*.

### sieve delete

**doveadm** [*GLOBAL OPTIONS*] sieve delete
  [**-A** | **-u** *user* | **-F** *file* | **\-\-no-userdb-lookup**]
  [**-S** *socket_path*]
  [**-a**]
  *scriptname* ...

This command deletes one or more Sieve scripts. The deleted script may
not be the active script, unless the **-a** option is present.

### sieve list

**doveadm** [*GLOBAL OPTIONS*] sieve list
  [**-A** | **-u** *user* | **-F** *file* | **\-\-no-userdb-lookup**]
  [**-S** *socket_path*]

List existing Sieve scripts, and their active state.

### sieve rename

**doveadm** [*GLOBAL OPTIONS*] sieve rename
  [**-A** | **-u** *user* | **-F** *file* | **\-\-no-userdb-lookup**]
  [**-S** *socket_path*]
  *old_name* *new_name*

The **sieve rename** command is used to rename the Sieve script *old_name*
to *new_name*.

### sieve activate

**doveadm** [*GLOBAL OPTIONS*] sieve activate
  [**-A** | **-u** *user* | **-F** *file* | **\-\-no-userdb-lookup**]
  [**-S** *socket_path*]
  *scriptname*

This command marks the Sieve script named *scriptname* as the active script
for execution at delivery.

### sieve deactivate

**doveadm** [*GLOBAL OPTIONS*] sieve deactivate
  [**-A** | **-u** *user* | **-F** *file* | **\-\-no-userdb-lookup**]
  [**-S** *socket_path*]
  *scriptname*

This command deactivates Sieve processing.

<!-- @include: reporting-bugs.inc -->

## SEE ALSO

[[man,doveadm]], [[man,dovecot-lda]], [[man,pigeonhole,,7]]
