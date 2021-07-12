.. _importing_mailboxes:

===================
Importing mailboxes
===================

For importing mails, dovecot has `doveadm import <https://wiki2.dovecot.org/Tools/Doveadm/Import>`_ command.

.. warning::

  Do not use this tool for migrating mails to another system, see :ref:`migrating_mailboxes` instead.

The import command imports mails as is, and most importantly does not preserve UIDs or check if the mail is already there.
Message flags are preserved.

Importing mails from other users
--------------------------------

To import mail from another user in the system, you can do

::

  doveadm import -U sourceuser -u destuser 'maildir:~/Maildir' Imported ALL

This will import all mails and folder structure from sourceuser to destuser, under folder ``Imported``.

This will require that both sourceuser and destuser have same system UID.

You can also use imap client to do the import, which lets you import mail from users with different system UID,
or users that reside on a remote system.

::

  doveadm import -U sourceuser -u destuser imapc: Imported ALL

This assumes you have configured imap client, see :ref:`migrating_mailboxes_imapc` for details.

Importing mails from filesystem
-------------------------------

You can also import mails from a filesystem location.

::

  doveadm import -u destuser maildir:/opt/backup/destuser/Maildir "" ALL

This will restore all mails from backup into mailbox root, with folder structure.
The main difference here to the previous example is that the ``-U`` parameter is not given.
This causes the source location to be opened as ``destuser``.
Note that ``destuser`` must have read and privileges to the source location.

If you have only read privileges, you can try using in-memory indexes.

::

  doveadm import -u destuser maildir:/opt/backup/destuser/Maildir:INDEX=MEMORY "" ALL

