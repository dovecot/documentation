---
layout: doc
title: doveadm-fts
dovecotComponent: core
---

# doveadm-fts(1) - Manipulate the Full Text Search (FTS) index

## SYNOPSIS

**doveadm** [*GLOBAL OPTIONS*] **fts** *command* [*OPTIONS*] [*ARGUMENTS*]

## DESCRIPTION

The doveadm fts *COMMANDS* can be used to manipulate the Full Text
Search (FTS) index.

<!-- @include: include/global-options.inc -->

This command uses by default the output formatter **flow** (without the
*key*=prefix).

## OPTIONS

<!-- @include: include/option-A.inc -->

<!-- @include: include/option-F-file.inc -->

<!-- @include: include/option-no-userdb-lookup.inc -->

<!-- @include: include/option-S-socket.inc -->

<!-- @include: include/option-u-user.inc -->

## ARGUMENTS

*namespace*
:   The name of a namespace, e.g. the name of the shared namespace. When
    no namespace was given, the user's private namespace will be used.

## COMMANDS

### fts optimize

**doveadm** [*GLOBAL OPTIONS*] fts optimize [**-u** *user* | **-A** | **-F** *file* | **\-\-no-userdb-lookup**] [**-S** *socket_path*] [*namespace*]

Optimize the full text search index. This is also done automatically by
the full text search engines, but this enforces it to happen.

### fts rescan

**doveadm** [*GLOBAL OPTIONS*] fts rescan [**-u** *user* | **-A** | **-F** *file* | **\-\-no-userdb-lookup**] [**-S** *socket_path*] [*namespace*]

Scan what mails exist in the full text search index and compare those to
what actually exist in mailboxes. This removes mails from the index that
have already been expunged and makes sure that the next **doveadm
index** will index all the missing mails (if any). Note that currently
most FTS backends do not implement this properly, but instead they
delete all the FTS indexes. This may change in the future versions.

### fts check fast

**doveadm** [*GLOBAL OPTIONS*] fts check fast [**-u** *user* | **-A** | **-F** *file* | **\-\-no-userdb-lookup**] [**-S** *socket_path*] [**-\-refresh**] [**-\-print-mismatches-only**] [*namespace*]

This command exists only when the fts_dovecot plugin (Dovecot Pro FTS) is
loaded.

This command can be used to check FTS indexes for consistency. It performs
a fast check using only information in local caches (fts.S, metacache).

**-\-refresh**
:   Refresh any necessary local caches for the command to run successfully.
    This can be used if the command otherwise fails with exit code 68.

**-\-print-mismatches-only**
:    Print only mailboxes that have inconsistencies.

Exit codes:

**0**
:   The mailbox is fully consistent

**2**
:   The mailbox is not fully consistent

**68**
:   There is not enough information in local metacache to know whether the
    mailbox is fully consistent. Use either the **-\-refresh** parameter or
    the "full" check.

### fts check full

**doveadm** [*GLOBAL OPTIONS*] fts check full [**-u** *user* | **-A** | **-F** *file* | **\-\-no-userdb-lookup**] [**-S** *socket_path*] [**-\-print-details**] [**-\-print-mismatches-only**] [*namespace*]

This command exists only when the fts_dovecot plugin (Dovecot Pro FTS) is
loaded.

This command can be used to check FTS indexes for consistency. It performs
a full check to give detailed output of inconsistencies.

**-\-print-details**
:   Print also IMAP UID numbers and FTS triplet names for each email.

**-\-print-mismatches-only**
:   Print only mailboxes (or emails, with **-\-print-details**) that have
    inconsistencies.

Exit codes:

**0**
:   The mailbox is fully consistent

**2**
:   The mailbox is not fully consistent

<!-- @include: include/reporting-bugs.inc -->

## SEE ALSO

[[man,doveadm]], [[man,doveadm-search-query,,7]]

Additional resources:

- [[plugin,fts]]
