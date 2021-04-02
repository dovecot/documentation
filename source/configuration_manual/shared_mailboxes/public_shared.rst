.. _public_shared_mailboxes:

================
Public Mailboxes
================

Public mailboxes are typically mailboxes that are visible to all users
or to large user groups. They are created by defining a public
namespace, under which all the shared mailboxes are. See
:ref:`admin_manual_permissions_in_shared_mailboxes`
for issues related to filesystem permissions. See
:ref:`Namespaces <namespaces>` for details of how namespaces are configured.

For example to create a public Maildir mailboxes, use:

::

   # User's private mail location
   mail_location = maildir:~/Maildir

   # When creating any namespaces, you must also have a private namespace:
   namespace {
     type = private
     separator = /
     prefix =
     #location defaults to mail_location.
     inbox = yes
   }

   namespace {
     type = public
     separator = /
     prefix = Public/
     location = maildir:/var/mail/public
     subscriptions = no
   }

In the above example, you would then create Maildir mailboxes under the
``/var/mail/public/`` directory.

Note that with Maildir format Dovecot uses Maildir++ layout by default for
folders, where the folder names must begin with a "." or Dovecot will ignore
them. You can also optionally use the `"fs" layout <maildir_mbox_format>`_
if you want the directory structure to look like:

-  ``/var/mail/public/`` (root dir)

-  ``/var/mail/public/info/`` (maildir folder)

-  ``/var/mail/public/company/`` (maildir folder)

Per-user \\Seen flag
----------------------------

The recommended way to enable private flags for shared
mailboxes is to create private indexes with :INDEXPVT=<path>. This
creates dovecot.index.pvt[.log] files, which contain only the message
UIDs and the private flags. Currently the list of private flags is
hardcoded only to the \\Seen flag.

Example:

::

   namespace {
     type = public
     separator = /
     prefix = Public/
     location = maildir:/var/mail/public:INDEXPVT=~/Maildir/public
     subscriptions = no
   }

Maildir: Keyword sharing
~~~~~~~~~~~~~~~~~~~~~~~~

Make sure you don't try to use per-user CONTROL directory. Otherwise
``dovecot-keywords`` file doesn't get shared and keyword mapping breaks.

Subscriptions
-------------

Typically you want each user to have control over their own
subscriptions for mailboxes in public namespaces. This is why you should
set ``subscriptions=no`` to the namespace. Dovecot will then use the
parent namespace's subscriptions file. If you don't otherwise have a
namespace with empty prefix, create one:

::

        namespace subscriptions {
          prefix =
          separator = /
          subscriptions = yes
          hidden = yes
          list = no
          alias_for = INBOX/ # the INBOX namespace's prefix
          location = <same as mail_location>:SUBSCRIPTIONS=subscriptions-shared
        }


Read-only mailboxes
-------------------

Read-only mboxes
~~~~~~~~~~~~~~~~

If you have a read-only directory structure containing mbox files,
you'll need to store index files elsewhere:

::

   namespace {
     type = public
     prefix = Public/
     location = mbox:/var/mail/public/:INDEX=/var/indexes/public
     subscriptions = no
   }

In the above example all the users would still be sharing the index
files, so you might have problems with filesystem permissions.
Alternatively you could place the index files under user's home
directory.

Read-only Maildirs
~~~~~~~~~~~~~~~~~~

If your Maildir is read-only, the control and index files still need to
be created somewhere. You can specify the path for these by appending
``:CONTROL=<path>:INDEX=<path>`` to mail location. The path may point to
a directory that is shared among all users, or to a per-user path. Note
that if the Maildir has any keywords, the per-user control directory
breaks the keywords since there is no ``dovecot-keywords`` file.

When configuring multiple namespaces, the CONTROL/INDEX path must be
different for each namespace. Otherwise if namespaces have identically
named mailboxes their control/index directories will conflict and cause
all kinds of problems.

If you put the control files to a per-user directory, you must also put
the index files to a per-user directory, otherwise you'll get errors. It
is however possible to use shared control files but per-user index
files, assuming you've set up permissions properly.

::

   namespace {
     type = public
     separator = /
     prefix = Public/
     location = maildir:/var/mail/public:CONTROL=~/Maildir/public:INDEX=~/Maildir/public
     subscriptions = no
   }
   namespace {
     type = public
     separator = /
     prefix = Team/
     location = maildir:/var/mail/team:CONTROL=~/Maildir/team:INDEX=~/Maildir/team
     subscriptions = no
   }

Example: Public mailboxes with ACLs
-----------------------------------

See :ref:`ACL <acl>` for more information about ACLs.

::

   namespace {
     type = public
     separator = .
     prefix = public.
     location = maildir:/var/mail/public
     subscriptions = no
     list = children
   }

   plugin {
     acl = vfile
   }

It's important that the namespace type is "public" regardless of whether
you set the namespace prefix to "shared." or something else.

After this you have to place ``dovecot-acl`` files in every
mailbox/folder below ``/var/mail/public`` with rights for that folder
(e.g. ``user=someone lr``).

The :ref:`plugin-acl-lookup-dict-setting-acl_shared_dict` setting is not relevant for public mailboxes (only
for shared).
