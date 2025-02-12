---
layout: doc
title: doveadm-import
dovecotComponent: core
---

# doveadm-import(1) - Import messages matching given search query

## SYNOPSIS

**doveadm** [*GLOBAL OPTIONS*] **import**
  [**-S** *socket_path*]
  [**-U** *source_user*]
  [**-s**]
  **-A**
  *source_mail_driver*:*source_mail_path*

**doveadm** [*GLOBAL OPTIONS*] **import**
  [**-S** *socket_path*]
  [**-U** *source_user*]
  [**-s**]
  **-F** *file* *source_mail_driver*:*source_mail_path*

**doveadm** [*GLOBAL OPTIONS*] **import**
  [**-S** *socket_path*]
  [**-U** *source_user*]
  [**-s**]
  **\-\-no-userdb-lookup** *source_mail_driver*:*source_mail_path*

**doveadm** [*GLOBAL OPTIONS*] **import**
  [**-S** *socket_path*]
  [**-U** *source_user*]
  [**-s**]
  **-u** *user* *source_mail_driver*:*source_mail_path*

## DESCRIPTION

This command can be used to import mails from another mail storage
specified by *source_mail_driver*, *source_mail_path*, and other settings
specified via **-p** parameters to one or more user's mailboxes. All the
mailboxes are imported under the given *dest_parent* mailbox, or to root
level if *dest_parent* is empty (""). The *search_query* can be used to
restrict which mailboxes or messages are imported. By default the import
is done in destination user's context, you can use -U to change this.

In the first form, [[man,doveadm]] will executed the **import** action
mails will be imported for all users.

In the second form, the mails will be imported for all users listed in
the given *file*.

In the third form, the command will be performed for the user contained in the
*USER* environment variable.

In the final form, the mails will be imported only for given *user* (s).

<!-- @include: include/global-options.inc -->

## OPTIONS

<!-- @include: include/option-A.inc -->

<!-- @include: include/option-F-file.inc -->

<!-- @include: include/option-no-userdb-lookup.inc -->

<!-- @include: include/option-S-socket.inc -->

<!-- @include: include/option-p.inc -->

**-s**
:   When the **-s** option is present, *dest_parent* and all new
    mailboxes under it will be subscribed to.

**-U username**
:   When the **-U** option is present, the source box is opened with
    given username.

<!-- @include: include/option-u-user.inc -->

## ARGUMENTS

*dest_parent*
:   The name of the destination mailbox, under which the mails should be
    imported. [[man,doveadm]] will create the *dest_parent* mailbox if
    it doesn't exist.

*search_query*
:   Copy messages matching this search query. See
    [[man,doveadm-search-query,,7]] for details.

*source_mail_driver*:*source_mail_path*
:   This argument specifies the *mail_driver* and *mail_path* settings for the
    source location. The **-p** parameter can optionally be used to specify
    additional settings.
    For example: **maildir:/backup/20101126/jane.doe/Maildir** or
    **-p mail_alt_path=/nfsmount/john.doe/mdbox mdbox:/srv/mail/john.doe/mdbox**

## EXAMPLE

This example imports all mails from a backup under a *backup-20101026*
mailbox:

```sh
doveadm import -u jane.doe@example.org \
  mdbox:/backup/20101026/jane.doe/mdbox backup-20101026 all
```

Another example that imports only messages from foo@example.org in the
backup mdbox's INBOX to jane's INBOX:

```sh
doveadm import -u jane.doe@example.org \
  mdbox:~/mdbox-backup "" mailbox INBOX from foo@example.org
```

<!-- @include: include/reporting-bugs.inc -->

## SEE ALSO

[[man,doveadm]], [[man,doveadm-search-query,,7]]
