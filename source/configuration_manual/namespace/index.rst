.. highlight:: none
.. _namespaces:

==========
Namespaces
==========

Dovecot supports fully configurable namespaces. Their original and primary
purpose is to provide Namespace IMAP extension (`RFC
2342 <http://www.faqs.org/rfcs/rfc2342.html>`_) support, which allows giving
IMAP clients hints about where to locate mailboxes and whether they're private,
shared or public.

Dovecot namespaces can be used for several other purposes too:

* Changing the :ref:`namespace-hierarchy-separators`
* Providing backwards compatibility when switching from another IMAP server
* Provides support for :ref:`public <public_shared_mailboxes>` and
  :ref:`shared <user_shared_mailboxes>` mailboxes
* Allows having mails in multiple different locations with possibly different
  formats

Configuration
=============

If the Dovecot configuration doesn't explicitly specify a namespace, the
inbox namespace is created automatically.

Namespace configuration is defined within a dovecot configuration block with
the format::

  namespace <section-name> {
    [... namespace settings ...]
  }

The optional section name is only used internally within configuration. It
allows you to update an existing namespace - by repeating the namespace block
and adding additional configuration settings - or allows userdb to override
namespace settings for specific users, e.g.::

  namespace/section-name/prefix=foo/

Example configuration for default namespace::

  namespace inbox {
    separator = .
    prefix =
    inbox = yes
  }

Settings
========

.. dovecot_core:setting:: namespace
   :values: @string

   Name of the namespace.

   Giving name is optional, but doing so enables referencing the configuration
   later on.

   Example, to name a namespace ``foo``::

     namespace foo {
       [...]
     }


.. dovecot_core:setting:: namespace/alias_for
   :values: @string

   Defines the namespace prefix for purposes of alias detection.

   If multiple namespaces point to the same location, they should be marked as
   aliases against one primary namespace. This avoids duplicating work for
   some commands (listing the same mailbox multiple times).

   :ref:`Mail user variables <variables-mail_user>` can be used.

   .. note:: Alias namespaces often have ``hidden=yes`` and ``list=no`` so
             they are not visible unless clients have specifically configured
             them, and they're typically used when migrating to a different
             namespace prefix for existing users.

   Example::

     namespace {
       # If primary namespace has empty prefix
       alias_for =

       # OR if primary namespace has ``prefix=INBOX/``
       alias_for=INBOX/
     }


.. dovecot_core:setting:: namespace/disabled
   :default: no
   :values: @boolean

   If ``yes``, namespace is disabled and cannot be accessed by user in any way.

   Useful when returned by a userdb lookup to easily configure per-user
   namespaces.


.. dovecot_core:setting:: namespace/hidden
   :default: no
   :values: @boolean

   If ``yes``, namespace will be hidden from IMAP NAMESPACE command.


.. dovecot_core:setting:: namespace/ignore_on_failure
   :default: no
   :values: @boolean

   If namespace :dovecot_core:ref:`namespace/location` fails to load, by
   default the entire session will fail to start. If this is set, this
   namespace will be ignored instead.


.. dovecot_core:setting:: namespace/inbox
   :default: no
   :values: @boolean

   If ``yes``, this namespace will be considered the one holding the INBOX
   folder.

   There can be only one namespace defined like this.


.. dovecot_core:setting:: namespace/list
   :default: yes
   :seealso: @namespace/hidden;dovecot_core
   :values: yes, no, children

   Include this namespace in LIST output when listing its parent's folders.

   Options:

   ============= ============================================================
   Value         Description
   ============= ============================================================
   ``children``  Namespace prefix list listed only if it has child mailboxes.
   ``no``        Namespace and mailboxes not listed unless listing requests
                 explicitly mailboxes under the namespace prefix.
   ``yes``       Namespace and mailboxes are always listed.
   ============= ============================================================

   It is still possible to list the namespace's folders by explicitly asking
   for them. For example, if this setting is ``no``, using ``LIST "" *`` with
   namespace prefix "lazy-expunge/" won't list it, but using ``LIST ""
   lazy-expunge/*`` lists all folders under it.


.. dovecot_core:setting:: namespace/location
   :default: @mail_location;dovecot_core
   :values: @string

   Specifies driver and parameters for physical mailbox storage. It allows an
   override of the ``mail_location`` setting for a namespace.

   :ref:`Mail user variables <variables-mail_user>` can be used.

   Example::

     namespace {
       location = sdbox:/archive/%u
     }


.. dovecot_core:setting:: namespace/order
   :default: 0
   :values: @uint

   Sets display order in IMAP ``NAMESPACE`` command.

   Namespaces are automatically numbered if this setting does not exist.


.. dovecot_core:setting:: namespace/prefix
   :values: @string

   Specifies prefix for namespace.

   .. note:: Must end with
             :dovecot_core:ref:`hierarchy separator <namespace/separator>`.

   :ref:`Mail user variables <variables-mail_user>` can be used.

   Example::

     namespace {
       prefix = Shared/
       separator = /
     }


.. dovecot_core:setting:: namespace/separator
   :default: !'.' for Maildir; '/' for other mbox formats
   :seealso: @namespace-hierarchy-separators
   :values: @string

   Specifies the hierarchy separator for the namespace.

   The separator is a single character, which can't then otherwise be used in
   folder names.

   The commonly used separators are ``.`` and ``/``, but other separators can
   be used as well. For example ``^`` is less likely to be found in normal
   folder names.

   Recommended value is to leave it empty and accept the default value.

   Example::

     namespace {
       separator = /
     }


.. dovecot_core:setting:: namespace/subscriptions
   :default: yes
   :values: @boolean

   Whether subscriptions are stored in this namespace.

   This is usually ``no`` for shared namespaces so that the shared folders'
   subscriptions are stored in the user's primary subscriptions file. If
   ``no``, the subscriptions are stored in the first parent namespace (based
   on the prefix) that has this setting enabled.

   Example: If this setting is ``no`` for a namespace with
   ``prefix=foo/bar/``, Dovecot first sees if there's a ``prefix=foo/``
   namespace with ``subscriptions=yes`` and then a namespace with an empty
   prefix. If neither is found, an error is given.


.. dovecot_core:setting:: namespace/type
   :default: private
   :values: private, shared, public

   The namespace type.  One of:

   ============ ===========================================================
   Type         Description
   ============ ===========================================================
   ``public``   Contains :ref:`public mailboxes <public_shared_mailboxes>`.
   ``private``  Typically contains only user's own private mailboxes.
   ``shared``   Contains other users'
                :ref:`shared mailboxes <user_shared_mailboxes>`.
   ============ ===========================================================

.. _namespace-hierarchy-separators:

Hierarchy Separators
====================

:dovecot_core:ref:`Hierarchy separator <namespace/separator>` specifies the
character that is used to separate the parent mailbox from its child mailbox.
For example if you have a mailbox "foo" with child mailbox "bar", the full
path to the child mailbox would be "foo/bar" with ``/`` as the separator, and
"foo.bar" with ``.`` as the separator.

IMAP clients, Sieve scripts, and many parts of Dovecot configuration use the
configured separator when referring to mailboxes. This means that if you change
the separator, you may break things.

However, changing the separator doesn't change the on-disk "layout separator".

Example:

================================ =========== ======= ============ ===================
``mail_location``                Layout Sep. NS Sep. Mailbox Name Directory
================================ =========== ======= ============ ===================
``maildir:~/Maildir``            .           .       foo.bar      ~/Maildir/.foo.bar/
``maildir:~/Maildir``            .           /       foo/bar      ~/Maildir/.foo.bar/
``maildir:~/Maildir:LAYOUT=fs``  /           .       foo.bar      ~/Maildir/foo/bar/
``maildir:~/Maildir:LAYOUT=fs``  /           /       foo/bar      ~/Maildir/foo/bar/
================================ =========== ======= ============ ===================

.. Note::

    The "namespace separator" changes only the "mailbox name", but doesn't
    change the directory where the mails are stored. The "layout separator" can
    only be changed by changing :ref:`LAYOUT <mail_location_settings-keys>`,
    which also affects the entire directory structure.

The layout separator also restricts the mailbox names. For example if the
layout separator is ``.``, you can't just set separator to ``/`` and create a
mailbox named `foo.bar`. If you need to do this, you can use
:ref:`listescape_plugin` to escape the mailbox names.

A commonly used separator is ``/``. It probably causes the least amount of
trouble with different IMAP clients. The ``^`` separator is troublesome with
Thunderbird. If ``\`` has to be used, it needs to be escaped in configuration::

  namespace {
    separator = "\\"
  }

You should use the same hierarchy separator for all namespaces. All
``list=yes`` namespaces must use the same separator, but if you find it
necessary (e.g. for backwards compatibility namespaces) you may use different
separators for ``list=no`` namespaces.

Values From userdb
==================

To change namespace settings from userdb, you need to return
``namespace/<name>/setting=value``. To create a namespace, make sure you first
return ``namespace=<name>[,<name>,...]`` and settings after this. Note that the
``namespace`` setting must list all the namespaces that are used - there's
currently no way to simply add a namespace.

::

  userdb {
    driver = static
    args = namespace=inbox,special namespace/special/location=sdbox:/var/special/%u namespace/special/prefix=special/
  }

Dovecot Support for Shared Mailboxes
====================================
See :ref:`mailbox sharing <shared_mailboxes>`.

Examples
========

Mixed mbox and Maildir
----------------------

If you have your INBOX as mbox in `/var/mail/username` and the rest of the
mailboxes in Maildir format under `~/Maildir`, you can do this by creating two
namespaces:

::

  namespace {
    separator = /
    prefix = "#mbox/"
    location = mbox:~/mail:INBOX=/var/mail/%u
    inbox = yes
    hidden = yes
    list = no
  }
  namespace {
    separator = /
    prefix =
    location = maildir:~/Maildir
  }

Without the ``list = no`` setting in the first namespace, clients would see the
"#mbox" namespace as a non-selectable mailbox named "#mbox" but with child
mailboxes (the mbox files in the "~/mail" directory), i.e. like a directory.
So specifically with ``inbox = yes``, having ``list = no`` is often desirable.

Backwards Compatibility: UW-IMAP
--------------------------------

When switching from UW-IMAP and you don't want to give users full access to
filesystem, you can create hidden namespaces which allow users to access their
mails using their existing namespace settings in clients.

::

  # default namespace
  namespace inbox {
    separator = /
    prefix =
    inbox = yes
  }
  # for backwards compatibility:
  namespace compat1 {
    separator = /
    prefix = mail/
    hidden = yes
    list = no
    alias_for =
  }
  namespace compat2 {
    separator = /
    prefix = ~/mail/
    hidden = yes
    list = no
    alias_for =
  }
  namespace compat3 {
    separator = /
    prefix = ~%u/mail/
    hidden = yes
    list = no
    alias_for =
  }

Backwards Compatibility: Courier IMAP
-------------------------------------

**Recommended:** You can continue using the same INBOX. namespace as Courier:

::

  namespace inbox {
    separator = .
    prefix = INBOX.
    inbox = yes
  }

**Alternatively:** Create the INBOX. as a compatibility name, so old clients
can continue using it while new clients will use the empty prefix namespace:

::

  namespace inbox {
    separator = /
    prefix =
    inbox = yes
  }

  namespace compat {
    separator = .
    prefix = INBOX.
    inbox = no
    hidden = yes
    list = no
    alias_for =
  }

The ``separator=/`` allows the INBOX to have child mailboxes. Otherwise with
``separator=.`` it wouldn't be possible to know if "INBOX.foo" means INBOX's
"foo" child or the root "foo" mailbox in "INBOX." compatibility namespace. With
``separator=/`` the difference is clear with "INBOX/foo" vs. "INBOX.foo".

The alternative configuration is not recommended, as it may introduce issues:

* Although clients may do ``LIST INBOX.*``, they may still do ``LSUB *``,
  resulting in mixed results.
* If clients used empty namespace with Courier, they now see the mailboxes with
  different names, resulting in redownloading of all mails (except INBOX).
* Some clients may have random errors auto-detecting the proper default folders
  (Sent, Drafts etc) if the client settings refer to old paths while the server
  lists new paths.

See also `Migration/Courier <https://wiki.dovecot.org/Migration/Courier>`_

Per-user Namespace Location From SQL
------------------------------------

You need to give the namespace a name, for example "docs" below:

::

  namespace docs {
    type = public
    separator = /
    prefix = Public/
  }

Then you have an SQL table like:

.. code-block:: sql

  CREATE TABLE Namespaces (
    ..
    Location varchar(255) NOT NULL,
    ..
  )

Now if you want to set the namespace location from the Namespaces table, use
something like:

.. code-block:: sql

  user_query = SELECT Location as 'namespace/docs/location' FROM Namespaces WHERE ..

If you follow some advice to separate your "INBOX", "shared/" and "public/"
namespaces by choosing "INBOX/" as your prefix for the inboxes you will see,
that you run into troubles with subscriptions. Thats, because there is no
parent namespace for "shared/" and "public/" if you set ``subscriptions = no``
for those namespaces. If you set ``subscriptions = yes`` for "shared/" and
"public/" you will see yourself in the situation, that all users share the same
subscription files under the location of those mailboxes. One good solution is,
to create a so called "hidden subscription namespace" with subscriptions turned
on and setting ``subscriptions = no`` for the other namespaces:

::

  namespace subscriptions {
    subscriptions = yes
    prefix = ""
    list = no
    hidden = yes
  }

  namespace inbox {
    inbox = yes
    location =
    subscriptions = no

    mailbox Drafts {
      auto = subscribe
      special_use = \Drafts
    }
    mailbox Sent {
      auto = subscribe
      special_use = \Sent
    }
    mailbox "Sent Messages" {
      special_use = \Sent
    }
    mailbox Spam {
      auto = subscribe
      special_use = \Junk
    }
    mailbox Trash {
      auto = subscribe
      special_use = \Trash
    }
    prefix = INBOX/
    separator = /
  }
  namespace {
    type = shared
    prefix = shared/%%u/
    location = mdbox:%%h/mdbox:INDEXPVT=%h/mdbox/shared
    list = children
    subscriptions = no
  }
  namespace {
    type = public
    separator = /
    prefix = public/
    location = mdbox:/usr/local/mail/public/mdbox:INDEXPVT=%h
    subscriptions = no
    list = children
  }

.. _mailbox_settings:

================
Mailbox Settings
================

Mailbox configuration is defined within a dovecot configuration block, inside
of a ``namespace`` block, with the format::

  mailbox <mailbox-name> {
    [... mailbox settings ...]
  }

The mailbox-name specifies the full mailbox name; if it has spaces, you can
put it into quotes::

  mailbox "Test Mailbox {
    [...]
  }

Settings
========

.. dovecot_core:setting:: namespace/mailbox/auto
   :default: no
   :values: create, no, subscribe

   Autocreate and/or subscribe to the mailbox?

   ============== ==================================
   Value          Description
   ============== ==================================
   ``create``     Autocreate but don't autosubscribe
   ``no``         Don't autocreate or autosubscribe
   ``subscribe``  Autocreate and autosubscribe
   ============== ==================================

   Autocreated mailboxes are created lazily to disk only when accessed for
   the first time. The autosubscribed mailboxes aren't written to
   subscriptions file, unless SUBSCRIBE command is explicitly used for them.


.. dovecot_core:setting:: namespace/mailbox/autoexpunge
   :added: v2.2.20
   :default: 0
   :seealso: @namespace/mailbox/autoexpunge_max_mails;dovecot_core
   :values: @time

   Expunge all mails in this mailbox whose saved-timestamp is older than this
   value.

   For IMAP and POP3 this happens after the client is already disconnected.

   For LMTP this happens when the user's mail delivery is finished. Note that
   if there are multiple recipients this may delay delivering the mails to the
   other recipients.

   :dovecot_core:ref:`mailbox_list_index` = ``yes`` is highly recommended when
   using this setting, as it avoids actually opening the mailbox to see if
   anything needs to be expunged.


.. dovecot_core:setting:: namespace/mailbox/autoexpunge_max_mails
   :added: v2.2.25
   :default: 0
   :values: @uint

   Mails are autoexpunged until mail count is at or below this number of
   messages.

   Once this threshold has been reached,
   :dovecot_core:ref:`namespace/mailbox/autoexpunge` processing is done.


.. dovecot_core:setting:: namespace/mailbox/special_use
   :values: @string

   Space-separated list of SPECIAL-USE
   (`RFC 6154 <http://www.faqs.org/rfcs/rfc6154.html>`_) flags to broadcast
   for the mailbox.

   There are no validity checks, so you could specify anything you want here,
   but it's not a good idea to use other than the standard ones specified in
   the RFC.

   .. note:: Bug in v2.2.30-v2.2.33: if special-use flags are used,
             SPECIAL-USE needs to be added to post-login CAPABILITY response
             as RFC 6154 mandates. You can do this with
             ``imap_capability = +SPECIAL-USE``


Example
=======

::

  namespace inbox {
    # the namespace prefix isn't added again to the mailbox names.
    #prefix = INBOX.
    inbox = yes
    # ...

    mailbox Trash {
      auto = no
      special_use = \Trash
    }
    mailbox Drafts {
      auto = no
      special_use = \Drafts
    }
    mailbox Sent {
      auto = subscribe # autocreate and autosubscribe the Sent mailbox
      special_use = \Sent
    }
    mailbox "Sent Messages" {
      auto = no
      special_use = \Sent
    }
    mailbox Spam {
      auto = create # autocreate Spam, but don't autosubscribe
      special_use = \Junk
    }
    mailbox virtual/All { # if you have a virtual "All messages" mailbox
      auto = no
      special_use = \All
    }
  }
