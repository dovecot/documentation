---
layout: doc
title: Mailbox List
---

# Mailbox List

`src/lib-storage/mailbox-list.h` and `mailbox-list-private.h`
describes mailbox list. The purpose of mailbox list is to manage mailbox
storage name &lt;-&gt; physical directory path mapping. Its most important
functions are:

- listing existing mailboxes,

- creating directories for new mailboxes (but not the mailboxes
  themselves, that's storage's job),

- deleting mailboxes,

- renaming mailboxes and

- managing mailbox subscriptions.

Mailbox list code also internally creates and updates mailbox changelog
(in `dovecot.mailbox.log` file), which keeps track of mailbox
deletions, renames and subscription changes. This is primarily useful
when running the `doveadm sync` command.

## Mailbox Names

The mailbox names are configured in [Mail Namespace](mail_namespace).

The same mailbox name can be visible in three different forms:

- Virtual name (commonly called "vname") uses the namespace's configured
  separator and namespace prefix. For example `INBOX/foo/bar`.

- Storage name (commonly called just "name") uses the native separator and
  doesn't have a namespace prefix. For example `foo.bar`.

- Physical directory name on disk can be different again. For example
  with Maildir++ it could be `.../Maildir/.foo.bar` (note the leading
  dot before `foo`). With [[setting,mailbox_list_layout,index]] the directory
  name is the mailbox GUID (e.g.
  `.../mailboxes/d3b07384d113edec49eaa6238ad5ff00`).

The mailbox virtual/storage names can be converted with functions:

- `mailbox_list_get_storage_name()` - Virtual name -&gt; storage name
- `mailbox_list_get_vname()` - Storage name -&gt; virtual name

## Listing Mailboxes

First the list operation is initialized with one of the init functions:

### Init Functions

#### `mailbox_list_iter_init()`

List mailboxes that match the given pattern.

#### `mailbox_list_iter_init_multiple()`

List mailboxes that match any of the given patterns list.

#### `mailbox_list_iter_init_namespaces()`

List matching mailboxes from all namespaces.

- `MAILBOX_LIST_ITER_SKIP_ALIASES` flag skips namespaces that have
  `alias_for` set. You usually want to set this flag to avoid
  processing the same mailbox multiple times.

### List Patterns

The patterns are IMAP-style patterns with '%' and '\*' wildcards as
described by [[rfc,3501]]: '%' matches only up to next hierarchy separator,
while '\*' matches the rest of the string.

### Mailbox Return Flags

These flags control what mailboxes are returned:

#### `MAILBOX_LIST_ITER_NO_AUTO_BOXES`

Don't list INBOX or other autocreated
mailboxes unless they physically exists (i.e. they have been opened once).

#### `MAILBOX_LIST_ITER_SKIP_ALIASES`

Skip namespaces that are aliases to other namespaces
([[setting,namespace_alias_for]]).

#### `MAILBOX_LIST_ITER_STAR_WITHIN_NS`

Change `*` in patterns to not cross namespace boundaries. For example `*o`
returns all mailboxes that end with the `o` letter in the root namespace,
but not in any other namespaces.

#### `MAILBOX_LIST_ITER_SELECT_SUBSCRIBED`

List only subscribed mailboxes.

#### `MAILBOX_LIST_ITER_SELECT_RECURSIVEMATCH`

Currently only useful when combined with `_SELECT_SUBSCRIBED` flag. Then it
adds `MAILBOX_CHILD_SUBSCRIBED` flags for mailboxes whose children are
subscribed. It also lists mailboxes that aren't themselves
subscribed, but have children that do.

#### `MAILBOX_LIST_ITER_SELECT_SPECIALUSE`

List only mailboxes marked with \Special-use flags.

### Mailbox Matching Return Flags

These flags control what is returned for matching mailboxes:

#### `MAILBOX_LIST_ITER_RETURN_NO_FLAGS`

This can be set when you don't care about mailbox flags. They're then set
only if it can be done without any additional disk I/O.

#### `MAILBOX_LIST_ITER_RETURN_SUBSCRIBED`

Return mailbox's subscription state.

#### `MAILBOX_LIST_ITER_RETURN_CHILDREN`

Add "has child mailboxes" or "doesn't have child mailboxes" flag.

#### `MAILBOX_LIST_ITER_RETURN_SPECIALUSE`

Return mailbox's \Special-use flags.

### Other Flags

#### `MAILBOX_LIST_ITER_RAW_LIST`

This should usually be avoided. It ignores ACLs and just returns everything.

### Return Struct

Once listing is initialized, `mailbox_list_iter_next()` can be called
until it returns NULL. The returned mailbox_info struct contains:

#### `vname`

Mailbox's virtual name.

#### `special_use`

Mailbox's \Special-use flags.

#### `ns`:

Mailbox's namespace. This is mainly useful when mailboxes are
listed using `mailbox_list_iter_init_namespaces()`.

#### `flags`

Mailbox flags:

##### `MAILBOX_NOSELECT`

Mailbox exists, but can't be selected. It's
possible that it can be created and then it becomes selectable.
For example with mbox and FS layout the directories aren't
selectable mailboxes.

##### `MAILBOX_NONEXISTENT`

Mailbox doesn't exist. It's listed only because it has child mailboxes that
do exist but don't match the pattern.

Example: `foo/bar` exists, but `foo` doesn't. `%`, `foo` or
`*o` pattern would list `foo`, because it matches the pattern
but its child doesn't. Then again `*`, `*bar` or `%/%` wouldn't
list `foo`, because `foo/bar` matches the pattern (and is also
listed). Something like `*asd*` wouldn't match either `foo` or
`foo/bar` so neither is returned.

##### `MAILBOX_CHILDREN`
##### `MAILBOX_NOCHILDREN`

Mailbox has or doesn't have children. If neither of these flags are set, it's
not known if mailbox has children.

##### `MAILBOX_NOINFERIORS`

Mailbox doesn't have children and none can ever be created. For example with
mbox and FS layout the mailboxes have this flag set, because files can't be
created under files.

##### `MAILBOX_MARKED`
##### `MAILBOX_UNMARKED`

Mailbox has or doesn't have messages with \\Recent flags. If neither is set,
the state is unknown. Because this check is done in a very cheap way,
having `MAILBOX_MARKED` doesn't always mean that there are \\Recent flags.
However, if `MAILBOX_UNMARKED` is returned it is guaranteed to be correct.
(False positives are ok, false negatives are not ok.)

##### `MAILBOX_SUBSCRIBED`

Mailbox is subscribed.

##### `MAILBOX_CHILD_SUBSCRIBED`

Mailbox has a child that is subscribed (and `_SELECT_RECURSIVEMATCH` flag was
set).

##### `MAILBOX_SPECIALUSE_*`

These are for internal use only. Don't use them.

### Deinitialization

Finally the listing is deinitialized with `mailbox_list_iter_deinit()`.
If it returns -1, it means that some mailboxes perhaps weren't listed
due to some internal error.

If you wish to get mailbox_info flags only for a single mailbox, you can
use `mailbox_list_mailbox()`.

## Directory Permissions

`mailbox_list_get_permissions()` and
`mailbox_list_get_dir_permissions()` can be used to get wanted
permissions for newly created files and directories.

- For global files, give NULL as the mailbox name. The permissions are
  then based on the root_dir. If root_dir doesn't exist, it returns
  0700/0600 mode.

- For per-mailbox files, give the mailbox name. The permissions are
  then based on the mailbox's directory.

If changing the group fails with EPERM, `eperm_error_get_chgrp()` can
be used to log a nice and understandable error message.

### Returned Permissions

#### `mode`

Creation mode, like 0600.

#### `gid`

Group that should be set, unless it's `(gid_t)-1`. There are 3
reasons why it could be that:

- directory has g+s bit set, so the wanted group is set automatically

- group is the same as process's effective GID, so it gets set automatically

- mode's group permissions are the same as world permissions, so
  group doesn't matter.

#### `gid_origin`

This string points to the directory where the group (and
permissions in general) was based on, or "defaults" for internal
defaults.
