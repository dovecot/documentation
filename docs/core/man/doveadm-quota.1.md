---
layout: doc
title: doveadm-quota
dovecotComponent: core
---

# doveadm-quota(1) - Initialize/recalculate or show current quota usage

## SYNOPSIS

**doveadm** [*GLOBAL OPTIONS*] [**-f** *formatter*] **quota** [**-S** *socket_path*] *command* **-A**

**doveadm** [*GLOBAL OPTIONS*] [**-f** *formatter*] **quota** [**-S** *socket_path*] *command* **-F** *file*

**doveadm** [*GLOBAL OPTIONS*] [**-f** *formatter*] **quota** [**-S** *socket_path*] *command* **\-\-no-userdb-lookup**

**doveadm** [*GLOBAL OPTIONS*] [**-f** *formatter*] **quota** [**-S** *socket_path*] *command* **-u** *user*

## DESCRIPTION

In the first form, the command will be performed for all users.

In the second form, the command will be performed for all users listed
in the given *file*.

In the third form, the command will be performed for the user contained in the
*USER* environment variable.

In the last form, the command will affect only the matching *user*(s).

- The **quota get** and **quota recalc** commands are only available
  when the global *mail_plugins* setting contains the **quota** plugin.

<!-- @include: include/global-options-formatter.inc -->

## OPTIONS

<!-- @include: include/option-A.inc -->

<!-- @include: include/option-F-file.inc -->

<!-- @include: include/option-no-userdb-lookup.inc -->

<!-- @include: include/option-S-socket.inc -->

<!-- @include: include/option-u-user.inc -->

## COMMANDS

### quota get

**doveadm** [*GLOBAL OPTIONS*] **quota get** [**-A** | **-u** *user* | **-F** *file*]

The **quota get** command is used to display the current quota usage.
The storage values are reported in kilobytes.

This command uses by default the output formatter **table**.

### quota recalc

**doveadm** [*GLOBAL OPTIONS*] quota recalc [**-A** | **-u** *user* | **-F** *file*]

The **quota recalc** command is used to recalculate the current quota
usage.

## FILES

*/etc/dovecot/dovecot.conf*
:   Dovecot's main configuration file, including the *dict* section.

*/etc/dovecot/dovecot-dict-sql.conf.ext*
:   SQL dictionary proxy settings.

*/etc/dovecot/conf.d/10-mail.conf*
:   Mailbox locations and namespaces, including global *mail_location*

*/etc/dovecot/conf.d/90-quota.conf*
:   Quota configuration.

## EXAMPLE

Get the current quota usage of user jane:

```console
$ doveadm quota get -u jane
Quota name                        Type    Value  Limit  %
user                              STORAGE 90099 102400 87
user                              MESSAGE 20548  30000 68
```

<!-- @include: include/reporting-bugs.inc -->

## SEE ALSO

[[man,doveadm]]
