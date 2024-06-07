---
layout: doc
title: doveadm-expunge
---

# doveadm-expunge

## NAME

doveadm-expunge - Expunge messages matching given search query

## SYNOPSIS

**doveadm** [*GLOBAL OPTIONS*] **expunge** [**-S** *socket_path*] [**-d**] **-A** *search_query*

**doveadm** [*GLOBAL OPTIONS*] **expunge** [**-S** *socket_path*] [**-d**] **-F** *file* *search_query*

**doveadm** [*GLOBAL OPTIONS*] **expunge** [**-S** *socket_path*] [**-d**] **\-\-no-userdb-lookup** *search_query*

**doveadm** [*GLOBAL OPTIONS*] **expunge** [**-S** *socket_path*] [**-d**] **-u** *user* *search_query*

## DESCRIPTION

This command can be used to expunge mails matching the given search
query. It is typically used to expunge old mails from users' Trash
and/or Spam mailboxes. To test which messages a given search query would
match, you can use *doveadm fetch* or *doveadm search* commands.

In the first form, the command will be performed for all users.

In the second form, [[man,doveadm]] will expunge messages of the users
listed in the given *file*.

In the third form, the command will be performed for the user contained in the
*USER* environment variable.

In the final form, only matching mails of the given *user* (s) will be
expunged.

<!-- @include: include/global-options.inc -->

## OPTIONS

<!-- @include: include/option-A.inc -->

**-d**
:   Delete the mailbox if it is empty after expunging.

<!-- @include: include/option-F-file.inc -->

<!-- @include: include/option-no-userdb-lookup.inc -->

<!-- @include: include/option-S-socket.inc -->

<!-- @include: include/option-u-user.inc -->

## ARGUMENTS

*search_query*
:   Expunge messages matching this search query. See
    [[man,doveadm-search-query,,7]] for details.

## EXAMPLE

This example expunges messages from Spam mailbox that were saved/copied
there more than two weeks ago:

```console
$ doveadm expunge -u jane.doe@example.org mailbox Spam savedbefore 2w
```

<!-- @include: include/reporting-bugs.inc -->

## SEE ALSO

[[man,doveadm]], [[man,doveadm-search]]
