.. _quota:
.. _quota_plugin:

============
Quota Plugin
============

Quota tracking and enforcing plugin.

Three plugins are associated with quota:

======================================= ========================================
Name                                    Description
======================================= ========================================
imap_quota                              Enables IMAP commands for requesting
                                        and adminstering current quota.
quota                                   Implements the actual quota handling
                                        and includes all quota backends.
:ref:`quota_clone <quota_clone_plugin>` Copy the current quota usage to a dict.
======================================= ========================================

Quota backend specifies the method how Dovecot keeps track of the current quota
usage. They don't (usually) specify users' quota limits, that's done by
:ref:`returning extra fields from userdb <quota_configuration_per_user>`.
There are different quota backends that Dovecot can use:

+--------------------------+---------------------------------------------------+
| Backend                  | Description                                       |
+==========================+===================================================+
| :ref:`count              | Store quota usage within Dovecot's index files.   |
| <quota_backend_count>`   |                                                   |
|                          | .. versionadded:: v2.2.19                         |
+--------------------------+---------------------------------------------------+
| :ref:`dict               | Store quota usage in a dictionary (e.g. SQL, or   |
| <quota_backend_dict>`    | flat files).                                      |
+--------------------------+---------------------------------------------------+
| :ref:`dirsize            | The simplest and slowest quota backend.           |
| <quota_backend_dirsize>` |                                                   |
+--------------------------+---------------------------------------------------+
| :ref:`fs                 | Filesystem quota.                                 |
| <quota_backend_fs>`      |                                                   |
+--------------------------+---------------------------------------------------+
| :ref:`imapc              | Use quota from remote IMAP server with imapc.     |
| <quota_backend_imapc>`   |                                                   |
|                          | .. versionadded:: v2.2.30                         |
+--------------------------+---------------------------------------------------+
| :ref:`maildir            | Store quota usage in Maildir++ maildirsize        |
| <quota_backend_maildir>` | files. This is the most commonly used quota for   |
|                          | virtual users.                                    |
+--------------------------+---------------------------------------------------+

We recommend using :ref:`count <quota_backend_count>` for any new
installations.

If you need usage data to an external database, consider using
:ref:`quota_clone_plugin` for exporting the information. (It's very slow to
query every user's quota from the index files directly.)

Quota Service
=============

The quota service allows postfix to check quota before delivery:

.. code-block:: none

  service quota-status {
    executable = quota-status -p postfix
    inet_listener {
      port = 12340
      # You can choose any port you want
    }
    client_limit = 1
  }

And then have postfix check_policy_service check that:

.. code-block:: none

  smtpd_recipient_restrictions =
    ...
    check_policy_service inet:mailstore.example.com:12340

For more about this service see
https://blog.sys4.de/postfix-dovecot-mailbox-quota-en.html

Enabling Quota Plugins
======================

Enable in configuration files, e.g.:

``conf.d/10-mail.conf``:

.. code-block:: none

  # Enable quota plugin for tracking and enforcing the quota.
  mail_plugins = $mail_plugins quota

``conf.d/20-imap.conf``:

.. code-block:: none

  protocol imap {
    # Enable the IMAP QUOTA extension, allowing IMAP clients to ask for the
    # current quota usage.
    mail_plugins = $mail_plugins imap_quota
  }

``conf.d/90-quota.conf``: (for use with the quota-status service)

.. code-block:: none

  plugin {
    quota_grace = 10%%
    # 10% is the default
    quota_status_success = DUNNO
    quota_status_nouser = DUNNO
    quota_status_overquota = "552 5.2.2 Mailbox is full"
  }

Configuration
=============

.. toctree::
  :maxdepth: 1

  quota/index
  quota/unified_quota_configuration

Quota Recalculation
===================

If your quotas are out of sync, you can use ``doveadm quota recalc -u <uid>``
command to recalculate them.

Quota and Trash Mailbox
=======================

Standard way to expunge messages with IMAP works by:

1. Marking message with ``\Deleted`` flag
2. Actually expunging the message using EXPUNGE command

Both of these commands can be successfully used while user's quota is full.
However many clients use a ``move-to-Trash`` feature, which works by:

1. COPY the message to Trash mailbox
2. Mark the message with \Deleted
3. Expunge the message from the original mailbox.
4. (Maybe later expunge the message from Trash when ``clean trash`` feature is
   used)

If user is over quota (or just under it), the first COPY command will fail and
user may get an unintuitive message about not being able to delete messages
because user is over quota. The possible solutions for this are:

* Disable move-to-trash feature from client
* You can create a separate quota rule ignoring Trash mailbox's quota. Note
  that this would allow users to store messages infinitely to the mailbox.
* You can create a separate quota rule giving Trash mailbox somewhat higher
  quota limit (but not unlimited).

To make sure users don't start keeping messages permanently in Trash you can
use `autoexpunge <namespaces_autoexpunge>` to expunge old messages from Trash
mailbox.

Debugging Quota
================

User's current quota usage can be looked up with: ``doveadm quota get -u
user@domain``

User's current quota may sometimes be wrong for various reasons (typically only
after some other problems). The quota can be recalculated with:

``doveadm quota recalc -u user@domain``

Example
=======

To use the recommended ``count`` quota driver:

.. code-block:: none

  mail_plugins = $mail_plugins quota
  protocol imap {
    mail_plugins = $mail_plugins imap_quota
  }

  plugin {
    quota = count:User quota
    quota_max_mail_size = 100M
    # Required for 'count' quota driver
    quota_vsizes = yes


Associated Plugins
==================

.. toctree::
  :maxdepth: 1

  quota_clone_plugin

Quota Drivers
=============

.. toctree::
  :maxdepth: 1

  quota/quota_count
  quota/quota_dict
  quota/quota_dirsize
  quota/quota_fs
  quota/quota_imapc
  quota/quota_maildir
