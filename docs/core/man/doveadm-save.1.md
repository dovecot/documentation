---
layout: doc
title: doveadm-save
dovecotComponent: core
---

# doveadm-save(1) - Save email to a user's mailbox

## SYNOPSIS

**doveadm** [*GLOBAL OPTIONS*] **save** [**-S** *socket_path*] **-A** [*-m* *mailbox*] [*-U* *uid*] [*-g* *guid*] [*-r* *received-date*] [*mail-file*]

**doveadm** [*GLOBAL OPTIONS*] **save** [**-S** *socket_path*] **-F** *file* [*-m* *mailbox*] [*-U* *uid*] [*-g* *guid*] [*-r* *received-date*] [*mail-file*]

**doveadm** [*GLOBAL OPTIONS*] **save** [**-S** *socket_path*] **\-\-no-userdb-lookup** [*-m* *mailbox*] [*-U* *uid*] [*-g* *guid*] [*-r* *received-date*] [*mail-file*]

**doveadm** [*GLOBAL OPTIONS*] **save** [**-S** *socket_path*] **-u** *user* [*-m* *mailbox*] [*-U* *uid*] [*-g* *guid*] [*-r* *received-date*] [*mail-file*]

## DESCRIPTION

**doveadm save** can be used to save messages. This can be useful for
scripts and for debugging. Sieve is not invoked for saved messages, but
quota is enforced.

<!-- @include: include/global-options.inc -->

## OPTIONS

<!-- @include: include/option-A.inc -->

<!-- @include: include/option-F-file.inc -->

<!-- @include: include/option-no-userdb-lookup.inc -->

<!-- @include: include/option-S-socket.inc -->

<!-- @include: include/option-u-user.inc -->

**-m** *mailbox*
:   Store mail to specified mailbox instead of INBOX.

**-U** *uid*
:    Save the mail using the given UID, if possible.

**-g** *guid*
:    Save the mail using the given GUID.

**-r** *received-date*
:    Save the mail using the given received-date timestamp. This is in the
     "human timestamp" format as described by [[man,doveadm-search-query,,7]].

## EXAMPLE

```console
$ echo "hello, world" | doveadm save -u testuser@testdomain
```

<!-- @include: include/reporting-bugs.inc -->

## SEE ALSO

[[man,doveadm]]
