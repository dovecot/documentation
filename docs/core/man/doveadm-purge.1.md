---
layout: doc
title: doveadm-purge
dovecotComponent: core
---

# doveadm-purge(1) - Remove messages with refcount=0 from mdbox files

## SYNOPSIS

**doveadm** [*GLOBAL OPTIONS*] **purge** [**-S** *socket_path*] **-A**

**doveadm** [*GLOBAL OPTIONS*] **purge** [**-S** *socket_path*] **-F** *file*

**doveadm** [*GLOBAL OPTIONS*] **purge** [**-S** *socket_path*] **\-\-no-userdb-lookup**

**doveadm** [*GLOBAL OPTIONS*] **purge** [**-S** *socket_path*] **-u** *user*

## DESCRIPTION

The **doveadm purge** command is used to remove all messages with
refcount=0 from a user's mail storage. The refcount of a message is
decreased to 0 when the user (or some administration utility) has
expunged all instances of a message from all mailboxes.

In the first form, the command will be executed for all users.

In the second form, the command will be executed for all users listed in
the given *file*.

+In the third form, the command will be performed for the user contained in the
+*USER* environment variable.


In the last form, only messages of the given *user* (s) will be purged.

<!-- @include: include/global-options.inc -->

## OPTIONS

<!-- @include: include/option-A.inc -->

<!-- @include: include/option-F-file.inc -->

<!-- @include: include/option-no-userdb-lookup.inc -->

<!-- @include: include/option-S-socket.inc -->

<!-- @include: include/option-u-user.inc -->


<!-- @include: include/reporting-bugs.inc -->

## SEE ALSO

[[man,doveadm]]

Additional resources:

- [[link,dbox]]
