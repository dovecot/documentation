---
layout: doc
title: Mail Namespace
---

# Mail Namespace

`src/lib-storage/mail-namespace.h` describes mail namespaces. See
[[link,namespaces]] for more information about what they are actually about.

## Hierarchy Separators and Namespace Prefixes

A namespace and [mailbox_list](mailbox_list) has 1:1
relationship. A namespace is mainly about dealing with hierarchy separators
and namespace prefixes, which mailbox list doesn't know or care much about.

Mailbox lists have their native hierarchy separators. For example with
FS layout the separator is '/', because child mailboxes are physically
in subdirectories and '/' is the separator for directories. With
Maildir++ layout the separator is hardcoded to '.' in the
maildir directory name, so that's its native hierarchy separator.

Dovecot allows namespace separators to be configurable, so namespaces have two
separators:

- `mail_namespace_get_sep()` returns the namespace's configured separator.
  If unset, this uses the mailbox_list's default separator.

- `mailbox_list_get_hierarchy_sep()` returns the mailbox_list's native
  separator.

All `list=yes` namespaces must use the same configured hierarchy separator.
This is returned by `mail_namespaces_get_root_sep()`.

Namespaces also have prefixes. The prefixes are visible for
users/clients and they appear to be part of the actual mailbox name. One
commonly used namespace prefix is "INBOX.", so all mailboxes (other than
INBOX itself) appear to be children of the INBOX.

If all configured namespaces have a non-empty prefix, Dovecot internally
creates a namespace with empty prefix. This way functions that find a namespace
for a given mailbox name will always be able to return a valid namespace, so
callers don't have to handle "nonexistent namespace" error.

See [mailbox names](mailbox_list#mailbox-names) for how
mailbox names behave with namespace configuration.

## Users and Owners

When accessing other users' shared mailboxes, there's a difference
between a namespace's user and owner:

- `ns->user` points to the mail user actually accessing the mailbox
  (i.e. the IMAP connection's mail user).

- `ns->owner` points to the mail user who shared the mailbox.

The distinction can be important sometimes. For example if user adds or
removes messages from the shared mailbox, the owner's quota must be
updated instead of the user's.

## Functions

Functions about finding namespaces:

- `mail_namespace_find()` returns namespace for given virtual name.
  It also has a few variations:

  - `mail_namespace_find_unalias()` changes the behavior for namespaces
    that are aliases to another namespace ([[setting,namespace_alias_for]]).
    Then it returns the unaliased namespace and modifies the mailbox name.

  - `mail_namespace_find_visible()` skips `hidden=yes` namespaces.

  - `mail_namespace_find_subscribable()` skips `subscriptions=no`
    namespaces.

  - `mail_namespace_find_unsubscribable()` skips `subscriptions=yes`
     namespaces.

- `mail_namespace_find_inbox()` returns the namespace with `inbox=yes`.
  There is always exactly one such namespace.

- `mail_namespace_find_prefix()` returns the namespace that has the given
  prefix.

  - `mail_namespace_find_prefix_nosep()` does the same, but ignores
    the trailing separator in prefix (e.g. "foo" would find namespace
    with prefix=foo/).

A single namespace can in theory point to multiple storages. The
`ns->storage` points to the default storage, while `ns->all_storages` is
an array of all storages that the namespace can access. Currently there is no
actual code that adds more than one storage to a namespace, but this might
change some day so try to avoid preventing that. When creating new mailboxes,
`mail_namespace_get_default_storage()` returns the storage that should
be used. For other purposes you should find the storage via
[mailbox list](mailbox_list) functions.
