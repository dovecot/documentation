.. _lib-storage_mail_namespace:

==============
Mail Namespace
==============

``src/lib-storage/mail-namespace.h`` describes mail namespaces. See
:ref:`Namespaces <namespaces>` for more information about what they
are actually about.

Hierarchy separators and namespace prefixes
-------------------------------------------

A namespace and :ref:`mailbox list <lib-storage_mailbox_list>` has 1:1
relationship. A namespace is mainly about dealing with hierarchy separators
and namespace prefixes, which mailbox list doesn't know or care much about.

Mailbox lists have their native hierarchy separators. For example with
FS layout the separator is '/', because child mailboxes are physically
in subdirectories and '/' is the separator for directories. With
Maildir++ layout the separator is (currently) hardcoded to '.' in the
maildir directory name, so that's its native hierarchy separator.

Dovecot allows separators to be configurable, so namespaces have two
separators:

-  ``ns->sep`` is the configured virtual separator, which defaults to
   same as native separator.

-  ``ns->real_sep`` is the native separator.

Namespaces also have prefixes. The prefixes are visible for
users/clients and they appear to be part of the actual mailbox name. One
commonly used namespace prefix is "INBOX.", so all mailboxes (other than
INBOX itself) appear to be children of the INBOX.

So the same mailbox can be visible in three different forms:

-  Virtual name uses the virtual separator and namespace prefix. For
   example "INBOX/foo/bar".

-  Storage name uses the native separator and doesn't have a namespace
   prefix. For example "foo.bar".

-  Physical directory name on disk can be different again. For example
   with Maildir++ it could be ".../Maildir/.foo.bar" (not the leading
   dot before "foo").

Users and owners
----------------

When accessing other users' shared mailboxes, there's a difference
between a namespace's user and owner:

-  ``ns->user`` points to the mail user actually accessing the mailbox
   (e.g. the IMAP connection's mail user).

-  ``ns->owner`` points to the mail user who shared the mailbox.

The distinction can be important sometimes. For example if user adds or
removes messages from the shared mailbox, the owner's quota must be
updated instead of the user's.

Functions
---------

Functions about finding namespaces:

-  ``mail_namespace_find()`` returns namespace for given virtual name
   and changes the virtual name -> storage name. It also has a few
   variations:

   -  ``mail_namespace_find_visible()`` skips hidden=yes namespaces.

   -  ``mail_namespace_find_subscribable()`` skips subscriptions=no
      namespaces.

   -  ``mail_namespace_find_unsubscribable()`` skips subscriptions=yes
      namespaces.

-  ``mail_namespace_find_inbox()`` returns the namespace with inbox=yes.
   (There can be only one.)

-  ``mail_namespace_find_prefix()`` returns namespace that has the given
   prefix.

   -  ``mail_namespace_find_prefix_nosep()`` does the same, but ignores
      the trailing separator in prefix (e.g. "foo" would find namespace
      with prefix=foo/).

Functions about translating between virtual and storage names when the
namespace is known:

-  ``mail_namespace_fix_sep()`` changes virtual separators -> native
   separators.

-  ``mail_namespace_get_storage_name()`` changes virtual name -> storage
   name.

-  ``mail_namespace_get_vname()`` changes storage name -> virtual name.

-  ``mail_namespace_update_name()`` returns FALSE if virtual name
   doesn't actually match the given namespace. Otherwise returns TRUE
   and changes virtual name -> storage name.

A single namespace can currently point to only a single storage, but
there is already some code that attempts to make the transition to
multiple storages per namespace easier. In general you shouldn't try to
access ``ns->storage`` directly. When creating new mailboxes,
``mail_namespace_get_default_storage()`` returns the storage that should
be used. For other purposes you should find the storage via :ref:`mailbox
list <lib-storage_mailbox_list>` functions.
