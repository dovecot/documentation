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

*search_query*
:   Search query to run against the full text search index. See
    [[man,doveadm-search-query,,7]] for details.

*text*
:   Text to tokenize into indexable tokens.

## COMMANDS

### fts expand

**doveadm** [*GLOBAL OPTIONS*] fts expand
  [**-u** *user* | **-A** | **-F** *file* | **\-\-no-userdb-lookup**]
  [**-S** *socket_path*] *search_query*

Expands the given search query using the full text search backend for the
user. Prints the expanded search query as a single line.

### fts lookup

**doveadm** [*GLOBAL OPTIONS*] fts lookup
  [**-u** *user* | **-A** | **-F** *file* | **\-\-no-userdb-lookup**]
  [**-S** *socket_path*] *search_query*

Search mailboxes using the full text search backend. Prints the mailbox name
and matching UID sequence ranges (definite matches, and maybe matches if any)
for each mailbox.

### fts optimize

**doveadm** [*GLOBAL OPTIONS*] fts optimize
  [**-u** *user* | **-A** | **-F** *file* | **\-\-no-userdb-lookup**]
  [**-S** *socket_path*] [*namespace*]

Optimize the full text search index. This is also done automatically by
the full text search engines, but this enforces it to happen.

### fts rescan

**doveadm** [*GLOBAL OPTIONS*] fts rescan
  [**-u** *user* | **-A** | **-F** *file* | **\-\-no-userdb-lookup**]
  [**-S** *socket_path*] [*namespace*]

Scan what mails exist in the full text search index and compare those to
what actually exist in mailboxes. This removes mails from the index that
have already been expunged and makes sure that the next **doveadm
index** will index all the missing mails (if any). Note that currently
most FTS drivers do not implement this properly, but instead they
delete all the FTS indexes. This may change in the future versions.

### fts tokenize

**doveadm** [*GLOBAL OPTIONS*] fts tokenize
  [**-u** *user* | **-A** | **-F** *file* | **\-\-no-userdb-lookup**]
  [**-S** *socket_path*] [**-l** *language*] *text* ...

Tokenize the specified text using the FTS tokenizer and filter configured for
the user. Outputs the generated search tokens, one per line.

**-l** *language*
:   The language to use for tokenization and filtering. If not specified,
    the language is automatically detected.

<!-- @include: @docs/core/man/include/doveadm-fts-includes.inc -->

<!-- @include: include/reporting-bugs.inc -->

## SEE ALSO

[[man,doveadm]], [[man,doveadm-search-query,,7]]

Additional resources:

- [[plugin,fts]]
