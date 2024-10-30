---
layout: doc
title: doveadm-indexer
dovecotComponent: core
---

# doveadm-indexer(1) - Commands related to managing the indexer process

## SYNOPSIS

**doveadm** [*GLOBAL OPTIONS*] **indexer** *command* [*OPTIONS*] [*ARGUMENTS*]

## DESCRIPTION

**doveadm indexer** can be used to manage the indexer process.

<!-- @include: include/global-options-formatter.inc -->

## COMMANDS

### indexer add

**doveadm** [*GLOBAL OPTIONS*] indexer add
  [**-h**]
  [**-n** *max_recent*]
  *user* *mailbox*

Add indexing request for the given *user* and the *mailbox* to the
indexer queue. It works the same as the **doveadm index -q** command.

**-h**
:   Add the indexing request to the head of the queue. By default the
    request is added to the tail of the queue.

**-n** *max_recent*
:   An integer value, which specifies the maximum number of \\Recent
    messages in mailboxes. If the mailbox contains more than *max_recent*
    messages with \\Recent flag set, the mailbox will not be indexed.
    This may be useful to avoid unnecessary indexing for large mailboxes
    that are never opened.

### indexer remove

**doveadm** [*GLOBAL OPTIONS*] indexer remove *user_mask* [*mailbox_mask*]

Remove all indexer requests for the matching *user_mask* (and *mailbox_mask*).
It's possible to use wildcards. Requests that are currently processed by
indexer-worker are not listed; use **doveadm kick** instead to kick
them.

### indexer list

**doveadm** [*GLOBAL OPTIONS*] indexer list *user_mask*

List all the queued indexing requests matching *user_mask*. It's possible to
use wildcards. Requests that are currently processed by indexer-worker are
not listed; use **doveadm who** instead to see them.

<!-- @include: include/reporting-bugs.inc -->

## SEE ALSO

[[man,doveadm]]
