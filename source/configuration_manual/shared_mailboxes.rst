.. _shared_mailboxes:

=================
Shared mailboxes
=================

Dovecot can support mailbox sharing in several different ways:

 * :ref:`public_shared_mailboxes`: Shared mailboxes created by administrators.
 * :ref:`user_shared_mailboxes`: Users sharing their mailboxes to other users.
 * :ref:`Symlinking mailboxes <sharing_with_symlinks>`: Quick and dirty way of sharing a few mailboxes.
 * :ref:`mailbox_sharing_in_cluster`

 See :ref:`admin_manual_permissions_in_shared_mailboxes` for common filesystem related permission problem.
 Note that these permissions only make sense when using a shared filesystem to enable sharing between users.


.. toctree::
  :hidden:
  :glob:

  shared_mailboxes/*
