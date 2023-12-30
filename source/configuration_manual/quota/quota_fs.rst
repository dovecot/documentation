.. _quota_backend_fs:

=================
Quota Backend: fs
=================

The ``fs`` (filesystem) quota backend supports both local filesystems and
rquota (NFS).

Systemd
^^^^^^^

If you are using systemd, please make sure you **turn off**
``PrivateDevices=yes``, otherwise the backend won't work properly. The best
way to do this is to use ``systemctl edit dovecot`` command or add file
``/etc/systemd/system/dovecot.service.d/override.conf`` with:

.. code-block:: none

  [Service]
  PrivateDevices=off

Index Files
^^^^^^^^^^^

It's a good idea to keep index files in a partition where there are no
filesystem quota limits. The index files exist to speed up mailbox
operations, so Dovecot runs more slowly if it can't keep them updated. You can
specify the index file location with :dovecot_core:ref:`mail_index_path`
setting.

Dovecot can handle "out of disk space" errors in index file handling and
transparently move to in-memory indexes. It'll use the in-memory indexes until
the mailbox is re-opened.

mbox
----

It's a good idea to have ``mbox_lazy_writes = yes`` (default), otherwise
Dovecot might give "Not enough disk space" errors when opening the mailbox,
making it impossible to expunge any mails.

If user has run out of quota and index files are also in memory (because
they're also over quota), it's possible that message flag changes are lost.
This should be pretty rare though because Dovecot keeps some extra space
allocated inside the mbox file for flag changes.

Example preferred configuration:

.. code-block:: none

  mail_driver = mbox
  mail_path = ~/mail
  mail_inbox_path = /var/mail/%u
  mail_index_path = /var/no-quotas/index/%u

Maildir
-------

Maildir needs to be able to add UIDs of new messages to ``dovecot-uidlist``
file. If it can't do this, it can give an error when opening the mailbox,
making it impossible to expunge any mails.

Currently the only way to avoid this is to use a separate partition for the
uidlist files where there are no filesystem quota limits. You can do this with
the :dovecot_core:ref:`mail_control_path` setting.

Example preferred configuration:

.. code-block:: none

  mail_driver = maildir
  mail_path = ~/Maildir
  mail_index_path = /var/no-quotas/index/%u
  mail_control_path = /var/no-quotas/control/%u

Note that if you change the location of the control files, Dovecot will look
in the new control path directory (``/var/no-quotas/control/%u``) for the
subscriptions file.

Driver Parameters
^^^^^^^^^^^^^^^^^

By default only user quota is shown, or if it doesn't exist, group quota is
used as fallback.

Driver specific parameters:

================== =============================================================
Name               Description
================== =============================================================
``group``          Report only group quotas
``inode_per_mail`` Report inode quota as "number of message" quota. This can
                   be useful with Maildir or single-dbox.
``mount=<path>``   Report quota from given path. Default is to use the path
                   for the mail root directory.
``user``           Report only user quotas, don't fallback to showing group
                   quotas.
================== =============================================================

Examples
^^^^^^^^

.. code-block:: none

  mail_plugins = $mail_plugins quota
  protocol imap {
    mail_plugins = mail_plugins imap_quota
  }

  plugin {
    quota = fs:user
  }

If you want to see both user and group quotas as separate quota roots, you can
use:

.. code-block:: none

  plugin {
    quota = fs:User quota:user
    quota2 = fs:Group quota:group
  }

If you have your mails in two filesystems, you can create two quota roots:

.. code-block:: none

  plugin {
    # Assuming INBOX in /var/mail/ which is mounted to /
    quota = fs:INBOX:mount=/
    # Assuming other mailboxes are in /home mount
    quota2 = fs:Others:mount=/home
  }
