n--
layout: doc
title: doveadm-move
---

# doveadm-move

## NAME

doveadm-move - Move messages matching the given search query into
another mailbox

doveadm-copy - Copy messages matching the given search query into
another mailbox

## SYNOPSIS

**doveadm** [*GLOBAL OPTIONS*] **move** [**-S** *socket_path*] **-A** **destination** [**user** *source_user*] *search_query*

**doveadm** [*GLOBAL OPTIONS*] **move** [**-S** *socket_path*] **-F** *file* **destination** [**user** *source_user*] *search_query*

**doveadm** [*GLOBAL OPTIONS*] **move** [**-S** *socket_path*] **\-\-no-userdb-lookup** **destination** [**user** *source_user*] *search_query*

**doveadm** [*GLOBAL OPTIONS*] **move** [**-S** *socket_path*] **-u** *user* **destination** [**user** *source_user*] *search_query*


**doveadm** [*GLOBAL OPTIONS*] **copy** [**-S** *socket_path*] **-A** **destination** [**user** *source_user*] *search_query*

**doveadm** [*GLOBAL OPTIONS*] **copy** [**-S** *socket_path*] **-F** *file* **destination** [**user** *source_user*] *search_query*

**doveadm** [*GLOBAL OPTIONS*] **copy** [**-S** *socket_path*] **\-\-no-userdb-lookup** **destination** [**user** *source_user*] *search_query*

**doveadm** [*GLOBAL OPTIONS*] **copy** [**-S** *socket_path*] **-u** *user* **destination** [**user** *source_user*] *search_query*

## DESCRIPTION

**doveadm move** can be used for moving mails between mailboxes for
one or more users. The *search_query* is used to restrict which
messages are moved into the *destination* mailbox.

**doveadm copy** behaves the same as **doveadm move**, except that
copied messages will not be expunged after copying.

In the first form, [[man,doveadm]] will iterate over all users, found
in the configured *user_db* (s), and move or copy each user's messages,
matching the given *search_query*, into the user's *destination*
mailbox.

In the second form, [[man,doveadm]] will iterate over all users, found
in the given *file*, and move or copy each user's messages, matching the
given *search_query*, into the user's *destination* mailbox.

In the third form, matching mails will be moved or copied only for
given *user*(s).

<!-- @include: include/global-options.inc -->

## OPTIONS

<!-- @include: include/option-A.inc -->

<!-- @include: include/option-F-file.inc -->

<!-- @include: include/option-no-userdb-lookup.inc -->

<!-- @include: include/option-S-socket.inc -->

<!-- @include: include/option-u-user.inc -->

## ARGUMENTS

*destination*
:   The name of the destination mailbox, into which the mails should be
    moved or copied. The *destination* mailbox must exist, otherwise this
    command will fail.

*search_query*
:   Move/copy messages matching the given search query. See
    [[man,doveadm-search-query,,7]] for details.

**user** *source_user*
:   The keyword **user** followed by a valid user name. When this
    argument is present, [[man,doveadm]] will apply the *search_query*
    to the *source_user*'s *mail_location*.

    **Limitation:** Currently the users, specified by **-u** *user*
    and **user** *source_user*, must share the same system UID and GID.

## EXAMPLE

Move jane's messages - received in September 2011 - from her INBOX into
her archive:

```console
$ doveadm move -u jane Archive/2011/09 mailbox INBOX BEFORE \
      2011-10-01 SINCE 01-Sep-2011
```

<!-- @include: include/reporting-bugs.inc -->

## SEE ALSO

[[man,doveadm]]
