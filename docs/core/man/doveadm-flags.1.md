---
layout: doc
title: doveadm-flags
dovecotComponent: core
---

# doveadm-flags(1) - Add, remove or replace messages' flags

## SYNOPSIS

**doveadm** [*GLOBAL OPTIONS*] **flags** [**-S** *socket_path*] **-A** *command flags* *search_query*

**doveadm** [*GLOBAL OPTIONS*] **flags** [**-S** *socket_path*] **-F** *file* *command flags* *search_query*

**doveadm** [*GLOBAL OPTIONS*] **flags** [**-S** *socket_path*] **\-\-no-userdb-lookup** *command flags* *search_query*

**doveadm** [*GLOBAL OPTIONS*] **flags** [**-S** *socket_path*] **-u** *user* *command flags* *search_query*

## DESCRIPTION

This command is used to manipulate flags of messages.

<!-- @include: include/global-options.inc -->

## OPTIONS

<!-- @include: include/option-A.inc -->

<!-- @include: include/option-F-file.inc -->

<!-- @include: include/option-no-userdb-lookup.inc -->

<!-- @include: include/option-S-socket.inc -->

<!-- @include: include/option-u-user.inc -->

## ARGUMENTS

*flags*
:   Message flags as described in [[rfc,3501]], section 2.3.2 (Flags
    Message Attribute): **\\Answered**, **\\Deleted**, **\\Draft**,
    **\\Flagged**, **\\Recent** and **\\Seen**. And the IMAP keywords
    **$Forwarded**, **$MDNSent**, **$SubmitPending** and **$Submitted**
    or user-defined keywords, e.g. Junk, $NonSpam or $Label1.

    One or multiple flags and/or keywords can be specified.

*search_query*
:   Manipulate the flags of messages matching the given search query. See
    [[man,doveadm-search-query,,7]] for details.

## COMMANDS

### flags add

**doveadm** [*GLOBAL OPTIONS*] flags add [**-u** *user* | **-A** | **-F** *file* | **\-\-no-userdb-lookup**] [**-S** *socket_path*] *flags search_query*

This command is used to extend the current set of flags with the given
*flags*.

### flags remove

**doveadm** [*GLOBAL OPTIONS*] flags remove [**-u** *user* | **-A** | **-F** *file* | **\-\-no-userdb-lookup**] [**-S** *socket_path*] *flags search_query*

In order to remove the given *flags* from the current set of flags, use
this command.

### flags replace

**doveadm** [*GLOBAL OPTIONS*] flags replace [**-u** *user* | **-A** | **-F** *file* | **\-\-no-userdb-lookup**] [**-S** *socket_path*] *flags search_query*

This command is used to replace ALL current flags with the given
*flags*.

## EXAMPLE

List and manipulate the message flags of the message with uid 81563:

```console
$ doveadm fetch -u bob 'uid flags' mailbox dovecot uid 81563
uid: 81563
flags: \Answered \Seen NonJunk

$ doveadm flags remove -u bob NonJunk mailbox dovecot uid 81563
$ doveadm flags add -u bob '\Flagged $Forwarded' mailbox dovecot uid 81563
```

<!-- @include: include/reporting-bugs.inc -->

## SEE ALSO

[[man,doveadm]]
