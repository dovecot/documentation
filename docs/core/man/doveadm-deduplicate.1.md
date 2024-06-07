---
layout: doc
title: doveadm-deduplicate
---

# doveadm-deduplicate

## NAME

doveadm-deduplicate - Expunge duplicate messages

## SYNOPSIS

**doveadm** [*GLOBAL OPTIONS*] **deduplicate** [**-u** *user* | **-A** | **-F** *file* | **\-\-no-userdb-lookup**] [**-S** *socket_path*] [**-m**] *search_query*

## DESCRIPTION

This command is used to expunge duplicated messages in mailboxes.
**doveadm deduplicate** is mainly useful to revert some (more or less)
accidental duplication of messages, e.g. after **doveadm copy** or
**doveadm import**. [[man,doveadm]] will delete the newest duplicated
messages from the mailbox and keep the oldest.

Deduplication across multiple mailboxes is not supported.

<!-- @include: include/global-options.inc -->

## OPTIONS

<!-- @include: include/option-A.inc -->

<!-- @include: include/option-F-file.inc -->

<!-- @include: include/option-no-userdb-lookup.inc -->

**-m**
:   if the **-m** option is given, [[man,doveadm]] will deduplicate by
    Message-Id header. By default deduplication will be done by message
    GUIDs.

<!-- @include: include/option-S-socket.inc -->

<!-- @include: include/option-u-user.inc -->

## ARGUMENTS

*search_query*
:   expunge duplicates found from messages matching the given search
    query. Typically a search query like '**mailbox** *mailbox_name*
    **OR mailbox** *other_box*' will be sufficient. See
    [[man,doveadm-search-query,,7]] for details.

## EXAMPLE

This example shows how to list and expunge duplicate messages from a
mailbox.

```console
$ doveadm -f table fetch -u jane 'guid uid' mailbox a_Box | sort
guid                             uid
8aad0f0a30169f4bea620000ca356bad 18751
8aad0f0a30169f4bea620000ca356bad 18756
923e301ab9219b4b4f440000ca356bad 18748
923e301ab9219b4b4f440000ca356bad 18753
...

doveadm deduplicate -u jane mailbox a_Box

doveadm -f table fetch -u jane 'guid uid' mailbox a_Box | sort
guid                             uid
8aad0f0a30169f4bea620000ca356bad 18751
923e301ab9219b4b4f440000ca356bad 18748
a7999e1530739c4bd26d0000ca356bad 18749
...
```

<!-- @include: include/reporting-bugs.inc -->

## SEE ALSO

[[man,doveadm]], [[man,doveadm-import]]
