---
layout: doc
title: doveadm-altmove
dovecotComponent: core
---

# doveadm-altmove(1) - Move matching mails to the alternative storage (dbox-only)

## SYNOPSIS

**doveadm** [*GLOBAL OPTIONS*] **altmove** [**-r**] [**-S** *socket_path*] **-A** *search_query*

**doveadm** [*GLOBAL OPTIONS*] **altmove** [**-r**] [**-S** *socket_path*] **-F** *file search_query*

**doveadm** [*GLOBAL OPTIONS*] **altmove** [**-r**] [**-S** *socket_path*] **\-\-no-userdb-lookup** *search_query*

**doveadm** [*GLOBAL OPTIONS*] **altmove** [**-r**] [**-S** *socket_path*] **-u** *user search_query*

## DESCRIPTION

This command can be used with sdbox or mdbox storage to move mails to
alternative storage path when :ALT=\<path\> is specified for the mail
location.

In the first form, [[man,doveadm]] will execute the **altmove** for all users.

In the second form, the command will be performed for all users listed in
the given *file*.

In the third form, the command will be performed for the user contained in the
*USER* environment variable.

In the last form, only matching mails of the given *user*(s) will be
moved to the alternative storage.

<!-- @include: include/global-options.inc -->

## OPTIONS

<!-- @include: include/option-A.inc -->

<!-- @include: include/option-F-file.inc -->

<!-- @include: include/option-no-userdb-lookup.inc -->

**-r**
:   When the **-r** option is given this *command* works the other way
    round. Mails will be moved from the alternative storage back to the
    default mail location.

<!-- @include: include/option-S-socket.inc -->

<!-- @include: include/option-u-user.inc -->

## ARGUMENTS

*search_query*
:   Messages matching this search query will be moved to alt storage. See
    [[man,doveadm-search-query,,7]] for details.

## FILES

*/etc/dovecot/conf.d/10-mail.conf*
:   Mailbox locations and namespaces.

*/etc/dovecot/conf.d/auth-\*.conf.ext*
:   Authentication processes, including userdb settings.

## EXAMPLE

This example moves seen mails older than one week to alternative
storage under /nfsmount:

```
mail_location = mdbox:~/mdbox:ALT=/nfsmount/%h/mdbox
```

```console
$ doveadm altmove -u johnd@example.com seen savedbefore 1w<
```

<!-- @include: include/reporting-bugs.inc -->

## SEE ALSO

[[man,doveadm]]
