---
layout: doc
title: doveadm-instance
dovecotComponent: core
---

# doveadm-instance(1) - Manage the list of running Dovecot instances

## SYNOPSIS

**doveadm** [*GLOBAL OPTIONS*] **instance list**

**doveadm** [*GLOBAL OPTIONS*] **instance remove** *name* | *base_dir*

## DESCRIPTION

The **doveadm instance** commands are used to manage the list of Dovecot
instances running on the server. In most installations there is only one
Dovecot instance, but in some cases is may be useful to have more (e.g.
running proxy and backend in the same server).

Instances are added to the list automatically when Dovecot is started.
Each instance is uniquely identified by its *base_dir* setting.
Instances can be named by setting *instance_name* in each instance's
*dovecot.conf*. When an instance is named, it can be accessed easily by
giving **-i** *instance_name* command line parameter for Dovecot
binaries (e.g. doveadm).

<!-- @include: include/global-options-formatter.inc -->

## ARGUMENTS

*name*
:   The value of an instance's *instance_name* setting.

*base_dir*
:   The base directory of a Dovecot instance.

## COMMANDS

### instance list

**doveadm** [*GLOBAL OPTIONS*] instance list

This command lists the seen Dovecot instances.

### instance remove

**doveadm** [*GLOBAL OPTIONS*] instance remove *name* | *base_dir*

This command removes the specified instance.

<!-- @include: include/reporting-bugs.inc -->

## SEE ALSO

[[man,doveadm]]
