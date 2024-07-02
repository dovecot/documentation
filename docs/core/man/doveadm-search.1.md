---
layout: doc
title: doveadm-search
dovecotComponent: core
---

# doveadm-search(1) - Show a list of mailbox GUIDs and message UIDs matching given search query.

## SYNOPSIS

**doveadm** [*GLOBAL OPTIONS*] [**-f** *formatter*] **search** [**-S** *socket_path*] **-A** *search_query*

**doveadm** [*GLOBAL OPTIONS*] [**-f** *formatter*] **search** [**-S** *socket_path*] **-F** *file* *search_query*

**doveadm** [*GLOBAL OPTIONS*] [**-f** *formatter*] **search** [**-S** *socket_path*] **\-\-no-userdb-lookup** *search_query*

**doveadm** [*GLOBAL OPTIONS*] [**-f** *formatter*] **search** [**-S** *socket_path*] **-u** *user&* *search_query*

## DESCRIPTION

The **search** command is used to find matching messages.
[[man,doveadm]] will print the mailbox's guid and the message's uid
for each match.

When used with the **-A** or **-u** *wildcard* options,
[[man,doveadm]] will print the fields **username**, **mailbox-guid**
and **uid** for each matching message.

In the first form, [[man,doveadm]] will executed the **search** action
will be performed for all users.

In the second form, the command will be performed for all users listed in
the given *file*.

In the third form, the command will be performed for the user contained in the
*USER* environment variable.

In the last form, only matching mails of the given *user*(s) will be
searched.

<!-- @include: include/global-options-formatter.inc -->

This command uses by default the output formatter **flow** (without the
*key*=prefix).

## OPTIONS

<!-- @include: include/option-A.inc -->

<!-- @include: include/option-F-file.inc -->

<!-- @include: include/option-no-userdb-lookup.inc -->

<!-- @include: include/option-S-socket.inc -->

<!-- @include: include/option-u-user.inc -->

## ARGUMENTS

*search_query*
:   Show messages matching this search query. See
    [[man,doveadm-search-query,,7]] for details.

## EXAMPLE

Search in user bob's dovecot mailboxes all messages which contains the
word "todo" in the Subject: header:

```console
$ doveadm search -u bob mailbox dovecot\* subject todo
3a94c928d66ebe4bda04000015811c6a	8
3a94c928d66ebe4bda04000015811c6a	25
3a94c928d66ebe4bda04000015811c6a	45
```

The search command is mainly useful when used together with
[[man,doveadm-fetch]] command.

For example to save message bodies of all messages from
INBOX that have "todo" in subject, use:

```console
$ doveadm search -u bob mailbox INBOX subject todo
$ while read guid uid; do
    doveadm fetch -u bob body mailbox-guid $guid uid $uid > msg.$uid
  done
```

<!-- @include: include/reporting-bugs.inc -->

## SEE ALSO

[[man,doveadm]], [[man,doveadm-search-query,,7]]
