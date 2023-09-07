.. _nfs_hostchange:

======================
NFS host change plugin
======================

.. versionadded:: v2.3.19

.. note::

   This is a Dovecot Pro only plugin.

This plugin is intended to keep mailbox list indexes (``dovecot.list.index*`` files) stored locally under ``/dev/shm``.
If the user's backend has changed since previous access, the plugin automatically deletes any old ``dovecot.list.index*`` files from ``/dev/shm``.
Backends should also delete local mailbox list indexes that haven't been accessed for a long time, to avoid wasting memory for them.

Backend tracking
================

This plugin keeps track of the user's last hostname in ``INDEX/.lasthost`` file, which exists in NFS.
That file's inode and modification time is stored in ``LISTINDEX/.lasthost`` file, which exists locally under ``/dev/shm``.
Whenever the user logs in, ``INDEX/.lasthost`` is compared to ``LISTINDEX/.lasthost`` to see if it has changed.
If yes, delete ``LISTINDEX/dovecot.list.index*`` files and rewrite the ``LISTINDEX/.lasthost`` file.

Migration
=========

When first starting to use this plugin, ``dovecot.list.index*`` files don't exist locally anywhere yet.
To avoid large NFS disk I/O spikes, the existing ``dovecot.list.index*`` files should be copied from NFS to local ``/dev/shm`` if they don't exist yet.
:dovecot_plugin:ref:`nfs_hostchange_migration=yes <nfs_hostchange_migration>` setting is used to do this.

If ``nfs_hostchange_migration=yes``:

 * ``stat(INDEX/dovecot.list.index.log)`` is done to see if a backend without nfs_hostchange plugin has accessed the user.
   If the ``stat()`` succeeds to find the file, the local ``LISTINDEX/.lasthost`` and ``LISTINDEX/dovecot.list.index*`` are deleted.
 * If ``LISTINDEX/.lasthost`` doesn't now exist, ``INDEX/dovecot.list.index*`` are copied to local ``/dev/shm``.
   ``INDEX/dovecot.list.index*`` files are then deleted.

Note that using the migration setting introduces the extra ``stat()`` call to NFS, so once most users have been accessed this setting should be disabled.

There should be also a cronjob that deletes old users from the local ``/dev/shm``.
It should be done with ``LISTINDEX/.lasthost`` locked.
This plugin introduces a new ``doveadm nfs usercache clean <age> <user dir>`` command, which can be used e.g.::

  doveadm nfs usercache clean 7days /dev/shm/dovecot/00/testuser

Note that this needs to be run separately for each user.
So first run a script that finds the old users based on the ``.lasthost`` file's access time.
Then for each such user run the ``doveadm nfs usercache clean`` command to safely delete it.

Configuration
=============

.. code:: none

  mail_location = ...:LISTINDEX=/dev/shm/dovecot-listindex/%2.256Nu/%u/dovecot.list.index
  mail_plugins = $mail_plugins nfs_hostchange
  
  plugin {
    # until all backends have been upgraded and most users accessed:
    nfs_hostchange_migration = yes
  }


Settings
========

.. dovecot_plugin:setting:: nfs_hostchange_migration
   :added: v2.3.19
   :default: no
   :plugin: nfs_hostchange
   :values: @boolean

   When enabled, assumes user is being migrated.

Commands
========

``doveadm nfs usercache clean <min age> <path>``
------------------------------------------------

Cleans user's cache under root path for given age.
