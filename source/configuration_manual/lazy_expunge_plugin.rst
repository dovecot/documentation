.. _lazy_expunge_plugin:

============
Lazy Expunge
============

The lazy expunge plugin provides a "second-chance" to recover messages that
would otherwise be deleted from a mailbox by user action.

It does this by moving the message to a defined location (either a mailbox, or
a namespace -- see below for further details) when a user deletes the message
from a mailbox.

This behavior is useful for a variety of reasons:

#. Protect against misconfigured clients (e.g. POP3 client that deletes all
   messages)
#. Protect against accidental deletion (user error)
#. Archiving

Generally, lazy-expunge is configured so that the expunged mails are not
counted in the user's quota.  Unless being used for archiving, autoexpunge
should be used to prune the mailbox to control storage usage.

Settings
========

See :ref:`plugin-lazy-expunge`.

Configuration
=============

.. _lazy_expunge_plugin-storage_locations:

Storage Locations
-----------------

mailbox
^^^^^^^

.. dovecotadded:: 2.2.24

Messages that are expunged are moved to a single mailbox.

This is the simplest configuration. The mailbox is created automatically.

You probably also want to hide it with an :ref:`ACL <acl>` from the user, if
recovery is only expected to be an action performed by an admin/operator.

To move to a mailbox, do NOT add a trailing delimiter to the
:dovecot_plugin:ref:`lazy_expunge` setting.

Example configuration:

.. code-block:: none

  namespace inbox {
    mailbox .EXPUNGED {
      autoexpunge = 7days
      autoexpunge_max_mails = 100000
    }
  }

  mail_plugins = $mail_plugins lazy_expunge acl
  plugin {
    # Move messages to an .EXPUNGED mailbox
    lazy_expunge = .EXPUNGED

    # Define ACL so that user cannot list the .EXPUNGED mailbox
    acl = vfile:/etc/dovecot/dovecot.acl

    # Expunged messages most likely don't want to be included in quota:
    quota_rule = .EXPUNGED:ignore
  }

Where ``/etc/dovecot/dovecot.acl`` contains:

.. code-block:: none

  .EXPUNGED owner rwstipekxa

You could also leave the permissions empty if you don't want to allow clients
to access it at all.

namespace
^^^^^^^^^

.. dovecotdeprecated:: 2.3.0

Expunged messages are moved to mailbox(es) within a defined namespace

When a message is expunged from mailbox ``<name>``, it's moved to a mailbox
``<name>`` in the expunge namespace. When an entire mailbox ``<name>`` is
deleted, it's moved to this namespace as ``<name>``. If the mailbox already
exists in the expunge namespace, the contents are merged.

To move to a namespace, you MUST add a trailing delimiter to the
``lazy_expunge`` argument.  Example: if the namespace delimiter is ``/``,
and you want to move to the ``.EXPUNGED`` namespace, then the
:dovecot_plugin:ref:`lazy_expunge` setting should be set to
``.EXPUNGED/``.

Example configuration:

.. code-block:: none

  # Default namespace
  namespace {
    prefix =
    separator = /
    inbox = yes
  }

  # Namespace for lazy_expunge plugin
  namespace {
    prefix = .EXPUNGED/
    hidden = yes
    list = no
    separator = /
    location = maildir:~/Maildir/expunged
  }

  mail_plugins = $mail_plugins lazy_expunge
  plugin {
    # Move expunged messages into the .EXPUNGED namespace
    lazy_expunge = .EXPUNGED/
  }

mdbox
"""""

With `mdbox <dbox_mbox_format>`, use different
``MAILBOXDIRs`` (so copying between namespaces works quickly within the same
storage), but otherwise exactly the same paths (``INDEX``, ``control``):

.. code-block:: none

  # Default namespace
  namespace {
    prefix =
    inbox = yes
    location = mdbox:~/mdbox:INDEX=/var/index/%d/%n
    separator = /
  }

  # lazy_expunge namespace(s)
  namespace {
    prefix = .EXPUNGED/
    hidden = yes
    list = no
    separator = /
    subscriptions = no

    location = mdbox:~/mdbox:INDEX=/var/index/%d/%n:MAILBOXDIR=expunged

    # If mailbox_list_index=yes is enabled, it needs a separate index file
    # (v2.2.28+):
    #location = mdbox:~/mdbox:INDEX=/var/index/%d/%n:MAILBOXDIR=expunged:LISTINDEX=expunged.list.index
  }

Copy Only the Last Instance
---------------------------

If a mail has multiple copies within a user account, each copy is normally
moved to the lazy expunge storage when it's expunged.

Example: this may happen when moving a message to Trash, as clients can issue
IMAP COPY command to copy the message to Trash before expunging the message
from the original mailbox.  Deleting later from Trash would result in two
copies of the same message in the lazy expunge storage.

With v2.2+ you can enable
:dovecot_plugin:ref:`lazy_expunge_only_last_instance` to copy
only the last instance to the expunge storage.  This ensures that only a single
copy of a message will appear in the expunge storage.

Note that this feature only works with certain storage setups; see
:dovecot_plugin:ref:`lazy_expunge_only_last_instance` for the
list of supported storages.

Quota
-----

Generally, it is desired that messages in expunge storage are NOT
counted towards user quota, as the messages seen by the user will not
match-up with the size of the quota otherwise (especially if expunge storage
is hidden from users via ACL).

Example to exclude expunge storage from the quota:

.. code-block:: none

   plugin {
     quota = count:User quota
     quota_rule = *:storage=1GB
     # Exclude .EXPUNGED mailbox from the quota
     quota_rule2 = .EXPUNGED:ignore
   }

See :ref:`quota`.

Cleaning up
===========

doveadm
-------

Doveadm can be used to manually clean expunge storage.

Example to delete all messages in ``.EXPUNGED`` namespace older than one day:

.. code-block:: none

  doveadm expunge mailbox '.EXPUNGED/*' savedsince 1d

autoexpunge
-----------

Set autoexpunge configuration for expunge storage to automatically clean
old messages.

See :ref:`namespaces`.

Obox Settings
=============

Lazy expunge allows reduction of Cassandra dictmap lookups by removing the
lockdir setting and enabling the :dovecot_plugin:ref:`obox_track_copy_flags`
setting.

.. code-block:: none

   mail_plugins = $mail_plugins lazy_expunge
   plugin {
     lazy_expunge = .EXPUNGED
     # If Cassandra w/obox is used:
     obox_track_copy_flags = yes
  }

========
Dumpster
========

See :ref:`dumpster_config` for information on how to configure lazy_expunge
with the OX Dumpster module.
