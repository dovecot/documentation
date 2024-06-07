---
layout: doc
title: doveadm-force-resync
---

# doveadm-force-resync

## NAME

doveadm-force-resync - Repair broken mailboxes

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

<!-- @include: include/global-options.inc -->

## OPTIONS

<!-- @include: include/option-A.inc -->

<!-- @include: include/option-F-file.inc -->

<!-- @include: include/option-no-userdb-lookup.inc -->

<!-- @include: include/option-S-socket.inc -->

<!-- @include: include/option-u-user.inc -->

## ARGUMENTS

*mailbox*
:   The name of the mailbox to fix. With mdbox all of the mailboxes are
    fixed, so you can use for example INBOX as the name.

## EXAMPLE

Fix bob's INBOX:

```console
$ doveadm force-resync -u bob INBOX
```

<!-- @include: include/reporting-bugs.inc -->

## SEE ALSO

[[man,doveadm]]
