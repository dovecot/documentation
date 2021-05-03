.. _shared_mailboxes:

=================
Shared mailboxes
=================

Dovecot can support mailbox sharing in several different ways:

Sharing mailboxes in a one backend setup:
 * :ref:`public_shared_mailboxes`: Shared mailboxes created by administrators.
 * :ref:`user_shared_mailboxes`: Users sharing their mailboxes to other users.
 * :ref:`Symlinking mailboxes <sharing_with_symlinks>`: Quick and dirty way of sharing a few mailboxes.

Sharing mailboxes when running multiple backends:
 * :ref:`mailbox_sharing_in_cluster`: When there is more than one Dovecot backend, sharing must be done via imapc.

 See :ref:`admin_manual_permissions_in_shared_mailboxes` for common filesystem related permission problem.
 Note that these permissions only make sense when using a shared filesystem to enable sharing between users.


.. toctree::
  :hidden:
  :glob:

  shared_mailboxes/*
