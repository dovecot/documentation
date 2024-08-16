---
layout: doc
title: doveadm-force-resync
dovecotComponent: core
---

# doveadm-force-resync(1) - Repair broken mailboxes

## SYNOPSIS

**doveadm** [*GLOBAL OPTIONS*] **force-resync** [**-S** *socket_path*] **-A** *mailbox*

**doveadm** [*GLOBAL OPTIONS*] **force-resync** [**-S** *socket_path*] **-F** *file* *mailbox*

**doveadm** [*GLOBAL OPTIONS*] **force-resync** [**-S** *socket_path*] **\-\-no-userdb-lookup** *mailbox*

**doveadm** [*GLOBAL OPTIONS*] **force-resync** [**-S** *socket_path*] **-u** *user* *mailbox*

## DESCRIPTION

Under certain circumstances it may happen, that [[man,dovecot]] is
unable to automatically solve problems with mailboxes. In such
situations the **force-resync** command may be helpful. It tries to fix
all problems. For sdbox and mdbox mailboxes the storage files will be
also checked.

<!-- @include: global-options.inc -->

## OPTIONS

<!-- @include: option-A.inc -->

<!-- @include: option-F-file.inc -->

<!-- @include: option-no-userdb-lookup.inc -->

<!-- @include: option-S-socket.inc -->

<!-- @include: option-u-user.inc -->

## ARGUMENTS

*mailbox*
:   The name of the mailbox to fix. With mdbox all of the mailboxes are
    fixed, so you can use for example INBOX as the name.

## EXAMPLE

Fix bob's INBOX:

```sh
doveadm force-resync -u bob INBOX
```

<!-- @include: reporting-bugs.inc -->

## SEE ALSO

[[man,doveadm]]
