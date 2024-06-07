---
layout: doc
title: doveadm-index
---

# doveadm-index

## NAME

doveadm-index - Index mailboxes

## SYNOPSIS

**doveadm** [*GLOBAL OPTIONS*] **index** [**-S** *socket_path*] **-A** [**-q**] [**-n** *max_recent*] *mailbox*

**doveadm** [*GLOBAL OPTIONS*] **index** [**-S** *socket_path*] **-F** *file* [**-q**] [**-n** *max_recent*] *mailbox*

**doveadm** [*GLOBAL OPTIONS*] **index** [**-S** *socket_path*] **\-\-no-userdb-lookup** [**-q**] [**-n** *max_recent*] *mailbox*


**doveadm** [*GLOBAL OPTIONS*] **index** [**-S** *socket_path*] **-u** *user* [**-q**] [**-n** *max_recent*] *mailbox*

## DESCRIPTION

Add unindexed messages in a mailbox into index/cache file. If full text
search is enabled, also add unindexed messages to the fts database.

The caching adds only the fields that were previously added to the
mailbox's caching decisions, so it won't do anything useful for
mailboxes that user's client hasn't accessed yet. You can use **doveadm
dump** command to show a specific mailbox's current caching decisions.

Messages can also be added automatically to full text search index
using:

::: code-group
```[/etc/dovecot/conf.d/90-plugin.conf]
plugin {
  ...
  fts_autoindex = yes
}
```
:::

<!-- @include: include/global-options.inc -->

## OPTIONS

<!-- @include: include/option-A.inc -->

<!-- @include: include/option-F-file.inc -->

**-n** *max_recent*
:   An integer value, which specifies the maximum number of \\Recent
    messages in mailboxes. If the mailbox contains more than *max_recent*
    messages with \\Recent flag set, the mailbox will not be indexed.
    This may be useful to avoid unnecessary indexing for large mailboxes
    that are never opened.

<!-- @include: include/option-no-userdb-lookup.inc -->

**-q**
:   Queues the indexing to be run by indexer process. Without -q the
    indexing is done directly by the [[man,doveadm]] process. Some
    backends can't handle multiple processes updating the indexes
    simultaneously, so -q should usually be used on production.

<!-- @include: include/option-S-socket.inc -->

<!-- @include: include/option-u-user.inc -->

## ARGUMENTS

*mailbox*
:   The name of the mailbox to index.

## EXAMPLE

Index bob's INBOX:

```console
$ doveadm index -u bob INBOX
```

<!-- @include: include/reporting-bugs.inc -->

## SEE ALSO

[[man,doveadm]]
