---
layout: doc
title: doveadm-help
dovecotComponent: core
---

# doveadm-help(1) - Show information about doveadm commands

## SYNOPSIS

**doveadm** [*GLOBAL OPTIONS*] **help** [*command*]

## DESCRIPTION

With no *command* argument given, **doveadm help** will print:

* the synopsis for the most of the [[man,doveadm]] commands,
* groups of commands, e.g. **log** or **mailbox**.

When the name of a *command* (or a group) was given, it will show the
man page for that command.

<!-- @include: global-options.inc -->

<!-- @include: reporting-bugs.inc -->

## SEE ALSO

[[man,doveadm]]
